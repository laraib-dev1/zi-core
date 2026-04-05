import React, { useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@mantine/rte";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cnTabsTriggerPill } from "@/components/ui/tabTriggerVariants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createApplication, updateApplication } from "@/api/application.api";
import { useToast } from "@/components/ui/toast";
import ImageCropperModal from "@/components/admin/product/ImageCropperModal";
import {
  APPLICATION_SETUP_TYPE_ORDER,
  sortApplicationDownloadsList,
  defaultSetupLabelForType,
} from "@/utils/applicationSetupOrder";

const INSTALLER_SETUP_TYPES = new Set(["apk", "exe", "windows"]);

/** One link field in the UI: move legacy storageUrl into url and clear storageUrl. */
function normalizeInstallerDownloadsLinkField(list: unknown): any[] {
  const arr = Array.isArray(list) ? list : [];
  return arr.map((row: any) => {
    const t = String(row?.type || "").toLowerCase();
    if (!INSTALLER_SETUP_TYPES.has(t)) return row;
    const u = String(row?.url || "").trim();
    const s = String(row?.storageUrl || "").trim();
    const primary = u || s;
    return { ...row, url: primary, storageUrl: "" };
  });
}

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  data?: any;
  onClose: () => void;
  onSubmit: () => void;
}

const appTabs = ["app", "meta", "setups", "media", "description", "features", "guide", "help"] as const;
type AppTab = (typeof appTabs)[number];
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">{children}</label>;
}

