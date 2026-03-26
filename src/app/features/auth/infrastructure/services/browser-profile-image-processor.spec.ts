import imageCompression from 'browser-image-compression';

import { BrowserProfileImageProcessor } from './browser-profile-image-processor';

jest.mock('browser-image-compression', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('BrowserProfileImageProcessor', () => {
  const imageCompressionMock = jest.mocked(imageCompression);
  let processor: BrowserProfileImageProcessor;

  beforeEach(() => {
    processor = new BrowserProfileImageProcessor();
    imageCompressionMock.mockReset();
  });

  it('compresses valid images with the configured storage-saving options', async () => {
    const originalFile = new File([new Uint8Array(160_000)], 'avatar.png', { type: 'image/png' });
    const compressedFile = new File(['compressed-avatar'], 'avatar.webp', {
      type: 'image/webp',
    });
    imageCompressionMock.mockResolvedValue(compressedFile);

    await expect(processor.process(originalFile)).resolves.toBe(compressedFile);

    expect(imageCompressionMock).toHaveBeenCalledWith(
      originalFile,
      expect.objectContaining({
        fileType: 'image/webp',
        initialQuality: 1,
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }),
    );
  });

  it('returns small images without compression when they are already lightweight', async () => {
    const originalFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    await expect(processor.process(originalFile)).resolves.toBe(originalFile);
    expect(imageCompressionMock).not.toHaveBeenCalled();
  });

  it('falls back to the original image when compression fails', async () => {
    const originalFile = new File([new Uint8Array(160_000)], 'avatar.png', { type: 'image/png' });
    imageCompressionMock.mockRejectedValue(new Error('Compression failed'));

    await expect(processor.process(originalFile)).resolves.toBe(originalFile);
  });

  it('rejects files that are not images', async () => {
    const invalidFile = new File(['document'], 'avatar.pdf', { type: 'application/pdf' });

    await expect(processor.process(invalidFile)).rejects.toThrow('El archivo no es una imagen');
    expect(imageCompressionMock).not.toHaveBeenCalled();
  });
});
