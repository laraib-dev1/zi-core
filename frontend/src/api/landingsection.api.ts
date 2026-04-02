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
  /** Include in Navbar2 "Other pages" dropdown (when section is not a main nav link). Default true. */
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
