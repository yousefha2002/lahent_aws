import { ProductVariantType } from '../enums/product_varaint_type';

export type variantType = {
  name: string;
  price: number;
  type: ProductVariantType;
  imageUrl?:string,
  imagePublicId?:string
};
