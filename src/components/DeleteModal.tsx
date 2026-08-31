import React, { useState } from "react";
import { Trash2, AlertTriangle, ShieldCheck, Clock, X, Archive } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: "STUDENT" | "TEACHER";
  itemName: string;
  itemIdString?: string;
  onConfirmDelete: (reason: string) => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemName,
  itemIdString,
  onConfirmDelete,
}) => {
  const [reason, setReason] = useState("Administrative record cleanup / Transfer");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDelete(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-rose-50 dark:bg-rose-950/50 p-5 border-b border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-700 dark:text-rose-300">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Archive / Delete {itemType === "STUDENT" ? "Student" : "Teacher"} Record
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                6-Month Guaranteed Recovery Period
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2">
            <p className="text-slate-900 dark:text-slate-100 font-semibold text-xs">
              Are you sure you want to remove <span className="text-indigo-600 dark:text-indigo-400 font-bold">{itemName}</span>?
            </p>
            {itemIdString && (
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">ID / Ref: {itemIdString}</p>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-950 dark:text-amber-100">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>6-Month Safe Recovery Vault Policy</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              This record will be moved out of active rosters and report card views, but stored securely in the <strong>6-Month Recovery Vault</strong>. You or any school administrator can <strong>restore it with 1-click anytime for up to 180 days</strong> (6 months).
            </p>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Reason for Deletion / Archival *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="Transferred to another school / district">Transferred to another school / district</option>
              <option value="Graduated / Alumni archived">Graduated / Alumni archived</option>
              <option value="Family relocation outside Ghana/Region">Family relocation outside Ghana/Region</option>
              <option value="Staff resignation / contract completion">Staff resignation / contract completion</option>
              <option value="Duplicate or test entry removed">Duplicate or test entry removed</option>
              <option value="Administrative record cleanup">Administrative record cleanup</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Move to 6-Month Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
