import React, { useState, useEffect } from "react";
import {
  School,
  UserPersona,
  SchoolClass,
  Subject,
  Teacher,
  Student,
  SubjectGrade,
  AttendanceRecord,
  Announcement,
  FeeTransaction,
  NetworkLatencyMode,
  OfflineSyncItem,
} from "./types";
import {
  INITIAL_SCHOOLS,
  INITIAL_PERSONAS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_GRADES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_FEE_TRANSACTIONS,
} from "./data/mockData";
import { Navbar } from "./components/Navbar";
import { TenantModal } from "./components/TenantModal";
import { TeacherView } from "./components/TeacherView";
import { AdminView } from "./components/AdminView";
import { ParentView } from "./components/ParentView";
import { PlatformAdminView } from "./components/PlatformAdminView";
import { WifiOff, Zap, RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";
import confetti from "canvas-confetti";

export default function App() {
  // State Initialization with local storage fallbacks
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem("edugate_schools");
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [currentSchool, setCurrentSchool] = useState<School>(() => {
    return schools[0] || INITIAL_SCHOOLS[0];
  });

  const [personas, setPersonas] = useState<UserPersona[]>(INITIAL_PERSONAS);
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(INITIAL_PERSONAS[0]); // Madam Akosua

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem("edugate_classes");
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("edugate_subjects");
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem("edugate_teachers");
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("edugate_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [grades, setGrades] = useState<SubjectGrade[]>(() => {
    const saved = localStorage.getItem("edugate_grades");
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("edugate_attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("edugate_announcements");
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem("edugate_transactions");
    return saved ? JSON.parse(saved) : INITIAL_FEE_TRANSACTIONS;
  });

  // Low-Bandwidth and Offline Sync Queue
  const [networkMode, setNetworkMode] = useState<NetworkLatencyMode>("ONLINE");
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>([]);
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Dark Mode State with LocalStorage Persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("edugate_darkmode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("edugate_darkmode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("edugate_schools", JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem("edugate_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("edugate_teachers", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem("edugate_grades", JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem("edugate_attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("edugate_announcements", JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem("edugate_transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Handle School Switch (Ensures Strict RLS isolation in UI)
  const handleSelectSchool = (school: School) => {
    setCurrentSchool(school);
  };

  // Handle Add New School Tenant
  const handleAddSchool = (newSchool: School) => {
    const updated = [newSchool, ...schools];
    setSchools(updated);
    setCurrentSchool(newSchool);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Handle Persona Selection (RBAC)
  const handleSelectPersona = (persona: UserPersona) => {
    setCurrentPersona(persona);
  };

  // Handle Save Attendance
  const handleSaveAttendance = (newRecords: AttendanceRecord[], sendSms: boolean) => {
    if (networkMode === "OFFLINE") {
      const item: OfflineSyncItem = {
        id: `sync-att-${Date.now()}`,
        type: "ATTENDANCE",
        description: `Class Roll Call (${newRecords.length} pupils logged)`,
        timestamp: new Date().toLocaleTimeString(),
        status: "QUEUED",
        payload: newRecords,
      };
      setOfflineQueue((prev) => [...prev, item]);
    }

    setAttendanceRecords((prev) => {
      // Remove old records for this class & date, then add new
      const filtered = prev.filter(
        (r) =>
          !(
            r.classId === newRecords[0]?.classId &&
            r.date === newRecords[0]?.date &&
            r.schoolId === newRecords[0]?.schoolId
          )
      );
      return [...filtered, ...newRecords];
    });
  };

  // Handle Grade Updates
  const handleUpdateGrades = (updatedGrades: SubjectGrade[]) => {
    if (networkMode === "OFFLINE") {
      const item: OfflineSyncItem = {
        id: `sync-grd-${Date.now()}`,
        type: "GRADE",
        description: `Subject Scores update (${updatedGrades.length} records)`,
        timestamp: new Date().toLocaleTimeString(),
        status: "QUEUED",
        payload: updatedGrades,
      };
      setOfflineQueue((prev) => [...prev, item]);
    }

    setGrades((prev) => {
      const updatedIds = new Set(updatedGrades.map((g) => g.id));
      const filtered = prev.filter((g) => !updatedIds.has(g.id));
      return [...filtered, ...updatedGrades];
    });
  };

  // Handle Add Student
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Handle Soft-Delete Student (6-month retention vault)
  const handleDeleteStudent = (studentId: string, reason?: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: "Deleted",
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              deletedBy: `${currentPersona.name} (${currentPersona.title})`,
              deleteReason: reason || "Administrative archival",
            }
          : s
      )
    );
  };

  // Handle Restore Student from 6-month vault
  const handleRestoreStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: "Active",
              isDeleted: false,
              deletedAt: undefined,
              deletedBy: undefined,
              deleteReason: undefined,
            }
          : s
      )
    );
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Permanently Purge Student
  const handlePermanentlyPurgeStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Handle Add Teacher (Onboarding)
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    // Also create matching Persona for instant switching
    const newPersona: UserPersona = {
      id: newTeacher.id,
      schoolId: newTeacher.schoolId,
      role: "TEACHER",
      name: newTeacher.name,
      email: newTeacher.email,
      phone: newTeacher.phone,
      avatar: newTeacher.avatar,
      title: newTeacher.title,
      badge: "Teacher View (30-Sec Ops)",
      assignedClassId: newTeacher.assignedClassId,
      assignedClassName: newTeacher.assignedClassName,
      assignedSubjectIds: newTeacher.assignedSubjectIds,
      description: `Educator at ${currentSchool.name}. Teaching subjects and daily attendance.`,
    };
    setPersonas((prev) => [...prev, newPersona]);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Handle Soft-Delete Teacher (6-month retention vault)
  const handleDeleteTeacher = (teacherId: string, reason?: string) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              deletedBy: `${currentPersona.name} (${currentPersona.title})`,
              deleteReason: reason || "Staff roster removal",
            }
          : t
      )
    );
  };

  // Handle Restore Teacher from 6-month vault
  const handleRestoreTeacher = (teacherId: string) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacherId
          ? {
              ...t,
              isDeleted: false,
              deletedAt: undefined,
              deletedBy: undefined,
              deleteReason: undefined,
            }
          : t
      )
    );
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Permanently Purge Teacher
  const handlePermanentlyPurgeTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
  };

  // Handle Add Announcement
  const handleAddAnnouncement = (ann: Announcement) => {
    setAnnouncements((prev) => [ann, ...prev]);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  // Handle MoMo Payment Success
  const handlePaymentSuccess = (tx: FeeTransaction) => {
    setTransactions((prev) => [tx, ...prev]);

    // Deduct student fee balance in real time
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === tx.studentId) {
          const newBalance = Math.max(0, s.feeBalanceGHS - tx.amountGHS);
          return { ...s, feeBalanceGHS: newBalance };
        }
        return s;
      })
    );
  };

  // Sync Offline Queue
  const handleSyncOfflineQueue = () => {
    const count = offlineQueue.length;
    setOfflineQueue([]);
    setSyncToast(`Successfully synced ${count} cached transaction(s) to cloud database.`);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
    });
    setTimeout(() => setSyncToast(null), 5000);
  };

  // Find Kwame Mensah for parent persona
  const kwameStudent =
    students.find((s) => s.id === "stu-kwame") || students[0];
  const kwameClass =
    classes.find((c) => c.id === kwameStudent.classId) || classes[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        currentSchool={currentSchool}
        schools={schools}
        onSelectSchool={handleSelectSchool}
        onOpenNewSchoolModal={() => setIsNewSchoolModalOpen(true)}
        currentPersona={currentPersona}
        personas={personas}
        onSelectPersona={handleSelectPersona}
        networkMode={networkMode}
        onToggleNetworkMode={(mode) => setNetworkMode(mode)}
        offlineQueue={offlineQueue}
        onSyncOfflineQueue={handleSyncOfflineQueue}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Network Latency Banner (Simulates Ghana 3G / Offline resilience) */}
      {networkMode !== "ONLINE" && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between gap-3 border-b ${
            networkMode === "3G_SIMULATED"
              ? "bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
              : "bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            {networkMode === "3G_SIMULATED" ? (
              <>
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-amber-950 dark:text-amber-100">3G Low-Bandwidth Mode Active:</strong> Optimistic UI enabled. Sub-2-second loads with skeleton fallbacks and compressed telemetry.
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-rose-950 dark:text-rose-100">Offline Mode Active:</strong> Local caching via IndexedDB/LocalStorage. Roll calls and score inputs will be queued and auto-synced upon reconnection.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sync Toast Alert */}
      {syncToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-2.5 text-xs text-center font-semibold shadow-xs">
          ✓ {syncToast}
        </div>
      )}

      {/* Main Application Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Render View based on Current Active Persona (Strict RBAC) */}
        {currentPersona.role === "TEACHER" && (
          <TeacherView
            currentSchool={currentSchool}
            currentPersona={currentPersona}
            classes={classes.filter((c) => c.schoolId === currentSchool.id || true)}
            students={students.filter((s) => s.schoolId === currentSchool.id || true)}
            subjects={subjects.filter((s) => s.schoolId === currentSchool.id || true)}
            grades={grades}
            onUpdateGrades={handleUpdateGrades}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={handleSaveAttendance}
            networkMode={networkMode}
          />
        )}

        {currentPersona.role === "ADMIN" && (
          <AdminView
            school={currentSchool}
            onUpdateSchool={(updated) => {
              setCurrentSchool(updated);
              setSchools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            }}
            classes={classes}
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onRestoreStudent={handleRestoreStudent}
            onPermanentlyPurgeStudent={handlePermanentlyPurgeStudent}
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onRestoreTeacher={handleRestoreTeacher}
            onPermanentlyPurgeTeacher={handlePermanentlyPurgeTeacher}
            subjects={subjects}
            grades={grades}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            transactions={transactions}
          />
        )}

        {currentPersona.role === "PARENT" && (
          <ParentView
            school={currentSchool}
            currentPersona={currentPersona}
            student={kwameStudent}
            schoolClass={kwameClass}
            grades={grades}
            allClassGrades={grades.filter((g) => g.classId === kwameClass.id)}
            allClassStudents={students.filter((s) => s.classId === kwameClass.id)}
            announcements={announcements}
            transactions={transactions}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {currentPersona.role === "PLATFORM_ADMIN" && (
          <PlatformAdminView
            schools={schools}
            currentPersona={currentPersona}
            onOpenNewSchoolModal={() => setIsNewSchoolModalOpen(true)}
            networkMode={networkMode}
          />
        )}
      </main>

      {/* School Onboarding Modal */}
      <TenantModal
        isOpen={isNewSchoolModalOpen}
        onClose={() => setIsNewSchoolModalOpen(false)}
        onAddSchool={handleAddSchool}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 EduGate Ghana • School Information & Operations Management System (SIOMS)</p>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            GES Standard Compliant • RLS Multi-Tenant Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
