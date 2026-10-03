import { 
  Product, 
  StockMovement, 
  Order, 
  OrderItem, 
  PurchaseOrder, 
  MembershipTier, 
  ProductCategory 
} from '../types';

/**
 * Pure function: Calculates real-time available stock (Physical on-hand minus active reserved units).
 * This prevents overselling across Counter POS, Click & Collect, and Home Delivery.
 */
export function getAvailableStock(product: Product): number {
  if (product.isServiceItem) return 999; // Services like re-stringing have unlimited stock
  const reserved = product.reservedQty || 0;
  return Math.max(0, product.stockQty - reserved);
}

/**
 * Pure function: Validates whether requested cart items can be fulfilled from available stock.
 */
export function validateStockAvailability(
  items: { productId: string; quantity: number }[],
  products: Product[]
): {
  available: boolean;
  errors: { productId: string; productName: string; requested: number; available: number }[];
} {
  const errors: { productId: string; productName: string; requested: number; available: number }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      errors.push({
        productId: item.productId,
        productName: 'Unknown Product',
        requested: item.quantity,
        available: 0,
      });
      continue;
    }

    if (product.isServiceItem) continue;

    const available = getAvailableStock(product);
    if (available < item.quantity) {
      errors.push({
        productId: product.id,
        productName: product.name,
        requested: item.quantity,
        available,
      });
    }
  }

  return {
    available: errors.length === 0,
    errors,
  };
}

/**
 * Pure function: Reserves stock when an online/pickup order is placed.
 * Increases `reservedQty` so other channels cannot sell these units.
 */
export function reserveStock(
  items: { productId: string; quantity: number }[],
  products: Product[]
): Product[] {
  const itemMap = new Map<string, number>();
  items.forEach((i) => {
    itemMap.set(i.productId, (itemMap.get(i.productId) || 0) + i.quantity);
  });

  return products.map((product) => {
    const qtyToReserve = itemMap.get(product.id);
    if (!qtyToReserve || product.isServiceItem) return product;

    const currentReserved = product.reservedQty || 0;
    return {
      ...product,
      reservedQty: currentReserved + qtyToReserve,
    };
  });
}

/**
 * Pure function: Releases reserved stock when an unfulfilled order is cancelled or expired.
 */
export function releaseReservedStock(
  items: { productId: string; quantity: number }[],
  products: Product[]
): Product[] {
  const itemMap = new Map<string, number>();
  items.forEach((i) => {
    itemMap.set(i.productId, (itemMap.get(i.productId) || 0) + i.quantity);
  });

  return products.map((product) => {
    const qtyToRelease = itemMap.get(product.id);
    if (!qtyToRelease || product.isServiceItem) return product;

    const currentReserved = product.reservedQty || 0;
    return {
      ...product,
      reservedQty: Math.max(0, currentReserved - qtyToRelease),
    };
  });
}

/**
 * Pure function: Commits permanent stock deduction (for POS instant sales or fulfilled online orders).
 * Deducts physical `stockQty` and records audit `StockMovement` entries.
 */
export function commitStockDeduction(
  items: { productId: string; quantity: number; unitPrice?: number }[],
  products: Product[],
  fromReserved = false,
  referenceId = `SALE-${Date.now()}`,
  performedBy = 'Staff / POS'
): {
  updatedProducts: Product[];
  movements: StockMovement[];
} {
  const itemMap = new Map<string, number>();
  items.forEach((i) => {
    itemMap.set(i.productId, (itemMap.get(i.productId) || 0) + i.quantity);
  });

  const movements: StockMovement[] = [];

  const updatedProducts = products.map((product) => {
    const qtyDeducted = itemMap.get(product.id);
    if (!qtyDeducted || product.isServiceItem) return product;

    const newStock = Math.max(0, product.stockQty - qtyDeducted);
    const newReserved = fromReserved 
      ? Math.max(0, (product.reservedQty || 0) - qtyDeducted) 
      : (product.reservedQty || 0);

    movements.push({
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productName: product.name,
      change: -qtyDeducted,
      type: 'sale',
      notes: `Sold ${qtyDeducted} unit(s) via ${referenceId}`,
      performedBy,
      timestamp: new Date().toISOString(),
      referenceId,
    });

    return {
      ...product,
      stockQty: newStock,
      reservedQty: newReserved,
    };
  });

  return { updatedProducts, movements };
}

