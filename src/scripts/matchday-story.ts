interface StoryTeam {
	name: string;
	logoPath: string | null;
	monogram: string;
	primaryColor: string;
}

interface StoryPair {
	label: string;
	homePlayers: string[];
	awayPlayers: string[];
}

interface StoryEncounter {
	scheduledAtLabel: string;
	homeTeam: StoryTeam;
	awayTeam: StoryTeam;
	pairs: StoryPair[];
}

interface MatchdayStoryPayload {
	matchdayLabel: string;
	dateLabel: string;
	seasonLabel: string;
	venue: string;
	encounters: StoryEncounter[];
}

interface StoryTheme {
	background: string;
	surface: string;
	brand: string;
	textStrong: string;
	textMuted: string;
	headingFont: string;
	bodyFont: string;
}

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;
let storyTheme: StoryTheme = {
	background: '#0b0b0b',
	surface: '#111111',
	brand: '#c9a227',
	textStrong: '#f5f5f5',
	textMuted: '#a49b8c',
	headingFont: '"Space Grotesk", "Segoe UI", sans-serif',
	bodyFont: '"Manrope", "Segoe UI", sans-serif',
};

export function initializeMatchdayStoryExporters(): void {
	document.querySelectorAll<HTMLElement>('[data-story-exporter]').forEach((exporter) => {
		if (exporter.dataset.initialized === 'true') return;
		const button = exporter.querySelector<HTMLButtonElement>('[data-story-export]');
		const status = exporter.querySelector<HTMLElement>('[data-story-status]');
		const payloadNode = exporter.querySelector<HTMLScriptElement>('[data-story-payload]');
		if (!button || !status || !payloadNode) return;

		exporter.dataset.initialized = 'true';
		button.addEventListener('click', () => {
			void exportMatchdayStory(button, status, payloadNode);
		});
	});
}

async function exportMatchdayStory(
	button: HTMLButtonElement,
	status: HTMLElement,
	payloadNode: HTMLScriptElement,
): Promise<void> {
	button.disabled = true;
	button.setAttribute('aria-busy', 'true');
	status.textContent = 'Preparando la imagen…';
	try {
		const payload = JSON.parse(payloadNode.textContent) as MatchdayStoryPayload;
		const blob = await createStoryImage(payload);
		downloadStory(blob, payload.matchdayLabel);
		status.textContent = 'Imagen descargada. Ya puedes publicarla en Stories.';
	} catch (error) {
		console.error('No se pudo generar la imagen de la jornada.', error);
		status.textContent = 'No se pudo crear la imagen. Inténtalo de nuevo.';
	} finally {
		button.disabled = false;
		button.removeAttribute('aria-busy');
	}
}

async function createStoryImage(payload: MatchdayStoryPayload): Promise<Blob> {
	await document.fonts.ready;
	storyTheme = readProjectTheme();
	const canvas = document.createElement('canvas');
	canvas.width = STORY_WIDTH;
	canvas.height = STORY_HEIGHT;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Canvas 2D no disponible.');

	const imageSources = [
		'/kpl-logo-wordmark.png',
		...payload.encounters.flatMap(({ homeTeam, awayTeam }) => [
			homeTeam.logoPath,
			awayTeam.logoPath,
		]),
	].filter((source): source is string => Boolean(source));
	const images = await loadImages(imageSources);

	drawBackground(context);
	drawHeader(context, payload, images.get('/kpl-logo-wordmark.png'));
	drawEncounters(context, payload, images);
	drawFooter(context);

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error('No se pudo crear el PNG.'));
		}, 'image/png');
	});
}

function readProjectTheme(): StoryTheme {
	const styles = getComputedStyle(document.documentElement);
	const token = (name: string, fallback: string) =>
		styles.getPropertyValue(name).trim() || fallback;
	return {
		background: token('--kpl-color-background', storyTheme.background),
		surface: token('--kpl-color-surface', storyTheme.surface),
		brand: token('--kpl-color-brand', storyTheme.brand),
		textStrong: token('--kpl-color-text-strong', storyTheme.textStrong),
		textMuted: token('--kpl-color-text-muted', storyTheme.textMuted),
		headingFont: token('--kpl-font-family-heading', storyTheme.headingFont),
		bodyFont: token('--kpl-font-family-body', storyTheme.bodyFont),
	};
}

