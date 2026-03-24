import API from "./axios";

export const getProfilePages = async () => {
  const res = await API.get("/profilepages");
  return res.data.data;
};

export const getEnabledProfilePages = async () => {
  const res = await API.get("/profilepages/enabled");
  return res.data.data;
};

export const getProfilePageBySlug = async (slug: string) => {
  const res = await API.get(`/profilepages/${slug}`);
  return res.data.data;
};

export const createProfilePage = async (page: any) => {
  const res = await API.post("/profilepages", page);
  return res.data.data;
};

export const updateProfilePage = async (id: string, page: any) => {
  const res = await API.put(`/profilepages/${id}`, page);
  return res.data.data;
};

export const deleteProfilePage = async (id: string) => {
  const res = await API.delete(`/profilepages/${id}`);
  return res.data;
};

// Base profile tabs API (like admin tabs)
export const getBaseProfileTabs = async () => {
  const res = await API.get("/profilepages/base-tabs");
  return res.data.data;
};

export const getEnabledBaseProfileTabs = async () => {
  const res = await API.get("/profilepages/base-tabs/enabled");
  return res.data.data;
};

export const updateBaseProfileTab = async (id: string, tab: { enabled: boolean }) => {
  const res = await API.put(`/profilepages/base-tabs/${id}`, tab);
  return res.data.data;
};

