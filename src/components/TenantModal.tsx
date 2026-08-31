import React, { useState } from "react";
import { School, GradingSystemType, SchoolLevel } from "../types";
import { X, School as SchoolIcon, Shield, Check, Sparkles } from "lucide-react";

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSchool: (school: School) => void;
}

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Oti",
  "Savannah",
  "North East",
  "Western North",
];

export const TenantModal: React.FC<TenantModalProps> = ({ isOpen, onClose, onAddSchool }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    motto: "",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    level: "JHS" as SchoolLevel,
    academicYear: "2025/2026",
    term: "Term 2" as const,
    gradingScale: "GES_9_STANINE" as GradingSystemType,
    caPercentage: 40,
    examPercentage: 60,
    contactPhone: "+233 ",
    contactEmail: "",
    headmasterName: "",
    crestUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSchool: School = {
      id: `sch-${Date.now()}`,
      name: formData.name,
      code: formData.code.toUpperCase() || formData.name.substring(0, 3).toUpperCase() + "-001",
      crest: formData.crestUrl,
      motto: formData.motto || "Knowledge, Discipline, Excellence",
      region: formData.region,
      district: formData.district,
      level: formData.level,
      academicYear: formData.academicYear,
      term: formData.term,
      gradingScale: formData.gradingScale,
      caSplit: {
        caPercentage: Number(formData.caPercentage),
        examPercentage: Number(formData.examPercentage),
      },
      subscriptionTier: "Standard",
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail || `admin@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.edu.gh`,
      headmasterName: formData.headmasterName || "Headmaster",
      themeColor: "emerald",
      reopeningDate: "2026-09-15",
      totalStudents: 120,
      totalTeachers: 12,
    };

    onAddSchool(newSchool);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
              <SchoolIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Onboard New Ghanaian School Tenant
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded font-mono font-semibold">
                  RLS Isolated
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure GES academic parameters, grading scales, and school branding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                School Legal Name (e.g., St. Peter's Boys SHS, Roman Catholic Basic) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Keta Senior High Technical School"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">School Code (Acronym)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. KETASCO-001"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">School Motto</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                placeholder="e.g. Dzo Lali (Fly Now)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ghana Administrative Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} Region
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">District / Municipal Area</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Keta Municipal District"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Institutional Level</label>
              <select
                value={formData.level}
                onChange={(e) => {
                  const lvl = e.target.value as SchoolLevel;
                  setFormData({
                    ...formData,
                    level: lvl,
                    gradingScale: lvl === "SHS" ? "WAEC_WASSCE" : "GES_9_STANINE",
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Basic (KG - JHS)">Basic (KG - JHS)</option>
                <option value="JHS">Junior High School (JHS)</option>
                <option value="SHS">Senior High School (SHS)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Official Grading Scale</label>
              <select
                value={formData.gradingScale}
                onChange={(e) =>
                  setFormData({ ...formData, gradingScale: e.target.value as GradingSystemType })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="GES_9_STANINE">GES 9-Point Stanine (Grade 1 - 9 for BECE)</option>
                <option value="WAEC_WASSCE">WAEC WASSCE (A1, B2, B3, C4.. F9)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Continuous Assessment (CA) / Exam Split
              </label>
              <select
                value={`${formData.caPercentage}/${formData.examPercentage}`}
                onChange={(e) => {
                  const [ca, exam] = e.target.value.split("/").map(Number);
                  setFormData({ ...formData, caPercentage: ca, examPercentage: exam });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="40/60">40% Continuous Assessment / 60% Terminal Exam (GES Standard)</option>
                <option value="30/70">30% Continuous Assessment / 70% Terminal Exam (SHS/WAEC Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Headmaster / Principal Name</label>
              <input
                type="text"
                value={formData.headmasterName}
                onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                placeholder="e.g. Mr. Isaac Dzidzienyo"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Security & RLS Notice */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Database Tenant Isolation (RLS)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                A dedicated <code className="text-indigo-600 dark:text-indigo-400 font-mono">school_id</code> schema partition will be provisioned. Staff, students, and assessment records for this school will remain strictly cryptographic and access-restricted.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
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
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Complete School Onboarding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