function drawBackground(context: CanvasRenderingContext2D): void {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
}

// Only consolidate identical schedules; differing dates/times stay with their match.
function sharedSchedule(encounters: readonly StoryEncounter[]): string | undefined {
	const first = encounters[0]?.scheduledAtLabel;
	return first && encounters.every((encounter) => encounter.scheduledAtLabel === first)
		? first
		: undefined;
}

function drawHeader(
	context: CanvasRenderingContext2D,
	payload: MatchdayStoryPayload,
	logo: HTMLImageElement | undefined,
): void {
	if (logo) drawImageContain(context, logo, 72, 100, 190, 82);
	else {
		setFont(context, 700, 26);
		context.fillStyle = storyTheme.textStrong;
		context.fillText('KINGS PADEL LEAGUE', 72, 152);
	}

	setFont(context, 500, 24);
	context.textAlign = 'right';
	context.fillStyle = storyTheme.textMuted;
	fillTextFit(context, payload.seasonLabel, 1008, 152, 450, 20);
	context.textAlign = 'left';

	context.fillStyle = storyTheme.brand;
	context.fillRect(72, 240, 64, 4);
	setFont(context, 700, 88, true);
	const titleInk = context.createLinearGradient(72, 0, 900, 0);
	titleInk.addColorStop(0, storyTheme.textStrong);
	titleInk.addColorStop(0.35, storyTheme.textStrong);
	titleInk.addColorStop(1, storyTheme.brand);
	context.fillStyle = titleInk;
	fillTextFit(context, payload.matchdayLabel.toLocaleUpperCase('es'), 72, 340, 936, 48);
	setFont(context, 500, 28);
	context.fillStyle = storyTheme.textStrong;
	fillTextFit(context, sharedSchedule(payload.encounters) ?? payload.dateLabel, 76, 400, 928, 22);
	setFont(context, 400, 25);
	context.fillStyle = storyTheme.textMuted;
	fillTextFit(context, payload.venue, 76, 444, 928, 20);
}

function drawEncounters(
	context: CanvasRenderingContext2D,
	payload: MatchdayStoryPayload,
	images: ReadonlyMap<string, HTMLImageElement>,
): void {
	const { encounters } = payload;
	if (encounters.length === 0) return;
	const top = 510;
	const bottom = 1715;
	const gap = 22;
	let maximumCardHeight = 390;
	if (encounters.length === 1) maximumCardHeight = 720;
	else if (encounters.length === 2) maximumCardHeight = 540;
	const cardHeight = Math.min(
		maximumCardHeight,
		(bottom - top - gap * (encounters.length - 1)) / encounters.length,
	);
	const showSchedule = !sharedSchedule(encounters);
	encounters.forEach((encounter, index) => {
		drawEncounter(
			context,
			encounter,
			showSchedule,
			top + index * (cardHeight + gap),
			cardHeight,
			images,
		);
	});
}

function drawEncounter(
	context: CanvasRenderingContext2D,
	encounter: StoryEncounter,
	showSchedule: boolean,
	y: number,
	height: number,
	images: ReadonlyMap<string, HTMLImageElement>,
): void {
	const x = 60;
	const width = 960;
	const compact = height < 330;
	drawEncounterSurface(context, x, y, width, height);
	if (showSchedule) {
		setFont(context, 500, compact ? 21 : 23);
		context.fillStyle = storyTheme.textMuted;
		fillTextFit(context, encounter.scheduledAtLabel, x + 34, y + 36, width - 68, 18);
	}

	const logoSize = compact ? 80 : 120;
	const teamY = y + (showSchedule ? 52 : 20);
	const centerX = x + width / 2;
	drawTeamLogo(context, encounter.homeTeam, images, centerX - 48 - logoSize, teamY, logoSize);
	drawTeamLogo(context, encounter.awayTeam, images, centerX + 48, teamY, logoSize);
	setFont(context, 400, 22, true);
	context.fillStyle = storyTheme.textMuted;
	context.textAlign = 'center';
	context.fillText('vs', centerX, teamY + logoSize / 2 + 8);
	context.textAlign = 'left';

	const dividerY = teamY + logoSize + 16;
	context.strokeStyle = 'rgb(255 255 255 / 0.08)';
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(x + 34, dividerY);
	context.lineTo(x + width - 34, dividerY);
	context.stroke();

	if (encounter.pairs.length === 0) {
		setFont(context, 400, 24);
		context.fillStyle = storyTheme.textMuted;
		context.textAlign = 'center';
		context.fillText(
			'Parejas por confirmar',
			x + width / 2,
			dividerY + (height - (dividerY - y)) / 2,
		);
		context.textAlign = 'left';
		return;
	}

	const pairsTop = dividerY + 10;
	const pairHeight = (y + height - pairsTop - 12) / encounter.pairs.length;
	encounter.pairs.forEach((pair, index) => {
		const rowY = pairsTop + index * pairHeight;
		if (index > 0) {
			context.strokeStyle = 'rgb(255 255 255 / 0.065)';
			context.beginPath();
			context.moveTo(x + 34, rowY);
			context.lineTo(x + width - 34, rowY);
			context.stroke();
		}
		drawPair(context, pair, x, width, rowY, pairHeight, compact);
	});
}

