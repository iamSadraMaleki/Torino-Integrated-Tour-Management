// ==================== انبار (Inventory) ====================

export type InventoryCategory = "FOOD" | "DRINK" | "DESSERT" | "OTHER";

export interface InventoryItem {
  id: number;
  name: string;
  category: InventoryCategory;
  categoryPersian: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  lowStock: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemRequest {
  name: string;
  category: InventoryCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  description?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  totalQuantity: number;
  byCategory: {
    category: InventoryCategory;
    categoryPersian: string;
    count: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== لیست خرید (Shopping) ====================

export type ShoppingStatus = "PENDING" | "PURCHASED" | "CANCELLED";

export interface ShoppingItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  status: ShoppingStatus;
  statusPersian: string;
  note: string;
  inventoryItemId: number | null;
  inventoryItemName: string | null;
  createdBy: string;
  createdAt: string;
  purchasedAt: string | null;
}

export interface ShoppingItemRequest {
  name: string;
  quantity: number;
  unit: string;
  note?: string;
  inventoryItemId?: number | null;
}

export interface ShoppingStats {
  pendingCount: number;
  purchasedCount: number;
  cancelledCount: number;
  purchasedQuantity: number;
}

export const INVENTORY_CATEGORY_META: Record<InventoryCategory, { icon: string; label: string }> = {
  FOOD: { icon: "🍞", label: "مواد غذایی" },
  DRINK: { icon: "🥤", label: "نوشیدنی" },
  DESSERT: { icon: "🍰", label: "دسر" },
  OTHER: { icon: "📦", label: "سایر" },
};

export const SHOPPING_STATUS_META: Record<ShoppingStatus, { icon: string; label: string; color: string }> = {
  PENDING: { icon: "⏳", label: "در انتظار خرید", color: "#f59e0b" },
  PURCHASED: { icon: "✅", label: "خریداری شد", color: "#10b981" },
  CANCELLED: { icon: "❌", label: "لغو شد", color: "#ef4444" },
};
