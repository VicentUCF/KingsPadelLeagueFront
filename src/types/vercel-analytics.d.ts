declare module '@vercel/analytics' {
  export interface AnalyticsInjectOptions {
    mode?: 'auto' | 'production' | 'development';
    debug?: boolean;
    beforeSend?: (event: unknown) => unknown;
  }

  export function inject(options?: AnalyticsInjectOptions): void;
}
