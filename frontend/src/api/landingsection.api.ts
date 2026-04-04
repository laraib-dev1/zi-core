import API from "./axios";

export interface LandingSectionItem {
  _id: string;
  sectionId: string;
  label: string;
  enabled: boolean;
  order: number;
  isCustom?: boolean;
  code?: string;
  /** JSON object string: editable copy fields per section (see landingSectionContent). */
  contentJson?: string;
  /** When false, hidden from Other pages dropdown / mobile submenu only. Main row links (Home, Contact, …) follow which sections are enabled. Default true. */
  showInNavbarDropdown?: boolean;
}

export const getLandingSections = async (): Promise<LandingSectionItem[]> => {
  const res = await API.get("/landingsections");
  return res.data.data;
};

export const getEnabledLandingSections = async (): Promise<string[]> => {
  const res = await API.get("/landingsections/enabled");
  return res.data.data;
};

export const createLandingSection = async (label: string): Promise<LandingSectionItem> => {
  const res = await API.post("/landingsections", { label });
  return res.data.data;
};

export const updateLandingSection = async (
  id: string,
  data: {
    enabled?: boolean;
    order?: number;
    code?: string;
    label?: string;
    contentJson?: string;
    showInNavbarDropdown?: boolean;
  }
): Promise<LandingSectionItem> => {
  const res = await API.put(`/landingsections/${id}`, data);
  return res.data.data;
};
