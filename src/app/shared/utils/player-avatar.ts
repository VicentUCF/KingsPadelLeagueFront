export function resolvePlayerAvatarPath(avatarPath: string | null | undefined): string | null {
  if (!avatarPath) {
    return null;
  }

  return isPlaceholderAvatarPath(avatarPath) ? null : avatarPath;
}

function isPlaceholderAvatarPath(avatarPath: string): boolean {
  return avatarPath.includes('placeholder.com');
}
