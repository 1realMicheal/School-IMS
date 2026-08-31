import React, { useState } from "react";
import {
  School,
  UserPersona,
  SchoolClass,
  Teacher,
  Student,
  Subject,
  SubjectGrade,
  Announcement,
  FeeTransaction,
  GradingSystemType,
} from "../types";
import { calculateGrade, formatOrdinal, formatGHS } from "../utils/grading";
import { ReportCardModal } from "./ReportCardModal";
import { NewStudentModal } from "./NewStudentModal";
import { NewTeacherModal } from "./NewTeacherModal";
import { DeleteModal } from "./DeleteModal";
import { Avatar } from "./Avatar";
import {
  School as SchoolIcon,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  DollarSign,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  Bell,
  Settings,
  ShieldCheck,
  Check,
  RefreshCw,
  Trash2,
  RotateCcw,
  Clock,
  Archive,
  Phone,
  Mail,
  BookOpen,
  ShieldAlert,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";

interface AdminViewProps {
  school: School;
  onUpdateSchool: (school: School) => void;
  classes: SchoolClass[];
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string, reason?: string) => void;
  onRestoreStudent?: (studentId: string) => void;
  onPermanentlyPurgeStudent?: (studentId: string) => void;
  teachers?: Teacher[];
  onAddTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: string, reason?: string) => void;
  onRestoreTeacher?: (teacherId: string) => void;
  onPermanentlyPurgeTeacher?: (teacherId: string) => void;
  subjects: Subject[];
  grades: SubjectGrade[];
  announcements: Announcement[];
  onAddAnnouncement: (announcement: Announcement) => void;
  transactions: FeeTransaction[];
}

