import type { AuthRole } from '@app/features/auth/domain/entities/auth-user';

export const environment = {
  production: false,
  supabaseUrl: 'https://scoixrejbdmosrrjgtcv.supabase.co',
  supabaseAnonKey: 'sb_publishable_gGOwEf3arIBPNcbecB6Uug_N3xFRgoH',
  supabasePlayerProfileBucket: 'avatars',
  apiBaseUrl: 'http://100.109.201.58:3000',
  authDevRoleOverride: 'PRESIDENT' as AuthRole,
  authDevTeamIdOverride: null,
  backofficeDevAdminUiOverride: true,
};
