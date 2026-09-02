import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';

const port = await availablePort();
const outDir = await mkdtemp(join(process.cwd(), '.astro/ssg-'));
const activeOutDir = await mkdtemp(join(process.cwd(), '.astro/ssg-active-'));
const fixture = spawn(process.execPath, ['tests/fixtures/kpl-api-server.mjs'], {
	env: { ...process.env, KPL_FIXTURE_PORT: String(port) },
	stdio: ['ignore', 'pipe', 'inherit'],
});

try {
	await waitForFixture(fixture);
	await runBuild(port, outDir);
	const [home, standings, matchday, teams, team, players, player, sitemap, robots] =
		await Promise.all([
			readFile(join(outDir, 'index.html'), 'utf8'),
			readFile(join(outDir, 'clasificacion/index.html'), 'utf8'),
			readFile(join(outDir, 'jornadas/jornada-1/index.html'), 'utf8'),
			readFile(join(outDir, 'equipos/index.html'), 'utf8'),
			readFile(join(outDir, 'equipos/kings-of-favar/index.html'), 'utf8'),
			readFile(join(outDir, 'jugadores/index.html'), 'utf8'),
			readFile(join(outDir, 'jugadores/king/index.html'), 'utf8'),
			readFile(join(outDir, 'sitemap.xml'), 'utf8'),
			readFile(join(outDir, 'robots.txt'), 'utf8'),
		]);
	await runBuild(port, activeOutDir, false);
	const [matchdays, activeMatchday] = await Promise.all([
		readFile(join(activeOutDir, 'jornadas/index.html'), 'utf8'),
		readFile(join(activeOutDir, 'jornadas/jornada-1/index.html'), 'utf8'),
	]);

	assert.doesNotMatch(home, /Playoffs/);
	for (const page of [home, standings, matchday, team, player]) {
		assert.match(page, /name="astro-view-transitions-enabled" content="true"/);
		assert.match(page, /name="astro-view-transitions-fallback" content="animate"/);
	}
	for (const [label, page] of [
		['inicio', home],
		['equipos', teams],
		['detalle de equipo', team],
		['jugadores', players],
		['detalle de jugador', player],
		['jornadas', matchdays],
		['detalle de jornada', activeMatchday],
	]) {
		assertUniqueTransitionNames(label, page);
	}
	for (const page of [home, teams, team]) {
		assertTransitionNames(page, ['kpl-team-kings-of-favar-crest', 'kpl-team-kings-of-favar-name']);
	}
	for (const page of [players, team, player]) {
		assertTransitionNames(page, ['kpl-player-king-portrait', 'kpl-player-king-name']);
	}
	for (const page of [matchdays, activeMatchday]) {
		assertTransitionNames(page, ['kpl-matchday-jornada-1-title']);
	}
	assert.match(matchdays, /<span class="c-team-badge"[^>]*>/);
	assert.doesNotMatch(matchdays, /<a class="c-team-badge"/);
	assert.match(home, /Pretemporada/);
	assert.match(home, /Temporada 2/);
	assert.match(home, /Sigue la Kings Padel League desde el primer partido/);
	assert.match(standings, /Todos empiezan desde cero/);
	assert.match(standings, /La tabla espera al primer punto/);
	assert.match(standings, /Clasificación de la Temporada 2/);
	assert.match(matchday, /Jornada 1 de la Temporada 2/);
	assert.match(home, /<link rel="canonical" href="https:\/\/kpl\.example\//);
	assert.match(home, /property="og:title"/);
	assert.match(home, /application\/ld\+json/);
	assert.match(team, /"@type":"SportsTeam"/);
	assert.match(team, /Born in Favar, built to win/);
	assert.match(team, /team-identities\/kings-of-favar\/logo\.svg/);
	assert.doesNotMatch(team, /pattern-carbon/);
	assert.doesNotMatch(team, /Kings_of_Favar_no_bg\.webp/);
	assert.match(teams, /team-card__identity-accent/);
	assert.match(teams, /--team-primary:#69f6d1/);
	assert.match(home, /home-team-card__identity-accent/);
	assert.match(activeMatchday, /team-identity-bands/);
	assert.match(player, /"@type":"Person"/);
	assert.match(matchday, /name="robots" content="noindex, follow"/);
	assert.match(sitemap, /https:\/\/kpl\.example\/equipos\/kings-of-favar/);
	assert.doesNotMatch(sitemap, /https:\/\/kpl\.example\/jornadas\/jornada-1/);
	assert.match(robots, /Sitemap: https:\/\/kpl\.example\/sitemap\.xml/);
	console.log('SSG fixture builds verified: routes and shared view transitions are valid.');
} finally {
	fixture.kill('SIGTERM');
	await Promise.all([
		rm(outDir, { recursive: true, force: true }),
		rm(activeOutDir, { recursive: true, force: true }),
	]);
}

function transitionNames(document) {
	return [...document.matchAll(/view-transition-name:\s*([^;"\s]+)/g)].map((match) => match[1]);
}

function assertTransitionNames(document, expected) {
	const names = transitionNames(document);
	for (const name of expected) assert.ok(names.includes(name), `Missing view transition: ${name}`);
}

function assertUniqueTransitionNames(label, document) {
	const names = transitionNames(document);
	const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
	assert.deepEqual([...new Set(duplicates)], [], `Duplicate view transition names in ${label}`);
}

function availablePort() {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			assert(address && typeof address === 'object');
			const { port } = address;
			server.close((error) => (error ? reject(error) : resolve(port)));
		});
	});
}

function waitForFixture(child) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error('Fixture API startup timed out.')), 5_000);
		child.once('exit', (code) => {
			clearTimeout(timeout);
			reject(new Error(`Fixture API exited early with code ${code}.`));
		});
		child.stdout.on('data', (chunk) => {
			if (!chunk.toString().includes('Fixture KPL API listening')) return;
			clearTimeout(timeout);
			resolve();
		});
	});
}

function runBuild(port, outDir, preseason = true) {
	return new Promise((resolve, reject) => {
		const astroBin = join(process.cwd(), 'node_modules/astro/bin/astro.mjs');
		const build = spawn(process.execPath, [astroBin, 'build', '--outDir', outDir], {
			env: {
				...process.env,
				KPL_API_BASE_URL: `http://127.0.0.1:${port}`,
				KPL_PLAYOFFS_ENABLED: 'false',
				KPL_PRESEASON_MODE: String(preseason),
				KPL_SITE_URL: 'https://kpl.example',
			},
			stdio: 'inherit',
		});
		build.once('error', reject);
		build.once('exit', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`Astro build failed with code ${code}.`));
		});
	});
}
