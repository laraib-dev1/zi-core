export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  category?: string;
  image?: string;
  status?: "active" | "disable";
  metaFeatures?: string;  // HTML content
  metaInfo?: string;      // HTML content
  video1?: string;        // YouTube URL
  video2?: string; 
   [key: string]: any;
}
