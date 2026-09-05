import React, { createContext, useContext, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_ALL_SESSIONS,
  INITIAL_CLASSES,
  INITIAL_COACHES,
  INITIAL_COURTS,
  INITIAL_FACILITIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SHIFTS,
  INITIAL_STUDENTS,
  INITIAL_USERS
} from '../data/mockData';
import {
  AttendanceRecordItem,
  BadmintonClass,
  Coach,
  CoachAttendanceRecord,
  CourtInfo,
  Facility,
  NotificationItem,
  PaymentItem,
  SessionSchedule,
  ShiftInfo,
  Student,
  UserProfile,
  UserRole
} from '../types';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole, coachId?: string) => void;
  activeTab: string;
  selectedId: string | null;
  navigate: (tab: string, id?: string | null) => void;
  
  // Data lists
  facilities: Facility[];
  courts: CourtInfo[];
  shifts: ShiftInfo[];
  classes: BadmintonClass[];
  students: Student[];
  coaches: Coach[];
  sessions: SessionSchedule[];
  payments: PaymentItem[];
  notifications: NotificationItem[];
  
  // Facility CRUD
  addFacility: (facility: Omit<Facility, 'id' | 'code'>) => void;
  editFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;

  // Court CRUD
  addCourt: (court: Omit<CourtInfo, 'id'>) => void;
  editCourt: (id: string, updates: Partial<CourtInfo>) => void;
  deleteCourt: (id: string) => void;

  // Shift CRUD
  addShift: (shift: Omit<ShiftInfo, 'id' | 'code'>) => void;
  editShift: (id: string, updates: Partial<ShiftInfo>) => void;
  deleteShift: (id: string) => void;

  // Schedule & Session actions
  addSession: (sessionData: Omit<SessionSchedule, 'id'>) => void;
  editSession: (id: string, updates: Partial<SessionSchedule>) => void;
  deleteSession: (id: string) => void;

  // Attendance actions
  saveAttendance: (sessionId: string, records: AttendanceRecordItem[], classId: string, date: string) => void;
  saveCoachAttendance: (sessionId: string, record: CoachAttendanceRecord) => void;
  addMakeupStudentToSession: (sessionId: string, student: Student, note?: string) => void;
  
  // Payment actions
  confirmPayment: (paymentId: string, method?: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo') => void;
  addPayment: (payment: Omit<PaymentItem, 'id' | 'code'>) => void;
  collectPaymentAtCourt: (data: {
    studentId?: string;
    studentName: string;
    studentPhone: string;
    classId?: string;
    className?: string;
    amount: number;
    paymentType: 'Tuition' | 'CourtFee' | 'Equipment' | 'Other';
    method: 'Tiền mặt' | 'Chuyển khoản QR' | 'Thẻ ngân hàng' | 'Ví MoMo';
    note?: string;
  }) => void;
  
  // Student actions
  addStudent: (studentData: Omit<Student, 'id' | 'code'>) => void;
  editStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addSessionsToStudent: (studentId: string, extraSessions: number) => void;
  importStudentsFromExcel: (importedList: Array<Omit<Student, 'id' | 'code'>>) => number;
  renewStudentMonth: (
    studentId: string,
    newPackageSessions: number,
    monthStr: string,
    startDate?: string,
    endDate?: string
  ) => void;
  
  // Class actions
  addClass: (classData: Omit<BadmintonClass, 'id' | 'code' | 'currentStudentsCount' | 'studentIds'>) => void;
  editClass: (id: string, updates: Partial<BadmintonClass>) => void;
  deleteClass: (id: string) => void;
  
  // Coach actions
  addCoach: (coachData: Omit<Coach, 'id' | 'code' | 'taughtSessionsMonth' | 'taughtHoursMonth' | 'totalStudents'>) => void;
  editCoach: (id: string, updates: Partial<Coach>) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Toast notifications
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Filtered views based on coach / facility manager roles
  isCoach: boolean;
  isFacilityManager: boolean;
  managedFacilityId?: string;
  assignedClasses: BadmintonClass[];
  assignedStudents: Student[];
  assignedSessions: SessionSchedule[];
  assignedCourts: CourtInfo[];
  
  // Quick attendance target
  attendanceTarget: { classId: string; date: string; sessionId?: string } | null;
  setAttendanceTarget: (target: { classId: string; date: string; sessionId?: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [courts, setCourts] = useState<CourtInfo[]>(INITIAL_COURTS);
  const [shifts, setShifts] = useState<ShiftInfo[]>(INITIAL_SHIFTS);
  const [classes, setClasses] = useState<BadmintonClass[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [sessions, setSessions] = useState<SessionSchedule[]>(INITIAL_ALL_SESSIONS);
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [attendanceTarget, setAttendanceTarget] = useState<{ classId: string; date: string; sessionId?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigate = (tab: string, id: string | null = null) => {
    setActiveTab(tab);
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchUser = (userId: string) => {
    const target = INITIAL_USERS.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      const roleLabel =
        target.role === 'ADMIN'
          ? 'Admin Tổng'
          : target.role === 'FACILITY_MANAGER'
          ? `Quản lý ${target.facilityName || 'Cơ sở'}`
          : 'Huấn luyện viên';
      showToast(`Đã chuyển sang vai trò: ${target.name} (${roleLabel})`, 'info');
    }
  };

  const switchRole = (role: UserRole, coachId?: string) => {
    if (role === 'ADMIN') {
      setCurrentUser(INITIAL_USERS[0]);
      showToast('Đã chuyển sang vai trò: Ban Quản Trị (ADMIN)', 'info');
    } else if (role === 'FACILITY_MANAGER') {
      const targetManager = INITIAL_USERS.find(u => u.role === 'FACILITY_MANAGER') || INITIAL_USERS[1];
      setCurrentUser(targetManager);
      showToast(`Đã chuyển sang vai trò: ${targetManager.name} (${targetManager.title})`, 'info');
    } else {
      const targetCoachUser = INITIAL_USERS.find(u => u.coachId === coachId) || INITIAL_USERS.find(u => u.role === 'COACH') || INITIAL_USERS[2];
      setCurrentUser(targetCoachUser);
      showToast(`Đã chuyển sang vai trò: HLV ${targetCoachUser.name}`, 'info');
    }
  };

  const isCoach = currentUser.role === 'COACH';
  const isFacilityManager = currentUser.role === 'FACILITY_MANAGER';
  const managedFacilityId = currentUser.facilityId;

  // Filtered views based on coach and facility manager roles
  const assignedClasses = useMemo(() => {
    if (isCoach && currentUser.coachId) {
      return classes.filter(c => c.coachId === currentUser.coachId);
    }
    if (isFacilityManager && managedFacilityId) {
      return classes.filter(c => !c.facilityId || c.facilityId === managedFacilityId);
    }
    return classes;
  }, [classes, isCoach, isFacilityManager, currentUser, managedFacilityId]);

  const assignedStudents = useMemo(() => {
    if (isCoach && currentUser.coachId) {
      return students.filter(s => s.coachId === currentUser.coachId);
    }
    if (isFacilityManager && managedFacilityId) {
      return students.filter(s => !s.facilityId || s.facilityId === managedFacilityId);
    }
    return students;
  }, [students, isCoach, isFacilityManager, currentUser, managedFacilityId]);

  const assignedSessions = useMemo(() => {
    if (isCoach && currentUser.coachId) {
      return sessions.filter(s => s.coachId === currentUser.coachId);
    }
    if (isFacilityManager && managedFacilityId) {
      return sessions.filter(s => !s.facilityId || s.facilityId === managedFacilityId);
    }
    return sessions;
  }, [sessions, isCoach, isFacilityManager, currentUser, managedFacilityId]);

  const assignedCourts = useMemo(() => {
    if (isFacilityManager && managedFacilityId) {
      return courts.filter(c => c.facilityId === managedFacilityId);
    }
    return courts;
  }, [courts, isFacilityManager, managedFacilityId]);

  // Facility CRUD
  const addFacility = (facilityData: Omit<Facility, 'id' | 'code'>) => {
    const nextNum = facilities.length + 1;
    const newCode = `CS${String(nextNum).padStart(2, '0')}`;
    const newFacility: Facility = {
      ...facilityData,
      id: newCode,
      code: newCode
    };
    setFacilities(prev => [...prev, newFacility]);
    showToast(`Đã thêm cơ sở mới: ${newFacility.name}`, 'success');
  };

  const editFacility = (id: string, updates: Partial<Facility>) => {
    setFacilities(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    showToast('Đã cập nhật thông tin cơ sở!', 'success');
  };

  const deleteFacility = (id: string) => {
    setFacilities(prev => prev.filter(f => f.id !== id));
    showToast('Đã xoá cơ sở khỏi hệ thống!', 'info');
  };

  // Court CRUD
  const addCourt = (courtData: Omit<CourtInfo, 'id'>) => {
    const nextNum = courts.length + 1;
    const newId = `SAN${String(nextNum).padStart(2, '0')}`;
    const newCourt: CourtInfo = {
      ...courtData,
      id: newId
    };
    setCourts(prev => [...prev, newCourt]);
    showToast(`Đã thêm sân mới: ${newCourt.name} (${newCourt.facilityName})`, 'success');
  };

  const editCourt = (id: string, updates: Partial<CourtInfo>) => {
    setCourts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Đã cập nhật thông tin sân!', 'success');
  };

  const deleteCourt = (id: string) => {
    setCourts(prev => prev.filter(c => c.id !== id));
    showToast('Đã xoá sân!', 'info');
  };

  // Shift CRUD
  const addShift = (shiftData: Omit<ShiftInfo, 'id' | 'code'>) => {
    const nextNum = shifts.length + 1;
    const newId = `CA${String(nextNum).padStart(2, '0')}`;
    const newCode = `CA-${String(nextNum).padStart(2, '0')}`;
    const newShift: ShiftInfo = {
      ...shiftData,
      id: newId,
      code: newCode
    };
    setShifts(prev => [...prev, newShift]);
    showToast(`Đã tạo ca học mới: ${newShift.name} (${newShift.timeSlot})`, 'success');
  };

  const editShift = (id: string, updates: Partial<ShiftInfo>) => {
    setShifts(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Đã cập nhật ca học!', 'success');
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    showToast('Đã xoá ca học!', 'info');
  };

  // Schedule Session CRUD
  const addSession = (sessionData: Omit<SessionSchedule, 'id'>) => {
    const newId = `SES-${Date.now()}`;
    const newSession: SessionSchedule = {
      ...sessionData,
      id: newId
    };
    setSessions(prev => [newSession, ...prev]);
    showToast(`Đã sắp lịch ca học thành công: ${newSession.className} - ${newSession.date}!`, 'success');
  };

  const editSession = (id: string, updates: Partial<SessionSchedule>) => {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Đã cập nhật lịch ca học!', 'success');
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Đã xoá ca học khỏi lịch!', 'info');
  };

  // Coach Attendance Action
  const saveCoachAttendance = (sessionId: string, record: CoachAttendanceRecord) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            coachAttendance: record
          };
        }
        return s;
      })
    );
    showToast('Đã lưu điểm danh cho Huấn Luyện Viên!', 'success');
  };

  // Add make-up student to session
  const addMakeupStudentToSession = (sessionId: string, student: Student, note: string = 'Học bù tại cơ sở') => {
    const makeupItem: AttendanceRecordItem = {
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      studentPhone: student.phone,
      status: 'Present',
      isMakeup: true,
      makeupFromClass: student.className,
      note
    };

    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const currentMakeup = s.makeupStudents || [];
          const exists = currentMakeup.some(m => m.studentId === student.id);
          if (exists) return s;
          return {
            ...s,
            makeupStudents: [...currentMakeup, makeupItem],
            totalStudents: s.totalStudents + 1
          };
        }
        return s;
      })
    );

    showToast(`Đã thêm học viên ${student.name} vào danh sách học bù ca hôm nay!`, 'success');
  };

  // Save Student Attendance with Leave Rules (4 sessions/month = 1 leave)
  const saveAttendance = (sessionId: string, records: AttendanceRecordItem[], classId: string, date: string) => {
    const presentCount = records.filter(r => r.status === 'Present').length;
    const excusedCount = records.filter(r => r.status === 'Excused').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    
    // Update Session
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId || (s.classId === classId && s.date === date)) {
          return {
            ...s,
            status: 'Completed',
            attendanceDone: true,
            attendanceRecords: records
          };
        }
        return s;
      })
    );

    // Update Students Session Counters & Leave calculations
    setStudents(prev =>
      prev.map(student => {
        const studentRecord = records.find(r => r.studentId === student.id);
        if (!studentRecord) return student;

        const maxLeaves = student.allowedLeaves ?? Math.floor((student.packageSessions || 12) / 4);
        const currentUsed = student.usedLeaves || 0;

        if (studentRecord.status === 'Present') {
          const newAttended = student.attendedSessions + 1;
          const newRemaining = Math.max(0, student.remainingSessions - 1);
          const newStatus = newRemaining === 0 ? 'Expired' : student.status;
          return {
            ...student,
            attendedSessions: newAttended,
            remainingSessions: newRemaining,
            status: newStatus,
            lastAttended: date
          };
        } else if (studentRecord.status === 'Excused') {
          // Rule: 4 sessions = 1 leave.
          // If student has remaining leave allowance, this leave is excused and preserved for next month!
          if (currentUsed < maxLeaves) {
            return {
              ...student,
              usedLeaves: currentUsed + 1,
              // Buổi phép được bảo lưu, không bị trừ mất!
              note: student.note
                ? `${student.note} | Nghỉ có phép ngày ${date}`
                : `Nghỉ có phép ngày ${date}`
            };
          } else {
            // Exceeded leave allowance -> counts as absent, session deducted
            const newRemaining = Math.max(0, student.remainingSessions - 1);
            return {
              ...student,
              remainingSessions: newRemaining,
              status: newRemaining === 0 ? 'Expired' : student.status,
              note: student.note
                ? `${student.note} | Vắng (hết phép tháng) ngày ${date}`
                : `Vắng (hết phép) ngày ${date}`
            };
          }
        } else if (studentRecord.status === 'Absent') {
          // Absent without permission -> deducted from package, not preserved
          const newRemaining = Math.max(0, student.remainingSessions - 1);
          return {
            ...student,
            remainingSessions: newRemaining,
            status: newRemaining === 0 ? 'Expired' : student.status
          };
        }

        return student;
      })
    );

    // Update Coach stats
    const targetClass = classes.find(c => c.id === classId);
    if (targetClass) {
      setCoaches(prev =>
        prev.map(coach => {
          if (coach.id === targetClass.coachId) {
            return {
              ...coach,
              taughtSessionsMonth: coach.taughtSessionsMonth + 1,
              taughtHoursMonth: Number((coach.taughtHoursMonth + 1.5).toFixed(1))
            };
          }
          return coach;
        })
      );
    }

    // Add notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: 'Điểm danh hoàn tất',
      message: `Đã lưu điểm danh lớp ${targetClass?.name || classId} ngày ${date} (Có mặt: ${presentCount}, Có phép: ${excusedCount}, Vắng: ${absentCount}).`,
      time: 'Vừa xong',
      read: false,
      type: 'success',
      linkTo: { tab: 'attendance', id: classId }
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Confetti effect
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    showToast(`Đã lưu điểm danh! Có mặt: ${presentCount} | Có phép: ${excusedCount} | Vắng: ${absentCount}`, 'success');
  };

  // Payment confirmation
  const confirmPayment = (paymentId: string, method: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo' = 'Chuyển khoản QR') => {
    const todayStr = '28/08/2026';
    let targetStudentId = '';
    let amountStr = '';

    setPayments(prev =>
      prev.map(p => {
        if (p.id === paymentId) {
          targetStudentId = p.studentId || '';
          amountStr = p.amount.toLocaleString('vi-VN') + 'đ';
          return {
            ...p,
            status: 'Paid',
            paidDate: todayStr,
            method: method
          };
        }
        return p;
      })
    );

    if (targetStudentId) {
      setStudents(prev =>
        prev.map(s => {
          if (s.id === targetStudentId) {
            return {
              ...s,
              paymentStatus: 'Paid'
            };
          }
          return s;
        })
      );
    }

    showToast(`Đã xác nhận thanh toán học phí (${amountStr}) thành công!`, 'success');
  };

  const addPayment = (paymentData: Omit<PaymentItem, 'id' | 'code'>) => {
    const nextNum = payments.length + 1;
    const newPayment: PaymentItem = {
      ...paymentData,
      id: `PAY-${Date.now()}`,
      code: `PAY-2026-${String(nextNum).padStart(4, '0')}`
    };
    setPayments(prev => [newPayment, ...prev]);
    showToast(`Đã tạo phiếu thu ${newPayment.code} thành công!`, 'success');
  };

  // On-site Cashier Collection at Court/Facility (For Facility Manager and Admin)
  const collectPaymentAtCourt = (data: {
    studentId?: string;
    studentName: string;
    studentPhone: string;
    classId?: string;
    className?: string;
    amount: number;
    paymentType: 'Tuition' | 'CourtFee' | 'Equipment' | 'Other';
    method: 'Tiền mặt' | 'Chuyển khoản QR' | 'Thẻ ngân hàng' | 'Ví MoMo';
    note?: string;
  }) => {
    const nextNum = payments.length + 1;
    const todayStr = '28/08/2026';
    const newPayment: PaymentItem = {
      id: `PAY-${Date.now()}`,
      code: `PAY-2026-${String(nextNum).padStart(4, '0')}`,
      studentId: data.studentId,
      studentName: data.studentName,
      studentPhone: data.studentPhone,
      classId: data.classId,
      className: data.className,
      amount: data.amount,
      month: 'Tháng 08/2026',
      dueDate: todayStr,
      paidDate: todayStr,
      status: 'Paid',
      method: data.method,
      paymentType: data.paymentType,
      facilityId: currentUser.facilityId || 'CS01',
      facilityName: currentUser.facilityName || 'Cơ sở 1 - Cầu Giấy',
      collectorName: currentUser.name,
      note: data.note
    };

    setPayments(prev => [newPayment, ...prev]);

    // If tuition, update student payment status
    if (data.studentId && data.paymentType === 'Tuition') {
      setStudents(prev =>
        prev.map(s => {
          if (s.id === data.studentId) {
            return {
              ...s,
              paymentStatus: 'Paid'
            };
          }
          return s;
        })
      );
    }

    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    showToast(`Thu tiền tại cơ sở thành công: ${data.amount.toLocaleString('vi-VN')}đ (${newPayment.code})`, 'success');
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'code'>) => {
    const nextNum = students.length + 1;
    const newId = `HV${String(nextNum).padStart(3, '0')}`;
    const packageSessions = studentData.packageSessions || 12;
    const allowedLeaves = Math.floor(packageSessions / 4);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      code: newId,
      packageSessions,
      attendedSessions: 0,
      remainingSessions: packageSessions,
      allowedLeaves,
      usedLeaves: 0,
      carriedOverSessions: 0
    };
    
    setStudents(prev => [newStudent, ...prev]);
    
    // update class student list
    if (studentData.classId) {
      setClasses(prev =>
        prev.map(c => {
          if (c.id === studentData.classId) {
            return {
              ...c,
              currentStudentsCount: c.currentStudentsCount + 1,
              studentIds: [...c.studentIds, newId]
            };
          }
          return c;
        })
      );
    }

    showToast(`Đã thêm học viên mới: ${newStudent.name} (${newId}) - ${allowedLeaves} phép/tháng`, 'success');
  };

  const editStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Đã cập nhật thông tin học viên!', 'success');
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('Đã xoá học viên khỏi hệ thống!', 'info');
  };

  // Import batch students from Excel / CSV
  const importStudentsFromExcel = (importedList: Array<Omit<Student, 'id' | 'code'>>) => {
    let startNum = students.length + 1;
    const newStudents: Student[] = importedList.map(item => {
      const id = `HV${String(startNum++).padStart(3, '0')}`;
      const packageSessions = item.packageSessions || 12;
      return {
        ...item,
        id,
        code: id,
        packageSessions,
        attendedSessions: 0,
        remainingSessions: packageSessions,
        allowedLeaves: Math.floor(packageSessions / 4),
        usedLeaves: 0,
        carriedOverSessions: 0,
        status: 'Studying',
        paymentStatus: item.paymentStatus || 'Paid'
      };
    });

    setStudents(prev => [...newStudents, ...prev]);
    showToast(`Đã import thành công ${newStudents.length} học viên từ file Excel!`, 'success');
    return newStudents.length;
  };

  // Renew month with session rollover and leave reset
  const renewStudentMonth = (
    studentId: string,
    newPackageSessions: number,
    monthStr: string,
    startDate?: string,
    endDate?: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Rule: remaining sessions (including preserved leaves) are carried over to the next month
    const carriedOver = student.remainingSessions;
    const totalRemaining = newPackageSessions + carriedOver;
    const newAllowedLeaves = Math.floor(newPackageSessions / 4);

    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            month: monthStr,
            startDate: startDate || s.startDate,
            endDate: endDate || s.endDate,
            packageSessions: newPackageSessions,
            carriedOverSessions: carriedOver,
            remainingSessions: totalRemaining,
            attendedSessions: 0,
            allowedLeaves: newAllowedLeaves,
            usedLeaves: 0, // Reset leaves for new month
            status: 'Studying',
            paymentStatus: 'Unpaid'
          };
        }
        return s;
      })
    );

    // Create payment bill for the new month
    const nextNum = payments.length + 1;
    const newPayment: PaymentItem = {
      id: `PAY-${Date.now()}`,
      code: `PAY-2026-${String(nextNum).padStart(4, '0')}`,
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      classId: student.classId,
      className: student.className,
      amount: (classes.find(c => c.id === student.classId)?.feePerPackage || 1800000),
      month: monthStr,
      dueDate: startDate ? startDate.split('-').reverse().join('/') : '05/09/2026',
      status: 'Unpaid',
      note: `Gia hạn ${monthStr}: Đăng ký ${newPackageSessions} buổi + Cộng dồn ${carriedOver} buổi tháng trước`
    };
    setPayments(prev => [newPayment, ...prev]);

    showToast(
      `Đã gia hạn ${monthStr} cho ${student.name}: +${newPackageSessions} buổi, cộng dồn ${carriedOver} buổi từ tháng trước!`,
      'success'
    );
  };

  const addSessionsToStudent = (studentId: string, extraSessions: number) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const newPackage = s.packageSessions + extraSessions;
          const newRemaining = s.remainingSessions + extraSessions;
          return {
            ...s,
            packageSessions: newPackage,
            remainingSessions: newRemaining,
            status: 'Studying',
            paymentStatus: 'Paid'
          };
        }
        return s;
      })
    );
    showToast(`Đã nạp thêm +${extraSessions} buổi học cho học viên!`, 'success');
  };

  // Class Actions
  const addClass = (classData: Omit<BadmintonClass, 'id' | 'code' | 'currentStudentsCount' | 'studentIds'>) => {
    const nextNum = classes.length + 1;
    const newCode = `BD-${classData.level.charAt(0)}${String(nextNum).padStart(2, '0')}`;
    const newClass: BadmintonClass = {
      ...classData,
      id: newCode,
      code: newCode,
      currentStudentsCount: 0,
      studentIds: []
    };
    setClasses(prev => [...prev, newClass]);
    showToast(`Đã tạo lớp học mới: ${newClass.name} (${newCode})`, 'success');
  };

  const editClass = (id: string, updates: Partial<BadmintonClass>) => {
    setClasses(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Đã cập nhật thông tin lớp học!', 'success');
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    showToast('Đã xoá lớp học!', 'info');
  };

  // Coach Actions
  const addCoach = (coachData: Omit<Coach, 'id' | 'code' | 'taughtSessionsMonth' | 'taughtHoursMonth' | 'totalStudents'>) => {
    const nextNum = coaches.length + 1;
    const newId = `HLV${String(nextNum).padStart(3, '0')}`;
    const newCoach: Coach = {
      ...coachData,
      id: newId,
      code: newId,
      taughtSessionsMonth: 0,
      taughtHoursMonth: 0,
      totalStudents: 0
    };
    setCoaches(prev => [...prev, newCoach]);
    showToast(`Đã thêm HLV mới: ${newCoach.name} (${newId})`, 'success');
  };

  const editCoach = (id: string, updates: Partial<Coach>) => {
    setCoaches(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Đã cập nhật thông tin HLV!', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Đã đánh dấu đọc tất cả thông báo', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        switchUser,
        switchRole,
        activeTab,
        selectedId,
        navigate,
        facilities,
        courts,
        shifts,
        classes,
        students,
        coaches,
        sessions,
        payments,
        notifications,
        addFacility,
        editFacility,
        deleteFacility,
        addCourt,
        editCourt,
        deleteCourt,
        addShift,
        editShift,
        deleteShift,
        addSession,
        editSession,
        deleteSession,
        saveAttendance,
        saveCoachAttendance,
        addMakeupStudentToSession,
        confirmPayment,
        addPayment,
        collectPaymentAtCourt,
        addStudent,
        editStudent,
        deleteStudent,
        importStudentsFromExcel,
        renewStudentMonth,
        addSessionsToStudent,
        addClass,
        editClass,
        deleteClass,
        addCoach,
        editCoach,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
        isCoach,
        isFacilityManager,
        managedFacilityId,
        assignedClasses,
        assignedStudents,
        assignedSessions,
        assignedCourts,
        attendanceTarget,
        setAttendanceTarget
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