function drawEncounterSurface(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
): void {
	context.save();
	drawRoundRect(context, x, y, width, height, 18);
	context.shadowColor = 'rgb(0 0 0 / 0.3)';
	context.shadowBlur = 24;
	context.shadowOffsetY = 10;
	context.fillStyle = storyTheme.surface;
	context.fill();
	context.shadowColor = 'transparent';

	const surfaceLight = context.createLinearGradient(x, y, x + width * 0.3, y + height);
	surfaceLight.addColorStop(0, 'rgb(255 255 255 / 0.065)');
	surfaceLight.addColorStop(0.55, 'rgb(255 255 255 / 0.015)');
	surfaceLight.addColorStop(1, 'transparent');
	context.fillStyle = surfaceLight;
	context.fill();

	const edgeLight = context.createLinearGradient(x, y, x + width, y + height);
	edgeLight.addColorStop(0, 'rgb(255 255 255 / 0.16)');
	edgeLight.addColorStop(0.5, 'rgb(255 255 255 / 0.045)');
	edgeLight.addColorStop(1, 'rgb(255 255 255 / 0.02)');
	context.strokeStyle = edgeLight;
	context.lineWidth = 1;
	context.stroke();
	context.restore();
}

function drawTeamLogo(
	context: CanvasRenderingContext2D,
	team: StoryTeam,
	images: ReadonlyMap<string, HTMLImageElement>,
	x: number,
	y: number,
	logoSize: number,
): void {
	const image = team.logoPath ? images.get(team.logoPath) : undefined;
	if (image) drawImageContain(context, image, x, y, logoSize, logoSize);
	else drawMonogram(context, team, x, y, logoSize);
}

function drawPair(
	context: CanvasRenderingContext2D,
	pair: StoryPair,
	x: number,
	width: number,
	y: number,
	height: number,
	compact: boolean,
): void {
	const centerY = y + height / 2;
	const fontSize = Math.max(17, Math.min(compact ? 23 : 27, height * 0.27));
	context.fillStyle = storyTheme.textStrong;
	drawPlayerNames(context, pair.homePlayers, x + 38, centerY, height, 360, fontSize, 'left');
	drawPlayerNames(
		context,
		pair.awayPlayers,
		x + width - 38,
		centerY,
		height,
		360,
		fontSize,
		'right',
	);

	setFont(context, 400, Math.max(14, fontSize - 8), true);
	context.fillStyle = storyTheme.textMuted;
	context.textAlign = 'center';
	fillTextFit(context, pair.label, x + width / 2, centerY - 8, 140, 14);
	setFont(context, 400, 20, true);
	context.fillText('vs', x + width / 2, centerY + 20);
	context.textAlign = 'left';
}

