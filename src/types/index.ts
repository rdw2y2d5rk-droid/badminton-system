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

// Sân cầu lông (Facility / Badminton Court) - Thống nhất Cơ sở & Sân là một
export interface Facility {
  id: string; // e.g. "SAN01" hoặc "CS01"
  code: string; // "SAN-CG"
  name: string; // "Sân Cầu Lông Cầu Giấy"
  address: string; // "Số 12 Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
  phone: string;
  managerId?: string;
  managerName?: string;
  openHours: string; // "06:00 - 22:30"
  status: 'Active' | 'Maintenance' | 'Inactive';
  description?: string;
  pricePerHour?: number;
  surface?: string;
  totalCourts?: number;
  courtIds?: string[];
  facilityId?: string;
  facilityName?: string;
  type?: 'Standard' | 'VIP';
  currentCoach?: string;
  currentClass?: string;
}

// Alias để tương thích ngược toàn bộ hệ thống
export type CourtInfo = Facility;
export type BadmintonCourt = Facility;

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

  // Lịch học theo ngày cụ thể trong tháng (không cố định thứ nữa)
  specificDates?: string[]; // e.g. ['2026-08-03', '2026-08-05', '2026-08-10', ...]
  scheduleStatus?: 'pending_admin' | 'confirmed'; // Trạng thái phê duyệt / lưu lịch của Admin
  scheduleConfirmedAt?: string;
  scheduleConfirmedBy?: string;

  // Lịch cố định theo sân, ca
  facilityId?: string; // e.g. "SAN01" hoặc "CS01"
  facilityName?: string; // "Sân Cầu Lông Cầu Giấy"
  courtId?: string;
  courtName?: string;
  fixedShiftId?: string;
  fixedShiftName?: string;
  shiftId?: string;
  shiftName?: string;
  timeSlot?: string;
  fixedDays?: string[];
  fixedWeekdays?: string[];

  // Đăng ký theo tháng & thời hạn
  month?: string; // "Tháng 08/2026"
  startDate?: string;
  endDate?: string;

  // Quản lý gói buổi & Quy luật tính phép (4 buổi = 1 phép)
  packageSessions: number;
  attendedSessions: number;
  remainingSessions: number;
  allowedLeaves?: number;
  maxLeaveDays?: number;
  usedLeaves?: number;
  carriedOverSessions?: number;

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

// Thông báo Admin duyệt lịch học & vận hành
export interface AdminNotification {
  id: string;
  type: 'new_schedule_request' | 'late_coach' | 'student_leave';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  studentPhone?: string;
  facilityId: string;
  facilityName: string;
  shiftId: string;
  shiftName: string;
  specificDates?: string[];
  status: 'unread' | 'read' | 'confirmed';
  createdAt: string;
}

