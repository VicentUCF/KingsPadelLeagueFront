import type { APIRoute } from 'astro';

import { PLAYOFFS_ENABLED } from '../lib/features';
import { isPublicPreseason } from '../lib/league-presentation';
import { loadPublicLeagueView } from '../lib/public-view';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
	const origin = site ?? new URL('http://localhost');
	const view = await loadPublicLeagueView();
	const paths = [
		'/',
		'/jornadas',
		'/clasificacion',
		'/calendario',
		'/equipos',
		'/jugadores',
		...(PLAYOFFS_ENABLED ? ['/playoffs'] : []),
		...view.teams.map((team) => `/equipos/${team.slug}`),
		...view.players.map((player) => `/jugadores/${player.slug}`),
		...(!isPublicPreseason()
			? view.matchdays
					.filter((matchday) => matchday.encounters.length > 0)
					.map((matchday) => `/jornadas/${matchday.id}`)
			: []),
	];
	const urls = [...new Set(paths)].map((path) => new URL(path, origin).href);
	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
		'</urlset>',
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}
