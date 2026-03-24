// frontend/src/types/index.ts
export interface Category {
  id: string;      // string because MongoDB IDs are strings
  icon: string;
  name: string;
  products: number;
}
