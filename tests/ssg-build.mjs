import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';

// El adapter de Vercel (astro.config.mjs, necesario para /tina-island y /noticias/preview bajo
// demanda) ignora `--outDir` para los assets estáticos: siempre los escribe en la ruta fija que
// exige el Build Output API de Vercel. `outDir`/`activeOutDir` (mkdtemp) ya no son el resultado
// real, pero se mantienen como directorio de trabajo de cada build.
const VERCEL_STATIC_DIR = join(process.cwd(), '.vercel/output/static');

const port = await availablePort();
// mkdtemp no crea el directorio padre: en un checkout limpio (CI) `.astro/` todavía no existe
// porque nada ha invocado a Astro antes de este script.
await mkdir(join(process.cwd(), '.astro'), { recursive: true });
const outDir = await mkdtemp(join(process.cwd(), '.astro/ssg-'));
const activeOutDir = await mkdtemp(join(process.cwd(), '.astro/ssg-active-'));
const fixture = spawn(process.execPath, ['tests/fixtures/kpl-api-server.mjs'], {
	env: { ...process.env, KPL_FIXTURE_PORT: String(port) },
	stdio: ['ignore', 'pipe', 'inherit'],
});

try {
	await waitForFixture(fixture);
	await runBuild(port, outDir);
	const [home, standings, matchday, cards, teams, team, players, player, sitemap, robots] =
		await Promise.all([
			readFile(join(VERCEL_STATIC_DIR, 'index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'clasificacion/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'jornadas/jornada-1/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'cartas/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'equipos/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'equipos/kings-of-favar/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'jugadores/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'jugadores/king/index.html'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'sitemap.xml'), 'utf8'),
			readFile(join(VERCEL_STATIC_DIR, 'robots.txt'), 'utf8'),
		]);
	await rm(join(process.cwd(), '.vercel/output'), { recursive: true, force: true });
	await runBuild(port, activeOutDir, false);
	const [calendarPage, activeMatchday, scheduledMatchday] = await Promise.all([
		readFile(join(VERCEL_STATIC_DIR, 'calendario/index.html'), 'utf8'),
		readFile(join(VERCEL_STATIC_DIR, 'jornadas/jornada-1/index.html'), 'utf8'),
		readFile(join(VERCEL_STATIC_DIR, 'jornadas/jornada-3/index.html'), 'utf8'),
	]);

	assert.doesNotMatch(home, /Playoffs/);
	for (const page of [home, standings, matchday, cards, team, player]) {
		assert.match(page, /name="astro-view-transitions-enabled" content="true"/);
		assert.match(page, /name="astro-view-transitions-fallback" content="none"/);
	}
	for (const [label, page] of [
		['inicio', home],
		['equipos', teams],
		['detalle de equipo', team],
		['jugadores', players],
		['detalle de jugador', player],
		['calendario', calendarPage],
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
	for (const page of [calendarPage, activeMatchday]) {
		assertTransitionNames(page, ['kpl-matchday-jornada-1-title']);
	}
	assert.match(calendarPage, /<a class="c-team-badge"[^>]*href="\/equipos\//);
	assert.match(calendarPage, /Padel Mixto Xeresa/);
	assert.match(calendarPage, /season-map__day--match/);
	assert.match(calendarPage, /Ver desglose por parejas/);
	// MatchCard uses the player's full name without adding the profile alias.
	assert.match(calendarPage, /<a href="\/jugadores\/king">Alex Rey<\/a>/);
	assert.match(scheduledMatchday, /Jornada programada/);
	assert.match(scheduledMatchday, /<a href="\/jugadores\/roar">Iris Rojo<\/a>/);
	assert.match(scheduledMatchday, /<a href="\/jugadores\/nova">Nora Vega<\/a>/);
	assert.doesNotMatch(scheduledMatchday, /“Roar”/);
	assert.doesNotMatch(scheduledMatchday, />Pendiente</);
	assert.match(scheduledMatchday, /match-card__pair-score">\s*VS\s*<\/strong>/);
	assert.match(scheduledMatchday, /data-story-export/);
	assert.match(home, /Pretemporada/);
	assert.match(home, /Temporada 2/);
	assert.match(home, /Sigue la Kings Padel League desde el primer partido/);
	assert.match(standings, /Todos empiezan desde cero/);
	assert.match(standings, /La tabla espera al primer punto/);
	assert.match(standings, /Clasificación de la Temporada 2/);
	assert.match(matchday, /Jornada 1 de la Temporada 2/);
	assert.match(cards, /Una carta/);
	assert.match(cards, /Cada <a href="\/equipos">presidente<\/a> roba una/);
	assert.match(cards, /40–15/);
	assert.match(cards, /Las siete cartas/);
	// The old skip-button intro (data-card-intro) was replaced by the
	// video-based reveal (data-cards-animation); this assertion was never
	// updated when that happened.
	assert.match(cards, /data-cards-animation/);
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
	// Home teasers share the team-card mechanics (see docs/css-audit.md P2);
	// the home-team-card__* classes were unified into team-card__*.
	assert.match(home, /team-card__identity-accent/);
	// TeamIdentityBands (and its `team-identity-bands` class) was removed in
	// the CSS consolidation (see docs/css-audit.md) — MatchCard now renders
	// team identity through TeamBadge alone, with no direct replacement marker.
	assert.match(player, /"@type":"Person"/);
	assert.match(players, /<strong[^>]*>Alex Rey<\/strong>/);
	assert.match(players, /“King” · Revés · Presidente/);
	assert.match(team, /<strong[^>]*>Alex Rey<\/strong>/);
	assert.match(team, /<span>“King”<\/span>/);
	assert.match(
		team,
		/class="player-card__points" aria-label="18 puntos">\s*<strong>18<\/strong> PTS\s*<\/span>/,
	);
	assert.match(player, /<h1[^>]*>\s*Alex Rey\s*<\/h1>/);
	assert.match(player, /player-profile__alias">“King”<\/p>/);
	assert.match(matchday, /name="robots" content="noindex, follow"/);
	assert.match(sitemap, /https:\/\/kpl\.example\/equipos\/kings-of-favar/);
	assert.match(sitemap, /https:\/\/kpl\.example\/cartas/);
	assert.doesNotMatch(sitemap, /https:\/\/kpl\.example\/jornadas\/jornada-1/);
	assert.match(robots, /Sitemap: https:\/\/kpl\.example\/sitemap\.xml/);
	console.log('SSG fixture builds verified: routes and shared view transitions are valid.');
} finally {
	fixture.kill('SIGTERM');
	await Promise.all([
		rm(outDir, { recursive: true, force: true }),
		rm(activeOutDir, { recursive: true, force: true }),
		rm(join(process.cwd(), '.vercel/output'), { recursive: true, force: true }),
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
