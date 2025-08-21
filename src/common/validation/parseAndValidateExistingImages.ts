export interface ExistingImage {
  productId: string;
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
        typeof item.productId !== 'string' ||
        !item.imageUrl ||
        typeof item.imageUrl !== 'string' ||
        !item.imagePublicId ||
        typeof item.imagePublicId !== 'string'
      ) {
        throw new Error(
          'Each existing image must have productId (number), imageUrl (string), and imagePublicId (string)',
        );
      }
    }

    return parsed;
  } catch (err) {
    throw new Error(`Invalid existingImages: ${err.message}`);
  }
}