function SectionToggle({
  title,
  enabled,
  onChange,
  disabled,
}: {
  title: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold theme-text-primary whitespace-nowrap">{title}</span>
      <div className="h-px flex-1 bg-[color-mix(in_srgb,var(--theme-primary)_35%,#d1d5db)]" />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-(--theme-primary)" : "bg-gray-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-pressed={enabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function isRichTextEmpty(html: string): boolean {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

function createEmptyApplicationForm() {
  return {
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
      datesEnabled: false,
      thumbnailEnabled: true,
      bannerEnabled: true,
      imagesEnabled: true,
      descriptionTabEnabled: true,
      featuresTabEnabled: true,
      guideTabEnabled: true,
      supportTabEnabled: true,
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
  };
}

export default function ApplicationModal({ open, mode, data, onClose, onSubmit }: Props) {
  const { success, error, info } = useToast();
  const isView = mode === "view";
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<AppTab>("app");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<"icon" | "banner" | "inner" | "screenshot" | null>(null);
  const [cropScreenshotIndex, setCropScreenshotIndex] = useState<number | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [form, setForm] = useState<any>(() => createEmptyApplicationForm());
  const currentTabIndex = useMemo(() => appTabs.indexOf(tab), [tab]);
  const getSetup = (typeKey: string) => {
    const existing = (form.downloadsList || []).find((x: any) => String(x?.type || "").toLowerCase() === typeKey);
    return {
      type: typeKey,
      label: existing?.label || defaultSetupLabelForType(typeKey),
      url: existing?.url || "",
      storageUrl: existing?.storageUrl || "",
      fileName: existing?.fileName || "",
      fileSize: existing?.fileSize || 0,
      fileUrl: existing?.fileUrl || "",
      setupFileGzipped: existing?.setupFileGzipped === true,
      setupFileEncoding: String(existing?.setupFileEncoding || (existing?.setupFileGzipped ? "gzip" : "none")),
      sizeText: existing?.sizeText || "",
      description: existing?.description || "",
      enabled: existing?.enabled !== false,
    };
  };
  const updateSetup = (typeKey: string, patch: Record<string, any>) => {
    setForm((prev: any) => {
      const list = Array.isArray(prev.downloadsList) ? [...prev.downloadsList] : [];
      const idx = list.findIndex((x: any) => String(x?.type || "").toLowerCase() === typeKey);
      const current =
        idx >= 0
          ? list[idx]
          : {
              type: typeKey,
              label: defaultSetupLabelForType(typeKey),
              url: "",
              storageUrl: "",
              fileName: "",
              fileSize: 0,
              fileUrl: "",
              setupFileGzipped: false,
              setupFileEncoding: "none",
              sizeText: "",
              description: "",
              enabled: true,
            };
      const nextItem = { ...current, ...patch, type: typeKey };
      if (idx >= 0) list[idx] = nextItem;
      else list.push(nextItem);
      const sorted = APPLICATION_SETUP_TYPE_ORDER.map((t) =>
        list.find((x: any) => String(x?.type || "").toLowerCase() === t)
      ).filter(Boolean);
      return { ...prev, downloadsList: sorted };
    });
  };

  useEffect(() => {
    if (!open) return;
    setTab("app");
    const empty = createEmptyApplicationForm();
    if (data) {
      const mergedAppInfo = { ...empty.appInfo, ...(data.appInfo || {}) };
      if (typeof mergedAppInfo.supportTabEnabled !== "boolean") {
        mergedAppInfo.supportTabEnabled = Boolean(data.helpEnabled);
      }
      setForm({
        ...empty,
        ...data,
        appInfo: mergedAppInfo,
        media: { banner: "", inner: "", screenshots: [], ...(data.media || {}) },
        downloadsList: sortApplicationDownloadsList(
          normalizeInstallerDownloadsLinkField(Array.isArray(data.downloadsList) ? data.downloadsList : [])
        ),
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""),
        iconFile: null,
        bannerFile: null,
        innerFile: null,
        screenshotFiles: [],
        imageFile: null,
        image: data.image || "",
      });
    } else {
      setForm(createEmptyApplicationForm());
    }
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
        helpEnabled: Boolean(form.appInfo?.supportTabEnabled),
        downloadsList: sortApplicationDownloadsList(form.downloadsList || []).map((x: any) => {
          const { file: _file, clearSetupFile: _clear, ...rest } = x;
          const t = String(x?.type || "").toLowerCase();
          const row = {
            ...rest,
            label: String(x.label || "").trim() || defaultSetupLabelForType(x.type),
          };
          if (INSTALLER_SETUP_TYPES.has(t)) return { ...row, storageUrl: "" };
          return row;
        }),
      };
      if (mode === "add") {
        await createApplication(payload);
        success("Application created successfully");
      } else {
        const id = data?._id || data?.id;
        await updateApplication(id, payload);
        success("Application updated successfully");
      }
      setForm(createEmptyApplicationForm());
      setTab("app");
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
        if (form.appInfo?.starsEnabled) {
          if (Number(form.appInfo?.stars || 0) < 1 || Number(form.appInfo?.stars || 0) > 5) return "Meta tab: Stars must be between 1 and 5 when Rating is enabled.";
          if (Number(form.appInfo?.ratingCount || 0) < 0) return "Meta tab: Rating count is invalid.";
        }
        if (form.appInfo?.downloadsEnabled && !String(form.appInfo?.downloadsDisplay || "").trim()) return "Meta tab: Downloads text is required when Downloads is enabled.";
        if (form.appInfo?.datesEnabled) {
          if (!form.appInfo?.releaseDate) return "Meta tab: Release date is required when Dates is enabled.";
          if (!form.appInfo?.updateDate) return "Meta tab: Update date is required when Dates is enabled.";
        }
        return null;
      case "setups":
        if (!Array.isArray(form.downloadsList) || form.downloadsList.length === 0) return "Setups tab: Add at least one setup option.";
        if (!form.downloadsList.some((x: any) => x?.enabled !== false)) return "Setups tab: Enable at least one setup option.";
        if (
          form.downloadsList.some((x: any) => {
            if (x?.enabled === false) return false;
            const lab = String(x?.label || "").trim() || defaultSetupLabelForType(x?.type);
            return !lab;
          })
        )
          return "Setups tab: Each enabled setup needs a label.";
        if (
          form.downloadsList.some(
            (x: any) =>
              x?.enabled !== false &&
              !x?.url?.trim() &&
              !x?.storageUrl?.trim() &&
              !x?.fileUrl
          )
        )
          return "Setups tab: Each enabled setup needs a link.";
        return null;
      case "media":
        if (form.appInfo?.thumbnailEnabled && !(form.media?.banner || form.bannerFile)) return "Media tab: Thumbnail image is required when Thumbnail is enabled.";
        if (form.appInfo?.bannerEnabled && !(form.media?.inner || form.innerFile)) return "Media tab: Banner image is required when Banner is enabled.";
        if (form.appInfo?.imagesEnabled) {
          const firstUrl = Array.isArray(form.media?.screenshots) ? String(form.media.screenshots[0] || "").trim() : "";
          const firstFile = Array.isArray(form.screenshotFiles) ? form.screenshotFiles[0] : null;
          if (!firstUrl && !firstFile) {
            return "Media tab: Main image (first slot) is required when Images is enabled. Additional slots are optional.";
          }
        }
        return null;
      case "description":
        if (form.appInfo?.descriptionTabEnabled && isRichTextEmpty(form.description)) return "Description tab: Description is required when enabled.";
        return null;
      case "features":
        if (form.appInfo?.featuresTabEnabled && isRichTextEmpty(form.featuresHtml)) return "Features tab: Features content is required when enabled.";
        return null;
      case "guide":
        if (form.appInfo?.guideTabEnabled && isRichTextEmpty(form.guideHtml)) return "Guide tab: Guide content is required when enabled.";
        return null;
      case "help":
        if (form.appInfo?.supportTabEnabled && isRichTextEmpty(form.helpHtml)) return "Support tab: Support content is required when enabled.";
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

  const openCropper = (target: "icon" | "banner" | "inner" | "screenshot", file?: File | null, screenshotIndex?: number) => {
    if (!file) return;
    setCropTarget(target);
    setCropScreenshotIndex(typeof screenshotIndex === "number" ? screenshotIndex : null);
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
        screenshotFiles: (() => {
          const files = [...(prev.screenshotFiles || [])];
          if (typeof cropScreenshotIndex === "number") files[cropScreenshotIndex] = file;
          else files.push(file);
          return files;
        })(),
        media: {
          ...prev.media,
          screenshots: (() => {
            const shots = [...(prev.media?.screenshots || [])];
            const idx = typeof cropScreenshotIndex === "number" ? cropScreenshotIndex : shots.length;
            shots[idx] = url;
            return shots.slice(0, 5);
          })(),
        },
      }));
    }
    setCropModalOpen(false);
    setCropTarget(null);
    setCropScreenshotIndex(null);
    setCropFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose className="max-w-6xl w-full h-[90vh] overflow-y-auto bg-[#f7f7f8] p-0">
        <DialogHeader
          className="flex flex-row items-center gap-4 space-y-0 px-6 py-5 border-b border-white/20 text-left sm:text-left"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <DialogTitle className="text-2xl text-white">
              {mode === "add" ? "Add New Application" : mode === "edit" ? "Edit Application" : "View Application"}
            </DialogTitle>
            <DialogDescription className="text-white/90">Fill all tabs to build the application detail page.</DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-colors"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>
          </DialogClose>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full px-6 py-4">
          <TabsList className="inline-flex w-full justify-start overflow-x-auto gap-1 p-1.5 rounded-xl h-auto border-0 shadow-none bg-[color-mix(in_srgb,var(--theme-primary)_10%,#e8f0f3)]">
            <TabsTrigger value="app" className={cnTabsTriggerPill()}>App</TabsTrigger>
            <TabsTrigger value="meta" className={cnTabsTriggerPill()}>Meta</TabsTrigger>
            <TabsTrigger value="setups" className={cnTabsTriggerPill()}>Setups</TabsTrigger>
            <TabsTrigger value="media" className={cnTabsTriggerPill()}>Media</TabsTrigger>
            <TabsTrigger value="description" className={cnTabsTriggerPill()}>Description</TabsTrigger>
            <TabsTrigger value="features" className={cnTabsTriggerPill()}>Features</TabsTrigger>
            <TabsTrigger value="guide" className={cnTabsTriggerPill()}>Guide</TabsTrigger>
            <TabsTrigger value="help" className={cnTabsTriggerPill()}>Support</TabsTrigger>
          </TabsList>

          <TabsContent value="app" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <div>
              <FieldLabel>App Logo</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {form.image ? <img src={form.image} alt="App icon" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">No logo</span>}
                </div>
                {!isView && (
                  <input
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-(--theme-primary) file:px-3 file:py-2 file:text-white"
                    type="file"
                    accept="image/*"
                    onChange={(e) => openCropper("icon", e.target.files?.[0] || null)}
                  />
                )}
              </div>
            </div>
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
              <textarea
                disabled={isView}
                placeholder="Write app intro / about text"
                value={form.appInfo.intro}
                onChange={(e) => updateAppInfo("intro", e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-(--theme-primary) focus:ring-1 focus:ring-(--theme-primary)"
              />
            </div>
          </TabsContent>

          <TabsContent value="meta" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <SectionToggle
              title="Rating"
              enabled={!!form.appInfo.starsEnabled}
              onChange={(next) => updateAppInfo("starsEnabled", next)}
              disabled={isView}
            />
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${!form.appInfo.starsEnabled ? "opacity-60" : ""}`}>
              <div>
                <FieldLabel>Stars (1-5)</FieldLabel>
                <Input
                  disabled={isView || !form.appInfo.starsEnabled}
                  type="number"
                  min={1}
                  max={5}
                  placeholder="3"
                  value={form.appInfo.stars}
                  onChange={(e) => updateAppInfo("stars", Math.max(1, Math.min(5, Number(e.target.value || 0))))}
                />
              </div>
              <div>
                <FieldLabel>Rating Count</FieldLabel>
                <Input
                  disabled={isView || !form.appInfo.starsEnabled}
                  type="number"
                  placeholder="250"
                  value={form.appInfo.ratingCount}
                  onChange={(e) => updateAppInfo("ratingCount", Number(e.target.value || 0))}
                />
              </div>
            </div>
            <SectionToggle
              title="Downloads"
              enabled={!!form.appInfo.downloadsEnabled}
              onChange={(next) => updateAppInfo("downloadsEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.downloadsEnabled ? "opacity-60" : ""}>
              <FieldLabel>Show Downloads</FieldLabel>
              <Input
                disabled={isView || !form.appInfo.downloadsEnabled}
                placeholder="3000"
                value={form.appInfo.downloadsDisplay}
                onChange={(e) => updateAppInfo("downloadsDisplay", e.target.value)}
              />
            </div>
            <SectionToggle
              title="Dates"
              enabled={!!form.appInfo.datesEnabled}
              onChange={(next) => updateAppInfo("datesEnabled", next)}
              disabled={isView}
            />
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${!form.appInfo.datesEnabled ? "opacity-60" : ""}`}>
              <div>
                <FieldLabel>Release Date</FieldLabel>
                <Input
                  disabled={isView || !form.appInfo.datesEnabled}
                  type="date"
                  value={form.appInfo.releaseDate}
                  onChange={(e) => updateAppInfo("releaseDate", e.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                />
              </div>
              <div>
                <FieldLabel>Update Date</FieldLabel>
                <Input
                  disabled={isView || !form.appInfo.datesEnabled}
                  type="date"
                  value={form.appInfo.updateDate}
                  onChange={(e) => updateAppInfo("updateDate", e.target.value)}
                  className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="setups" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Paste one <strong>HTTPS link</strong> per row (your own CDN, or a Google Drive / Dropbox / OneDrive share link). At least one link is required for each enabled installer row. The <strong>File</strong> row is a placeholder: click it to see <strong>Coming soon</strong> — use the link field until upload is enabled.
            </p>
            <div className="space-y-5">
              {[
                { type: "website", title: "Web", installer: false, hasSize: false, linkPlaceholder: "https://www.example.com" },
                {
                  type: "playstore",
                  title: "Play Store",
                  installer: false,
                  hasSize: false,
                  linkPlaceholder: "https://play.google.com/store/apps/details?id=…",
                },
                {
                  type: "apk",
                  title: "APK",
                  installer: true,
                  hasSize: true,
                  linkPlaceholder:
                    "https://… APK (CDN, or Google Drive / Dropbox / OneDrive share link)",
                },
                {
                  type: "exe",
                  title: "Desktop",
                  installer: true,
                  hasSize: true,
                  linkPlaceholder: "https://… desktop installer (CDN or cloud share link)",
                },
                {
                  type: "windows",
                  title: "Windows",
                  installer: true,
                  hasSize: true,
                  linkPlaceholder: "https://… Windows .exe / .msi (CDN or cloud share link)",
                },
              ].map((block) => {
                const setup = getSetup(block.type);
                return (
                  <div key={block.type} className="space-y-3">
                    <SectionToggle
                      title={block.title}
                      enabled={!!setup.enabled}
                      onChange={(next) => updateSetup(block.type, { enabled: next })}
                      disabled={isView}
                    />
                    <div className={`${!setup.enabled ? "opacity-60" : ""} space-y-3`}>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className={`${block.hasSize ? "sm:col-span-8" : "sm:col-span-12"}`}>
                          <FieldLabel>Link</FieldLabel>
                          <Input
                            disabled={isView || !setup.enabled}
                            placeholder={
                              block.linkPlaceholder ||
                              (block.installer ? "https://…" : "https://…")
                            }
                            value={setup.url || ""}
                            onChange={(e) => updateSetup(block.type, { url: e.target.value })}
                          />
                        </div>
                        {block.hasSize && (
                          <div className="sm:col-span-4">
                            <FieldLabel>Size</FieldLabel>
                            <Input
                              disabled={isView || !setup.enabled}
                              placeholder="5 MB"
                              value={setup.sizeText || ""}
                              onChange={(e) => updateSetup(block.type, { sizeText: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                      {block.installer && (
                        <div>
                          <FieldLabel>File</FieldLabel>
                          {!isView && setup.enabled ? (
                            <button
                              type="button"
                              onClick={() => info("Coming soon")}
                              className="flex w-full min-h-[44px] cursor-pointer flex-col items-start justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-700 transition-colors hover:border-(--theme-primary)/40 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--theme-primary)"
                            >
                              <span className="font-medium text-gray-800">Choose file</span>
                              <span className="mt-0.5 text-xs text-gray-500">
                                Installer upload from here is not available yet — click to see Coming soon. Use the link field above.
                              </span>
                            </button>
                          ) : isView ? (
                            <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                              File upload: coming soon (view mode).
                            </p>
                          ) : (
                            <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                              Enable this setup to use the file option.
                            </p>
                          )}
                          {setup.fileUrl ? (
                            <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5">
                              Existing hosted file: <span className="font-medium">{setup.fileName || "file"}</span>. New uploads from this screen are not available yet; use links or keep the current file until upload ships.
                            </p>
                          ) : null}
                        </div>
                      )}
                      <div>
                        <FieldLabel>{block.title} Guide / Description</FieldLabel>
                        <textarea
                          disabled={isView || !setup.enabled}
                          rows={3}
                          placeholder="Write guide / details for this setup"
                          value={setup.description || ""}
                          onChange={(e) => updateSetup(block.type, { description: e.target.value })}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-(--theme-primary) focus:ring-1 focus:ring-(--theme-primary)"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
            <SectionToggle
              title="Thumbnail"
              enabled={!!form.appInfo.thumbnailEnabled}
              onChange={(next) => updateAppInfo("thumbnailEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.thumbnailEnabled ? "opacity-60" : ""}>
              <div className="h-48 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {form.media?.banner ? <img src={form.media.banner} alt="Thumbnail" className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">Upload Thumbnail</span>}
              </div>
              {!isView && <input disabled={!form.appInfo.thumbnailEnabled} className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-(--theme-primary) file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => openCropper("banner", e.target.files?.[0] || null)} />}
            </div>

            <SectionToggle
              title="Banner"
              enabled={!!form.appInfo.bannerEnabled}
              onChange={(next) => updateAppInfo("bannerEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.bannerEnabled ? "opacity-60" : ""}>
              <div className="h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {form.media?.inner ? <img src={form.media.inner} alt="Banner" className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">Upload Banner</span>}
              </div>
              {!isView && <input disabled={!form.appInfo.bannerEnabled} className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-(--theme-primary) file:px-3 file:py-2 file:text-white" type="file" accept="image/*" onChange={(e) => openCropper("inner", e.target.files?.[0] || null)} />}
            </div>

            <SectionToggle
              title="Images"
              enabled={!!form.appInfo.imagesEnabled}
              onChange={(next) => updateAppInfo("imagesEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.imagesEnabled ? "opacity-60" : ""}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer aspect-square bg-gray-50 rounded border overflow-hidden flex items-center justify-center"
                    onClick={() => {
                      if (isView || !form.appInfo.imagesEnabled) return;
                      const el = document.getElementById(`app-shot-${idx}`) as HTMLInputElement | null;
                      el?.click();
                    }}
                  >
                    {(form.media?.screenshots?.[idx]) ? (
                      <img src={form.media.screenshots[idx]} className="w-full h-full object-cover" alt={idx === 0 ? "Main screenshot" : `Screenshot ${idx + 1}`} />
                    ) : (
                      <span className="text-xs text-gray-400">
                        {idx === 0 ? "Main image (required)" : `Image ${idx + 1} (optional)`}
                      </span>
                    )}
                    {!isView && form.media?.screenshots?.[idx] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev: any) => {
                            const shots = [...(prev.media?.screenshots || [])];
                            shots[idx] = "";
                            return { ...prev, media: { ...prev.media, screenshots: shots } };
                          });
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        x
                      </button>
                    )}
                    {!isView && (
                      <input
                        id={`app-shot-${idx}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => openCropper("screenshot", e.target.files?.[0] || null, idx)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                First image is required when Images is enabled; up to four more are optional. Recommended size: 1080 × 1080 (1:1).
              </p>
            </div>
          </TabsContent>

          <TabsContent value="description" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
            <SectionToggle
              title="Description"
              enabled={!!form.appInfo.descriptionTabEnabled}
              onChange={(next) => updateAppInfo("descriptionTabEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.descriptionTabEnabled ? "opacity-60" : ""}>
              <RichTextEditor
                value={form.description || "<p></p>"}
                onChange={(v) => setForm({ ...form, description: v })}
                readOnly={isView || !form.appInfo.descriptionTabEnabled}
              />
            </div>
          </TabsContent>
          <TabsContent value="features" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
            <SectionToggle
              title="Features"
              enabled={!!form.appInfo.featuresTabEnabled}
              onChange={(next) => updateAppInfo("featuresTabEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.featuresTabEnabled ? "opacity-60" : ""}>
              <RichTextEditor
                value={form.featuresHtml || "<p></p>"}
                onChange={(v) => setForm({ ...form, featuresHtml: v })}
                readOnly={isView || !form.appInfo.featuresTabEnabled}
              />
            </div>
          </TabsContent>
          <TabsContent value="guide" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3">
            <SectionToggle
              title="Guide"
              enabled={!!form.appInfo.guideTabEnabled}
              onChange={(next) => updateAppInfo("guideTabEnabled", next)}
              disabled={isView}
            />
            <div className={!form.appInfo.guideTabEnabled ? "opacity-60" : ""}>
              <RichTextEditor
                value={form.guideHtml || "<p></p>"}
                onChange={(v) => setForm({ ...form, guideHtml: v })}
                readOnly={isView || !form.appInfo.guideTabEnabled}
              />
            </div>
          </TabsContent>
          <TabsContent value="help" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <div className="mb-3">
              <SectionToggle
                title="Support"
                enabled={!!form.appInfo.supportTabEnabled}
                onChange={(next) => {
                  updateAppInfo("supportTabEnabled", next);
                  setForm((prev: any) => ({ ...prev, helpEnabled: next }));
                }}
                disabled={isView}
              />
            </div>
            <div className={!form.appInfo.supportTabEnabled ? "opacity-60" : ""}>
              <RichTextEditor value={form.helpHtml || "<p></p>"} onChange={(v) => setForm({ ...form, helpHtml: v })} readOnly={isView || !form.appInfo.supportTabEnabled} />
            </div>
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
          setCropScreenshotIndex(null);
        }}
        file={cropFile}
        onCropDone={onCropDone}
        aspect={cropTarget === "icon" ? 1 : cropTarget === "banner" ? 16 / 6 : cropTarget === "inner" ? 16 / 4 : 1}
      />
    </Dialog>
  );
}
