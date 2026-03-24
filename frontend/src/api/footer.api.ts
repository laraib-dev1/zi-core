import API from "./axios";

export const getFooter = async () => {
  const res = await API.get("/footer");
  return res.data.data;
};

export const updateFooter = async (footer: any) => {
  const res = await API.put("/footer", footer);
  return res.data.data;
};





