/**
 * Pure function: Restocks a product (manual replenishment or supplier delivery).
 */
export function restockProduct(
  productId: string,
  quantity: number,
  products: Product[],
  reason: string,
  performedBy: string,
  referenceId?: string
): {
  updatedProducts: Product[];
  movement: StockMovement;
} {
  let affectedProduct: Product | undefined;

  const updatedProducts = products.map((p) => {
    if (p.id === productId) {
      affectedProduct = p;
      return {
        ...p,
        stockQty: p.stockQty + quantity,
      };
    }
    return p;
  });

  const movement: StockMovement = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    productId,
    productName: affectedProduct?.name || 'Product',
    change: quantity,
    type: 'restock',
    notes: reason || `Manual restock (+${quantity})`,
    performedBy,
    timestamp: new Date().toISOString(),
    referenceId,
  };

  return { updatedProducts, movement };
}

/**
 * Pure function: Stock adjustment for shrinkage, count discrepancies, or damage.
 */
export function adjustStock(
  productId: string,
  newStockQty: number,
  products: Product[],
  reason: string,
  performedBy: string
): {
  updatedProducts: Product[];
  movement: StockMovement;
} {
  let diff = 0;
  let affectedProduct: Product | undefined;

  const updatedProducts = products.map((p) => {
    if (p.id === productId) {
      affectedProduct = p;
      diff = newStockQty - p.stockQty;
      return {
        ...p,
        stockQty: newStockQty,
      };
    }
    return p;
  });

  const movement: StockMovement = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    productId,
    productName: affectedProduct?.name || 'Product',
    change: diff,
    type: 'adjustment',
    notes: `Inventory Count Adjustment: ${reason} (${diff > 0 ? '+' : ''}${diff})`,
    performedBy,
    timestamp: new Date().toISOString(),
  };

  return { updatedProducts, movement };
}

/**
 * Pure function: Processes reception of Purchase Orders (supporting partial receipts).
 * Updates inventory stockQty and generates 'po_receipt' stock movements.
 */
export function receivePurchaseOrderStock(
  po: PurchaseOrder,
  receipts: { productId: string; receivedQty: number }[],
  products: Product[],
  performedBy: string
): {
  updatedProducts: Product[];
  movements: StockMovement[];
  updatedPo: PurchaseOrder;
} {
  const receiptMap = new Map<string, number>();
  receipts.forEach((r) => receiptMap.set(r.productId, r.receivedQty));

  const movements: StockMovement[] = [];
  const updatedProducts = products.map((product) => {
    const qtyReceived = receiptMap.get(product.id);
    if (!qtyReceived || qtyReceived <= 0) return product;

    movements.push({
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      productName: product.name,
      change: qtyReceived,
      type: 'po_receipt',
      notes: `Received from PO #${po.poNumber} (${po.supplierName})`,
      performedBy,
      timestamp: new Date().toISOString(),
      referenceId: po.id,
    });

    return {
      ...product,
      stockQty: product.stockQty + qtyReceived,
    };
  });

  // Update PO item counts
  const updatedItems = po.items.map((item) => {
    const newlyReceived = receiptMap.get(item.productId) || 0;
    return {
      ...item,
      receivedQty: item.receivedQty + newlyReceived,
    };
  });

  const allFulfilled = updatedItems.every((item) => item.receivedQty >= item.orderedQty);
  const someReceived = updatedItems.some((item) => item.receivedQty > 0);

  const updatedPo: PurchaseOrder = {
    ...po,
    items: updatedItems,
    status: allFulfilled ? 'received' : someReceived ? 'partially_received' : po.status,
    receivedDate: allFulfilled ? new Date().toISOString().split('T')[0] : po.receivedDate,
  };

  return { updatedProducts, movements, updatedPo };
}

