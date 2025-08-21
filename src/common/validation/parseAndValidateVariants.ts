import { ProductVariantType } from '../enums/product_varaint_type';

export default function parseAndValidateVariants(
  raw: string,
): { name: string; price: number; type: ProductVariantType }[] {
  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('variants must be an array');
    }

    for (const item of parsed) {
      if (
        typeof item.name !== 'string' ||
        !item.name.trim() ||
        typeof item.price !== 'number' ||
        item.price < 0 ||
        typeof item.type !== 'string' ||
        !Object.values(ProductVariantType).includes(item.type)
      ) {
        throw new Error(
          'Each variant must have a valid name, a positive price, and a valid type',
        );
      }
    }

    return parsed;
  } catch (err) {
    throw new Error(`Invalid variants: ${err.message}`);
  }
}
