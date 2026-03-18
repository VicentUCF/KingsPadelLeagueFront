export type EditablePlayerPreferredPosition = 'both' | 'left' | 'right';

export interface EditablePlayerProfile {
  readonly id: string;
  readonly alias: string;
  readonly firstName: string;
  readonly instagramUrl: string;
  readonly lastName: string;
  readonly preferredPosition: EditablePlayerPreferredPosition;
  readonly profileImageUrl: string | null;
}

export function resolveEditablePlayerProfileDisplayName(
  profile: Pick<EditablePlayerProfile, 'alias' | 'firstName' | 'lastName'>,
): string {
  const normalizedAlias = profile.alias.trim();
  if (normalizedAlias.length > 0) {
    return normalizedAlias;
  }

  return [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(' ');
}
