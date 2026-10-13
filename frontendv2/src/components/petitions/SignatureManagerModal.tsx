import { useState, useRef } from "react";
import {
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  FileImage,
  Plus,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useSignatures, useBrandingMutations } from "@/services/brandingService";
import type { SharedSignature } from "@/types/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SignatureManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (signature: SharedSignature) => void;
  mode?: "manage" | "select";
}

export function SignatureManagerModal({
  isOpen,
  onClose,
  onSelect,
  mode = "select",
}: SignatureManagerModalProps) {
  const { data: signatures = [], isLoading } = useSignatures();
  const { signatureCreate, signatureUpdate, signatureDelete } = useBrandingMutations();

  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newSigName, setNewSigName] = useState("");
  const [newSigFile, setNewSigFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Edit State
  const [editingSig, setEditingSig] = useState<SharedSignature | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const filteredSignatures = signatures.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSigFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!newSigName) {
        setNewSigName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSigFile || !newSigName.trim()) return;

    try {
      await signatureCreate.mutateAsync({
        name: newSigName.trim(),
        file: newSigFile,
      });
      setIsUploading(false);
      setNewSigName("");
      setNewSigFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      alert(err.message || "Failed to upload signature");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSig) return;
    try {
      await signatureUpdate.mutateAsync({
        id: editingSig.id,
        name: editName.trim() || undefined,
        file: editFile || undefined,
      });
      setEditingSig(null);
      setEditFile(null);
      setEditPreviewUrl(null);
    } catch (err: any) {
      alert(err.message || "Failed to update signature");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this shared signature from the library?")) return;
    try {
      await signatureDelete.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || "Failed to delete signature");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileImage className="size-5 text-indigo-600" />
              {mode === "select" ? "Select Official Signature" : "Shared Signature Library"}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "select"
                ? "Click an official signature to insert or replace at cursor position."
                : "Manage official signatures visible to all officers."}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsUploading(!isUploading)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 gap-1.5"
          >
            <Plus className="size-3.5" /> New Signature
          </Button>
        </DialogHeader>

        {/* Upload Form Drawer / Section */}
        {isUploading && (
          <form
            onSubmit={handleCreate}
            className="bg-indigo-50/50 border-b border-indigo-100 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 uppercase flex items-center gap-1.5">
                <Upload className="size-3.5 text-indigo-600" /> Upload New Signature
              </span>
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Signature Label / Dignitary Name
                </label>
                <Input
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                  placeholder="e.g., Hon. Minister / Joint Secretary"
                  className="bg-white text-xs h-8"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  PNG / JPEG Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                  required
                />
              </div>
            </div>

            {previewUrl && (
              <div className="mt-2 flex items-center gap-3 bg-white p-2.5 rounded-lg border border-indigo-100">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-12 max-w-[140px] object-contain border border-slate-100 rounded bg-slate-50"
                />
                <span className="text-xs text-slate-500 italic">Signature preview</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsUploading(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={signatureCreate.isPending || !newSigFile || !newSigName.trim()}
                className="h-7 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {signatureCreate.isPending ? (
                  <Loader2 className="size-3 animate-spin mr-1" />
                ) : (
                  <Check className="size-3 mr-1" />
                )}
                Save to Library
              </Button>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter signatures by name..."
              className="pl-8 h-8 text-xs bg-white"
            />
          </div>
        </div>

        {/* Signatures Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="size-6 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs">Loading shared signatures...</p>
            </div>
          ) : filteredSignatures.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6">
              <FileImage className="size-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No signatures found</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                No signatures match your filter or none have been uploaded yet. Click "New Signature" above to add one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSignatures.map((sig) => (
                <div
                  key={sig.id}
                  className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 ${
                    mode === "select"
                      ? "hover:border-indigo-500 hover:shadow-md cursor-pointer bg-white"
                      : "bg-white hover:border-slate-300"
                  }`}
                  onClick={() => {
                    if (mode === "select" && onSelect) {
                      onSelect(sig);
                      onClose();
                    }
                  }}
                >
                  {/* Signature Image Preview */}
                  <div className="h-24 bg-slate-50/80 rounded-lg flex items-center justify-center p-2 border border-slate-100 mb-2 overflow-hidden">
                    <img
                      src={sig.image_url}
                      alt={sig.name}
                      className="max-h-full max-w-full object-contain pointer-events-none"
                    />
                  </div>

                  {/* Signature Title & Meta */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate" title={sig.name}>
                        {sig.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {sig.created_by || "Shared"}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSig(sig);
                          setEditName(sig.name);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit label or replace image"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sig.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete signature"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>

                  {mode === "select" && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center text-[11px] font-semibold text-indigo-600 group-hover:underline">
                      Insert Signature
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal Dialog */}
        {editingSig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-sm font-bold text-slate-900">Edit Signature #{editingSig.id}</h4>
                <button
                  type="button"
                  onClick={() => setEditingSig(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Signature Label / Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Replace Image (Optional)
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                />
              </div>

              <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center p-2 border">
                <img
                  src={editPreviewUrl || editingSig.image_url}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSig(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={signatureUpdate.isPending}
                  className="text-xs h-8 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {signatureUpdate.isPending && <Loader2 className="size-3 animate-spin mr-1" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
