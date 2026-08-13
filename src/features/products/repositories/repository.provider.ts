import {
  productRepository,
  type IProductRepository,
} from "./product.repository";


export const productRepositoryProvider:
  IProductRepository =
    productRepository;