/**
 * Pure function: Computes total inventory valuation, retail worth, and stock health metrics.
 */
export function calculateStockValuation(products: Product[]): {
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  profitMarginPercent: number;
  totalProductsCount: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
} {
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let totalUnitsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((p) => {
    if (p.isServiceItem) return;

    const units = p.stockQty || 0;
    const cost = (p.costPrice || 0) * units;
    const retail = (p.price || 0) * units;

    totalCostValue += cost;
    totalRetailValue += retail;
    totalUnitsInStock += units;

    if (units === 0) {
      outOfStockCount += 1;
    } else if (units <= p.reorderLevel) {
      lowStockCount += 1;
    }
  });

  const potentialProfit = Math.max(0, totalRetailValue - totalCostValue);
  const profitMarginPercent = totalRetailValue > 0 ? Math.round((potentialProfit / totalRetailValue) * 100) : 0;

  return {
    totalCostValue,
    totalRetailValue,
    potentialProfit,
    profitMarginPercent,
    totalProductsCount: products.filter((p) => !p.isServiceItem).length,
    totalUnitsInStock,
    lowStockCount,
    outOfStockCount,
  };
}

/**
 * Pure function: Fast & Slow Movers Velocity Analysis.
 */
export interface ProductVelocity {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  category: ProductCategory;
  unitsSold: number;
  revenue: number;
  stockQty: number;
  daysOfInventoryRemaining: number;
}

export function calculateProductVelocity(
  products: Product[],
  orders: Order[]
): {
  fastMovers: ProductVelocity[];
  slowMovers: ProductVelocity[];
} {
  const salesMap = new Map<string, { unitsSold: number; revenue: number }>();

  orders.forEach((order) => {
    if (order.status === 'cancelled' || order.status === 'refunded') return;
    (order.items || []).forEach((item) => {
      const existing = salesMap.get(item.productId) || { unitsSold: 0, revenue: 0 };
      salesMap.set(item.productId, {
        unitsSold: existing.unitsSold + item.quantity,
        revenue: existing.revenue + item.finalPrice,
      });
    });
  });

  const velocityList: ProductVelocity[] = products
    .filter((p) => !p.isServiceItem)
    .map((p) => {
      const sales = salesMap.get(p.id) || { unitsSold: 0, revenue: 0 };
      const avgDailySales = Math.max(0.05, sales.unitsSold / 30);
      const daysOfInventoryRemaining = Math.round(p.stockQty / avgDailySales);

      return {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        category: p.category,
        unitsSold: sales.unitsSold,
        revenue: sales.revenue,
        stockQty: p.stockQty,
        daysOfInventoryRemaining,
      };
    });

  const sortedBySales = [...velocityList].sort((a, b) => b.unitsSold - a.unitsSold);
  const fastMovers = sortedBySales.slice(0, 8);
  const slowMovers = sortedBySales.filter((p) => p.unitsSold <= 1).slice(0, 8);

  return { fastMovers, slowMovers };
}

/**
 * Pure function: Calculates itemized order prices with member tier discounts and GST.
 * Gold: 20%, Silver: 10%, Junior: 5%, Walk-in: 0%.
 */
export function getMemberShopDiscountPercent(tier: MembershipTier): number {
  switch (tier) {
    case 'gold': return 20;
    case 'silver': return 10;
    case 'junior': return 5;
    default: return 0;
  }
}

export function calculateTierPrice(mrp: number, tier: MembershipTier): number {
  const discountPct = getMemberShopDiscountPercent(tier) / 100;
  return Math.round(mrp * (1 - discountPct));
}
