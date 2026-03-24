import API from "./axios";

export const getCompany = async () => {
  const res = await API.get("/company");
  return res.data.data;
};

export const updateCompany = async (data: any) => {
  const formData = new FormData();

  // Append text fields
  if (data.company !== undefined) formData.append("company", data.company);
  if (data.slogan !== undefined) formData.append("slogan", data.slogan);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.phone !== undefined) formData.append("phone", data.phone);
  if (data.supportEmail !== undefined) formData.append("supportEmail", data.supportEmail);
  if (data.address !== undefined) formData.append("address", data.address);
  if (data.description !== undefined) formData.append("description", data.description);
  
  // Append logo file
  if (data.logoFile instanceof File) {
    formData.append("logo", data.logoFile);
  }
  
  // Append favicon file
  if (data.faviconFile instanceof File) {
    formData.append("favicon", data.faviconFile);
  }

  // Append social links
  if (data.socialLinks) {
    formData.append("socialLinks", JSON.stringify(data.socialLinks));
  }

  // Append social posts
  if (data.socialPosts) {
    formData.append("socialPosts", JSON.stringify(data.socialPosts));
  }

  // Append social post files
  if (data.socialPostFiles && Array.isArray(data.socialPostFiles)) {
    console.log("Appending social post files:", data.socialPostFiles.length);
    const fileIndices: number[] = [];
    data.socialPostFiles.forEach((item: { index: number; file: File }) => {
      if (item && item.file instanceof File) {
        console.log(`Appending file for social post ${item.index}:`, item.file.name, item.file.size);
        formData.append(`socialPost_${item.index}`, item.file);
        fileIndices.push(item.index);
      } else {
        console.warn("Invalid social post file item:", item);
      }
    });
    if (fileIndices.length > 0) {
      console.log("Social post file indices:", fileIndices);
      formData.append("socialPostFileIndices", JSON.stringify(fileIndices));
    } else {
      console.warn("No valid social post files to append");
    }
  } else {
    console.log("No social post files to append");
  }

  // Append brand theme
  if (data.brandTheme) {
    formData.append("brandTheme", JSON.stringify(data.brandTheme));
  }

  const res = await API.put("/company", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data;
};





















