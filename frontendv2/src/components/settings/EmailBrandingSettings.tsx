import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Plus,
  Code,
  Check,
} from "lucide-react";
import { useBrandingConfig, useBrandingMutations } from "@/services/brandingService";
import { SignatureManagerModal } from "@/components/petitions/SignatureManagerModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DEFAULT_GOVERNMENT_HTML_HEADER = `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 20px 24px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #6366f1;">
  <div style="display: flex; align-items: center; gap: 14px;">
    <div style="background: #ffffff; border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #0f172a;">
      🏛️
    </div>
    <div>
      <div style="font-size: 16px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #ffffff;">Government Grievance Cell</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Office of the Minister | MantriOS Official Dispatch</div>
    </div>
  </div>
  <div style="text-align: right;">
    <div style="font-size: 10px; font-weight: 700; color: #818cf8; letter-spacing: 1px; text-transform: uppercase;">Confidential Record</div>
    <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Kerala State Administration</div>
  </div>
</div>`;

const DEFAULT_GOVERNMENT_HTML_FOOTER = `<div style="background: #f8fafc; border-top: 2px solid #e2e8f0; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #64748b; font-size: 11px; line-height: 1.5; border-radius: 8px; margin-top: 20px;">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
    <div>
      <strong style="color: #334155;">Confidentiality Notice:</strong> This official communication and any attachments are intended solely for the designated recipient and may contain privileged government information.
    </div>
    <div style="font-weight: 600; color: #6366f1;">MantriOS Official Portal</div>
  </div>
  <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">
    Government Grievance Monitoring Cell • Room 402, North Block Secretariat, Thiruvananthapuram
  </div>
