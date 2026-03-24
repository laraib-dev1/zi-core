import API from "./axios";

// Get all queries (admin only)
export const getQueries = async () => {
  const res = await API.get("/queries");
  return res.data;
};

// Create query (public)
export const createQuery = async (data: { email: string; subject: string; description: string }) => {
  const res = await API.post("/queries/create", data);
  return res.data;
};

// Update query status (admin only)
export const updateQueryStatus = async (id: string, status: "Pending" | "Read" | "Replied") => {
  const res = await API.patch(`/queries/${id}/status`, { status });
  return res.data;
};

// Delete query (admin only)
export const deleteQuery = async (id: string) => {
  const res = await API.delete(`/queries/${id}`);
  return res.data;
};

