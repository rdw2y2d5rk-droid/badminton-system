export type UserRole = 'ADMIN' | 'COACH';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  coachId?: string; // If role is COACH
  email: string;
  phone: string;
  avatar: string;
  title: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface BadmintonClass {
  id: string;
  code: string;
  name: string;
  level: SkillLevel;
  levelLabel: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  scheduleDays: string[]; // e.g. ['T2', 'T4', 'T6']
  scheduleDaysText: string; // "T2 · T4 · T6"
  timeSlot: string; // "18:00 - 19:30"
  court: string; // "Sân 02"
  maxStudents: number;
  currentStudentsCount: number;
  studentIds: string[];
  status: 'Active' | 'Paused' | 'Upcoming';
  feePerPackage: number;
  totalSessions: number; // default package length e.g. 12
  description: string;
  startDate: string;
}

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Overdue';
export type StudentStatus = 'Studying' | 'Completed' | 'Reserved' | 'Expired';
export type AttendanceState = 'Present' | 'Absent' | 'Excused';
export type AttendanceStatus = AttendanceState; // alias

export interface StudentAttendanceHistoryItem {
  id: string;
  date: string;
  status: AttendanceState;
  note?: string;
}

export interface Student {
  id: string;
  code: string; // "HV001"
  name: string;
  phone: string;
  email: string;
  avatar: string;
  classId: string;
  className: string;
  coachId: string;
  coachName: string;
  packageSessions: number; // e.g. 12
  attendedSessions: number; // e.g. 8
  remainingSessions: number; // e.g. 4
  paymentStatus: PaymentStatus;
  status: StudentStatus;
  joinedDate: string;
  emergencyContact: string;
  note?: string;
  lastAttended?: string;
  skillLevel: SkillLevel;
  attendanceHistory?: StudentAttendanceHistoryItem[];
}

export interface Coach {
  id: string;
  code: string; // "HLV001"
  name: string;
  phone: string;
  email: string;
  avatar: string;
  specialty: string;
  bio?: string;
  experience?: string;
  certificate?: string;
  status: 'Active' | 'OnLeave';
  assignedClassIds: string[];
  rating: number;
  joinedDate: string;
  hourlyRate: number;
  taughtSessionsMonth: number;
  taughtHoursMonth: number;
  totalStudents: number;
}

export type SessionStatus = 'Upcoming' | 'Ongoing' | 'Completed';

export interface AttendanceRecordItem {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  status: AttendanceState;
  note?: string;
}

export interface SessionSchedule {
  id: string;
  classId: string;
  className: string;
  level: SkillLevel;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Thứ Hai", "Thứ Tư", etc.
  startTime: string; // "18:00"
  endTime: string; // "19:30"
  timeSlot: string; // "18:00 - 19:30"
  court: string; // "Sân 02"
  status: SessionStatus;
  attendanceDone: boolean;
  totalStudents: number;
  attendanceRecords?: AttendanceRecordItem[];
}

export interface PaymentItem {
  id: string;
  code: string; // "PAY-2026-0801"
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentAvatar?: string;
  classId: string;
  className: string;
  amount: number; // e.g. 1800000
  month: string; // "Tháng 08/2026"
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo';
  note?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success' | 'alert';
  linkTo?: {
    tab: string;
    id?: string;
  };
}

export interface CourtInfo {
  id: string;
  name: string; // "Sân 01"
  type: 'Standard' | 'VIP';
  surface: string; // "Thảm PVC Yonex"
  status: 'InUse' | 'Available' | 'Maintenance';
  currentClass?: string;
  currentCoach?: string;
}
