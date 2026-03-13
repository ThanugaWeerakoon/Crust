export type Category =
  | 'Mocktails'
  | 'Smoothies'
  | 'Milkshake'
  | 'Juice'
  | 'Soft Drinks'
  | 'The Classics'
  | 'Wines'
  | 'Beer'
  | 'Pizza'
  | 'Add Ons'
  | 'Tacos'
  | 'From the Grill'
  | 'To Share'
  | 'Salads'
  | 'Sweets';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  image?: string;
  description: string;
  available: boolean;
  discount?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  firestoreId: string;
  items: CartItem[];
  discountId?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
  tableNumber?: string;
  isTakeaway: boolean;
  status: 'Pending' | 'Refunded' | 'Completed';
  date: string;
  cashier: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Admin' | 'Cashier' | 'Manager';
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesTo: 'order' | 'item';
  validFrom: string;
  validTo: string;
  enabled: boolean;
  itemIds?: string[];
}

interface MenuForm {
  name: string;
  description: string;
  price: string; // string for input
  category: Category;
  available: boolean;
}

const emptyForm: MenuForm = {
  name: "",
  description: "",
  price: "", // string
  category: "Mocktails",
  available: true
};