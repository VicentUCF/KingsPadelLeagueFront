import { defineConfig } from 'tinacms';

// Slugs = nombres de archivo reales bajo src/content/news/, así que las URLs públicas
// (/noticias/<slug>) nunca cambian al migrar de Pages CMS.
const NEWS_CATEGORIES = [
	{ value: 'equipos', label: 'Equipos' },
	{ value: 'calendario', label: 'Calendario' },
	{ value: 'cartas', label: 'Cartas' },
	{ value: 'partidos', label: 'Partidos' },
];

// El prefijo TINA_PUBLIC_ es obligatorio: @tinacms/cli solo inyecta en el bundle de /admin las
// variables TINA_PUBLIC_*/NEXT_PUBLIC_* (ver filterPublicEnv en @tinacms/cli) — con
// TINA_PREVIEW_SECRET a secas, este `router` vería siempre ''.
const previewToken = process.env.TINA_PUBLIC_PREVIEW_SECRET ?? '';

// Deriva el nombre de archivo (= slug = URL) del titular para noticias nuevas, sin que Patrizio
// tenga que pensar en rutas técnicas.
function slugifyTitle(values: Record<string, unknown>): string {
	const title = typeof values.title === 'string' ? values.title : 'nueva-noticia';
	return title
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.split('-')
		.filter(Boolean)
		.join('-');
}

export default defineConfig({
	branch: process.env.TINA_BRANCH || process.env.HEAD || 'main',
	clientId: process.env.TINA_CLIENT_ID || null,
	token: process.env.TINA_TOKEN || null,

	build: {
		publicFolder: 'public',
		outputFolder: 'admin',
	},

	media: {
		tina: {
			publicFolder: 'public',
			mediaRoot: 'news/covers',
			// Explícito (coincide con el default) para que quede claro que Patrizio puede subir y
			// borrar fotos desde el admin: con `static: true` el Media Manager pasa a solo lectura.
			static: false,
		},
	},

	schema: {
		collections: [
			{
				name: 'news',
				label: 'Noticias',
				path: 'src/content/news',
				format: 'md',
				// La plantilla editorial (_plantilla-resultados-jornada.md) queda fuera del listado
				// de Tina: no es una noticia real, es una guía para crear jornadas a mano.
				match: { exclude: '_*' },
				// El campo "Fecha de publicación" solo pre-rellena visualmente el día de hoy (sin fijar
				// un valor real): en una noticia recién creada, ese hueco queda marcado como obligatorio
				// y bloquea "Save" hasta que se rellena a mano, aunque el selector ya "parezca" relleno.
				// `defaultItem` sí fija un valor real desde el primer render, para que una noticia nueva
				// sea guardable (y por tanto previsualizable) nada más completar el titular, el subtítulo
				// y la categoría. `ui.defaultValue` por campo (la alternativa más simple, usada antes
				// aquí) tiene el mismo problema con los booleanos: no llega a marcar el interruptor en el
				// formulario de creación, así que "published"/"featured" se fijan aquí también.
				defaultItem: () => ({
					publishedAt: new Date().toISOString(),
					category: 'equipos',
					published: true,
					featured: false,
				}),
				ui: {
					filename: {
						slugify: slugifyTitle,
					},
					// El token va como segmento de ruta, no como `?token=`: el iframe de previsualización
					// que Tina abre desde su propio listado de documentos construye su `src` a partir de
					// esta ruta descartando la query string (ver src/pages/noticias/preview/[slug]/
					// [token].astro), así que con `?token=` la previsualización dentro del admin siempre
					// se veía como "no disponible".
					router: ({ document }) =>
						`/noticias/preview/${document._sys.filename}${
							previewToken ? `/${encodeURIComponent(previewToken)}` : ''
						}`,
				},
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Titular',
						description: 'Título principal de la noticia (máximo 90 caracteres).',
						isTitle: true,
						required: true,
					},
					{
						type: 'string',
						name: 'subtitle',
						label: 'Subtítulo',
						description:
							'Entradilla o bajada corta. Se muestra en el listado de noticias y en la cabecera ' +
							'de la noticia, y también se usa como descripción para buscadores y redes sociales ' +
							'(máximo 200 caracteres).',
						ui: { component: 'textarea' },
						required: true,
					},
					{
						type: 'object',
						name: 'cover',
						label: 'Imagen principal',
						required: false,
						fields: [
							{
								type: 'image',
								name: 'image',
								label: 'Imagen',
							},
							{
								type: 'string',
								name: 'alt',
								label: 'Texto alternativo',
								description: 'Descripción de la foto para lectores de pantalla.',
							},
							{
								type: 'string',
								name: 'credit',
								label: 'Crédito',
								required: false,
							},
						],
					},
					{
						type: 'rich-text',
						name: 'body',
						label: 'Contenido',
						description: 'Cuerpo principal de la noticia.',
						isBody: true,
					},
					{
						type: 'datetime',
						name: 'publishedAt',
						label: 'Fecha de publicación',
						description:
							'Mientras sea una fecha futura, la noticia queda guardada pero no aparece ' +
							'todavía en la web.',
						required: true,
					},
					{
						type: 'string',
						name: 'category',
						label: 'Categoría',
						options: NEWS_CATEGORIES,
						required: true,
					},
					{
						type: 'boolean',
						name: 'published',
						label: 'Publicada',
						description:
							'Actívalo cuando la noticia esté lista para verse en la web. Mientras esté ' +
							'desactivado, queda guardada como borrador y no aparece en el listado ni tiene ' +
							'página pública (pero puede previsualizarse desde aquí, con "Ver en directo").',
					},
					{
						type: 'boolean',
						name: 'featured',
						label: 'Destacada en portada',
					},
					{
						type: 'number',
						name: 'homePriority',
						label: 'Prioridad en destacadas',
						description:
							'Solo aplica si está "Destacada en portada". Cuanto menor sea el número, más ' +
							'arriba aparece.',
						required: false,
					},
					{
						type: 'datetime',
						name: 'updatedAt',
						label: 'Fecha de actualización',
						description: 'Opcional. Solo si la noticia se corrige o amplía tras publicarse.',
						required: false,
					},
					{
						type: 'string',
						name: 'relatedTeamSlugs',
						label: 'Equipos relacionados',
						description: 'Slugs de equipo tal y como aparecen en /equipos/<slug>.',
						list: true,
						required: false,
					},
					{
						type: 'string',
						name: 'relatedMatchdayId',
						label: 'Jornada relacionada',
						description: 'Id de jornada tal y como aparece en /jornadas/<id>.',
						required: false,
					},
					{
						type: 'string',
						name: 'socialTemplate',
						label: 'Plantilla social (fase futura)',
						description:
							'Reservado para una futura fase de generación automática de piezas para ' +
							'Instagram. Todavía no se usa en la web.',
						options: [
							{ value: 'official', label: 'Oficial' },
							{ value: 'alert', label: 'Alerta' },
							{ value: 'profile', label: 'Perfil' },
						],
						required: false,
					},
					{
						type: 'string',
						name: 'socialTitle',
						label: 'Titular para redes (fase futura)',
						description: 'Reservado para la futura generación automática de piezas sociales.',
						required: false,
					},
					{
						type: 'string',
						name: 'socialSubtitle',
						label: 'Subtítulo para redes (fase futura)',
						description: 'Reservado para la futura generación automática de piezas sociales.',
						required: false,
					},
				],
			},
		],
	},
});
