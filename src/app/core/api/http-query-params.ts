import { type HttpParams } from '@angular/common/http';

export function withJsonArrayParam(
  params: HttpParams,
  key: string,
  values: readonly string[],
): HttpParams {
  if (values.length === 0) {
    return params;
  }

  return params.set(key, JSON.stringify(values));
}
