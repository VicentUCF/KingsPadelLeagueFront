import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dev as startAstro } from 'astro';

const port = await availablePort();
const fixture = spawn(process.execPath, ['tests/fixtures/kpl-api-server.mjs'], {
	env: { ...process.env, KPL_FIXTURE_PORT: String(port) },
	stdio: ['ignore', 'pipe', 'inherit'],
});
let devServer;

try {
	await waitForFixture(fixture);
	process.env.KPL_API_BASE_URL = `http://127.0.0.1:${port}`;
	devServer = await startAstro({
		root: process.cwd(),
		server: { host: readHost(), port: readPort() },
	});
	const url = devServer.resolvedUrls.local[0] ?? `http://localhost:${devServer.address.port}/`;
	console.log(`Astro dev with fixture data: ${url}`);
	await waitForStopSignal();
} finally {
	await devServer?.stop();
	fixture.kill('SIGTERM');
}

function readPort() {
	const index = process.argv.indexOf('--port');
	if (index === -1) return 4321;
	const port = Number(process.argv[index + 1]);
	if (!Number.isInteger(port) || port <= 0) throw new Error('--port requires a valid port number.');
	return port;
}

function readHost() {
	const index = process.argv.indexOf('--host');
	if (index === -1) return false;
	const value = process.argv[index + 1];
	return value && !value.startsWith('--') ? value : true;
}

function waitForStopSignal() {
	return new Promise((resolve) => {
		process.once('SIGINT', resolve);
		process.once('SIGTERM', resolve);
	});
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
