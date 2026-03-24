export interface Address {
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  area?: string;
  postalCode: string;
  phone: string;
  line1: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerName: string;
  address: Address;
  phoneNumber: string;
  items: OrderItem[];
  type: string;
  bill: number;
  payment: string;
  status: string;
  cancelledBy?: "user" | "admin";
  cancelledAt?: string;
  createdAt: string;
}
