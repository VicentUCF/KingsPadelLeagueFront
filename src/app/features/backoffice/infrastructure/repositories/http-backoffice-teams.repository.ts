import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, TeamHttpV1 } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { resolveTeamBranding } from '@shared/utils/team-branding';

@Injectable()
export class HttpBackofficeTeamsRepository extends BackofficeTeamsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  override loadAll(): Promise<readonly BackofficeTeam[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<TeamHttpV1>>(`${this.baseUrl}/v1/teams`, {
        params: { limit: '100' },
        context: withHttpErrorToast({ key: 'load-teams' }),
      }),
    ).then((res) => res.items.map(mapTeam));
  }
}

function mapTeam(raw: TeamHttpV1): BackofficeTeam {
  const branding = resolveTeamBranding({
    teamName: raw.name,
    fallbackLogoPath: sanitizeTeamLogoPath(raw.logo),
  });

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    secondaryDescription: raw.secondaryDescription,
    logo: branding.logoPath,
  };
}

function sanitizeTeamLogoPath(logoPath: string | null | undefined): string | null {
  if (!logoPath) {
    return null;
  }

  return logoPath.includes('placeholder.com') ? null : logoPath;
}
