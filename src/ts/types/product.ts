
// 상품 목록
export interface MenuItem {
    menuId: number;
    userId: string;
    no: number;
    image: string;
    name: string;
    price: string;
    empty: string;
}

// 상품 상태 로고
export interface MenuState {
    event: string;
    new: string;
    best: string;
}

// 상품 Item 목록 
export interface MenuItemIngredient {
    type: string;
    value1: string;  // 혹은 number로도 가능
    value2: string;  // 혹은 number
    value3: string;  // 혹은 number
    value4: string | number; // 0으로 오는 경우가 있어 number도 허용
}

// 상품 상세
export interface MenuDetail {
    menuId: number;
    userId: string;
    no: number;
    name: string;
    price: string;
    category: string;
    cup: string; // "plastic" | "paper" 등
    empty: string; // "yes" | "no"
    iceYn: string; // "yes" | "no"
    iceTime: string;
    waterTime: string;
    image: string;
    state: MenuState;
    items: MenuItemIngredient[];
}