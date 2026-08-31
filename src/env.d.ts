interface ImportMetaEnv {
	readonly KPL_API_BASE_URL?: string;
	readonly KPL_PRESEASON_MODE?: string;
	readonly KPL_PUBLIC_SEASON_NAME?: string;
	readonly KPL_SEASON_STARTS_AT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '@kpl/design-system/css';
