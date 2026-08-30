export interface PublishableAnnouncement {
	data: {
		draft: boolean;
		publishedAt: Date;
	};
}

export function selectPublishedAnnouncements<T extends PublishableAnnouncement>(
	entries: readonly T[],
	now = new Date(),
	limit = 3,
): T[] {
	return entries
		.filter(({ data }) => !data.draft && data.publishedAt.getTime() <= now.getTime())
		.sort((left, right) => right.data.publishedAt.getTime() - left.data.publishedAt.getTime())
		.slice(0, limit);
}
