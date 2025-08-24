export interface ExistingImage {
  imageUrl: string;
  imagePublicId: string;
}

export function parseAndValidateExistingImages(raw: string): ExistingImage[] {
  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('existingImages must be an array');
    }

    for (const item of parsed) {
      if (
        !item.imageUrl ||
        typeof item.imageUrl !== 'string' ||
        !item.imagePublicId ||
        typeof item.imagePublicId !== 'string'
      ) {
        throw new Error(
          'Each existing image imageUrl (string), and imagePublicId (string)',
        );
      }
    }

    return parsed;
  } catch (err) {
    throw new Error(`Invalid existingImages: ${err.message}`);
  }
}
