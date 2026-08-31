import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';

const port = await availablePort();
const outDir = await mkdtemp(join(process.cwd(), '.astro/ssg-'));
const fixture = spawn(process.execPath, ['tests/fixtures/kpl-api-server.mjs'], {
	env: { ...process.env, KPL_FIXTURE_PORT: String(port) },
	stdio: ['ignore', 'pipe', 'inherit'],
});

try {
	await waitForFixture(fixture);
	await runBuild(port, outDir);
	const [home, standings, matchday, team, player, sitemap, robots] = await Promise.all([
		readFile(join(outDir, 'index.html'), 'utf8'),
		readFile(join(outDir, 'clasificacion/index.html'), 'utf8'),
		readFile(join(outDir, 'jornadas/jornada-1/index.html'), 'utf8'),
		readFile(join(outDir, 'equipos/kings-of-favar/index.html'), 'utf8'),
		readFile(join(outDir, 'jugadores/king/index.html'), 'utf8'),
		readFile(join(outDir, 'sitemap.xml'), 'utf8'),
		readFile(join(outDir, 'robots.txt'), 'utf8'),
	]);

	assert.doesNotMatch(home, /Playoffs/);
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
	assert.match(player, /"@type":"Person"/);
	assert.match(matchday, /name="robots" content="noindex, follow"/);
	assert.match(sitemap, /https:\/\/kpl\.example\/equipos\/kings-of-favar/);
	assert.doesNotMatch(sitemap, /https:\/\/kpl\.example\/jornadas\/jornada-1/);
	assert.match(robots, /Sitemap: https:\/\/kpl\.example\/sitemap\.xml/);
	console.log('SSG fixture build verified: Temporada 2 preseason routes generated successfully.');
} finally {
	fixture.kill('SIGTERM');
	await rm(outDir, { recursive: true, force: true });
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

function runBuild(port, outDir) {
	return new Promise((resolve, reject) => {
		const build = spawn('npm', ['run', 'build', '--', '--outDir', outDir], {
			env: {
				...process.env,
				KPL_API_BASE_URL: `http://127.0.0.1:${port}`,
				KPL_PLAYOFFS_ENABLED: 'false',
				KPL_PRESEASON_MODE: 'true',
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
