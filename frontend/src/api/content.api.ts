import API from "./axios";

export type ContentType = "privacy" | "terms" | "faqs";

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContentPage {
  _id?: string;
  type: ContentType;
  title: string;
  subTitle: string;
  description: string;
  faqs?: FAQ[];
  lastUpdated?: string;
}

// Public: Get content by type
export const getContentByType = async (type: ContentType): Promise<ContentPage> => {
  const res = await API.get(`/content/${type}`);
  return res.data.data;
};

// Admin: Get all content pages
export const getAllContent = async (): Promise<ContentPage[]> => {
  const res = await API.get("/content");
  return res.data.data;
};

// Admin: Update content page
export const updateContent = async (
  type: ContentType,
  data: { title: string; subTitle: string; description: string; faqs?: FAQ[] }
): Promise<ContentPage> => {
  const res = await API.put(`/content/${type}`, data);
  return res.data.data;
};















