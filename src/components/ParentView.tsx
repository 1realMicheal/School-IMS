import React, { useState } from "react";
import { School, UserPersona, Student, SchoolClass, SubjectGrade, Announcement, FeeTransaction } from "../types";
import { formatGHS, formatOrdinal } from "../utils/grading";
import { ReportCardModal } from "./ReportCardModal";
import { PaymentModal } from "./PaymentModal";
import { Avatar } from "./Avatar";
import {
  Heart,
  Award,
  Clock,
  DollarSign,
  FileText,
  Smartphone,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  MessageSquare,
} from "lucide-react";

interface ParentViewProps {
  school: School;
  currentPersona: UserPersona;
  student: Student;
  schoolClass: SchoolClass;
  grades: SubjectGrade[];
  allClassGrades: SubjectGrade[];
  allClassStudents: Student[];
  announcements: Announcement[];
  transactions: FeeTransaction[];
  onPaymentSuccess: (transaction: FeeTransaction) => void;
}

export const ParentView: React.FC<ParentViewProps> = ({
  school,
  currentPersona,
  student,
  schoolClass,
  grades,
  allClassGrades,
  allClassStudents,
  announcements,
  transactions,
  onPaymentSuccess,
}) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Student specific grades
  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const totalScore = studentGrades.reduce((sum, g) => sum + g.totalScore, 0);
  const average = studentGrades.length > 0 ? (totalScore / studentGrades.length).toFixed(1) : "85.2";

  // Filter student transactions
  const studentTransactions = transactions.filter((t) => t.studentId === student.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Parent Welcome Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={`${student.firstName} ${student.lastName}`}
              src={student.photo}
              size="lg"
              className="rounded-2xl border-2 border-indigo-600"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                {student.firstName} {student.lastName}'s Academic Portal
              </h1>
              <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                Parent: {currentPersona.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {school.name} • {schoolClass.name} • Index: <span className="font-mono">{student.indexNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="parent-view-report-btn"
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Terminal Report Card</span>
          </button>

          <button
            id="parent-pay-momo-btn"
            onClick={() => setIsPaymentOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pay Fees (MoMo)</span>
          </button>
        </div>
      </div>

      {/* "The Quick Check" KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance KPI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Roll Call Attendance</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{student.attendancePercentage}%</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">(58/60 Days)</span>
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            ✓ Marked Present this morning by Madam Akosua
          </p>
        </div>

        {/* Latest Top Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Top Subject Score</span>
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">95/100</span>
            <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">Grade 1</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">Computing / ICT • Highest in Class</p>
        </div>

        {/* Class Position Rank */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Term Class Position</span>
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">2nd</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">out of {allClassStudents.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Overall Term Average: {average}%</p>
        </div>

        {/* Fee Arrears Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Outstanding Fee Balance</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 font-mono">
            {student.feeBalanceGHS > 0 ? formatGHS(student.feeBalanceGHS) : "GH₵ 0.00"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {student.feeBalanceGHS > 0 ? "Due before exam week" : "Fully cleared for Term 2"}
          </p>
        </div>
      </div>

      {/* Main Grid: Subject Scores & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continuous Assessment & Exam Scores Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Live Continuous Assessment & Exam Grade Card
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {school.academicYear} • {school.term}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {studentGrades.map((grade) => (
              <div
                key={grade.id}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{grade.subjectName}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      Number(grade.grade) <= 2
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    }`}
                  >
                    Grade {grade.grade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-900 p-2 rounded-lg text-center text-[10px] border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">CA (40%)</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">{grade.totalCA}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Exam (60%)</span>
                    <span className="text-indigo-700 dark:text-indigo-400 font-bold font-mono">{grade.examScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Total (100)</span>
                    <span className="text-slate-900 dark:text-slate-100 font-black font-mono">{grade.totalScore}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="italic truncate">{grade.gradeRemark}</span>
                  <span className="font-mono">Pos: {formatOrdinal(grade.positionInSubject || 1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Teacher Contact Column */}
        <div className="space-y-4">
          {/* Direct Class Teacher Contact Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Class Teacher Touchpoint
              </h3>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Teacher"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">Madam Akosua Mensah</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">JHS 2 Gold Form Teacher</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl">
              "Kwame had a strong performance in our weekly geometry quiz today. Please ensure he brings his compass construction set on Friday."
            </p>

            <a
              href="https://wa.me/233243981204"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Message Teacher on WhatsApp</span>
            </a>
          </div>

          {/* School Broadcasts for Parents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Parent Announcements
              </h3>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 2).map((notice) => (
                <div
                  key={notice.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">{notice.title}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">{notice.publishedAt}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        student={student}
        school={school}
        onPaymentSuccess={onPaymentSuccess}
      />

      {/* Official Terminal Report Card Modal */}
      <ReportCardModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        school={school}
        student={student}
        schoolClass={schoolClass}
        grades={grades}
        allClassGrades={allClassGrades}
        allClassStudents={allClassStudents}
      />
    </div>
  );
};
