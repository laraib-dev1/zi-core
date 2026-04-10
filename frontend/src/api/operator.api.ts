import API from "./axios";

export const getOperatorUsers = async () => {
  const res = await API.get("/operators");
  return res.data.data;
};

export const getOperatorUserById = async (id: string) => {
  const res = await API.get(`/operators/${id}`);
  return res.data.data;
};

export const updateOperatorUser = async (id: string, payload: any) => {
  const res = await API.put(`/operators/${id}`, payload);
  return res.data.data;
};

export const updateOperatorPassword = async (id: string, newPassword: string) => {
  const res = await API.put(`/operators/${id}/password`, { newPassword });
  return res.data;
};

export const deleteOperatorUser = async (id: string) => {
  const res = await API.delete(`/operators/${id}`);
  return res.data;
};
