import React, { createContext, useContext, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_ALL_SESSIONS,
  INITIAL_CLASSES,
  INITIAL_COACHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_STUDENTS,
  INITIAL_USERS
} from '../data/mockData';
import {
  AttendanceRecordItem,
  BadmintonClass,
  Coach,
  NotificationItem,
  PaymentItem,
  SessionSchedule,
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
  
  classes: BadmintonClass[];
  students: Student[];
  coaches: Coach[];
  sessions: SessionSchedule[];
  payments: PaymentItem[];
  notifications: NotificationItem[];
  
  // Attendance actions
  saveAttendance: (sessionId: string, records: AttendanceRecordItem[], classId: string, date: string) => void;
  
  // Payment actions
  confirmPayment: (paymentId: string, method?: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo') => void;
  addPayment: (payment: Omit<PaymentItem, 'id' | 'code'>) => void;
  
  // Student actions
  addStudent: (studentData: Omit<Student, 'id' | 'code'>) => void;
  editStudent: (id: string, updates: Partial<Student>) => void;
  addSessionsToStudent: (studentId: string, extraSessions: number) => void;
  
  // Class actions
  addClass: (classData: Omit<BadmintonClass, 'id' | 'code' | 'currentStudentsCount' | 'studentIds'>) => void;
  editClass: (id: string, updates: Partial<BadmintonClass>) => void;
  
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

  // Filtered views based on coach role
  isCoach: boolean;
  assignedClasses: BadmintonClass[];
  assignedStudents: Student[];
  assignedSessions: SessionSchedule[];
  
  // Quick attendance target
  attendanceTarget: { classId: string; date: string; sessionId?: string } | null;
  setAttendanceTarget: (target: { classId: string; date: string; sessionId?: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
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
      showToast(`Đã chuyển sang vai trò: ${target.name} (${target.role === 'ADMIN' ? 'Admin' : 'Huấn luyện viên'})`, 'info');
    }
  };

  const switchRole = (role: UserRole, coachId?: string) => {
    if (role === 'ADMIN') {
      setCurrentUser(INITIAL_USERS[0]);
      showToast('Đã chuyển sang vai trò: Ban Quản Trị (ADMIN)', 'info');
    } else {
      const targetCoachUser = INITIAL_USERS.find(u => u.coachId === coachId) || INITIAL_USERS[1];
      setCurrentUser(targetCoachUser);
      showToast(`Đã chuyển sang vai trò: HLV ${targetCoachUser.name}`, 'info');
    }
  };

  const isCoach = currentUser.role === 'COACH';

  // Compute coach filtered data
  const assignedClasses = useMemo(() => {
    if (!isCoach || !currentUser.coachId) return classes;
    return classes.filter(c => c.coachId === currentUser.coachId);
  }, [classes, isCoach, currentUser]);

  const assignedStudents = useMemo(() => {
    if (!isCoach || !currentUser.coachId) return students;
    return students.filter(s => s.coachId === currentUser.coachId);
  }, [students, isCoach, currentUser]);

  const assignedSessions = useMemo(() => {
    if (!isCoach || !currentUser.coachId) return sessions;
    return sessions.filter(s => s.coachId === currentUser.coachId);
  }, [sessions, isCoach, currentUser]);

  // Save Attendance Action
  const saveAttendance = (sessionId: string, records: AttendanceRecordItem[], classId: string, date: string) => {
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent' || r.status === 'Excused').length;
    
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

    // Update Students Session Counters
    setStudents(prev =>
      prev.map(student => {
        const studentRecord = records.find(r => r.studentId === student.id);
        if (studentRecord) {
          if (studentRecord.status === 'Present') {
            const newAttended = student.attendedSessions + 1;
            const newRemaining = Math.max(0, student.packageSessions - newAttended);
            const newStatus = newRemaining === 0 ? 'Expired' : student.status;
            return {
              ...student,
              attendedSessions: newAttended,
              remainingSessions: newRemaining,
              status: newStatus,
              lastAttended: date
            };
          }
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
      title: 'Điểm danh thành công',
      message: `Đã lưu điểm danh lớp ${targetClass?.name || classId} ngày ${date} (Có mặt: ${presentCount}, Vắng: ${absentCount}).`,
      time: 'Vừa xong',
      read: false,
      type: 'success',
      linkTo: { tab: 'attendance', id: classId }
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    showToast(`Đã lưu điểm danh thành công! Có mặt: ${presentCount} | Vắng: ${absentCount}`, 'success');
  };

  // Payment confirmation
  const confirmPayment = (paymentId: string, method: 'Chuyển khoản QR' | 'Tiền mặt' | 'Thẻ ngân hàng' | 'Ví MoMo' = 'Chuyển khoản QR') => {
    const todayStr = '28/08/2026';
    let targetStudentId = '';
    let amountStr = '';

    setPayments(prev =>
      prev.map(p => {
        if (p.id === paymentId) {
          targetStudentId = p.studentId;
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
    showToast(`Đã tạo phiếu thu học phí ${newPayment.code} thành công!`, 'success');
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'code'>) => {
    const nextNum = students.length + 1;
    const newId = `HV${String(nextNum).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      code: newId,
      attendedSessions: 0,
      remainingSessions: studentData.packageSessions
    };
    
    setStudents(prev => [newStudent, ...prev]);
    
    // update class student list
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

    showToast(`Đã thêm học viên mới: ${newStudent.name} (${newId})`, 'success');
  };

  const editStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Đã cập nhật thông tin học viên!', 'success');
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
        classes,
        students,
        coaches,
        sessions,
        payments,
        notifications,
        saveAttendance,
        confirmPayment,
        addPayment,
        addStudent,
        editStudent,
        addSessionsToStudent,
        addClass,
        editClass,
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
        assignedClasses,
        assignedStudents,
        assignedSessions,
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
