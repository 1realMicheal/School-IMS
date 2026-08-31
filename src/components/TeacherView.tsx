import React, { useState } from "react";
import { School, UserPersona, SchoolClass, Student, Subject, SubjectGrade, AttendanceRecord, AttendanceStatus, NetworkLatencyMode } from "../types";
import { calculateGrade, calculateTotalScore, formatOrdinal } from "../utils/grading";
import { Avatar } from "./Avatar";
import { CheckCircle, XCircle, Clock, ShieldCheck, Sparkles, Send, Users, BookOpen, AlertCircle, Save, Check, RefreshCw, Smartphone, Award, Search, Filter, X } from "lucide-react";
import confetti from "canvas-confetti";

interface TeacherViewProps {
  currentSchool: School;
  currentPersona: UserPersona;
  classes: SchoolClass[];
  students: Student[];
  subjects: Subject[];
  grades: SubjectGrade[];
  onUpdateGrades: (updatedGrades: SubjectGrade[]) => void;
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (records: AttendanceRecord[], sendSms: boolean) => void;
  networkMode: NetworkLatencyMode;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  currentSchool,
  currentPersona,
  classes,
  students,
  subjects,
  grades,
  onUpdateGrades,
  attendanceRecords,
  onSaveAttendance,
  networkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "GRADEBOOK" | "ROSTER">("ATTENDANCE");
  
  // Selected Class & Subject
  const defaultClassId = currentPersona.assignedClassId || classes[0]?.id || "cls-jhs2-gold";
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("sub-maths");

