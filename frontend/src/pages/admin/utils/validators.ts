import { z } from "zod";

export const productSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(2, "Title required").max(200),
  price: z.number().min(0.01, "Price must be > 0"),
  description: z.string().optional(),
  category_id: z.number().int(),
  image: z.any().optional(), // file upload
});

export type ProductForm = z.infer<typeof productSchema>;
