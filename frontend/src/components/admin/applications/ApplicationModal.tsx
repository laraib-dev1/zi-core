import React, { useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@mantine/rte";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createApplication, updateApplication } from "@/api/application.api";
import { useToast } from "@/components/ui/toast";
import ImageCropperModal from "@/components/admin/product/ImageCropperModal";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: any;
  onClose: () => void;
  onSubmit: () => void;
}

const appTabs = ["app", "meta", "setups", "media", "description", "features", "guide", "help"] as const;
type AppTab = (typeof appTabs)[number];
const tabClass =
  "rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 border border-gray-200";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">{children}</label>;
}

function isRichTextEmpty(html: string): boolean {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

export default function ApplicationModal({ open, mode, data, onClose, onSubmit }: Props) {
  const { success, error } = useToast();
  const isView = mode === "view";
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<AppTab>("app");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<"icon" | "banner" | "inner" | "screenshot" | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [form, setForm] = useState<any>({
    title: "",
    subTag: "",
    shortDescription: "",
    description: "<p></p>",
    status: "draft",
    tags: "",
    latestVersionLabel: "",
    latestVersionSize: "",
    appInfo: {
      domain: "",
      version: "",
      buildWith: "",
      intro: "",
      starsEnabled: false,
      stars: 0,
      ratingCount: 0,
      downloadsEnabled: false,
      downloadsDisplay: "",
      releaseDate: "",
      updateDate: "",
    },
    media: { banner: "", inner: "", screenshots: [] as string[] },
    downloadsList: [] as any[],
    featuresHtml: "<p></p>",
    guideHtml: "<p></p>",
    helpEnabled: false,
    helpHtml: "<p></p>",
    iconFile: null as File | null,
    bannerFile: null as File | null,
    innerFile: null as File | null,
    screenshotFiles: [] as File[],
    imageFile: null as File | null,
    image: "",
  });
  const currentTabIndex = useMemo(() => appTabs.indexOf(tab), [tab]);

  useEffect(() => {
    if (!open) return;
    setTab("app");
    if (data) {
      setForm({
        ...form,
        ...data,
        appInfo: { ...form.appInfo, ...(data.appInfo || {}) },
        media: { banner: "", inner: "", screenshots: [], ...(data.media || {}) },
        downloadsList: Array.isArray(data.downloadsList) ? data.downloadsList : [],
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
        iconFile: null,
        bannerFile: null,
        innerFile: null,
        screenshotFiles: [],
        imageFile: null,
        image: data.image || "",
      });
    } else {
      setForm((prev: any) => ({ ...prev, title: "", subTag: "", shortDescription: "", description: "<p></p>", downloadsList: [] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data]);

  const handleSave = async () => {
    if (isView) return onClose();
    for (const t of appTabs) {
      const msg = validateTab(t);
      if (msg) {
        setTab(t);
        return error(msg);
      }
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
      };
      if (mode === "add") {
        await createApplication(payload);
        success("Application created successfully");
      } else {
        const id = data?._id || data?.id;
        await updateApplication(id, payload);
        success("Application updated successfully");
      }
      onClose();
      onSubmit();
    } catch (e: any) {
      error(e?.response?.data?.message || "Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const updateAppInfo = (key: string, value: any) => setForm((prev: any) => ({ ...prev, appInfo: { ...prev.appInfo, [key]: value } }));

  const validateTab = (targetTab: AppTab): string | null => {
    switch (targetTab) {
      case "app":
        if (!form.title?.trim()) return "App tab: Application title is required.";
        if (!form.appInfo?.domain?.trim()) return "App tab: Domain/Field is required.";
        if (!form.appInfo?.version?.trim()) return "App tab: Version is required.";
        if (!form.appInfo?.intro?.trim()) return "App tab: Intro is required.";
        if (!(form.image || form.iconFile || form.imageFile)) return "App tab: App logo is required.";
        return null;
      case "meta":
        if (Number(form.appInfo?.stars || 0) < 1 || Number(form.appInfo?.stars || 0) > 5) return "Meta tab: Stars must be between 1 and 5.";
        if (Number(form.appInfo?.ratingCount || 0) < 0) return "Meta tab: Rating count is invalid.";
        if (!form.appInfo?.releaseDate) return "Meta tab: Release date is required.";
        if (!form.appInfo?.updateDate) return "Meta tab: Update date is required.";
        return null;
      case "setups":
        if (!Array.isArray(form.downloadsList) || form.downloadsList.length === 0) return "Setups tab: Add at least one setup option.";
        if (form.downloadsList.some((x: any) => !x?.label?.trim() || (!x?.url?.trim() && !x?.file))) return "Setups tab: Each setup needs a label and URL or file.";
        return null;
      case "media":
        if (!(form.media?.banner || form.bannerFile)) return "Media tab: Banner image is required.";
        if (!Array.isArray(form.media?.screenshots) && !(form.screenshotFiles?.length > 0)) return "Media tab: Add screenshots.";
        if (Array.isArray(form.media?.screenshots) && form.media.screenshots.length === 0 && !(form.screenshotFiles?.length > 0)) return "Media tab: Add screenshots.";
        return null;
      case "description":
        return isRichTextEmpty(form.description) ? "Description tab: Description is required." : null;
      case "features":
        return isRichTextEmpty(form.featuresHtml) ? "Features tab: Features content is required." : null;
      case "guide":
        return isRichTextEmpty(form.guideHtml) ? "Guide tab: Guide content is required." : null;
      case "help":
        if (form.helpEnabled && isRichTextEmpty(form.helpHtml)) return "Help tab: Help content is required when help is enabled.";
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const msg = validateTab(tab);
    if (msg) return error(msg);
    const next = appTabs[currentTabIndex + 1];
    if (next) setTab(next);
  };

  const goPrev = () => {
    const prev = appTabs[currentTabIndex - 1];
    if (prev) setTab(prev);
  };

  const handleTabChange = (nextTab: string) => {
    const target = nextTab as AppTab;
    const targetIndex = appTabs.indexOf(target);
    if (targetIndex <= currentTabIndex) return setTab(target);
    const msg = validateTab(tab);
    if (msg) return error(msg);
    setTab(target);
  };

  const openCropper = (target: "icon" | "banner" | "inner" | "screenshot", file?: File | null) => {
    if (!file) return;
    setCropTarget(target);
    setCropFile(file);
    setCropModalOpen(true);
  };

  const onCropDone = (blob: Blob) => {
    const file = new File([blob], `${cropTarget || "image"}-${Date.now()}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    if (cropTarget === "icon") {
      setForm((prev: any) => ({ ...prev, iconFile: file, imageFile: file, image: url }));
    } else if (cropTarget === "banner") {
      setForm((prev: any) => ({ ...prev, bannerFile: file, media: { ...prev.media, banner: url } }));
    } else if (cropTarget === "inner") {
      setForm((prev: any) => ({ ...prev, innerFile: file, media: { ...prev.media, inner: url } }));
    } else if (cropTarget === "screenshot") {
      setForm((prev: any) => ({
        ...prev,
        screenshotFiles: [...(prev.screenshotFiles || []), file],
        media: { ...prev.media, screenshots: [...(prev.media?.screenshots || []), url] },
      }));
    }
    setCropModalOpen(false);
    setCropTarget(null);
    setCropFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto bg-[#f7f7f8] p-0">
        <DialogHeader className="px-6 py-5 border-b border-gray-200" style={{ backgroundColor: "var(--theme-primary)" }}>
          <DialogTitle className="text-2xl text-white">
            {mode === "add" ? "Add New Application" : mode === "edit" ? "Edit Application" : "View Application"}
          </DialogTitle>
          <DialogDescription className="text-white/90">Fill all tabs to build the application detail page.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full px-6 py-4">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-2 h-auto">
            <TabsTrigger value="app" className={tabClass}>App</TabsTrigger>
            <TabsTrigger value="meta" className={tabClass}>Meta</TabsTrigger>
            <TabsTrigger value="setups" className={tabClass}>Setups</TabsTrigger>
            <TabsTrigger value="media" className={tabClass}>Media</TabsTrigger>
            <TabsTrigger value="description" className={tabClass}>Description</TabsTrigger>
            <TabsTrigger value="features" className={tabClass}>Features</TabsTrigger>
            <TabsTrigger value="guide" className={tabClass}>Guide</TabsTrigger>
            <TabsTrigger value="help" className={tabClass}>Help</TabsTrigger>
          </TabsList>

          <TabsContent value="app" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <div>
              <FieldLabel>Application Title</FieldLabel>
              <Input disabled={isView} placeholder="Enter application title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Status</FieldLabel>
                <Select value={form.status || "draft"} onValueChange={(v) => setForm({ ...form, status: v })} disabled={isView}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="unpublished">Unpublished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Tags</FieldLabel>
                <Input disabled={isView} placeholder="tag1, tag2" value={form.tags || ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Domain / Field</FieldLabel>
                <Input disabled={isView} placeholder="e.g. Ecommerce" value={form.appInfo.domain} onChange={(e) => updateAppInfo("domain", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Version</FieldLabel>
                <Input disabled={isView} placeholder="vX.X.X" value={form.appInfo.version} onChange={(e) => updateAppInfo("version", e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Build With</FieldLabel>
              <Input disabled={isView} placeholder="React / Flutter / .NET" value={form.appInfo.buildWith} onChange={(e) => updateAppInfo("buildWith", e.target.value)} />
            </div>
            <div>
              <FieldLabel>Intro</FieldLabel>
              <Input disabled={isView} placeholder="One-line intro" value={form.appInfo.intro} onChange={(e) => updateAppInfo("intro", e.target.value)} />
            </div>
            <div>
              <FieldLabel>App Icon</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {form.image ? <img src={form.image} alt="App icon" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">No logo</span>}
                </div>
                {!isView && (
                  <input
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--theme-primary)] file:px-3 file:py-2 file:text-white"
                    type="file"
                    accept="image/*"
                    onChange={(e) => openCropper("icon", e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Stars (1-5)</FieldLabel>
                <Input disabled={isView} type="number" min={1} max={5} placeholder="3" value={form.appInfo.stars} onChange={(e) => updateAppInfo("stars", Math.max(1, Math.min(5, Number(e.target.value || 0))))} />
              </div>
              <div>
                <FieldLabel>Rating Count</FieldLabel>
                <Input disabled={isView} type="number" placeholder="250" value={form.appInfo.ratingCount} onChange={(e) => updateAppInfo("ratingCount", Number(e.target.value || 0))} />
              </div>
            </div>
            <div>
              <FieldLabel>Show Downloads</FieldLabel>
              <Input disabled={isView} placeholder="3000" value={form.appInfo.downloadsDisplay} onChange={(e) => updateAppInfo("downloadsDisplay", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Release Date</FieldLabel>
                <Input disabled={isView} type="date" value={form.appInfo.releaseDate} onChange={(e) => updateAppInfo("releaseDate", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Update Date</FieldLabel>
                <Input disabled={isView} type="date" value={form.appInfo.updateDate} onChange={(e) => updateAppInfo("updateDate", e.target.value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setups" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">Downloads / Links</span>
              {!isView && <Button type="button" className="theme-button text-white" onClick={() => setForm({ ...form, downloadsList: [...form.downloadsList, { type: "website", label: "", url: "" }] })}>Add New</Button>}
            </div>
            {form.downloadsList.map((d: any, i: number) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="sm:col-span-2">
                  <Select value={d.type || "other"} onValueChange={(v) => {
                    const n = [...form.downloadsList];
                    n[i] = { ...n[i], type: v };
                    setForm({ ...form, downloadsList: n });
                  }} disabled={isView}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {["website", "apk", "desktop", "windows", "ios", "exe", "other"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input className="sm:col-span-3" disabled={isView} placeholder="Label" value={d.label || ""} onChange={(e) => {
                  const n = [...form.downloadsList];
                  n[i] = { ...n[i], label: e.target.value };
                  setForm({ ...form, downloadsList: n });
                }} />
                <Input className="sm:col-span-4" disabled={isView} placeholder="URL" value={d.url || ""} onChange={(e) => {
                  const n = [...form.downloadsList];
                  n[i] = { ...n[i], url: e.target.value };
                  setForm({ ...form, downloadsList: n });
                }} />
                <div className="sm:col-span-3">
                  {!isView && <input className="block w-full text-xs text-gray-600 file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1" type="file" onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    const n = [...form.downloadsList];
                    n[i] = { ...n[i], file: f, fileName: f?.name || n[i]?.fileName };
                    setForm({ ...form, downloadsList: n });
                  }} />}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="media" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <div>
              <FieldLabel>Thumbnail</FieldLabel>
              <div className="h-48 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {form.media?.banner ? <img src={form.media.banner} alt="Thumbnail" className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">Upload Thumbnail</span>}
              </div>
              {!isView && <input className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--theme-primary)] file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => openCropper("banner", e.target.files?.[0] || null)} />}
            </div>
            <div>
              <FieldLabel>Banner</FieldLabel>
              <div className="h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {form.media?.inner ? <img src={form.media.inner} alt="Banner" className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">Upload Banner</span>}
              </div>
              {!isView && <input className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--theme-primary)] file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => openCropper("inner", e.target.files?.[0] || null)} />}
            </div>
            <div>
              <FieldLabel>Images</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(form.media?.screenshots || []).slice(0, 8).map((src: string, index: number) => (
                  <div key={`${src}-${index}`} className="relative h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={src} alt={`Screenshot ${index + 1}`} className="h-full w-full object-cover" />
                    {!isView && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1"
                        onClick={() => setForm((prev: any) => ({ ...prev, media: { ...prev.media, screenshots: prev.media.screenshots.filter((_: string, i: number) => i !== index) } }))}
                      >
                        x
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!isView && <input className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--theme-primary)] file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => openCropper("screenshot", e.target.files?.[0] || null)} />}
            </div>
          </TabsContent>

          <TabsContent value="description" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"><RichTextEditor value={form.description || "<p></p>"} onChange={(v) => setForm({ ...form, description: v })} readOnly={isView} /></TabsContent>
          <TabsContent value="features" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"><RichTextEditor value={form.featuresHtml || "<p></p>"} onChange={(v) => setForm({ ...form, featuresHtml: v })} readOnly={isView} /></TabsContent>
          <TabsContent value="guide" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"><RichTextEditor value={form.guideHtml || "<p></p>"} onChange={(v) => setForm({ ...form, guideHtml: v })} readOnly={isView} /></TabsContent>
          <TabsContent value="help" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <input type="checkbox" checked={!!form.helpEnabled} onChange={(e) => setForm({ ...form, helpEnabled: e.target.checked })} disabled={isView} />
              <span className="text-sm font-medium text-gray-700">Help enabled</span>
            </div>
            <RichTextEditor value={form.helpHtml || "<p></p>"} onChange={(v) => setForm({ ...form, helpHtml: v })} readOnly={isView} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0">
          <Button variant="outline" onClick={onClose} className="min-w-[92px]">{isView ? "Close" : "Cancel"}</Button>
          {!isView && currentTabIndex > 0 && <Button variant="outline" onClick={goPrev}>Previous</Button>}
          {!isView && currentTabIndex < appTabs.length - 1 && <Button className="theme-button text-white" onClick={goNext}>Next</Button>}
          {!isView && currentTabIndex === appTabs.length - 1 && <Button className="theme-button text-white min-w-[92px]" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : mode === "edit" ? "Update" : "Add"}</Button>}
        </DialogFooter>
      </DialogContent>
      <ImageCropperModal
        open={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setCropFile(null);
          setCropTarget(null);
        }}
        file={cropFile}
        onCropDone={onCropDone}
        aspect={cropTarget === "icon" ? 1 : cropTarget === "banner" ? 16 / 6 : cropTarget === "inner" ? 16 / 4 : 4 / 3}
      />
    </Dialog>
  );
}
