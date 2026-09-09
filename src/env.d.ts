interface ImportMetaEnv {
	readonly KPL_API_BASE_URL?: string;
	readonly KPL_PORTAL_URL?: string;
	readonly KPL_PRESEASON_MODE?: string;
	readonly KPL_PUBLIC_SEASON_NAME?: string;
	readonly KPL_SEASON_STARTS_AT?: string;
	/** Secreto que autoriza /noticias/preview/<slug> a mostrar noticias no publicadas (ver tina/config.ts). */
	readonly TINA_PUBLIC_PREVIEW_SECRET?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '@kpl/design-system/css';
