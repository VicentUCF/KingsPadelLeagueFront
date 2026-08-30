const REQUEST_TIMEOUT_MS = 10_000;

export function resolveApiBaseUrl(): string {
	const value = import.meta.env.KPL_API_BASE_URL?.trim();
	if (!value) {
		throw new Error(
			'Falta KPL_API_BASE_URL. Configura la URL de la API antes de generar el sitio.',
		);
	}

	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error('KPL_API_BASE_URL debe ser una URL absoluta válida.');
	}
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error('KPL_API_BASE_URL debe utilizar HTTP o HTTPS.');
	}
	return url.toString().replace(/\/$/, '');
}

export async function loadCollection<T>(
	url: string,
	parseItem: (value: unknown, index: number) => T,
	resourceLabel: string,
): Promise<T[]> {
	let response: Response;
	try {
		response = await fetch(url, {
			headers: { accept: 'application/json' },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});
	} catch (error) {
		throw new Error(`No se han podido cargar ${resourceLabel} desde la API.`, { cause: error });
	}
	if (!response.ok) {
		throw new Error(`La API ha respondido con HTTP ${response.status} al cargar ${resourceLabel}.`);
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch (error) {
		throw new Error(`La respuesta de ${resourceLabel} no contiene JSON válido.`, { cause: error });
	}
	if (!isRecord(payload) || !Array.isArray(payload.items) || !isRecord(payload.meta)) {
		throw new Error(
			`La respuesta de ${resourceLabel} no contiene la paginación "items" y "meta" esperada.`,
		);
	}
	return payload.items.map(parseItem);
}

export function collectionUrl(
	apiBaseUrl: string,
	path: string,
	limit: number,
	filters: Readonly<Record<string, readonly string[]>> = {},
): string {
	const url = new URL(path, `${apiBaseUrl}/`);
	url.searchParams.set('limit', String(limit));
	for (const [key, values] of Object.entries(filters)) {
		url.searchParams.set(key, JSON.stringify(values));
	}
	return url.toString();
}

export function loadRelatedCollection<T>(
	apiBaseUrl: string,
	path: string,
	filterName: string,
	ids: readonly string[],
	limit: number,
	parseItem: (value: unknown, index: number) => T,
	resourceLabel: string,
): Promise<T[]> {
	if (ids.length === 0) return Promise.resolve([]);
	return loadCollection(
		collectionUrl(apiBaseUrl, path, limit, { [filterName]: ids }),
		parseItem,
		resourceLabel,
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