export const AdminView: React.FC<AdminViewProps> = ({
  school,
  onUpdateSchool,
  classes,
  students,
  onAddStudent,
  onDeleteStudent,
  onRestoreStudent,
  onPermanentlyPurgeStudent,
  teachers = [],
  onAddTeacher,
  onDeleteTeacher,
  onRestoreTeacher,
  onPermanentlyPurgeTeacher,
  subjects,
  grades,
  announcements,
  onAddAnnouncement,
  transactions,
}) => {
  const [adminTab, setAdminTab] = useState<
    "OVERVIEW" | "REPORTS" | "STUDENTS" | "TEACHERS" | "RECOVERY" | "ANNOUNCEMENTS" | "SETTINGS"
  >("OVERVIEW");

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "cls-jhs2-gold");
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);

  // Soft Deletion Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    itemType: "STUDENT" | "TEACHER";
    id: string;
    name: string;
    refId?: string;
  } | null>(null);

  // Batch Report Generation State (The Term-End Crunch)
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchCompleteMessage, setBatchCompleteMessage] = useState<string | null>(null);

  // Student Search / Filter State
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentGenderFilter, setStudentGenderFilter] = useState<string>("ALL");

  // Teacher Search / Filter State
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [teacherGenderFilter, setTeacherGenderFilter] = useState<string>("ALL");

  // Report Search State
  const [reportSearchQuery, setReportSearchQuery] = useState("");

  // Announcements Search State
  const [announcementSearchQuery, setAnnouncementSearchQuery] = useState("");

  // Overview / Transactions Search State
  const [overviewTxSearchQuery, setOverviewTxSearchQuery] = useState("");

  // Recovery Vault Filter
  const [vaultTypeFilter, setVaultTypeFilter] = useState<"ALL" | "STUDENTS" | "TEACHERS">("ALL");
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");

  // Announcement Form State
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeContent, setNewNoticeContent] = useState("");
  const [newNoticeAudience, setNewNoticeAudience] = useState<"ALL" | "PARENTS" | "TEACHERS">("ALL");
  const [newNoticeCategory, setNewNoticeCategory] = useState<
    "General" | "Academic" | "PTA" | "Fee Notice"
  >("PTA");
  const [newNoticeSms, setNewNoticeSms] = useState(true);

  // Active records (Filtered by school & non-deleted)
  const activeStudents = students.filter(
    (s) => (s.schoolId === school.id || !s.schoolId) && !s.isDeleted && s.status !== "Deleted"
  );
  const activeTeachers = teachers.filter(
    (t) => (t.schoolId === school.id || !t.schoolId) && !t.isDeleted
  );

  // Deleted records (In 6-month recovery vault)
  const deletedStudents = students.filter(
    (s) => (s.schoolId === school.id || !s.schoolId) && (s.isDeleted || s.status === "Deleted")
  );
  const deletedTeachers = teachers.filter(
    (t) => (t.schoolId === school.id || !t.schoolId) && t.isDeleted
  );
  const totalInVault = deletedStudents.length + deletedTeachers.length;

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = activeStudents.filter((s) => s.classId === selectedClassId);

  // Filtered Class Students for Report Cards
  const filteredReportStudents = classStudents.filter((s) => {
    const q = reportSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.indexNumber.toLowerCase().includes(q) ||
      s.ghanaCardId.toLowerCase().includes(q) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(q))
    );
  });

  // Filtered Active Students for Directory
  const filteredStudents = activeStudents.filter((s) => {
    const q = studentSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.indexNumber.toLowerCase().includes(q) ||
      s.ghanaCardId.toLowerCase().includes(q) ||
      (s.className && s.className.toLowerCase().includes(q)) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(q)) ||
      (s.guardianPhone && s.guardianPhone.toLowerCase().includes(q));
    const matchesGender = studentGenderFilter === "ALL" || s.gender === studentGenderFilter;
    return matchesSearch && matchesGender;
  });

  // Filtered Active Teachers for Directory
  const filteredTeachers = activeTeachers.filter((t) => {
    const q = teacherSearchQuery.toLowerCase().trim();
    const teacherSubjects = subjects.filter((sub) => t.assignedSubjectIds?.includes(sub.id));
    const subjectMatch = teacherSubjects.some((sub) => sub.name.toLowerCase().includes(q));

    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.gesStaffId.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.qualification.toLowerCase().includes(q) ||
      (t.phone && t.phone.toLowerCase().includes(q)) ||
      (t.assignedClassName && t.assignedClassName.toLowerCase().includes(q)) ||
      subjectMatch;
    const matchesGender = teacherGenderFilter === "ALL" || t.gender === teacherGenderFilter;
    return matchesSearch && matchesGender;
  });

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((notice) => {
    const q = announcementSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      notice.title.toLowerCase().includes(q) ||
      notice.content.toLowerCase().includes(q) ||
      notice.category.toLowerCase().includes(q) ||
      notice.author.toLowerCase().includes(q)
    );
  });

  // Filtered Overview Transactions
  const filteredOverviewTransactions = transactions.filter((tx) => {
    const q = overviewTxSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tx.reference.toLowerCase().includes(q) ||
      tx.studentName.toLowerCase().includes(q) ||
      tx.payerPhone.toLowerCase().includes(q) ||
      tx.network.toLowerCase().includes(q) ||
      tx.amountGHS.toString().includes(q)
    );
  });

  // Calculate Overall Revenue & Arrears
  const totalCollectedGHS = transactions
    .filter((t) => t.status === "SUCCESSFUL")
    .reduce((sum, t) => sum + t.amountGHS, 0);
  const totalArrearsGHS = activeStudents.reduce((sum, s) => sum + s.feeBalanceGHS, 0);

  // Calculate remaining days for 6-month retention
  const calculateRecoveryCountdown = (deletedAt?: string) => {
    if (!deletedAt) {
      return { daysLeft: 180, percentageLeft: 100, formattedDate: "Recent" };
    }
    const deletedTime = new Date(deletedAt).getTime();
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    const expiryTime = deletedTime + sixMonthsMs;
    const now = Date.now();
    const diffMs = expiryTime - now;
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const percentageLeft = Math.min(100, Math.max(0, Math.round((daysLeft / 180) * 100)));
    const formattedDate = new Date(deletedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const expiryDateFormatted = new Date(expiryTime).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return { daysLeft, percentageLeft, formattedDate, expiryDateFormatted };
  };

  // Batch Report Generation Handler (The Term-End Crunch)
  const handleBatchGenerateReports = () => {
    setIsGeneratingBatch(true);
    setBatchProgress(15);

    const interval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingBatch(false);
          setBatchCompleteMessage(
            `Compiled all ${classStudents.length} official GES terminal report cards for ${selectedClass.name}. Ready for 1-click batch printing & parent portal dispatch.`
          );
          confetti({
            particleCount: 70,
            spread: 90,
            origin: { y: 0.6 },
          });
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Create Announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const notice: Announcement = {
      id: `ann-${Date.now()}`,
      schoolId: school.id,
      title: newNoticeTitle,
      content: newNoticeContent,
      category: newNoticeCategory,
      targetAudience: newNoticeAudience,
      publishedAt: new Date().toISOString().split("T")[0],
      author: `${school.headmasterName} (Headmaster)`,
      priority: "Normal",
      smsBroadcast: newNoticeSms,
    };

    onAddAnnouncement(notice);
    setNewNoticeTitle("");
    setNewNoticeContent("");
  };

  // Handle Confirmed Soft Deletion
  const handleExecuteDelete = (reason: string) => {
    if (!deleteModalConfig) return;
    if (deleteModalConfig.itemType === "STUDENT" && onDeleteStudent) {
      onDeleteStudent(deleteModalConfig.id, reason);
    } else if (deleteModalConfig.itemType === "TEACHER" && onDeleteTeacher) {
      onDeleteTeacher(deleteModalConfig.id, reason);
    }
    setDeleteModalConfig(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* School Admin Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
            🏫
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{school.name}</h1>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {school.code}
              </span>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-semibold">
                {school.subscriptionTier} Tenant
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Headmaster: <strong>{school.headmasterName}</strong> • {school.district}, {school.region} • Academic Year {school.academicYear} ({school.term})
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsNewTeacherModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Onboard Teacher</span>
          </button>
          <button
            onClick={() => setIsNewStudentModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setAdminTab("OVERVIEW")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "OVERVIEW"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Operational Dashboard</span>
        </button>

        <button
          onClick={() => setAdminTab("REPORTS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "REPORTS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Report Card Engine (GES Stanine)</span>
        </button>

        <button
          onClick={() => setAdminTab("STUDENTS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "STUDENTS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Directory ({activeStudents.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("TEACHERS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "TEACHERS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff & Teachers ({activeTeachers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("RECOVERY")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "RECOVERY"
              ? "border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/40 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>6-Month Recovery Vault</span>
          {totalInVault > 0 && (
            <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full">
              {totalInVault}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab("ANNOUNCEMENTS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "ANNOUNCEMENTS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notices & SMS Broadcast</span>
        </button>

        <button
          onClick={() => setAdminTab("SETTINGS")}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
            adminTab === "SETTINGS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Academic Setup</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Active Enrollment</span>
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{activeStudents.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pupils across {classes.length} classroom streams</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Teaching Staff</span>
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{activeTeachers.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">GES Registered certified educators</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">MTN/Vodafone MoMo Collections</span>
                <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                {formatGHS(totalCollectedGHS)}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                {transactions.length} reconciled parent payments
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold">Outstanding Fee Arrears</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatGHS(totalArrearsGHS)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Automated SMS fee reminders scheduled</p>
            </div>
          </div>

          {/* Classroom Streams & Teachers Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Academic Classes & Class Teachers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live roster summary for {school.academicYear}</p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{classes.length} Streams Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const count = activeStudents.filter((s) => s.classId === cls.id).length;
                const assignedTeacher = activeTeachers.find((t) => t.assignedClassId === cls.id);
                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cls.name}</h4>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-semibold">
                        {cls.gradeLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        Class Teacher: <strong>{assignedTeacher ? assignedTeacher.name : cls.classTeacherName}</strong>
                      </p>
                      <p className="font-mono text-slate-500 dark:text-slate-400">{count} enrolled pupils</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reconciled MoMo Transactions Section with Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Recent Mobile Money Fee Collections</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time MTN MoMo, Telecel Cash, and AT Money reconciliations.
                </p>
              </div>

              {/* Transactions Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={overviewTxSearchQuery}
                  onChange={(e) => setOverviewTxSearchQuery(e.target.value)}
                  placeholder="Search Ref, Student, Phone, Amount..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {overviewTxSearchQuery && (
                  <button
                    onClick={() => setOverviewTxSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Network & Payer</th>
                    <th className="p-3 text-right">Amount (GHS)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredOverviewTransactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-indigo-700 dark:text-indigo-400">{tx.reference}</td>
                      <td className="p-3 font-sans font-medium text-slate-900 dark:text-slate-100">{tx.studentName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.network}</span> • {tx.payerPhone}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        GH₵ {tx.amountGHS.toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-500 dark:text-slate-400 text-[11px]">{tx.timestamp}</td>
                    </tr>
                  ))}
                  {filteredOverviewTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 dark:text-slate-500 font-sans">
                        No transactions found matching "{overviewTxSearchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORT CARDS */}
      {adminTab === "REPORTS" && (
        <div className="space-y-6">
          {/* Batch Generator Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>GES 9-Stanine Terminal Report Card Compilation</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automated continuous assessment (40%) and terminal exam (60%) tabulation for official Ministry standard reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-lg font-bold focus:outline-none focus:border-indigo-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.gradeLevel})
                  </option>
                ))}
              </select>

              <button
                onClick={handleBatchGenerateReports}
                disabled={isGeneratingBatch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
              >
                {isGeneratingBatch ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>{isGeneratingBatch ? "Compiling..." : "Batch Compile All Class Reports"}</span>
              </button>
            </div>
          </div>

          {/* Batch Progress Bar */}
          {isGeneratingBatch && (
            <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Calculating Stanine Ranks, Position Ordinals & Comments...</span>
                <span>{batchProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          {batchCompleteMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{batchCompleteMessage}</span>
              </div>
              <button
                onClick={() => setBatchCompleteMessage(null)}
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Student Report Cards Table with Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Class Roster Reports: {selectedClass.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Showing {filteredReportStudents.length} of {classStudents.length} Pupils
                </span>
              </div>

              {/* Report Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  placeholder="Search pupil by name, index #, Ghana Card..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {reportSearchQuery && (
                  <button
                    onClick={() => setReportSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Index No.</th>
                    <th className="p-3.5 text-center">Attendance</th>
                    <th className="p-3.5 text-center">Total Score Avg</th>
                    <th className="p-3.5 text-center">Class Position</th>
                    <th className="p-3.5 text-center">Promotion Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReportStudents.map((student, idx) => {
                    const studentGrades = grades.filter((g) => g.studentId === student.id);
                    const total = studentGrades.reduce((sum, g) => sum + g.totalScore, 0);
                    const avg =
                      studentGrades.length > 0 ? (total / studentGrades.length).toFixed(1) : "82.4";

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={`${student.firstName} ${student.lastName}`}
                              src={student.photo}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{student.gender}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{student.indexNumber}</td>

                        <td className="p-3.5 text-center">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                            {student.attendancePercentage}%
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-slate-100">{avg}%</td>

                        <td className="p-3.5 text-center">
                          <span className="font-black text-indigo-700 dark:text-indigo-400 font-mono">
                            {formatOrdinal(idx + 1)}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Promoted to Next Level
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            id={`preview-report-btn-${student.id}`}
                            onClick={() => {
                              setSelectedStudentForReport(student);
                              setIsReportModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View / Print Report</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReportStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                        No pupils found matching "{reportSearchQuery}" in {selectedClass.name}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT DIRECTORY */}
      {adminTab === "STUDENTS" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Search student name, index no, Ghana card..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={studentGenderFilter}
                onChange={(e) => setStudentGenderFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Boys Only</option>
                <option value="Female">Girls Only</option>
              </select>
            </div>

            <button
              id="enroll-student-btn"
              onClick={() => setIsNewStudentModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student Record</span>
            </button>
          </div>

          {/* Students Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={`${student.firstName} ${student.lastName}`}
                        src={student.photo}
                        size="md"
                        className="rounded-xl"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{student.indexNumber}</p>
                        <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">{student.className}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {student.ghanaCardId}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Guardian:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                        {student.guardianName} ({student.guardianRelation})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Contact:</span>
                      <a
                        href={`tel:${student.guardianPhone}`}
                        className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px] hover:underline font-semibold"
                      >
                        {student.guardianPhone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Fee Balance:</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          student.feeBalanceGHS > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {student.feeBalanceGHS > 0
                          ? `GH₵ ${student.feeBalanceGHS.toFixed(2)}`
                          : "Fully Settled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setDeleteModalConfig({
                        isOpen: true,
                        itemType: "STUDENT",
                        id: student.id,
                        name: `${student.firstName} ${student.lastName}`,
                        refId: student.indexNumber,
                      });
                    }}
                    title="Move to 6-Month Recovery Vault"
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStudentForReport(student);
                      setIsReportModalOpen(true);
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <span>Report Card</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">No active students matching your query.</p>
              <p className="text-xs">You can enroll new pupils or check the 6-Month Recovery Vault.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TEACHERS & EDUCATORS ROSTER */}
      {adminTab === "TEACHERS" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.target.value)}
                  placeholder="Search staff name, GES ID, qualification..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={teacherGenderFilter}
                onChange={(e) => setTeacherGenderFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male Teachers</option>
                <option value="Female">Female Teachers</option>
              </select>
            </div>

            <button
              id="onboard-teacher-btn"
              onClick={() => setIsNewTeacherModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Onboard New Teacher</span>
            </button>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => {
              const teacherSubjects = subjects.filter((s) =>
                teacher.assignedSubjectIds.includes(s.id)
              );

              return (
                <div
                  key={teacher.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={teacher.name}
                          src={teacher.avatar}
                          size="lg"
                          className="rounded-xl"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{teacher.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{teacher.title}</p>
                          <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 font-semibold">
                            {teacher.gesStaffId}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Active Staff
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Qualification:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium text-[11px] text-right">
                          {teacher.qualification}
                        </span>
                      </div>

                      {teacher.assignedClassName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Assigned Form:</span>
                          <span className="text-indigo-700 dark:text-indigo-400 font-bold text-[11px]">
                            {teacher.assignedClassName}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Phone / SMS:</span>
                        <a
                          href={`tel:${teacher.phone}`}
                          className="text-slate-900 dark:text-slate-100 font-mono text-[11px] hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {teacher.phone}
                        </a>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Email:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-mono text-[10px] truncate max-w-[150px]">
                          {teacher.email}
                        </span>
                      </div>
                    </div>

                    {/* Subject Tags */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Subjects Taught:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {teacherSubjects.map((sub) => (
                          <span
                            key={sub.id}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setDeleteModalConfig({
                          isOpen: true,
                          itemType: "TEACHER",
                          id: teacher.id,
                          name: teacher.name,
                          refId: teacher.gesStaffId,
                        });
                      }}
                      title="Move to 6-Month Recovery Vault"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete / Archive</span>
                    </button>

                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      Joined {teacher.dateJoined}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">No active teachers matching your query.</p>
              <p className="text-xs">Use the "Onboard New Teacher" button to add educators to the school roster.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: 6-MONTH RECOVERY VAULT (DATA RETENTION & RECOVERY) */}
      {adminTab === "RECOVERY" && (
        <div className="space-y-5">
          {/* Statutory Data Protection & Recovery Policy Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                    6-Month Protected Data Recovery Vault
                  </h3>
                  <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    180-Day Guarantee
                  </span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                  In compliance with Ghana Education Service (GES) data retention and school administrative safeguards, deleted pupil and staff records are preserved here for <strong>up to six months (180 days)</strong> before automated permanent purging. Restoring any record instantly reinstates their full profile, terminal grades, and class associations.
                </p>
              </div>
            </div>
          </div>

          {/* Vault Control & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setVaultTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  vaultTypeFilter === "ALL"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All Recoverable ({totalInVault})
              </button>
              <button
                onClick={() => setVaultTypeFilter("STUDENTS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  vaultTypeFilter === "STUDENTS"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Deleted Students ({deletedStudents.length})
              </button>
              <button
                onClick={() => setVaultTypeFilter("TEACHERS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  vaultTypeFilter === "TEACHERS"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Deleted Teachers ({deletedTeachers.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={vaultSearchQuery}
                onChange={(e) => setVaultSearchQuery(e.target.value)}
                placeholder="Search vault records..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Vault Records List */}
          <div className="space-y-3">
            {/* Deleted Students */}
            {(vaultTypeFilter === "ALL" || vaultTypeFilter === "STUDENTS") &&
              deletedStudents
                .filter((s) => {
                  const q = vaultSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
                    s.indexNumber.toLowerCase().includes(q) ||
                    s.ghanaCardId.toLowerCase().includes(q) ||
                    (s.className && s.className.toLowerCase().includes(q)) ||
                    (s.deleteReason && s.deleteReason.toLowerCase().includes(q)) ||
                    (s.deletedBy && s.deletedBy.toLowerCase().includes(q))
                  );
                })
                .map((student) => {
                  const countdown = calculateRecoveryCountdown(student.deletedAt);

                  return (
                    <div
                      key={student.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          name={`${student.firstName} ${student.lastName}`}
                          src={student.photo}
                          size="lg"
                          className="rounded-xl grayscale opacity-80"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                              Student
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-through decoration-slate-400">
                              {student.firstName} {student.lastName}
                            </h4>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              ({student.indexNumber})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Class: <strong>{student.className}</strong> • Reason:{" "}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              "{student.deleteReason || "Administrative archival"}"
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                            Deleted on: {countdown.formattedDate} • By: {student.deletedBy || "School Admin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shrink-0">
                        {/* Countdown Pill */}
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl px-3 py-2 text-right">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 justify-end">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{countdown.daysLeft} days remaining</span>
                          </div>
                          <p className="text-[10px] text-amber-700 dark:text-amber-300">
                            Expires on {countdown.expiryDateFormatted}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onRestoreStudent) onRestoreStudent(student.id);
                            }}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore Pupil</span>
                          </button>

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to PERMANENTLY purge ${student.firstName} ${student.lastName}? This cannot be undone.`
                                )
                              ) {
                                if (onPermanentlyPurgeStudent) onPermanentlyPurgeStudent(student.id);
                              }
                            }}
                            title="Purge permanently"
                            className="px-2.5 py-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

            {/* Deleted Teachers */}
            {(vaultTypeFilter === "ALL" || vaultTypeFilter === "TEACHERS") &&
              deletedTeachers
                .filter((t) => {
                  const q = vaultSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    t.name.toLowerCase().includes(q) ||
                    t.gesStaffId.toLowerCase().includes(q) ||
                    t.email.toLowerCase().includes(q) ||
                    t.qualification.toLowerCase().includes(q) ||
                    (t.deleteReason && t.deleteReason.toLowerCase().includes(q)) ||
                    (t.deletedBy && t.deletedBy.toLowerCase().includes(q))
                  );
                })
                .map((teacher) => {
                  const countdown = calculateRecoveryCountdown(teacher.deletedAt);

                  return (
                    <div
                      key={teacher.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar
                          name={teacher.name}
                          src={teacher.avatar}
                          size="lg"
                          className="rounded-xl grayscale opacity-80"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 uppercase">
                              Educator / Staff
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-through decoration-slate-400">
                              {teacher.name}
                            </h4>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              ({teacher.gesStaffId})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {teacher.qualification} • Reason:{" "}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              "{teacher.deleteReason || "Staff roster removal"}"
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                            Deleted on: {countdown.formattedDate} • By: {teacher.deletedBy || "School Admin"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shrink-0">
                        {/* Countdown Pill */}
                        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl px-3 py-2 text-right">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 justify-end">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{countdown.daysLeft} days remaining</span>
                          </div>
                          <p className="text-[10px] text-amber-700 dark:text-amber-300">
                            Expires on {countdown.expiryDateFormatted}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (onRestoreTeacher) onRestoreTeacher(teacher.id);
                            }}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore Teacher</span>
                          </button>

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to PERMANENTLY purge ${teacher.name}? This cannot be undone.`
                                )
                              ) {
                                if (onPermanentlyPurgeTeacher) onPermanentlyPurgeTeacher(teacher.id);
                              }
                            }}
                            title="Purge permanently"
                            className="px-2.5 py-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

            {totalInVault === 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recovery Vault is Empty</h4>
                <p className="text-xs max-w-md mx-auto">
                  All student and educator records are active. When any record is deleted, it will be safely isolated here for 180 days with 1-click restoration.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENTS & SMS NOTICE BOARD */}
      {adminTab === "ANNOUNCEMENTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Notice Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Broadcast School Notice</h2>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="e.g. PTA General Assembly / Fee Notice"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Audience</label>
                <select
                  value={newNoticeAudience}
                  onChange={(e) =>
                    setNewNoticeAudience(e.target.value as "ALL" | "PARENTS" | "TEACHERS")
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Entire School (Parents & Staff)</option>
                  <option value="PARENTS">Parents & Guardians Only</option>
                  <option value="TEACHERS">Teaching Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newNoticeCategory}
                  onChange={(e) =>
                    setNewNoticeCategory(e.target.value as "General" | "Academic" | "PTA" | "Fee Notice")
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PTA">PTA & Community</option>
                  <option value="Academic">Academic & Exams</option>
                  <option value="Fee Notice">School Fees & Finance</option>
                  <option value="General">General Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Type message content here..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-700 dark:text-slate-300">Dispatch SMS broadcast alert</span>
                <input
                  type="checkbox"
                  checked={newNoticeSms}
                  onChange={(e) => setNewNoticeSms(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Publish Broadcast</span>
              </button>
            </form>
          </div>

          {/* Notices Feed with Search */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Published Digital Notice Board ({filteredAnnouncements.length})
              </h3>

              {/* Announcement Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={announcementSearchQuery}
                  onChange={(e) => setAnnouncementSearchQuery(e.target.value)}
                  placeholder="Search notices by title, category..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {announcementSearchQuery && (
                  <button
                    onClick={() => setAnnouncementSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAnnouncements.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded font-mono font-semibold">
                        {notice.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1.5">{notice.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{notice.publishedAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>By: {notice.author}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                      {notice.smsBroadcast ? "✓ SMS Broadcasted" : "In-App Notice"}
                    </span>
                  </div>
                </div>
              ))}

              {filteredAnnouncements.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No announcements found matching "{announcementSearchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ACADEMIC SETUP & GRADING SYSTEM */}
      {adminTab === "SETTINGS" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 max-w-2xl text-xs text-slate-700 dark:text-slate-300">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Ghana Education Service (GES) Curriculum Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adjust institutional grading scales, Continuous Assessment (CA) splits, and reopening schedules.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Grading System</label>
              <select
                value={school.gradingScale}
                onChange={(e) =>
                  onUpdateSchool({
                    ...school,
                    gradingScale: e.target.value as GradingSystemType,
                  })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="GES_9_STANINE">GES 9-Point Stanine (Grade 1 - 9 for BECE / JHS)</option>
                <option value="WAEC_WASSCE">WAEC WASSCE Scale (A1, B2, B3, C4.. F9 for SHS)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Continuous Assessment vs Exam Ratio
              </label>
              <select
                value={`${school.caSplit.caPercentage}/${school.caSplit.examPercentage}`}
                onChange={(e) => {
                  const [ca, exam] = e.target.value.split("/").map(Number);
                  onUpdateSchool({
                    ...school,
                    caSplit: { caPercentage: ca, examPercentage: exam },
                  });
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="40/60">40% Continuous Assessment / 60% Terminal Exam (Standard)</option>
                <option value="30/70">30% Continuous Assessment / 70% Terminal Exam (WAEC)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Next Term Reopening Date</label>
              <input
                type="date"
                value={school.reopeningDate}
                onChange={(e) => onUpdateSchool({ ...school, reopeningDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Card Modal for Print & Preview */}
      {selectedStudentForReport && (
        <ReportCardModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedStudentForReport(null);
          }}
          school={school}
          student={selectedStudentForReport}
          schoolClass={selectedClass}
          grades={grades}
          allClassGrades={grades.filter((g) => g.classId === selectedClassId)}
          allClassStudents={classStudents}
        />
      )}

      {/* New Student Enrollment Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        school={school}
        classes={classes}
        onAddStudent={onAddStudent}
      />

      {/* New Teacher Onboarding Modal */}
      {onAddTeacher && (
        <NewTeacherModal
          isOpen={isNewTeacherModalOpen}
          onClose={() => setIsNewTeacherModalOpen(false)}
          school={school}
          classes={classes}
          subjects={subjects}
          onAddTeacher={onAddTeacher}
        />
      )}

      {/* 6-Month Soft Deletion Confirmation Modal */}
      {deleteModalConfig && (
        <DeleteModal
          isOpen={deleteModalConfig.isOpen}
          onClose={() => setDeleteModalConfig(null)}
          itemType={deleteModalConfig.itemType}
          itemName={deleteModalConfig.name}
          itemIdString={deleteModalConfig.refId}
          onConfirmDelete={handleExecuteDelete}
        />
      )}
    </div>
  );
};
