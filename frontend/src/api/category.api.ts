import API from "./axios";

export const getCategories = async () => {
  const res = await API.get("/categories");
  return res.data.data;
};

export const addCategory = async (category: any) => {
  const formData = new FormData();
  formData.append("name", category.name);
  formData.append("products", String(category.products || 0));

  if (category.iconFile) {
    formData.append("icon", category.iconFile);
  }

  const res = await API.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};


export const updateCategory = async (id: string, category: any) => {
  const formData = new FormData();
  formData.append("name", category.name);
  formData.append("products", String(category.products || 0));

  if (category.iconFile) {
    formData.append("icon", category.iconFile);
  }

  const res = await API.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};


export const deleteCategory = async (id: string | number) => {
  const res = await API.delete(`/categories/${id}`);
  return res.data.success;
};
