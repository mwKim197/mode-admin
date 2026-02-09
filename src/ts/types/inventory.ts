export interface InventoryItem {
    current: number;
    max: number;
}

export interface InventoryGroup {
    [key: string]: InventoryItem;
}

export interface InventoryData {
    coffee?: InventoryGroup;
    garucha?: InventoryGroup;
    syrup?: InventoryGroup;
    cup?: InventoryGroup;
}

export interface InventoryResponse {
    ok: boolean;
    inventory: InventoryData;
    flags?: {
        alert10?: Record<string, boolean>;
        alert30?: Record<string, boolean>;
        soldOut?: Record<string, boolean>;
    };
    updatedAt?: string;
}
