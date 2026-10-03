import { useState } from "react";
import { Send, X, Mail, Paperclip, FileText, CheckCircle2, UserPlus, RefreshCw, Save } from "lucide-react";
import type { Petition } from "@/types/petition";

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
  const [message, setMessage] = useState<string>(
    `Please find attached the citizen petition #${petition.id} regarding "${petition.subject}".\n\nAI Summary: ${petition.analysis?.summary || 'N/A'}\n\nKindly review.`
  );
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const handleAddSuggestedRecipient = () => {
    setTo(prev => prev ? `${prev}, Personal Secretary` : "Personal Secretary");
  };

  const handleInstructionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setInstruction(val);
    if (val) {
      setMessage(prev => `${val}.\n\n${prev}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
            <Mail className="size-4 text-slate-600" /> Forward Petition #{petition.id}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Email Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-12 text-xs font-semibold text-slate-500 uppercase">To</label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Recipient email addresses..."
                    className="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>
                <button
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
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="w-12 text-xs font-semibold text-slate-500 uppercase">Bcc</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 uppercase">Mandatory Instruction</label>
              <select
                value={instruction}
                onChange={handleInstructionChange}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500/20 shadow-2xs"
              >
                <option value="" disabled>Select an instruction phrase...</option>
                {FORWARD_INSTRUCTIONS.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 uppercase">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5 pt-2 flex flex-col h-64">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 uppercase">Message (AI Drafted)</label>
                <div className="flex gap-2">
                  <button disabled className="text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
                    <RefreshCw className="size-3" /> Regenerate
                  </button>
                  <button disabled className="text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 opacity-50 cursor-not-allowed" title="Coming soon">
                    <Save className="size-3" /> Save Draft
                  </button>
                </div>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 w-full rounded-lg border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-indigo-500/20 resize-none font-sans"
              />
            </div>

            {/* Signature Area */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Official Signature</label>
              <div className="text-xs text-slate-500 font-sans border-l-2 border-slate-200 pl-3 italic">
                Official signature will be configured
              </div>
            </div>
          </div>

          {/* Right Column: Attachments & Notes */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                <Paperclip className="size-4 text-slate-500" /> Attachments
              </h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">Petition_Report_{petition.id}.pdf</p>
                    <p className="text-[10px] text-slate-500">245 KB • Auto-generated</p>
                  </div>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <button disabled className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-500 uppercase hover:bg-slate-50 opacity-50 cursor-not-allowed">
                + Add Attachment (Coming Soon)
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                <FileText className="size-4 text-slate-500" /> Internal Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes for the forwarded department..."
                className="w-full h-32 rounded-lg border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500 italic">This action will be recorded in the petition history.</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
            >
              <Send className="size-4" /> Send Forward (Coming soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