function drawPlayerNames(
	context: CanvasRenderingContext2D,
	players: readonly string[],
	x: number,
	centerY: number,
	rowHeight: number,
	maxWidth: number,
	fontSize: number,
	align: 'left' | 'right',
): void {
	const visiblePlayers = players.slice(0, 2);
	const lineGap = Math.min(fontSize * 1.35, rowHeight * 0.34);
	const firstBaseline = centerY - ((visiblePlayers.length - 1) * lineGap) / 2 + fontSize * 0.34;
	context.textAlign = align;
	visiblePlayers.forEach((player, index) => {
		setFont(context, 500, fontSize);
		fillTextFit(context, player, x, firstBaseline + index * lineGap, maxWidth, 16);
	});
}

function drawFooter(context: CanvasRenderingContext2D): void {
	setFont(context, 400, 23);
	context.textAlign = 'center';
	context.fillStyle = storyTheme.textMuted;
	context.fillText('@kingspadel.league', STORY_WIDTH / 2, 1816);
	context.textAlign = 'left';
}

async function loadImages(sources: readonly string[]): Promise<Map<string, HTMLImageElement>> {
	const uniqueSources = [...new Set(sources)];
	const entries = await Promise.all(
		uniqueSources.map(async (source): Promise<[string, HTMLImageElement] | null> => {
			try {
				return [source, await loadImage(source)];
			} catch {
				return null;
			}
		}),
	);
	return new Map(entries.filter((entry): entry is [string, HTMLImageElement] => entry !== null));
}

function loadImage(source: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.decoding = 'async';
		image.onload = () => {
			resolve(image);
		};
		image.onerror = () => {
			reject(new Error(`No se pudo cargar ${source}.`));
		};
		image.src = source;
	});
}

function downloadStory(blob: Blob, label: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = `kpl-${slugify(label)}-instagram-story.png`;
	anchor.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 1_000);
}

function drawImageContain(
	context: CanvasRenderingContext2D,
	image: HTMLImageElement,
	x: number,
	y: number,
	width: number,
	height: number,
): void {
	const sourceWidth = image.naturalWidth;
	const sourceHeight = image.naturalHeight;
	const scale = Math.min(width / sourceWidth, height / sourceHeight);
	const renderWidth = sourceWidth * scale;
	const renderHeight = sourceHeight * scale;
	context.drawImage(
		image,
		x + (width - renderWidth) / 2,
		y + (height - renderHeight) / 2,
		renderWidth,
		renderHeight,
	);
}

function drawMonogram(
	context: CanvasRenderingContext2D,
	team: StoryTeam,
	x: number,
	y: number,
	size: number,
): void {
	context.fillStyle = safeColor(team.primaryColor);
	context.beginPath();
	context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
	context.fill();
	setFont(context, 900, size * 0.35, true);
	context.fillStyle = storyTheme.background;
	context.textAlign = 'center';
	context.fillText(team.monogram, x + size / 2, y + size * 0.64);
	context.textAlign = 'left';
}

function drawRoundRect(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
	const safeRadius = Math.min(radius, width / 2, height / 2);
	context.beginPath();
	context.moveTo(x + safeRadius, y);
	context.arcTo(x + width, y, x + width, y + height, safeRadius);
	context.arcTo(x + width, y + height, x, y + height, safeRadius);
	context.arcTo(x, y + height, x, y, safeRadius);
	context.arcTo(x, y, x + width, y, safeRadius);
	context.closePath();
}

function fillTextFit(
	context: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	minimumSize: number,
): void {
	const pxIndex = context.font.indexOf('px');
	const sizeStart = context.font.lastIndexOf(' ', pxIndex) + 1;
	const fontPrefix = context.font.slice(0, sizeStart);
	const fontSuffix = context.font.slice(pxIndex);
	let size = Number.parseInt(context.font.slice(sizeStart, pxIndex), 10) || minimumSize;
	while (context.measureText(text).width > maxWidth && size > minimumSize) {
		size -= 1;
		context.font = `${fontPrefix}${size}${fontSuffix}`;
	}
	context.fillText(text, x, y, maxWidth);
}

function setFont(
	context: CanvasRenderingContext2D,
	weight: number,
	size: number,
	condensed = false,
): void {
	const family = condensed ? storyTheme.headingFont : storyTheme.bodyFont;
	context.font = `${weight} ${size}px ${family}`;
}

function safeColor(color: string): string {
	return /^#[\da-f]{3,8}$/i.test(color) ? color : storyTheme.brand;
}

function slugify(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('es')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