  // Attendance State (The 30-Second Morning)
  const todayStr = new Date().toISOString().split("T")[0];
  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);
  const [tempAttendance, setTempAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [sendSmsToParents, setSendSmsToParents] = useState<boolean>(true);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState<boolean>(false);
  const [smsNotificationToast, setSmsNotificationToast] = useState<string | null>(null);
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState("");

  // Gradebook State
  const [editingGrades, setEditingGrades] = useState<Record<string, { classEx: number; hw: number; proj: number; exam: number }>>({});
  const [gradeSearchQuery, setGradeSearchQuery] = useState("");
  const [aiGeneratingStudentId, setAiGeneratingStudentId] = useState<string | null>(null);
  const [aiGeneratedRemarks, setAiGeneratedRemarks] = useState<Record<string, string>>({});

  // Roster State
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");

  // Filter students for the selected class (active only)
  const classStudents = students.filter(
    (s) => s.classId === selectedClassId && !s.isDeleted && s.status !== "Deleted"
  );
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Search filtered lists for each tab
  const filteredAttendanceStudents = classStudents.filter((student) => {
    const q = attendanceSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      student.firstName.toLowerCase().includes(q) ||
      student.lastName.toLowerCase().includes(q) ||
      student.indexNumber.toLowerCase().includes(q) ||
      student.ghanaCardId.toLowerCase().includes(q)
    );
  });

  const filteredGradebookStudents = classStudents.filter((student) => {
    const q = gradeSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      student.firstName.toLowerCase().includes(q) ||
      student.lastName.toLowerCase().includes(q) ||
      student.indexNumber.toLowerCase().includes(q) ||
      student.ghanaCardId.toLowerCase().includes(q)
    );
  });

  const filteredRosterStudents = classStudents.filter((student) => {
    const q = rosterSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(q) ||
      student.firstName.toLowerCase().includes(q) ||
      student.lastName.toLowerCase().includes(q) ||
      student.indexNumber.toLowerCase().includes(q) ||
      student.ghanaCardId.toLowerCase().includes(q) ||
      student.guardianName.toLowerCase().includes(q) ||
      student.guardianPhone.toLowerCase().includes(q) ||
      (student.interest && student.interest.toLowerCase().includes(q))
    );
  });

  // Initialize attendance for today if not already set
  React.useEffect(() => {
    const existing = attendanceRecords.filter(
      (r) => r.classId === selectedClassId && r.date === attendanceDate
    );
    const map: Record<string, AttendanceStatus> = {};
    if (existing.length > 0) {
      existing.forEach((r) => {
        map[r.studentId] = r.status;
      });
      setAttendanceSubmitted(true);
    } else {
      // Default to PRESENT for instant 30-second workflow
      classStudents.forEach((s) => {
        map[s.id] = "PRESENT";
      });
      setAttendanceSubmitted(false);
    }
    setTempAttendance(map);
  }, [selectedClassId, attendanceDate, attendanceRecords.length]);

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      map[s.id] = "PRESENT";
    });
    setTempAttendance(map);
  };

  // Toggle individual status
  const handleToggleStatus = (studentId: string) => {
    setTempAttendance((prev) => {
      const current = prev[studentId] || "PRESENT";
      let next: AttendanceStatus = "PRESENT";
      if (current === "PRESENT") next = "ABSENT";
      else if (current === "ABSENT") next = "LATE";
      else if (current === "LATE") next = "EXCUSED";
      else if (current === "EXCUSED") next = "PRESENT";
      return { ...prev, [studentId]: next };
    });
  };

  // Submit Morning Attendance (The 30-Second Journey)
  const handleSubmitAttendance = () => {
    const records: AttendanceRecord[] = classStudents.map((s) => ({
      id: `att-${selectedClassId}-${s.id}-${attendanceDate}`,
      schoolId: currentSchool.id,
      classId: selectedClassId,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      date: attendanceDate,
      status: tempAttendance[s.id] || "PRESENT",
      recordedBy: currentPersona.name,
      smsSent: sendSmsToParents,
    }));

    onSaveAttendance(records, sendSmsToParents);
    setAttendanceSubmitted(true);

    const absentCount = Object.values(tempAttendance).filter((s) => s === "ABSENT").length;
    const presentCount = Object.values(tempAttendance).filter((s) => s === "PRESENT").length;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10b981", "#f59e0b", "#3b82f6"],
    });

    if (sendSmsToParents && absentCount > 0) {
      setSmsNotificationToast(
        `Dispatched Ghana SMS to ${absentCount} parent(s): Absences logged for morning roll call.`
      );
      setTimeout(() => setSmsNotificationToast(null), 6000);
    }
  };

  // Grade Calculations & Inline Editing
  const getStudentGrade = (studentId: string) => {
    const existing = grades.find(
      (g) =>
        g.studentId === studentId &&
        g.subjectId === selectedSubjectId &&
        g.term === currentSchool.term &&
        g.academicYear === currentSchool.academicYear
    );

    const editState = editingGrades[studentId];

    const classEx = editState !== undefined ? editState.classEx : existing?.classExercises ?? 12;
    const hw = editState !== undefined ? editState.hw : existing?.homework ?? 8;
    const proj = editState !== undefined ? editState.proj : existing?.projectMidTerm ?? 12;
    const exam = editState !== undefined ? editState.exam : existing?.examScore ?? 45;

    const { totalCA, finalScore } = calculateTotalScore(
      classEx,
      hw,
      proj,
      exam,
      currentSchool.caSplit.caPercentage,
      currentSchool.caSplit.examPercentage
    );

    const gradeInfo = calculateGrade(finalScore, currentSchool.gradingScale);

    return {
      classEx,
      hw,
      proj,
      totalCA,
      exam,
      finalScore,
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      existingId: existing?.id,
    };
  };

  const handleGradeInputChange = (
    studentId: string,
    field: "classEx" | "hw" | "proj" | "exam",
    val: number
  ) => {
    const current = getStudentGrade(studentId);
    setEditingGrades((prev) => ({
      ...prev,
      [studentId]: {
        classEx: field === "classEx" ? val : current.classEx,
        hw: field === "hw" ? val : current.hw,
        proj: field === "proj" ? val : current.proj,
        exam: field === "exam" ? val : current.exam,
      },
    }));
  };

  const handleSaveAllGrades = () => {
    const updated: SubjectGrade[] = classStudents.map((s, index) => {
      const g = getStudentGrade(s.id);
      return {
        id: g.existingId || `grd-${s.id}-${selectedSubjectId}-${Date.now()}`,
        schoolId: currentSchool.id,
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject.name,
        academicYear: currentSchool.academicYear,
        term: currentSchool.term,
        classExercises: g.classEx,
        homework: g.hw,
        projectMidTerm: g.proj,
        totalCA: g.totalCA,
        examScore: g.exam,
        totalScore: g.finalScore,
        grade: g.grade,
        gradeRemark: g.remark,
        positionInSubject: index + 1,
        classAverage: 68.5,
      };
    });

    onUpdateGrades(updated);
    setEditingGrades({});
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  // AI Pedagogical Remark Assistant
  const handleGenerateAiRemark = async (student: Student) => {
    setAiGeneratingStudentId(student.id);
    const g = getStudentGrade(student.id);

    try {
      const res = await fetch("/api/ai/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: `${student.firstName} ${student.lastName}`,
          classLevel: selectedClass?.gradeLevel || "JHS 2",
          averageScore: g.finalScore,
          attendanceRate: student.attendancePercentage,
          strengths: student.interest,
          areasForImprovement: g.finalScore < 60 ? "Regular algebra practice" : "Essay elaboration",
          role: "teacher",
        }),
      });
      const data = await res.json();
      if (data.remark) {
        setAiGeneratedRemarks((prev) => ({
          ...prev,
          [student.id]: data.remark,
        }));
      }
    } catch (err) {
      console.error(err);
      setAiGeneratedRemarks((prev) => ({
        ...prev,
        [student.id]: `${student.firstName} shows great determination. Consistent practice in class exercises will solidify their grasp of concepts next term.`,
      }));
    } finally {
      setAiGeneratingStudentId(null);
    }
  };

  const presentCount = Object.values(tempAttendance).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(tempAttendance).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(tempAttendance).filter((s) => s === "LATE").length;
  const rateToday = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Teacher Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg">
            👩🏾‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">Teacher Command Hub</h1>
              <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold">
                Madam Akosua
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid 30-Second Attendance, Continuous Assessment & GES Terminal Grading
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            id="tab-attendance-btn"
            onClick={() => setActiveTab("ATTENDANCE")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "ATTENDANCE"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>30-Sec Attendance</span>
          </button>
          <button
            id="tab-gradebook-btn"
            onClick={() => setActiveTab("GRADEBOOK")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "GRADEBOOK"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Assessment & Exams</span>
          </button>
          <button
            id="tab-roster-btn"
            onClick={() => setActiveTab("ROSTER")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "ROSTER"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Class Roster ({classStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Class & Subject Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Class:</span>
            <select
              id="teacher-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          {activeTab === "GRADEBOOK" && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Subject:</span>
              <select
                id="teacher-subject-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="font-mono">
            CA Split: <strong className="text-indigo-700 dark:text-indigo-400 font-semibold">{currentSchool.caSplit.caPercentage}% CA</strong> /{" "}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{currentSchool.caSplit.examPercentage}% Exam</strong>
          </span>
          <span>•</span>
          <span className="font-mono">
            Grading: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{currentSchool.gradingScale === "GES_9_STANINE" ? "GES 9-Stanine" : "WAEC WASSCE"}</strong>
          </span>
        </div>
      </div>

      {/* SMS Alert Notification Toast */}
      {smsNotificationToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{smsNotificationToast}</span>
          </div>
          <button
            onClick={() => setSmsNotificationToast(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: THE 30-SECOND MORNING ATTENDANCE */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-4">
          {/* Quick Metrics & One-Tap Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Present Today</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono font-bold">{rateToday}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${rateToday}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Absent</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {absentCount > 0 ? "SMS alert queued" : "All accounted"}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Late / Excused</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{lateCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Tardy arrivals</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Date Register</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 mt-1"
              />
            </div>
          </div>

          {/* 30-Second Morning Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    The 30-Second Roll Call Workflow
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tap "Mark All Present", tap any absentee card to toggle, then click Save Register.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  id="mark-all-present-btn"
                  onClick={handleMarkAllPresent}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark All ({classStudents.length}) Present</span>
                </button>

                <button
                  id="submit-attendance-btn"
                  onClick={handleSubmitAttendance}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{attendanceSubmitted ? "Update Register" : "Submit Attendance"}</span>
                </button>
              </div>
            </div>

            {/* Attendance Search Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                  placeholder="Search pupil by name, index number (e.g. ACH-2026-001), or Ghana Card..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {attendanceSearchQuery && (
                  <button
                    onClick={() => setAttendanceSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                Showing {filteredAttendanceStudents.length} of {classStudents.length} pupils
              </span>
            </div>
          </div>

          {/* Student Rapid Attendance Grid (Cards built for rapid touch on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAttendanceStudents.map((student) => {
              const status = tempAttendance[student.id] || "PRESENT";
              return (
                <div
                  key={student.id}
                  id={`student-att-card-${student.id}`}
                  onClick={() => handleToggleStatus(student.id)}
                  className={`cursor-pointer select-none rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 shadow-xs ${
                    status === "PRESENT"
                      ? "bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                      : status === "ABSENT"
                      ? "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-800"
                      : status === "LATE"
                      ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800"
                      : "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        name={`${student.firstName} ${student.lastName}`}
                        src={student.photo}
                        size="md"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                          status === "PRESENT"
                            ? "bg-emerald-500"
                            : status === "ABSENT"
                            ? "bg-rose-500"
                            : status === "LATE"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{student.indexNumber}</span>
                        <span>•</span>
                        <span>{student.gender}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill Indicator */}
                  <div className="shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        status === "PRESENT"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : status === "ABSENT"
                          ? "bg-rose-600 text-white font-bold"
                          : status === "LATE"
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAttendanceStudents.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-200">No pupil found matching "{attendanceSearchQuery}"</p>
              <p>Try searching by pupil First Name, Last Name, Index Number, or Ghana Card ID.</p>
            </div>
          )}

          {/* SMS Broadcast Setting */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shadow-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                Simulate Instant Ghana SMS alerts to registered parent phone numbers for absentees
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sendSmsToParents}
                onChange={(e) => setSendSmsToParents(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: CONTINUOUS ASSESSMENT & TERMINAL EXAMS GRADEBOOK */}
      {activeTab === "GRADEBOOK" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Subject Assessment Sheet:</span>
                  <span className="text-indigo-700 dark:text-indigo-400 font-semibold">{selectedSubject.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">({selectedClass.name})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Continuous Assessment Breakdown (Exercises: 15, HW: 10, Project: 15 = 40) + Exam (60). Total = 100%.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="save-grades-btn"
                  onClick={handleSaveAllGrades}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Grades</span>
                </button>
              </div>
            </div>

            {/* Gradebook Search Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={gradeSearchQuery}
                  onChange={(e) => setGradeSearchQuery(e.target.value)}
                  placeholder="Search students in gradebook by name, index number, or Ghana Card ID..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {gradeSearchQuery && (
                  <button
                    onClick={() => setGradeSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                Showing {filteredGradebookStudents.length} of {classStudents.length} students
              </span>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5 text-center">
                      Class Ex. <span className="text-indigo-600 dark:text-indigo-400 font-semibold">(15)</span>
                    </th>
                    <th className="p-3.5 text-center">
                      HW <span className="text-indigo-600 dark:text-indigo-400 font-semibold">(10)</span>
                    </th>
                    <th className="p-3.5 text-center">
                      Project <span className="text-indigo-600 dark:text-indigo-400 font-semibold">(15)</span>
                    </th>
                    <th className="p-3.5 text-center bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      Total CA (40%)
                    </th>
                    <th className="p-3.5 text-center">
                      Exam <span className="text-slate-700 dark:text-slate-300 font-semibold">(60%)</span>
                    </th>
                    <th className="p-3.5 text-center font-bold text-slate-900 dark:text-slate-100">Total (100)</th>
                    <th className="p-3.5 text-center">Grade</th>
                    <th className="p-3.5">GES Remarks & AI Assist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredGradebookStudents.map((student) => {
                    const g = getStudentGrade(student.id);
                    const aiRemark = aiGeneratedRemarks[student.id];

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={`${student.firstName} ${student.lastName}`}
                              src={student.photo}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {student.indexNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Class Exercise (Max 15) */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={g.classEx}
                            onChange={(e) =>
                              handleGradeInputChange(student.id, "classEx", Number(e.target.value))
                            }
                            className="w-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100 py-1 focus:border-indigo-500 focus:outline-none"
                          />
                        </td>

                        {/* Homework (Max 10) */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={g.hw}
                            onChange={(e) =>
                              handleGradeInputChange(student.id, "hw", Number(e.target.value))
                            }
                            className="w-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100 py-1 focus:border-indigo-500 focus:outline-none"
                          />
                        </td>

                        {/* Project (Max 15) */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={g.proj}
                            onChange={(e) =>
                              handleGradeInputChange(student.id, "proj", Number(e.target.value))
                            }
                            className="w-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100 py-1 focus:border-indigo-500 focus:outline-none"
                          />
                        </td>

                        {/* Total CA (40%) */}
                        <td className="p-3 text-center font-mono font-black text-indigo-700 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800/60">
                          {g.totalCA}
                        </td>

                        {/* Exam Score (Max 60) */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={g.exam}
                            onChange={(e) =>
                              handleGradeInputChange(student.id, "exam", Number(e.target.value))
                            }
                            className="w-14 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100 py-1 focus:border-indigo-500 focus:outline-none"
                          />
                        </td>

                        {/* Total Score (100) */}
                        <td className="p-3 text-center font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                          {g.finalScore}%
                        </td>

                        {/* Grade Pill */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-black ${
                              Number(g.grade) <= 2 || g.grade === "A1" || g.grade === "B2"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : Number(g.grade) <= 5 || g.grade.startsWith("C")
                                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            Grade {g.grade}
                          </span>
                        </td>

                        {/* AI Remarks Assistant */}
                        <td className="p-3 max-w-xs">
                          {aiRemark ? (
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 italic leading-snug">
                              "{aiRemark}"
                            </p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{g.remark}</span>
                              <button
                                id={`ai-remark-btn-${student.id}`}
                                onClick={() => handleGenerateAiRemark(student)}
                                disabled={aiGeneratingStudentId === student.id}
                                className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold transition shrink-0 flex items-center gap-1"
                                title="Generate Ghanaian Pedagogical Remark"
                              >
                                {aiGeneratingStudentId === student.id ? (
                                   <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                )}
                                <span>AI Remark</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGradebookStudents.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        No students found matching "{gradeSearchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLASS ROSTER & GUARDIAN DIRECTORY */}
      {activeTab === "ROSTER" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Class Roster & Guardian Directory</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">({selectedClass.name})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contact information, student profile metrics, and fee balance status.
              </p>
            </div>

            {/* Roster Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={rosterSearchQuery}
                onChange={(e) => setRosterSearchQuery(e.target.value)}
                placeholder="Search pupil, Index #, Guardian, Phone..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {rosterSearchQuery && (
                <button
                  onClick={() => setRosterSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRosterStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${s.firstName} ${s.lastName}`}
                      src={s.photo}
                      size="lg"
                      className="rounded-xl"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {s.firstName} {s.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{s.indexNumber}</p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-slate-700">
                        {s.ghanaCardId}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      s.attendancePercentage >= 95
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {s.attendancePercentage}% Att.
                  </span>
                </div>

                {/* Guardian Details & Quick Phone / WhatsApp Actions */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Guardian:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium">
                      {s.guardianName} ({s.guardianRelation})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                    <a
                      href={`tel:${s.guardianPhone}`}
                      className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold hover:underline"
                    >
                      {s.guardianPhone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Arrears:</span>
                    <span
                      className={`font-mono font-bold ${
                        s.feeBalanceGHS > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {s.feeBalanceGHS > 0 ? `GH₵ ${s.feeBalanceGHS.toFixed(2)}` : "Fully Settled"}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Interests:</strong> {s.interest}
                </div>
              </div>
            ))}
          </div>

          {filteredRosterStudents.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-200">No pupil found matching "{rosterSearchQuery}"</p>
              <p>Try searching by pupil Name, Index Number, Ghana Card, Guardian Name, or Phone.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
