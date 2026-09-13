export type Role = 'CUSTOMER' | 'CALL_AGENT' | 'RESTAURANT_ADMIN' | 'RIDER' | 'OPERATIONS_ADMIN' | 'SUPER_ADMIN';

export type OrderSource = 'ONLINE' | 'PHONE_CALL' | 'EASY_ORDER' | 'AGENT';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'RIDER_ACCEPTED'
  | 'AT_RESTAURANT'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'MOCK_UPI' | 'MOCK_CARD';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  roleProfileId?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  phone: string;
  isVegOnly: boolean;
  isOpen: boolean;
  imageUrl: string;
  categories?: MenuCategory[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId: string;
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedMinutes: number;
  currentLat?: number;
  currentLng?: number;
  rider?: {
    id: string;
    vehicleType: string;
    vehicleNumber: string;
    user: { name: string; phone: string };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  restaurantId: string;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  deliveryAddress: string;
  landmark?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  restaurant?: Restaurant;
  customer?: { id: string; user: User };
  statusHistory?: OrderStatusHistory[];
  delivery?: Delivery;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}
