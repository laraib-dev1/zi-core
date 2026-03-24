import API from "./axios";

export const getWebPages = async () => {
  const res = await API.get("/webpages");
  return res.data.data;
};

export const getEnabledWebPages = async () => {
  const res = await API.get("/webpages/enabled");
  return res.data.data;
};

export const getEnabledWebPagesByLocation = async (location: "nav" | "footer" | "both") => {
  const res = await API.get(`/webpages/enabled/${location}`);
  return res.data.data;
};

export const createWebPage = async (page: any) => {
  const res = await API.post("/webpages", page);
  return res.data.data;
};

export const updateWebPage = async (id: string, page: any) => {
  const res = await API.put(`/webpages/${id}`, page);
  return res.data.data;
};

export const deleteWebPage = async (id: string) => {
  const res = await API.delete(`/webpages/${id}`);
  return res.data;
};
