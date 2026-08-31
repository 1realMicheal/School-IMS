import React, { useState } from "react";
import { School, SchoolClass, Student } from "../types";
import { X, UserPlus, Check, Camera, Image, Trash2, Upload } from "lucide-react";
import { Avatar } from "./Avatar";

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  classes: SchoolClass[];
  onAddStudent: (student: Student) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  school,
  classes,
  onAddStudent,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female",
    dob: "2012-05-15",
    classId: classes[0]?.id || "cls-jhs2-gold",
    indexNumber: `${school.code.split("-")[0]}/2026/${Math.floor(100 + Math.random() * 900)}`,
    ghanaCardId: `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-${Math.floor(1 + Math.random() * 9)}`,
    guardianName: "",
    guardianRelation: "Father" as "Father" | "Mother" | "Guardian",
    guardianPhone: "+233 24 ",
    guardianEmail: "",
    residentialAddress: "",
    feeBalanceGHS: 250.0,
    photoUrl: "", // Empty by default so initials are used if no photo provided
  });

  const [photoInputMode, setPhotoInputMode] = useState<"file" | "url">("file");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    const selectedClass = classes.find((c) => c.id === formData.classId) || classes[0];

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      schoolId: school.id,
      classId: formData.classId,
      className: selectedClass.name,
      indexNumber: formData.indexNumber,
      ghanaCardId: formData.ghanaCardId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formData.dob,
      photo: formData.photoUrl.trim(), // Can be empty, will render initials
      guardianName: formData.guardianName || "Guardian",
      guardianPhone: formData.guardianPhone,
      guardianEmail: formData.guardianEmail || "guardian@email.com",
      guardianRelation: formData.guardianRelation,
      residentialAddress: formData.residentialAddress || "Accra, Ghana",
      feeBalanceGHS: Number(formData.feeBalanceGHS),
      attendancePercentage: 100,
      conduct: "Courteous and respectful.",
      attitude: "Active participant in class activities.",
      interest: "Science, Football, ICT Club",
      status: "Active",
    };

    onAddStudent(newStudent);
    onClose();
  };

  const studentFullName = `${formData.firstName} ${formData.lastName}`.trim() || "New Pupil";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Enroll New Student Record</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digital Filing Cabinet • {school.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 max-h-[80vh] overflow-y-auto">
          {/* Live Profile Picture & Initials Preview Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Student Profile Picture (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                {formData.photoUrl ? "Custom photo selected" : "Initials will be used automatically"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  name={studentFullName}
                  src={formData.photoUrl}
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
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: "" })}
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
                      <span>Choose Passport Photo</span>
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
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://images.example.com/photo.jpg"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Kwadwo"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Last Name / Surname *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Annan"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

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
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Class Assigned</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Student Index No.</label>
              <input
                type="text"
                value={formData.indexNumber}
                onChange={(e) => setFormData({ ...formData, indexNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ghana Card PIN</label>
              <input
                type="text"
                value={formData.ghanaCardId}
                onChange={(e) => setFormData({ ...formData, ghanaCardId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Guardian Full Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="e.g. Papa Annan"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Guardian Phone (Ghana SMS/MoMo)</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.residentialAddress}
                onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                placeholder="e.g. House No. 24, Achimota Mile 7, Accra"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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
              <span>Enroll Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

