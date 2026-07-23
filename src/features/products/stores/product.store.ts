import {
  create,
} from "zustand";


import type {
  Product,
} from "../types/product.types";


import {
  productService,
} from "../services/product.service";



interface ProductStore {

  products: Product[];

  loadProducts(): void;


  addProduct(
    product: Product,
  ): void;


  updateProduct(
    id: string,
    updates: Partial<Product>,
  ): void;


  removeProduct(
    id: string,
  ): void;

}



export const useProductStore =
create<ProductStore>((set) => ({


  products: [],



  loadProducts() {

    set({

      products:
        productService.getProducts(),

    });

  },



  addProduct(product) {

    set((state) => ({

      products: [
        ...state.products,
        product,
      ],

    }));

  },



  updateProduct(
    id,
    updates,
  ) {

    const updated =
      productService.updateProduct(
        id,
        updates,
      );


    if (!updated) {
      return;
    }


    set((state) => ({

      products:
        state.products.map(
          (product) =>
            product.id === id
              ? updated
              : product,
        ),

    }));

  },



  removeProduct(id) {

    productService.deleteProduct(id);


    set((state) => ({

      products:
        state.products.filter(
          (product) =>
            product.id !== id,
        ),

    }));

  },


}));