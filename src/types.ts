export type UserRole = "TEACHER" | "ADMIN" | "PARENT" | "PLATFORM_ADMIN";

export type GradingSystemType = "GES_9_STANINE" | "WAEC_WASSCE";

export type SchoolLevel = "Basic (KG - JHS)" | "JHS" | "SHS";

export type TermType = "Term 1" | "Term 2" | "Term 3";

export interface School {
  id: string;
  name: string;
  code: string;
  crest: string;
  motto: string;
  region: string;
  district: string;
  level: SchoolLevel;
  academicYear: string;
  term: TermType;
  gradingScale: GradingSystemType;
  caSplit: {
    caPercentage: number; // e.g. 40 or 30
    examPercentage: number; // e.g. 60 or 70
  };
  subscriptionTier: "Basic" | "Standard" | "Enterprise";
  contactPhone: string;
  contactEmail: string;
  headmasterName: string;
  themeColor: string;
  reopeningDate: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface UserPersona {
  id: string;
  schoolId: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  badge: string;
  assignedClassId?: string;
  assignedClassName?: string;
  assignedSubjectIds?: string[];
  linkedStudentId?: string;
  linkedStudentName?: string;
  description: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: string;
  classTeacherId: string;
  classTeacherName: string;
  roomNumber: string;
  studentCount: number;
  boyCount: number;
  girlCount: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  core: boolean;
  category: "Core" | "Elective" | "Language" | "Technical";
}

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female";
  avatar: string;
  gesStaffId: string;
  qualification: string;
  title: string;
  assignedClassId?: string;
  assignedClassName?: string;
  assignedSubjectIds: string[];
  dateJoined: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  indexNumber: string;
  ghanaCardId: string;
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dob: string;
  photo: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation: "Father" | "Mother" | "Guardian";
  residentialAddress: string;
  feeBalanceGHS: number;
  attendancePercentage: number;
  conduct: string;
  attitude: string;
  interest: string;
  status: "Active" | "Transferred" | "Alumni" | "Deleted";
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  recordedBy: string;
  smsSent: boolean;
}

export interface SubjectGrade {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  academicYear: string;
  term: TermType;
  classExercises: number; // Max 15
  homework: number; // Max 10
  projectMidTerm: number; // Max 15
  totalCA: number; // Max 40 or 30
  examScore: number; // Max 60 or 70
  totalScore: number; // Max 100
  grade: string; // e.g. "1", "2", "3" or "A1", "B2"
  gradeRemark: string; // "Distinction", "Proficient", "Credit", "Pass", "Fail"
  positionInSubject: number;
  classAverage: number;
}

export interface ReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentIndex: string;
  classId: string;
  className: string;
  term: TermType;
  academicYear: string;
  subjects: SubjectGrade[];
  totalMarks: number;
  maxPossibleMarks: number;
  averageScore: number;
  positionInClass: number;
  outOf: number;
  attendanceDays: number;
  outOfAttendanceDays: number;
  conduct: string;
  attitude: string;
  interest: string;
  classTeacherRemarks: string;
  headmasterRemarks: string;
  promotionStatus: "Promoted" | "Repeat" | "On Trial" | "Term Complete";
  nextClass?: string;
  reopeningDate: string;
  feesDueNextTermGHS: number;
  generatedAt: string;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  category: "General" | "Academic" | "PTA" | "Fee Notice" | "Sports" | "Emergency";
  targetAudience: "ALL" | "PARENTS" | "TEACHERS" | "STUDENTS" | "CLASS_SPECIFIC";
  targetClassId?: string;
  publishedAt: string;
  author: string;
  priority: "Normal" | "Urgent" | "High";
  smsBroadcast: boolean;
}

export interface FeeTransaction {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  amountGHS: number;
  term: TermType;
  feeType: "Tuition" | "PTA Dues" | "ICT & Science Levy" | "Examination Fee" | "Feeding / Canteen";
  paymentMethod: "MTN_MOMO" | "TELECEL_CASH" | "AT_MONEY" | "BANK_TRANSFER" | "CASH";
  reference: string;
  date: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED";
}

export interface OfflineSyncItem {
  id: string;
  type: "ATTENDANCE" | "GRADE" | "ANNOUNCEMENT" | "STUDENT";
  description: string;
  timestamp: string;
  status: "QUEUED" | "SYNCED";
  payload: any;
}

export type NetworkLatencyMode = "ONLINE" | "3G_SIMULATED" | "OFFLINE";
