import API from "./axios";

export const getApplications = async (status?: string) => {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  const res = await API.get(`/applications?${params.toString()}`);
  return res.data.data;
};

export const getApplicationById = async (id: string) => {
  const res = await API.get(`/applications/${id}`);
  return res.data.data;
};

export const incrementApplicationView = async (id: string) => {
  try {
    await API.post(`/applications/${id}/view`);
  } catch {
    // non-blocking
  }
};

export const createApplication = async (data: any) => {
  const formData = new FormData();
  formData.append("title", data.title || "");
  formData.append("subTag", data.subTag || "");
  formData.append("shortDescription", data.shortDescription || "");
  formData.append("description", data.description || "<p></p>");
  formData.append("status", data.status || "draft");
  formData.append("latestVersionLabel", data.latestVersionLabel || "");
  formData.append("latestVersionSize", data.latestVersionSize || "");
  formData.append("tags", Array.isArray(data.tags) ? data.tags.join(",") : (data.tags || ""));

  const list = Array.isArray(data.downloadsList) ? data.downloadsList : [];
  formData.append("downloadsList", JSON.stringify(list));
  formData.append("appInfo", JSON.stringify(data.appInfo || {}));
  formData.append("media", JSON.stringify({ screenshots: data.media?.screenshots || [] }));
  formData.append("featuresHtml", data.featuresHtml || "");
  formData.append("guideHtml", data.guideHtml || "");
  formData.append("helpEnabled", data.helpEnabled ? "true" : "false");
  formData.append("helpHtml", data.helpHtml || "");

  if (data.imageFile instanceof File) formData.append("image", data.imageFile);
  if (data.iconFile instanceof File) formData.append("icon", data.iconFile);
  if (data.bannerFile instanceof File) formData.append("banner", data.bannerFile);
  if (data.innerFile instanceof File) formData.append("inner", data.innerFile);
  (data.screenshotFiles || []).forEach((file: File, index: number) => {
    if (file instanceof File) formData.append(`screenshot_${index}`, file);
  });

  list.forEach((item: any, index: number) => {
    if (item?.file instanceof File) {
      formData.append(`downloadFile_${index}`, item.file);
    }
  });

  const res = await API.post("/applications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const updateApplication = async (id: string, data: any) => {
  const formData = new FormData();
  formData.append("title", data.title || "");
  formData.append("subTag", data.subTag || "");
  formData.append("shortDescription", data.shortDescription || "");
  formData.append("description", data.description || "<p></p>");
  formData.append("status", data.status || "draft");
  formData.append("latestVersionLabel", data.latestVersionLabel || "");
  formData.append("latestVersionSize", data.latestVersionSize || "");
  formData.append("tags", Array.isArray(data.tags) ? data.tags.join(",") : (data.tags || ""));

  const list = Array.isArray(data.downloadsList) ? data.downloadsList : [];
  formData.append("downloadsList", JSON.stringify(list));
  formData.append("appInfo", JSON.stringify(data.appInfo || {}));
  formData.append("media", JSON.stringify({ screenshots: data.media?.screenshots || [] }));
  formData.append("featuresHtml", data.featuresHtml || "");
  formData.append("guideHtml", data.guideHtml || "");
  formData.append("helpEnabled", data.helpEnabled ? "true" : "false");
  formData.append("helpHtml", data.helpHtml || "");

  if (data.imageFile instanceof File) formData.append("image", data.imageFile);
  if (data.iconFile instanceof File) formData.append("icon", data.iconFile);
  if (data.bannerFile instanceof File) formData.append("banner", data.bannerFile);
  if (data.innerFile instanceof File) formData.append("inner", data.innerFile);
  (data.screenshotFiles || []).forEach((file: File, index: number) => {
    if (file instanceof File) formData.append(`screenshot_${index}`, file);
  });

  list.forEach((item: any, index: number) => {
    if (item?.file instanceof File) {
      formData.append(`downloadFile_${index}`, item.file);
    }
  });

  const res = await API.put(`/applications/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

export const deleteApplication = async (id: string) => {
  const res = await API.delete(`/applications/${id}`);
  return res.data.success;
};
