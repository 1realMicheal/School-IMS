import React, { useState } from "react";
import { School, SchoolClass, Subject, Teacher } from "../types";
import { UserCheck, X, Check, Shield, Camera, Upload, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";

interface NewTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  classes: SchoolClass[];
  subjects: Subject[];
  onAddTeacher: (teacher: Teacher) => void;
}

export const NewTeacherModal: React.FC<NewTeacherModalProps> = ({
  isOpen,
  onClose,
  school,
  classes,
  subjects,
  onAddTeacher,
}) => {
  const [formData, setFormData] = useState({
    titlePrefix: "Mr.",
    fullName: "",
    gender: "Male" as "Male" | "Female",
    email: "",
    phone: "+233 ",
    gesStaffId: `GES-T-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    qualification: "B.Ed Basic Education (UCC)",
    designation: "Class Teacher & Subject Master",
    assignedClassId: classes[0]?.id || "",
    assignedSubjectIds: [subjects[0]?.id || ""],
    avatarUrl: "",
  });

  const [photoInputMode, setPhotoInputMode] = useState<"file" | "url">("file");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedSubjectIds.includes(subjectId);
      if (exists) {
        return {
          ...prev,
          assignedSubjectIds: prev.assignedSubjectIds.filter((id) => id !== subjectId),
        };
      } else {
        return {
          ...prev,
          assignedSubjectIds: [...prev.assignedSubjectIds, subjectId],
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const assignedClass = classes.find((c) => c.id === formData.assignedClassId);
    const teacherName = `${formData.titlePrefix} ${formData.fullName.trim()}`;

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      schoolId: school.id,
      name: teacherName,
      email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, ".")}@${school.code.toLowerCase()}.edu.gh`,
      phone: formData.phone.trim(),
      gender: formData.gender,
      avatar: formData.avatarUrl.trim(), // Can be empty string; fallback to initials avatar!
      gesStaffId: formData.gesStaffId.trim(),
      qualification: formData.qualification.trim(),
      title: formData.designation.trim() || "Subject Teacher",
      assignedClassId: formData.assignedClassId || undefined,
      assignedClassName: assignedClass ? assignedClass.name : undefined,
      assignedSubjectIds: formData.assignedSubjectIds,
      dateJoined: new Date().toISOString().split("T")[0],
      isDeleted: false,
    };

    onAddTeacher(newTeacher);
    onClose();
  };

  const teacherDisplayName = `${formData.titlePrefix} ${formData.fullName}`.trim() || "New Educator";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Onboard New Educator / Teacher</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff Roster & GES Certification • {school.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 max-h-[80vh] overflow-y-auto">
          {/* Live Profile Picture & Initials Preview Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Educator Profile Picture (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                {formData.avatarUrl ? "Custom photo selected" : "Initials will be used automatically"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  name={teacherDisplayName}
                  src={formData.avatarUrl}
                  size="xl"
                  className="shadow-sm ring-2 ring-indigo-500/30"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode("file")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                      photoInputMode === "file"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoInputMode("url")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                      photoInputMode === "url"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    Image URL
                  </button>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: "" })}
                      className="px-2.5 py-1 rounded text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Use Initials</span>
                    </button>
                  )}
                </div>

                {photoInputMode === "file" ? (
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Choose Staff Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WebP supported</span>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://images.example.com/staff.jpg"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Prefix</label>
              <select
                value={formData.titlePrefix}
                onChange={(e) => setFormData({ ...formData, titlePrefix: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Mr.">Mr.</option>
                <option value="Madam">Madam</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
                <option value="Dr.">Dr.</option>
                <option value="Rev.">Rev.</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Teacher Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Seth K. Baah"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">GES Registered Staff ID</label>
              <input
                type="text"
                value={formData.gesStaffId}
                onChange={(e) => setFormData({ ...formData, gesStaffId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@school.edu.gh"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number (Ghana SMS)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 24 XXX XXXX"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Academic Qualification</label>
              <select
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="B.Ed Basic Education (UCC)">B.Ed Basic Education (UCC)</option>
                <option value="B.Ed Mathematics & Science (UEW)">B.Ed Mathematics & Science (UEW)</option>
                <option value="B.A. English & Literature (UG Legon)">B.A. English & Literature (UG Legon)</option>
                <option value="B.Sc Computing in Education (KNUST)">B.Sc Computing in Education (KNUST)</option>
                <option value="Postgraduate Diploma in Education (PGDE)">PGDE (Postgraduate Diploma in Ed)</option>
                <option value="M.Ed Educational Leadership">M.Ed Educational Leadership</option>
                <option value="Diploma in Basic Education (Colleges of Education)">DBE (Colleges of Education)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Designation / Role Title</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior Class Master, Head of Science"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Form / Class (Optional)</label>
            <select
              value={formData.assignedClassId}
              onChange={(e) => setFormData({ ...formData, assignedClassId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- No Class Teacher Assignment (Subject Teacher Only) --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Teaching Subject Specializations *</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">Select one or more</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl max-h-36 overflow-y-auto">
              {subjects.map((sub) => {
                const isSelected = formData.assignedSubjectIds.includes(sub.id);
                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => handleSubjectToggle(sub.id)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 font-bold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-[11px] truncate">{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Teacher profile will be provisioned with Role-Based Access Control (RBAC). Data is protected under 6-month recoverable retention policies.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Onboard Teacher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

