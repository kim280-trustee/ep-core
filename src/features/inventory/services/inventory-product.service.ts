import { inventoryService } from "./inventory.service";
import { productService } from "../../products";

class InventoryProductService {
  getInventoryWithProducts() {
    return inventoryService.getInventory().map((record) => {
      const product = productService.getProduct(
        "",
        record.productId,
      );

      return {
        ...record,
        product,
      };
    });
  }

  getProductInventory(productId: string) {
    const inventory =
      inventoryService.getProductStock(productId);

    const product =
      productService.getProduct(
        "",
        productId,
      );

    return {
      product,
      inventory,
    };
  }
}

export const inventoryProductService =
  new InventoryProductService();