</div>`;

export function EmailBrandingSettings() {
  const { data: config, isLoading } = useBrandingConfig();
  const {
    headerUpload,
    headerDelete,
    headerHtmlSave,
    footerUpload,
    footerDelete,
    footerHtmlSave,
  } = useBrandingMutations();

  // Header State
  const [headerType, setHeaderType] = useState<"image" | "html">("image");
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [htmlHeaderContent, setHtmlHeaderContent] = useState<string>("");
  const [htmlHeaderSavedNotice, setHtmlHeaderSavedNotice] = useState<boolean>(false);

  // Footer State
  const [footerType, setFooterType] = useState<"image" | "html">("image");
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);
  const [htmlFooterContent, setHtmlFooterContent] = useState<string>("");
  const [htmlFooterSavedNotice, setHtmlFooterSavedNotice] = useState<boolean>(false);

  const [sigManagerOpen, setSigManagerOpen] = useState(false);

  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config) {
      setHeaderType(config.header_type || "image");
      setHtmlHeaderContent(config.header_html || DEFAULT_GOVERNMENT_HTML_HEADER);

      setFooterType(config.footer_type || "image");
      setHtmlFooterContent(config.footer_html || DEFAULT_GOVERNMENT_HTML_FOOTER);
    }
  }, [config]);

  // Header Handlers
  const handleHeaderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderFile(file);
      setHeaderPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadHeader = async () => {
    if (!headerFile) return;
    try {
      await headerUpload.mutateAsync(headerFile);
      setHeaderFile(null);
      setHeaderPreview(null);
    } catch (err: any) {
      alert(err.message || "Failed to upload header image");
    }
  };

  const handleDeleteHeader = async () => {
    if (!confirm("Are you sure you want to remove the global official email header?")) return;
    try {
      await headerDelete.mutateAsync();
      setHeaderFile(null);
      setHeaderPreview(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove header");
    }
  };

  const handleSaveHtmlHeader = async () => {
    try {
      await headerHtmlSave.mutateAsync(htmlHeaderContent);
      setHtmlHeaderSavedNotice(true);
      setTimeout(() => setHtmlHeaderSavedNotice(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to save HTML header");
    }
  };

  // Footer Handlers
  const handleFooterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFooterFile(file);
      setFooterPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadFooter = async () => {
    if (!footerFile) return;
    try {
      await footerUpload.mutateAsync(footerFile);
      setFooterFile(null);
      setFooterPreview(null);
    } catch (err: any) {
      alert(err.message || "Failed to upload footer image");
    }
  };

  const handleDeleteFooter = async () => {
    if (!confirm("Are you sure you want to remove the global official email footer?")) return;
    try {
      await footerDelete.mutateAsync();
      setFooterFile(null);
      setFooterPreview(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove footer");
    }
  };

  const handleSaveHtmlFooter = async () => {
    try {
      await footerHtmlSave.mutateAsync(htmlFooterContent);
      setHtmlFooterSavedNotice(true);
      setTimeout(() => setHtmlFooterSavedNotice(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to save HTML footer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const activeHeaderUrl = headerPreview || config?.header_url;
  const isHeaderConfigured =
    (headerType === "image" && Boolean(config?.header_url)) ||
    (headerType === "html" && Boolean(config?.header_html));

  const activeFooterUrl = footerPreview || config?.footer_url;
  const isFooterConfigured =
    (footerType === "image" && Boolean(config?.footer_url)) ||
    (footerType === "html" && Boolean(config?.footer_html));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="size-4" /> Admin Configuration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Email Branding & Signatures</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure the official government header and footer (image or rich HTML) and manage shared dignitary signatures.
          </p>
        </div>

        <Button
          onClick={() => setSigManagerOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 gap-1.5 shadow-sm"
        >
          <Plus className="size-4" /> Manage Signatures Library
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Official Email Header Card */}
        <Card className="border-slate-200 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="size-4 text-indigo-600" /> Official Email Header
              </CardTitle>
              {isHeaderConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="size-3" /> Configured ({headerType.toUpperCase()})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle className="size-3" /> Not Configured
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500">
              Displayed at the very top of outgoing emails when Header toggle is activated.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <Tabs
              value={headerType}
              onValueChange={(val) => setHeaderType(val as "image" | "html")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-100 p-0.5">
                <TabsTrigger value="image" className="text-xs py-1 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> Official Image
                </TabsTrigger>
                <TabsTrigger value="html" className="text-xs py-1 flex items-center gap-1.5">
                  <Code className="size-3.5" /> Custom HTML Header
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Image Header */}
              <TabsContent value="image" className="space-y-4 pt-3">
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/60 min-h-[140px] flex items-center justify-center p-4 overflow-hidden">
                  {activeHeaderUrl ? (
                    <img
                      src={activeHeaderUrl}
                      alt="Official Email Header"
                      className="w-full max-h-48 object-contain rounded-md"
                    />
                  ) : (
                    <div className="text-center space-y-2 py-6">
                      <ImageIcon className="size-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">No header image configured</p>
                      <p className="text-[11px] text-slate-400">PNG, JPEG or WebP up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <input
                    type="file"
                    ref={headerInputRef}
                    onChange={handleHeaderSelect}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => headerInputRef.current?.click()}
                    className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="mr-1.5 size-3.5 text-slate-500" />
                    {config?.header_url ? "Replace Header" : "Select Header"}
                  </Button>

                  <div className="flex items-center gap-2">
                    {headerFile && (
                      <Button
                        size="sm"
                        onClick={handleUploadHeader}
                        disabled={headerUpload.isPending}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {headerUpload.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                        Save Image Header
                      </Button>
                    )}

                    {config?.header_url && !headerFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteHeader}
                        disabled={headerDelete.isPending}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1.5 size-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: HTML Header */}
              <TabsContent value="html" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      HTML & Inline Styles Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setHtmlHeaderContent(DEFAULT_GOVERNMENT_HTML_HEADER)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      Reset to Official Template
                    </button>
                  </div>
                  <textarea
                    value={htmlHeaderContent}
                    onChange={(e) => setHtmlHeaderContent(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter custom HTML header template..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Live Render Preview</label>
                  <div
                    className="border border-slate-200 rounded-lg p-2 bg-slate-50 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: htmlHeaderContent }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleSaveHtmlHeader}
                    disabled={headerHtmlSave.isPending}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    {headerHtmlSave.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : htmlHeaderSavedNotice ? (
                      <Check className="size-3.5 text-emerald-300" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    {htmlHeaderSavedNotice ? "HTML Header Saved!" : "Save HTML Header"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 2. Official Email Footer Card (Supports Image OR Custom HTML) */}
        <Card className="border-slate-200 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="size-4 text-indigo-600" /> Official Email Footer
              </CardTitle>
              {isFooterConfigured ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="size-3" /> Configured ({footerType.toUpperCase()})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertCircle className="size-3" /> Not Configured
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500">
              Displayed at the very bottom of outgoing emails when Footer toggle is activated.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <Tabs
              value={footerType}
              onValueChange={(val) => setFooterType(val as "image" | "html")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-8 bg-slate-100 p-0.5">
                <TabsTrigger value="image" className="text-xs py-1 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> Official Image
                </TabsTrigger>
                <TabsTrigger value="html" className="text-xs py-1 flex items-center gap-1.5">
                  <Code className="size-3.5" /> Custom HTML Footer
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Image Footer */}
              <TabsContent value="image" className="space-y-4 pt-3">
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/60 min-h-[140px] flex items-center justify-center p-4 overflow-hidden">
                  {activeFooterUrl ? (
                    <img
                      src={activeFooterUrl}
                      alt="Official Email Footer"
                      className="w-full max-h-48 object-contain rounded-md"
                    />
                  ) : (
                    <div className="text-center space-y-2 py-6">
                      <ImageIcon className="size-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">No footer image configured</p>
                      <p className="text-[11px] text-slate-400">PNG, JPEG or WebP up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <input
                    type="file"
                    ref={footerInputRef}
                    onChange={handleFooterSelect}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => footerInputRef.current?.click()}
                    className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="mr-1.5 size-3.5 text-slate-500" />
                    {config?.footer_url ? "Replace Footer" : "Select Footer"}
                  </Button>

                  <div className="flex items-center gap-2">
                    {footerFile && (
                      <Button
                        size="sm"
                        onClick={handleUploadFooter}
                        disabled={footerUpload.isPending}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {footerUpload.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                        Save Image Footer
                      </Button>
                    )}

                    {config?.footer_url && !footerFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteFooter}
                        disabled={footerDelete.isPending}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1.5 size-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: HTML Footer */}
              <TabsContent value="html" className="space-y-4 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      HTML & Inline Styles Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setHtmlFooterContent(DEFAULT_GOVERNMENT_HTML_FOOTER)}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      Reset to Official Template
                    </button>
                  </div>
                  <textarea
                    value={htmlFooterContent}
                    onChange={(e) => setHtmlFooterContent(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-slate-200 p-2.5 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter custom HTML footer template..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Live Render Preview</label>
                  <div
                    className="border border-slate-200 rounded-lg p-2 bg-slate-50 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: htmlFooterContent }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleSaveHtmlFooter}
                    disabled={footerHtmlSave.isPending}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    {footerHtmlSave.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : htmlFooterSavedNotice ? (
                      <Check className="size-3.5 text-emerald-300" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    {htmlFooterSavedNotice ? "HTML Footer Saved!" : "Save HTML Footer"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Signature Management Modal */}
      <SignatureManagerModal
        isOpen={sigManagerOpen}
        onClose={() => setSigManagerOpen(false)}
        mode="manage"
      />
    </div>
  );
}
