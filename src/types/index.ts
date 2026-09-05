export type UserRole = 'ADMIN' | 'COACH' | 'FACILITY_MANAGER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  coachId?: string; // If role is COACH
  facilityId?: string; // If role is FACILITY_MANAGER
  facilityName?: string;
  email: string;
  phone: string;
  avatar: string;
  title: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// Cơ sở cầu lông (Branch / Facility)
export interface Facility {
  id: string; // e.g. "CS01"
  code: string; // "CS01"
  name: string; // "Cơ sở Cầu Giấy"
  address: string; // "Số 12 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
  phone: string;
  managerId?: string;
  managerName?: string;
  totalCourts: number;
  openHours: string; // "06:00 - 22:30"
  status: 'Active' | 'Maintenance' | 'Inactive';
  description?: string;
  courtIds?: string[];
}

// Sân cầu lông trực thuộc cơ sở
export interface CourtInfo {
  id: string; // "SAN01"
  facilityId: string; // "CS01"
  facilityName: string; // "Cơ sở Cầu Giấy"
  name: string; // "Sân 01"
  type: 'Standard' | 'VIP';
  surface: string; // "Thảm PVC Yonex 5.0mm"
  status: 'InUse' | 'Available' | 'Maintenance';
  pricePerHour?: number;
  currentClass?: string;
  currentCoach?: string;
}

// Ca học (Shift / Time Slot)
export interface ShiftInfo {
  id: string; // "CA01"
  code: string; // "CA-01"
  name: string; // "Ca Sáng 1"
  startTime: string; // "06:00"
  endTime: string; // "07:30"
  timeSlot: string; // "06:00 - 07:30"
  category: 'Morning' | 'Afternoon' | 'Evening';
  description?: string;
  isActive: boolean;
}

export interface BadmintonClass {
  id: string;
  code: string;
  name: string;
  level: SkillLevel;
  levelLabel: string;
  facilityId?: string;
  facilityName?: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  shiftId?: string;
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
  className?: string;
  facilityName?: string;
  courtName?: string;
  timeSlot?: string;
  isMakeup?: boolean; // Học bù
  isLeaveExcused?: boolean; // Nghỉ có phép
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

  // Lịch cố định theo cơ sở, ca và các thứ trong tuần
  facilityId?: string; // e.g. "CS01"
  facilityName?: string; // "Cơ sở 1 - Cầu Giấy"
  courtId?: string; // "SAN02"
  courtName?: string; // "Sân 02"
  fixedShiftId?: string; // "CA04"
  fixedShiftName?: string; // "18:00 - 19:30"
  fixedDays?: string[]; // e.g. ['T2', 'T4', 'T6']

  // Đăng ký theo tháng & thời hạn
  month?: string; // "Tháng 09/2026"
  startDate?: string; // "2026-09-01"
  endDate?: string; // "2026-09-30"

  // Quản lý gói buổi & Quy luật tính phép (4 buổi = 1 phép)
  packageSessions: number; // e.g. 12 buổi
  attendedSessions: number; // e.g. 8 buổi
  remainingSessions: number; // e.g. 4 buổi
  allowedLeaves?: number; // Math.floor(packageSessions / 4) e.g. 3 phép
  usedLeaves?: number; // e.g. 1 phép đã dùng
  carriedOverSessions?: number; // Buổi còn lại được cộng dồn từ tháng trước

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
  facilityIds?: string[]; // Cơ sở giảng dạy
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
  studentPhone?: string;
  status: AttendanceState;
  isMakeup?: boolean; // Học bù tại cơ sở hôm nay
  makeupFromClass?: string;
  note?: string;
}

export interface CoachAttendanceRecord {
  status: 'Present' | 'Absent' | 'Substituted';
  substituteCoachId?: string;
  substituteCoachName?: string;
  note?: string;
}

export interface SessionSchedule {
  id: string;
  classId: string;
  className: string;
  level: SkillLevel;
  facilityId?: string;
  facilityName?: string;
  court: string; // "Sân 02"
  shiftId?: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Thứ Hai", "Thứ Tư", etc.
  startTime: string; // "18:00"
  endTime: string; // "19:30"
  timeSlot: string; // "18:00 - 19:30"
  status: SessionStatus;
  attendanceDone: boolean;
  totalStudents: number;
  coachAttendance?: CoachAttendanceRecord;
  attendanceRecords?: AttendanceRecordItem[];
  makeupStudents?: AttendanceRecordItem[]; // Học viên học bù thêm vào ca
}

export interface PaymentItem {
  id: string;
  code: string; // "PAY-2026-0801"
  studentId?: string;
  studentName: string;
  studentPhone: string;
  studentAvatar?: string;
  classId?: string;
  className?: string;
  facilityId?: string;
  facilityName?: string;
  amount: number; // e.g. 1800000
  month: string; // "Tháng 08/2026"
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo';
  paymentType?: 'Tuition' | 'CourtFee' | 'Equipment' | 'Other';
  collectorName?: string; // Người thu (Admin hoặc Quản lý cơ sở)
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
