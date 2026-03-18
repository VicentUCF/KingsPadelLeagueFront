import type { User } from '@supabase/supabase-js';

import { normalizeAuthRole, type AuthRole, type AuthUser } from '../../domain/entities/auth-user';

type SupabaseMetadata = Record<string, unknown>;

export function mapSupabaseUserToAuthUser(user: User): AuthUser {
  const appMetadata = toMetadataRecord(user.app_metadata);
  const userMetadata = toMetadataRecord(user.user_metadata);

  return {
    id: user.id,
    email: user.email ?? '',
    displayName: resolveDisplayName(userMetadata, appMetadata, user.email),
    role: resolveAuthRole(appMetadata, userMetadata, user.role),
    teamId: resolveTeamId(appMetadata, userMetadata),
  };
}

function resolveAuthRole(
  appMetadata: SupabaseMetadata,
  userMetadata: SupabaseMetadata,
  defaultRole?: string,
) {
  return normalizeAuthRole(
    readMetadataString(appMetadata, 'role', 'Role') ?? userMetadata['role'] ?? defaultRole,
  ).toUpperCase() as AuthRole;
}

function resolveDisplayName(
  userMetadata: SupabaseMetadata,
  appMetadata: SupabaseMetadata,
  fallbackEmail?: string | null,
): string {
  return (
    readMetadataString(userMetadata, 'display_name', 'displayName') ??
    readMetadataString(appMetadata, 'display_name', 'displayName') ??
    fallbackEmail ??
    ''
  );
}

function resolveTeamId(
  appMetadata: SupabaseMetadata,
  userMetadata: SupabaseMetadata,
): string | null {
  return (
    readMetadataString(appMetadata, 'team_id', 'teamId') ??
    readMetadataString(userMetadata, 'team_id', 'teamId') ??
    null
  );
}

function readMetadataString(metadata: SupabaseMetadata, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function toMetadataRecord(value: unknown): SupabaseMetadata {
  return isMetadataRecord(value) ? value : {};
}

function isMetadataRecord(value: unknown): value is SupabaseMetadata {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
