import React, { useRef } from "react";
import { School, Student, SchoolClass, SubjectGrade } from "../types";
import { calculateGrade, formatOrdinal, formatGHS } from "../utils/grading";
import { Avatar } from "./Avatar";
import { X, Printer, Download, Award, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  student: Student;
  schoolClass: SchoolClass;
  grades: SubjectGrade[];
  allClassGrades: SubjectGrade[];
  allClassStudents: Student[];
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  school,
  student,
  schoolClass,
  grades,
  allClassGrades,
  allClassStudents,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter student grades
  const studentGrades = grades.filter((g) => g.studentId === student.id);

  // Compute student summary
  const totalMarks = studentGrades.reduce((sum, g) => sum + g.totalScore, 0);
  const averageScore =
    studentGrades.length > 0 ? Number((totalMarks / studentGrades.length).toFixed(1)) : 0;

  // Compute class rank for all students in class
  const classStudentAverages = allClassStudents.map((s) => {
    const sGrades = allClassGrades.filter((g) => g.studentId === s.id);
    const sTotal = sGrades.reduce((sum, g) => sum + g.totalScore, 0);
    const avg = sGrades.length > 0 ? sTotal / sGrades.length : 0;
    return { studentId: s.id, average: avg };
  });

  classStudentAverages.sort((a, b) => b.average - a.average);
  const positionIndex = classStudentAverages.findIndex((x) => x.studentId === student.id);
  const classPosition = positionIndex >= 0 ? positionIndex + 1 : 1;

  // Compute Core Grade Aggregate (e.g. Best 6 subjects for BECE/Stanine)
  const sortedScores = [...studentGrades].sort((a, b) => b.totalScore - a.totalScore);
  const rawAggregate = sortedScores.slice(0, 6).reduce((sum, g) => sum + Number(g.grade || 1), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Toolbar (Hidden on Print) */}
        <div className="bg-slate-50 dark:bg-slate-800/90 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Official GES Terminal Report Card: {student.firstName} {student.lastName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {school.name} • {school.academicYear} ({school.term})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-report-btn"
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Content Area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 font-sans print:p-0">
          <div
            ref={printRef}
            className="border-2 border-slate-900 p-6 sm:p-8 rounded-lg bg-white relative space-y-6 print:border-slate-800"
          >
            {/* Watermark Crest Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
              <img
                src={school.crest}
                alt="Watermark"
                className="w-96 h-96 object-contain grayscale"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 relative">
              <div className="flex items-center justify-between gap-4 mb-2">
                <img
                  src={school.crest}
                  alt={school.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded border border-slate-300 p-1"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-widest font-black text-emerald-800">
                    REPUBLIC OF GHANA • GHANA EDUCATION SERVICE (GES)
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight font-serif">
                    {school.name}
                  </h1>
                  <p className="text-xs italic text-slate-600 font-medium font-serif">
                    "{school.motto}"
                  </p>
                  <p className="text-[11px] text-slate-700 font-mono mt-0.5">
                    {school.district}, {school.region} Region • Tel: {school.contactPhone}
                  </p>
                </div>
                <div className="w-16 sm:w-20 text-center">
                  <div className="w-16 h-20 border border-slate-400 rounded overflow-hidden shadow-inner mx-auto flex items-center justify-center bg-slate-100">
                    <Avatar
                      name={`${student.firstName} ${student.lastName}`}
                      src={student.photo}
                      size="lg"
                      className="w-full h-full rounded-none"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Student Photo</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white font-bold py-1 px-3 rounded text-xs uppercase tracking-wider inline-block">
                STUDENT TERMINAL ASSESSMENT REPORT • {school.term.toUpperCase()} ({school.academicYear})
              </div>
            </div>

            {/* Student Bio Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3.5 rounded border border-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {student.firstName} {student.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Index / ID No:</span>
                <span className="font-mono font-bold text-slate-900">{student.indexNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Class / Form:</span>
                <span className="font-bold text-slate-900">{schoolClass.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Gender & Age:</span>
                <span className="font-bold text-slate-900">{student.gender} (14 yrs)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Position in Class:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {formatOrdinal(classPosition)} out of {allClassStudents.length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Term Attendance:</span>
                <span className="font-bold text-slate-900">
                  {Math.round((student.attendancePercentage / 100) * 60)} / 60 Days ({student.attendancePercentage}%)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Overall Average:</span>
                <span className="font-black text-slate-900 text-sm">{averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Stanine Aggregate:</span>
                <span className="font-black text-slate-900">{rawAggregate} (Best 6)</span>
              </div>
            </div>

            {/* Academic Performance Table */}
            <div className="border border-slate-900 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-900 uppercase font-mono text-[10px] border-b border-slate-900">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Subject</th>
                    <th className="p-2 text-center border-r border-slate-300">
                      CA ({school.caSplit.caPercentage}%)
                    </th>
                    <th className="p-2 text-center border-r border-slate-300">
                      Exam ({school.caSplit.examPercentage}%)
                    </th>
                    <th className="p-2 text-center border-r border-slate-300 font-bold">Total (100)</th>
                    <th className="p-2 text-center border-r border-slate-300 font-bold">Grade</th>
                    <th className="p-2 text-center border-r border-slate-300">Pos.</th>
                    <th className="p-2 text-center border-r border-slate-300">Class Avg</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {studentGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-300">
                        {g.subjectName}
                      </td>
                      <td className="p-2 text-center font-mono border-r border-slate-300">{g.totalCA}</td>
                      <td className="p-2 text-center font-mono border-r border-slate-300">{g.examScore}</td>
                      <td className="p-2 text-center font-mono font-black border-r border-slate-300">
                        {g.totalScore}%
                      </td>
                      <td className="p-2 text-center font-mono font-black border-r border-slate-300">
                        <span className="px-1.5 py-0.5 border border-slate-900 rounded text-[11px]">
                          {g.grade}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono border-r border-slate-300">
                        {formatOrdinal(g.positionInSubject || 1)}
                      </td>
                      <td className="p-2 text-center font-mono text-slate-600 border-r border-slate-300">
                        {g.classAverage}%
                      </td>
                      <td className="p-2 text-[11px] text-slate-700 italic">{g.gradeRemark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Character, Conduct & Affective Assessment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Conduct & Discipline:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.conduct}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Attitude to Work:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.attitude}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Interest & Co-Curricular:</span>
                <p className="font-semibold text-slate-900 mt-0.5">{student.interest}</p>
              </div>
            </div>

            {/* Remarks and Signatures */}
            <div className="space-y-4 border-t-2 border-slate-900 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class Teacher's Remark */}
                <div className="bg-slate-50 p-3 rounded border border-slate-300 relative">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Class Teacher's Remark (Madam Akosua Mensah):
                  </span>
                  <p className="italic text-slate-900 font-medium mt-1 leading-relaxed">
                    "{student.firstName} is an exceptionally capable and diligent student. His mastery of mathematics and computing is exemplary. Keep up the high standard."
                  </p>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-[10px] text-slate-400 font-mono">Date: 28th Aug, 2026</span>
                    <span className="font-serif italic font-bold text-slate-700">A. Mensah</span>
                  </div>
                </div>

                {/* Headmaster's Remark & Stamp */}
                <div className="bg-slate-50 p-3 rounded border border-slate-300 relative">
                  <span className="text-slate-500 uppercase font-bold text-[10px] block">
                    Headmaster's Remark & Official Endorsement:
                  </span>
                  <p className="italic text-slate-900 font-medium mt-1 leading-relaxed">
                    "An outstanding terminal achievement. Commended for exemplary academic performance and leadership."
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{school.headmasterName}</p>
                      <p className="text-[10px] text-slate-500">Headmaster / Principal</p>
                    </div>

                    {/* Official Digital Seal */}
                    <div className="w-16 h-16 border-2 border-emerald-800 rounded-full flex flex-col items-center justify-center text-[8px] font-black uppercase text-emerald-800 rotate-[-12deg] p-1 text-center bg-emerald-50/50">
                      <span>★ OFFICIAL ★</span>
                      <span>{school.code}</span>
                      <span>APPROVED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Term Notice & Bill Slip */}
              <div className="bg-emerald-50 border border-emerald-600/40 p-3 rounded text-xs flex flex-wrap items-center justify-between gap-3 text-emerald-950">
                <div>
                  <span className="font-bold uppercase text-[10px] block text-emerald-800">
                    Next Academic Term Information:
                  </span>
                  <p className="text-xs">
                    Next Term Reopening Date: <strong>15th September, 2026</strong> • Promoted to:{" "}
                    <strong>JHS 3 Diamond (BECE Class)</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Outstanding Balance:</span>
                  <p className="text-sm font-black font-mono">
                    {student.feeBalanceGHS > 0 ? formatGHS(student.feeBalanceGHS) : "GH₵ 0.00 (Cleared)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
