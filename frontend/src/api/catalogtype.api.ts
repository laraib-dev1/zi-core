import API from "./axios";

export const getCatalogTypes = async () => {
  const res = await API.get("/catalogtypes");
  return res.data.data;
};

export const getEnabledCatalogTypes = async () => {
  const res = await API.get("/catalogtypes/enabled");
  return res.data.data;
};

export const createCatalogType = async (data: { slug: string; label: string; showInAdmin?: boolean; order?: number }) => {
  const res = await API.post("/catalogtypes", data);
  return res.data.data;
};

export const updateCatalogType = async (id: string, data: Partial<{ slug: string; label: string; showInAdmin: boolean; order: number }>) => {
  const res = await API.put(`/catalogtypes/${id}`, data);
  return res.data.data;
};

export const deleteCatalogType = async (id: string) => {
  const res = await API.delete(`/catalogtypes/${id}`);
  return res.data;
};
