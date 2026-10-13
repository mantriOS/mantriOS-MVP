import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Mail,
  Paperclip,
  FileText,
  CheckCircle2,
  UserPlus,
  Loader2,
  FileImage,
  ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import type { Petition } from "@/types/petition";
import type { SharedSignature } from "@/types/branding";
import { useBrandingConfig, useBrandingMutations } from "@/services/brandingService";
import { SignatureManagerModal } from "./SignatureManagerModal";

interface ForwardPetitionDialogProps {
  petition: Petition;
  isOpen: boolean;
  onClose: () => void;
}

const FORWARD_INSTRUCTIONS = [
  "May see",
  "May examine",
  "May examine and take necessary action",
];

export function ForwardPetitionDialog({ petition, isOpen, onClose }: ForwardPetitionDialogProps) {
  const [to, setTo] = useState<string>("");
  const [cc, setCc] = useState<string>("");
  const [bcc, setBcc] = useState<string>("");
  const [instruction, setInstruction] = useState<string>("");
  const [subject, setSubject] = useState<string>(`Fwd: ${petition.subject}`);
  const [notes, setNotes] = useState<string>("");

  // Email Branding States
  const [headerEnabled, setHeaderEnabled] = useState<boolean>(false);
  const [footerEnabled, setFooterEnabled] = useState<boolean>(false);
  const [selectedSignature, setSelectedSignature] = useState<SharedSignature | null>(null);
  const [sigPickerOpen, setSigPickerOpen] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  // Editor Ref and cursor tracking
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRange = useRef<Range | null>(null);

  const { data: brandingConfig } = useBrandingConfig();
  const { forwardPetition } = useBrandingMutations();

  // Initialize initial editor text once dialog opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      const defaultText = `Please find attached citizen petition #${petition.id} regarding "${petition.subject}".\n\nAI Summary: ${petition.analysis?.summary || "N/A"}\n\nKindly review and take necessary action.`;
      editorRef.current.innerText = defaultText;
    }
  }, [isOpen, petition]);

  if (!isOpen) return null;

  const handleAddSuggestedRecipient = () => {
    setTo((prev) => (prev ? `${prev}, Personal Secretary` : "Personal Secretary"));
  };

  const handleInstructionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInstruction(val);
    if (val && editorRef.current) {
      editorRef.current.innerText = `${val}.\n\n${editorRef.current.innerText}`;
    }
  };

  // Save selection range when editor loses focus or selection changes
  const saveCursorPosition = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRange.current = range.cloneRange();
      }
    }
  };

  // Insert or Replace Signature at saved cursor position
  const handleSignatureSelected = (sig: SharedSignature) => {
    setSelectedSignature(sig);

    if (!editorRef.current) return;

    // Remove any existing signature in the editor (Requirement: only one signature allowed; replacement on select)
    const existingSigNode = editorRef.current.querySelector('[data-mantrios-signature="true"]');
    if (existingSigNode) {
      existingSigNode.remove();
    }

    // Create the signature wrapper node
    const sigContainer = document.createElement("div");
    sigContainer.setAttribute("data-mantrios-signature", "true");
    sigContainer.className = "my-3 select-none flex flex-col items-start";
    sigContainer.contentEditable = "false";

    const img = document.createElement("img");
    img.src = sig.image_url;
    img.alt = sig.name;
    img.className = "max-h-20 max-w-[220px] object-contain block";
    img.style.maxHeight = "80px";
    img.style.maxWidth = "220px";

    const caption = document.createElement("div");
    caption.className = "text-[11px] font-semibold text-slate-700 mt-1";
    caption.innerText = sig.name;

    sigContainer.appendChild(img);
    sigContainer.appendChild(caption);

    // Insert at saved cursor range or append at end
    const sel = window.getSelection();
    const range = savedSelectionRange.current;

    if (range && editorRef.current.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(sigContainer);
      // Move cursor after signature
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      editorRef.current.appendChild(sigContainer);
    }
  };

  // Remove the currently inserted signature from the email editor
  const handleRemoveSignature = () => {
    setSelectedSignature(null);
    if (editorRef.current) {
      const existingSigNode = editorRef.current.querySelector('[data-mantrios-signature="true"]');
      if (existingSigNode) {
        existingSigNode.remove();
      }
    }
  };


  const handleSend = async () => {
    if (!to.trim()) {
      alert("Please specify a recipient email address.");
      return;
    }

    const editorHtml = editorRef.current?.innerHTML || "";

    try {
      setSendStatus("sending");
      await forwardPetition.mutateAsync({
        petition_id: petition.id,
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim(),
        message: editorRef.current?.innerText || "",
        notes: notes.trim() || undefined,
        header_enabled: headerEnabled,
        footer_enabled: footerEnabled,
        signature_id: selectedSignature?.id || null,
        html_content: editorHtml,
      });

      setSendStatus("sent");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setSendStatus(null);
      alert(err.message || "Failed to forward petition email.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-5">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Mail className="size-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Forward Petition #{petition.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Email Form & Branded Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recipients Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <label className="w-12 text-xs font-semibold text-slate-500 uppercase">To</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Recipient email addresses..."
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSuggestedRecipient}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  <UserPlus className="size-3" /> + Personal Secretary
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-12 text-xs font-semibold text-slate-500 uppercase">Cc</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Optional CC addresses..."
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-12 text-xs font-semibold text-slate-500 uppercase">Bcc</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Optional BCC addresses..."
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Instruction Selection */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-700 uppercase">
                Official Instruction Note
              </label>
              <select
                value={instruction}
                onChange={handleInstructionChange}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-2xs"
              >
                <option value="" disabled>Select an instruction phrase...</option>
                {FORWARD_INSTRUCTIONS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            {/* ── EMAIL COMPOSER & BRANDING TOOLBAR ── */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Email Message & Official Branding
                </label>
                <span className="text-[10px] text-slate-400">WYSIWYG Email Output</span>
              </div>

              {/* Official Branding Toolbar (Requirement Section 3) */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-2 rounded-t-xl border border-slate-200 border-b-0">
                {/* 1. Header Toggle Button */}
                <button
                  type="button"
                  onClick={() => setHeaderEnabled(!headerEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    headerEnabled
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                  title={
                    brandingConfig?.header_url
                      ? "Toggle official government header"
                      : "Official header not configured in Admin Settings"
                  }
                >
                  <ImageIcon className="size-3.5" />
                  <span>Header</span>
                  {headerEnabled && <Check className="size-3 ml-0.5" />}
                </button>

                {/* 2. Footer Toggle Button */}
                <button
                  type="button"
                  onClick={() => setFooterEnabled(!footerEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    footerEnabled
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                  title={
                    brandingConfig?.footer_url
                      ? "Toggle official government footer"
                      : "Official footer not configured in Admin Settings"
                  }
                >
                  <ImageIcon className="size-3.5" />
                  <span>Footer</span>
                  {footerEnabled && <Check className="size-3 ml-0.5" />}
                </button>

                {/* 3. Insert Signature Action Button (Requirement Section 3.3) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      saveCursorPosition();
                      setSigPickerOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-2xs"
                    title="Insert or replace signature at cursor"
                  >
                    <FileImage className="size-3.5 text-indigo-600" />
                    <span>{selectedSignature ? "Change Signature" : "Insert Signature"}</span>
                    {selectedSignature && (
                      <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-normal">
                        {selectedSignature.name}
                      </span>
                    )}
                  </button>

                  {/* Remove Signature Button */}
                  {selectedSignature && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors shadow-2xs"
                      title="Remove signature from email"
                    >
                      <X className="size-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Integrated Branded Email Layout (Requirement Section 6 & 8) */}
              <div className="border border-slate-200 rounded-b-xl bg-white shadow-2xs overflow-hidden flex flex-col">
                {/* 1. Header (Image OR Custom HTML, Always at Top if Enabled) */}
                {headerEnabled && (
                  <div className="w-full bg-slate-50 border-b border-slate-100 p-2 flex justify-center items-center">
                    {brandingConfig?.header_type === "html" && brandingConfig?.header_html ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: brandingConfig.header_html }}
                      />
                    ) : brandingConfig?.header_url ? (
                      <img
                        src={brandingConfig.header_url}
                        alt="Official Header"
                        className="w-full max-h-36 object-contain"
                      />
                    ) : (
                      <div className="text-center py-3 text-amber-700 text-xs flex items-center justify-center gap-1.5">
                        <AlertCircle className="size-4" />
                        <span>Official header not configured in Admin Settings.</span>
                      </div>
                    )}
                  </div>
                )}


                {/* 2. Editable Email Message Body */}
                <div
                  ref={editorRef}
                  contentEditable
                  onKeyUp={saveCursorPosition}
                  onMouseUp={saveCursorPosition}
                  onBlur={saveCursorPosition}
                  className="min-h-[160px] max-h-[300px] overflow-y-auto p-4 text-sm text-slate-800 focus:outline-none font-sans whitespace-pre-wrap leading-relaxed"
                />

                {/* 3. Footer (Image OR Custom HTML, Always at Bottom if Enabled) */}
                {footerEnabled && (
                  <div className="w-full bg-slate-50 border-t border-slate-100 p-2 flex justify-center items-center">
                    {brandingConfig?.footer_type === "html" && brandingConfig?.footer_html ? (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: brandingConfig.footer_html }}
                      />
                    ) : brandingConfig?.footer_url ? (
                      <img
                        src={brandingConfig.footer_url}
                        alt="Official Footer"
                        className="w-full max-h-28 object-contain"
                      />
                    ) : (
                      <div className="text-center py-3 text-amber-700 text-xs flex items-center justify-center gap-1.5">
                        <AlertCircle className="size-4" />
                        <span>Official footer not configured in Admin Settings.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Attachments & Internal Notes */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                <Paperclip className="size-4 text-slate-500" /> Official Attachments
              </h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                      Petition_Report_{petition.id}.pdf
                    </p>
                    <p className="text-[10px] text-slate-500">Auto-generated docket</p>
                  </div>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                <FileText className="size-4 text-slate-500" /> Internal Administrative Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add confidential notes for the forwarding department..."
                className="w-full h-36 rounded-lg border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 italic">
            This forward action is recorded in petition history with applied branding.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={sendStatus === "sending"}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sendStatus === "sending" || sendStatus === "sent"}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
                sendStatus === "sent"
                  ? "bg-emerald-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {sendStatus === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Forwarding...
                </>
              ) : sendStatus === "sent" ? (
                <>
                  <Check className="size-4" /> Forwarded
                </>
              ) : (
                <>
                  <Send className="size-4" /> Send Forward
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Picker Modal */}
      <SignatureManagerModal
        isOpen={sigPickerOpen}
        onClose={() => setSigPickerOpen(false)}
        onSelect={handleSignatureSelected}
        mode="select"
      />
    </div>
  );
}
