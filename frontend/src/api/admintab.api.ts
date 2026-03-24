import API from "./axios";

export const getAdminTabs = async () => {
  const res = await API.get("/admintabs");
  return res.data.data;
};

export const getEnabledAdminTabs = async () => {
  const res = await API.get("/admintabs/enabled");
  return res.data.data;
};

export const createAdminTab = async (tab: any) => {
  const res = await API.post("/admintabs", tab);
  return res.data.data;
};

export const updateAdminTab = async (id: string, tab: any) => {
  const res = await API.put(`/admintabs/${id}`, tab);
  return res.data.data;
};

export const deleteAdminTab = async (id: string) => {
  const res = await API.delete(`/admintabs/${id}`);
  return res.data;
};





















