export default function parseAndValidateExtraItems(
  raw: string,
): { name: string; price: number }[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('extraItems must be an array');
    }

    for (const item of parsed) {
      if (
        typeof item.name !== 'string' ||
        !item.name.trim() ||
        typeof item.price !== 'number' ||
        item.price < 0
      ) {
        throw new Error(
          'Each extra item must have a valid name and a positive price',
        );
      }
    }

    return parsed;
  } catch (err) {
    throw new Error(`Invalid extraItems: ${err.message}`);
  }
}
