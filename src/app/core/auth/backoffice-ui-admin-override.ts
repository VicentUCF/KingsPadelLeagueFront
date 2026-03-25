import { environment } from '../../../environments/environment';
import type { AuthRole } from '@features/auth/domain/entities/auth-user';

export function hasBackofficeUiAdminOverride(role: AuthRole | null): boolean {
  return (
    !environment.production && environment.backofficeDevAdminUiOverride && role === 'PRESIDENT'
  );
}
