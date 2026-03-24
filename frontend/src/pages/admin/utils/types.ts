// frontend/src/pages/admin/utils/types.ts

export interface Product {
  id: number;
  title: string;
  price: number;
  description?: string;
  category_id?: number;
  image?: string; // base64 or URL
  created_at?: string;
  updated_at?: string;
}
