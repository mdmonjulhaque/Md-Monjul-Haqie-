export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  description: string;
  descriptionBn: string;
  brand: string;
  brandBn: string;
  price: number;
  discountPrice: number;
  rating: number;
  stock: number;
  images: string[];
  sizes: string[];
  colors: string[];
  reviews: Review[];
  isNew?: boolean;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  count: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  nameBn: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface OrderStatusLog {
  status: string;
  timestamp: string;
  note: string;
  noteBn: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  postalCode: string;
  paymentMethod: string;
  paymentDetails?: {
    transactionId?: string;
    cardLast4?: string;
    payTime?: string;
  };
  items: OrderItem[];
  shippingFee: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  statusLogs: OrderStatusLog[];
  trackingNumber: string;
  createdAt: string;
  invoiceUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  district?: string;
  upazila?: string;
  postalCode?: string;
  role: "customer" | "admin";
  blocked: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  expiryDate: string;
  active: boolean;
  description?: string;
  descriptionBn?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  link: string;
  active: boolean;
}

export interface CartItem {
  id: string; // unique cart uuid or key: productId-color-size
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface LiveMessage {
  id: string;
  sender: "user" | "bot" | "admin";
  text: string;
  timestamp: string;
}
