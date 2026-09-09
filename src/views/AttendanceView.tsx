import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Save,
  CheckCheck,
  ChevronRight,
  Sparkles,
  Users,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  UserPlus,
  Shield,
  Building2,
  Search,
  Plus,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, CoachAttendanceRecord } from '../types';
import { Modal } from '../components/common/Modal';
import { MonthlyAttendanceMatrix } from '../components/attendance/MonthlyAttendanceMatrix';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    facilities,
    coaches,
    sessions,
    saveAttendance,
    saveCoachAttendance,
    saveUnifiedAttendance,
    addMakeupStudentToSession,
    currentUser,
    isCoach,
    isFacilityManager,
    assignedClasses,
    assignedSessions,
    attendanceTarget,
    setAttendanceTarget,
    getDailyClasses,
    showToast
  } = useApp();

  const isAdmin = currentUser.role === 'ADMIN';
  const canManageCoachAttendance = isFacilityManager || isAdmin;

  const [viewTab, setViewTab] = useState<'session' | 'monthly'>('session');

  // Cơ sở mặc định: Quản lý sân -> sân mình quản lý; Admin -> CS đầu tiên hoặc từ target
  const defaultFacilityId = (currentUser.role === 'FACILITY_MANAGER' && currentUser.facilityId)
    ? currentUser.facilityId
    : (currentUser.role === 'COACH' && (currentUser as any).assignedFacilityId)
    ? (currentUser as any).assignedFacilityId
    : (facilities[0]?.id || 'CS01');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(attendanceTarget?.facilityId || defaultFacilityId);
  const [selectedDate, setSelectedDate] = useState<string>(attendanceTarget?.date || '2026-08-28');

  // Đồng bộ cơ sở nếu người dùng là Quản lý sân (không cho đổi sân khác)
  useEffect(() => {
    if (!isAdmin) {
      setSelectedFacilityId(defaultFacilityId);
    }
  }, [currentUser.id, currentUser.role, defaultFacilityId, isAdmin]);

  // Local state cho từng HLV
  const [coachAttendanceStates, setCoachAttendanceStates] = useState<Record<string, {
    status: 'Present' | 'Late' | 'Absent';
    isEditing?: boolean;
  }>>({});

  // Make-up Student Modal State
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [makeupSearchQuery, setMakeupSearchQuery] = useState('');
  const [selectedMakeupStudentId, setSelectedMakeupStudentId] = useState('');
  const [makeupNote, setMakeupNote] = useState('Học bù ca ngày hôm nay');

  // Sync if attendanceTarget changes
  useEffect(() => {
    if (attendanceTarget) {
      if (attendanceTarget.facilityId && isAdmin) {
        setSelectedFacilityId(attendanceTarget.facilityId);
      }
      if (attendanceTarget.date) setSelectedDate(attendanceTarget.date);
    }
  }, [attendanceTarget, isAdmin]);

  // Thông tin cơ sở hiện tại
  const currentFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];
  const currentFacilityName = currentFacility?.name || 'Sân Cầu Lông Cầu Giấy';

  // Danh sách lớp tại cơ sở này
  const facilityClasses = classes.filter(c => c.facilityId === selectedFacilityId);
  const facilityClassIds = facilityClasses.map(c => c.id);

  // Tìm phiên học (session) tương ứng ngày & cơ sở
  const facilitySessions = sessions.filter(
    s => (s.facilityId === selectedFacilityId || facilityClassIds.includes(s.classId)) && s.date === selectedDate
  );
  const targetSession = facilitySessions[0] || sessions.find(s => s.facilityId === selectedFacilityId && s.date === selectedDate);
  const sessionMakeupStudents = targetSession?.makeupStudents || [];

  // Danh sách các ca học thực tế hôm nay tại cơ sở này để lấy ghi chú nhắc nhở từ Quản lý
  const facilityDailyClasses = useMemo(() => {
    return getDailyClasses(selectedFacilityId, selectedDate);
  }, [getDailyClasses, selectedFacilityId, selectedDate]);

  const activeClassNotes = useMemo(() => {
    return facilityDailyClasses
      .filter(c => Boolean(c.preSessionNote))
      .map(c => ({
        classId: c.id,
        shiftName: c.shiftName || c.scheduleDaysText,
        timeSlot: c.timeSlot,
        court: c.court,
        coachName: c.coachName,
        note: c.preSessionNote
      }));
  }, [facilityDailyClasses]);

  // Thứ trong tuần theo ngày được chọn
  const dayOfWeekMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const selectedDayOfWeek = dayOfWeekMap[new Date(selectedDate).getDay()];

  // Danh sách HLV tại cơ sở trong ngày được chọn (điểm danh & duyệt từng HLV riêng biệt)
  const facilityCoachItems = useMemo(() => {
    const items: Array<{
      key: string;
      sessionId: string;
      coachId: string;
      coachName: string;
      coachAvatar?: string;
      coachPhone?: string;
      classId?: string;
      className?: string;
      timeSlot?: string;
      court?: string;
      session?: any;
      isAttended: boolean;
      attendanceRecord?: CoachAttendanceRecord;
    }> = [];

    const seenCoachClassPairs = new Set<string>();

    // 1. Từ các ca học (sessions) thực tế tại cơ sở trong ngày
    facilitySessions.forEach(s => {
      const coachObj = coaches.find(c => c.id === s.coachId || c.name === s.coachName);
      const coachId = s.coachId || coachObj?.id || 'HLV001';
      const coachName = s.coachName || coachObj?.name || 'Huấn luyện viên';
      const pairKey = `${coachId}_${s.classId || s.id}`;

      seenCoachClassPairs.add(pairKey);
      items.push({
        key: `sess_${s.id}`,
        sessionId: s.id,
        coachId,
        coachName,
        coachAvatar: s.coachAvatar || coachObj?.avatar,
        coachPhone: coachObj?.phone,
        classId: s.classId,
        className: s.className,
        timeSlot: s.timeSlot || `${s.startTime} - ${s.endTime}`,
        court: s.court || 'Sân 01',
        session: s,
        isAttended: Boolean(s.coachAttendanceDone),
        attendanceRecord: s.coachAttendance
      });
    });

    // 2. Từ các lớp học tại cơ sở có lịch vào thứ này mà chưa có session trong facilitySessions
    facilityClasses.forEach(fc => {
      if (fc.scheduleDays && fc.scheduleDays.includes(selectedDayOfWeek)) {
        const coachObj = coaches.find(c => c.id === fc.coachId || c.name === fc.coachName);
        const coachId = fc.coachId || coachObj?.id || 'HLV001';
        const coachName = fc.coachName || coachObj?.name || 'Huấn luyện viên';
        const pairKey = `${coachId}_${fc.id}`;

        if (!seenCoachClassPairs.has(pairKey)) {
          seenCoachClassPairs.add(pairKey);
          const virtualSessionId = `sess-${selectedFacilityId}-${fc.id}-${selectedDate}`;
          const existingSession = sessions.find(s => s.id === virtualSessionId);

          items.push({
            key: `cls_${fc.id}`,
            sessionId: virtualSessionId,
            coachId,
            coachName,
            coachAvatar: fc.coachAvatar || coachObj?.avatar,
            coachPhone: coachObj?.phone,
            classId: fc.id,
            className: fc.name,
            timeSlot: fc.timeSlot || '18:00 - 19:30',
            court: 'Sân cơ sở',
            session: existingSession,
            isAttended: Boolean(existingSession?.coachAttendanceDone),
            attendanceRecord: existingSession?.coachAttendance
          });
        }
      }
    });

    // 3. Nếu chưa có lớp nào vào thứ này, lấy danh sách HLV được gán cơ sở này
    if (items.length === 0) {
      const facilityAssignedCoaches = coaches.filter(c => c.assignedFacilityId === selectedFacilityId);
      facilityAssignedCoaches.forEach(c => {
        const virtualSessionId = `sess-${selectedFacilityId}-${c.id}-${selectedDate}`;
        const existingSession = sessions.find(s => s.id === virtualSessionId);
        items.push({
          key: `coach_${c.id}`,
          sessionId: virtualSessionId,
          coachId: c.id,
          coachName: c.name,
          coachAvatar: c.avatar,
          coachPhone: c.phone,
          classId: c.assignedClassIds?.[0],
          className: 'Lớp tại cơ sở',
          timeSlot: c.assignedShiftName || 'Ca dạy tại sân',
          court: 'Sân cơ sở',
          session: existingSession,
          isAttended: Boolean(existingSession?.coachAttendanceDone),
          attendanceRecord: existingSession?.coachAttendance
        });
      });
    }

    // 4. Nếu là role HLV (COACH), chỉ lọc hiển thị đúng bản thân HLV đó
    if (isCoach) {
      const coachId = currentUser.coachId || currentUser.id;
      return items.filter(it => it.coachId === coachId || it.coachName === currentUser.name);
    }

    return items;
  }, [facilitySessions, facilityClasses, coaches, selectedDayOfWeek, selectedFacilityId, selectedDate, sessions, isCoach, currentUser]);

  const classStudents = students.filter(student => {
    // 1. Nếu học viên có lịch học chi tiết từng buổi theo ngày & cơ sở & ca (scheduledSessions)
    if (student.scheduledSessions && student.scheduledSessions.length > 0) {
      const todaySession = student.scheduledSessions.find(s => s.date === selectedDate);
      if (!todaySession) return false; // Không có lịch học vào ngày đang chọn
      if (todaySession.facilityId !== selectedFacilityId) return false; // Không học ở cơ sở đang chọn vào ngày hôm nay

      // Nếu là HLV, chỉ lọc học viên lớp mình phụ trách
      if (isCoach && assignedClasses.length > 0) {
        const isAssigned = assignedClasses.some(ac => ac.id === student.classId) || student.coachId === currentUser.coachId;
        if (!isAssigned) return false;
      }

      return true;
    }

    const isSameFacility =
      student.facilityId === selectedFacilityId ||
      facilityClassIds.includes(student.classId) ||
      (!student.facilityId && selectedFacilityId === 'CS01');
    if (!isSameFacility) return false;

    // Nếu là HLV, chỉ lọc học viên lớp mình phụ trách
    if (isCoach && assignedClasses.length > 0) {
      const isAssigned = assignedClasses.some(ac => ac.id === student.classId) || student.coachId === currentUser.coachId;
      if (!isAssigned) return false;
    }

    // Nếu học viên có ngày học cụ thể
    if (student.specificDates && student.specificDates.length > 0) {
      return student.specificDates.includes(selectedDate);
    }
    // Nếu học viên có lịch học cố định theo thứ
    if (student.fixedDays && student.fixedDays.length > 0) {
      return student.fixedDays.includes(selectedDayOfWeek);
    }
    // Hoặc theo lịch lớp
    const studentClass = classes.find(c => c.id === student.classId);
    if (studentClass && studentClass.scheduleDays && studentClass.scheduleDays.length > 0) {
      return studentClass.scheduleDays.includes(selectedDayOfWeek);
    }
    // Hoặc đã có trong bản ghi điểm danh ca này
    if (targetSession && targetSession.attendanceRecords?.some(r => r.studentId === student.id)) {
      return true;
    }
    return student.status === 'Studying';
  });

  // Check if student attendance is already completed by coach (or completed in general)
  const isStudentAttendanceDone = Boolean(targetSession?.attendanceDone);
  const isAttendedByCoach = Boolean(targetSession?.attendanceDone && (targetSession.attendedByRole === 'COACH' || !targetSession.attendedByRole));

  // Local state for attendance choices: { [studentId]: 'Present' | 'Excused' | 'Absent' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Initialize attendance state when facility or date changes
  useEffect(() => {
    const initialMap: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    // 1. Regular class students
    if (targetSession && targetSession.attendanceRecords && targetSession.attendanceRecords.length > 0) {
      targetSession.attendanceRecords.forEach(rec => {
        const student = students.find(s => s.id === rec.studentId);
        const allowed = student ? (student.allowedLeaves ?? Math.floor(student.packageSessions / 4)) : 3;
        const used = student?.usedLeaves || 0;
        // If out of leaves, cannot be Excused -> convert to Absent
        if (rec.status === 'Excused' && used >= allowed) {
          initialMap[rec.studentId] = 'Absent';
        } else {
          initialMap[rec.studentId] = rec.status;
        }
        if (rec.note) initialNotes[rec.studentId] = rec.note;
      });
    } else {
      classStudents.forEach(st => {
        initialMap[st.id] = 'Present';
      });
    }

    // 2. Make-up students in session
    if (targetSession && targetSession.makeupStudents) {
      targetSession.makeupStudents.forEach(m => {
        const student = students.find(s => s.id === m.studentId);
        const allowed = student ? (student.allowedLeaves ?? Math.floor(student.packageSessions / 4)) : 3;
        const used = student?.usedLeaves || 0;
        const rawStatus = m.status || 'Present';
        if (!initialMap[m.studentId]) {
          initialMap[m.studentId] = rawStatus === 'Excused' && used >= allowed ? 'Absent' : rawStatus;
        }
        if (m.note && !initialNotes[m.studentId]) {
          initialNotes[m.studentId] = m.note;
        }
      });
    }

    setAttendanceMap(initialMap);
    setNotesMap(initialNotes);
  }, [selectedFacilityId, selectedDate, targetSession?.id, targetSession?.makeupStudents?.length]);

  // Đồng bộ trạng thái chấm công cho từng HLV
  useEffect(() => {
    setCoachAttendanceStates(prev => {
      const next = { ...prev };
      facilityCoachItems.forEach(item => {
        const rec = item.attendanceRecord;
        if (!next[item.key]) {
          next[item.key] = {
            status: (rec?.status === 'Substituted' ? 'Present' : rec?.status) || 'Present',
            isEditing: false
          };
        } else if (item.isAttended && rec && !next[item.key].isEditing) {
          next[item.key] = {
            status: (rec.status === 'Substituted' ? 'Present' : rec.status) || 'Present',
            isEditing: false
          };
        }
      });
      return next;
    });
  }, [facilityCoachItems]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    // If facility manager and attendance is already completed by coach, lock changes
    if (isFacilityManager && isStudentAttendanceDone) {
      showToast('Giáo viên đã điểm danh học viên cho ca này rồi. Quản lý sân không cần điểm danh lại!', 'info');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (student) {
      const allowedLeaves = student.allowedLeaves ?? Math.floor(student.packageSessions / 4);
      const usedLeaves = student.usedLeaves || 0;
      const isOutOfLeaves = usedLeaves >= allowedLeaves;

      // RULE: nếu hết phép thì chỉ có thể chuyển thành vắng, không thể chuyển sang có phép được
      if (status === 'Excused' && isOutOfLeaves) {
        showToast(
          `Học viên ${student.name} đã hết số buổi phép tháng (${usedLeaves}/${allowedLeaves} phép). Chỉ có thể chuyển thành VẮNG!`,
          'warning'
        );
        setAttendanceMap(prev => ({
          ...prev,
          [studentId]: 'Absent'
        }));
        return;
      }
    }

    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (isFacilityManager && isStudentAttendanceDone) return;
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(st => {
      const allowedLeaves = st.allowedLeaves ?? Math.floor(st.packageSessions / 4);
      const isOutOfLeaves = (st.usedLeaves || 0) >= allowedLeaves;
      if (status === 'Excused' && isOutOfLeaves) {
        updated[st.id] = 'Absent';
      } else {
        updated[st.id] = status;
      }
    });
    sessionMakeupStudents.forEach(m => {
      const st = students.find(s => s.id === m.studentId);
      const allowedLeaves = st ? (st.allowedLeaves ?? Math.floor(st.packageSessions / 4)) : 3;
      const isOutOfLeaves = st ? (st.usedLeaves || 0) >= allowedLeaves : false;
      if (status === 'Excused' && isOutOfLeaves) {
        updated[m.studentId] = 'Absent';
      } else {
        updated[m.studentId] = status;
      }
    });
    setAttendanceMap(updated);
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const excusedCount = Object.values(attendanceMap).filter(s => s === 'Excused').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'Absent').length;

  const isAllCoachesAttended = facilityCoachItems.length > 0 && facilityCoachItems.every(c => c.isAttended);
  const isEverythingAttended = isStudentAttendanceDone && (facilityCoachItems.length === 0 || isAllCoachesAttended);

  // Handler DUY NHẤT duyệt điểm danh cho TẤT CẢ học viên & Huấn luyện viên
  const handleApproveAllStudentsAndCoaches = () => {
    const effectiveClassId = targetSession?.classId || facilityClassIds[0] || 'BD-B01';
    const sessionId = targetSession ? targetSession.id : `sess-${selectedFacilityId}-${selectedDate}`;

    // 1. Lưu điểm danh học viên chính thức
    const regularRecords = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: attendanceMap[student.id] || 'Present',
      note: notesMap[student.id] || ''
    }));

    // 2. Lưu điểm danh học viên học bù
    const makeupRecords = sessionMakeupStudents.map(m => ({
      studentId: m.studentId,
      studentName: m.studentName,
      status: attendanceMap[m.studentId] || m.status || 'Present',
      isMakeup: true,
      makeupFromClass: m.makeupFromClass,
      note: notesMap[m.studentId] || m.note || 'Học bù'
    }));

    // 3. Danh sách HLV cần duyệt (dành cho Admin & Quản lý sân)
    const coachRecordsToSave = canManageCoachAttendance
      ? facilityCoachItems.map(item => {
          const itemState = coachAttendanceStates[item.key] || {
            status: (item.attendanceRecord?.status === 'Substituted' ? 'Present' : item.attendanceRecord?.status) || 'Present'
          };
          return {
            sessionId: item.sessionId,
            coachId: item.coachId,
            coachName: item.coachName,
            status: itemState.status,
            meta: {
              coachId: item.coachId,
              coachName: item.coachName,
              coachAvatar: item.coachAvatar,
              classId: item.classId,
              className: item.className,
              facilityId: selectedFacilityId,
              facilityName: currentFacilityName,
              date: selectedDate,
              timeSlot: item.timeSlot,
              court: item.court
            }
          };
        })
      : [];

    saveUnifiedAttendance({
      sessionId,
      records: [...regularRecords, ...makeupRecords],
      classId: effectiveClassId,
      date: selectedDate,
      coachRecords: coachRecordsToSave
    });

    // Đóng toàn bộ form sửa HLV nếu đang mở
    setCoachAttendanceStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], isEditing: false };
      });
      return next;
    });
  };

  const handleSaveAttendance = handleApproveAllStudentsAndCoaches;

  const handleAddMakeupConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMakeupStudentId) return;

    const targetStudent = students.find(s => s.id === selectedMakeupStudentId);
    if (!targetStudent) return;

    const sessionId = targetSession ? targetSession.id : `sess-${selectedFacilityId}-${selectedDate}`;
    addMakeupStudentToSession(sessionId, targetStudent, makeupNote);

    setAttendanceMap(prev => ({
      ...prev,
      [targetStudent.id]: 'Present'
    }));

    setIsMakeupModalOpen(false);
    setSelectedMakeupStudentId('');
    setMakeupNote('Học bù ca ngày hôm nay');
  };

  return (
    <div className={`space-y-6 mx-auto pb-24 md:pb-12 ${viewTab === 'monthly' ? 'max-w-7xl' : 'max-w-5xl'}`}>
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Điểm danh thực tế ca tập — Áp dụng quy luật 4 buổi = 1 phép</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Điểm Danh Học Viên & Huấn Luyện Viên
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ghi nhận chuyên cần, chấm công HLV và tiếp nhận học viên học bù tại sân
          </p>
        </div>

        {/* Action Buttons (Session Mode) */}
        {viewTab === 'session' && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            {!isCoach && !(isFacilityManager && isStudentAttendanceDone) && (
              <button
                onClick={() => setIsMakeupModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>THÊM HỌC BÙ</span>
              </button>
            )}

            <button
              onClick={handleApproveAllStudentsAndCoaches}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span>
                {isEverythingAttended
                  ? (canManageCoachAttendance ? 'CẬP NHẬT DUYỆT TẤT CẢ (HỌC VIÊN & HLV)' : 'CẬP NHẬT ĐIỂM DANH HỌC VIÊN')
                  : (canManageCoachAttendance ? 'DUYỆT ĐIỂM DANH TẤT CẢ HỌC VIÊN & HLV' : 'DUYỆT ĐIỂM DANH HỌC VIÊN')}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-fit">
        <button
          onClick={() => setViewTab('session')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewTab === 'session'
              ? 'bg-white text-[#0F172A] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📋 Điểm Danh Ca Học</span>
        </button>
        <button
          onClick={() => setViewTab('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            viewTab === 'monthly'
              ? 'bg-[#10B981] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Ma Trận Tháng (31 Ngày)</span>
          <span className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">
            Excel
          </span>
        </button>
      </div>

      {viewTab === 'monthly' ? (
        <MonthlyAttendanceMatrix />
      ) : (
        <>

      {/* Date & Facility Selection Bar - Chỉ gồm Chọn ngày điểm danh và Cơ sở */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Chọn ngày điểm danh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Ngày điểm danh</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm font-bold text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all cursor-pointer"
            />
          </div>

          {/* 2. Chọn cơ sở (Admin mới có quyền chọn cơ sở, Quản lý sân mặc định sân mình quản lý) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Cơ sở / Sân cầu lông</span>
            </label>
            {isAdmin ? (
              <select
                value={selectedFacilityId}
                onChange={e => {
                  setSelectedFacilityId(e.target.value);
                  setAttendanceTarget(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 text-sm font-bold text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all cursor-pointer"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2.5 bg-slate-100/90 text-sm font-bold text-[#0F172A] rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="truncate">{currentFacilityName}</span>
                <span className="shrink-0 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Sân quản lý
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Attendance Stats Counter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thống kê ca:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Có mặt: {presentCount} / {classStudents.length + sessionMakeupStudents.length}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                Có phép: {excusedCount}
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                Vắng: {absentCount}
              </span>
              {sessionMakeupStudents.length > 0 && (
                <span className="px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                  Học bù: +{sessionMakeupStudents.length}
                </span>
              )}
            </div>
          </div>

          {/* Quick Mark All Buttons for Students */}
          {!(isFacilityManager && isStudentAttendanceDone) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll('Present')}
                className="text-xs font-bold text-[#10B981] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                ✓ Tất cả học viên có mặt
              </button>
              <button
                onClick={() => handleMarkAll('Absent')}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Đặt lại học viên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Notes from Management for Coaches on this date */}
      {activeClassNotes.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-3 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-950 font-black text-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <span>Dặn Dò & Nhắc Nhở Từ Quản Lý Cho Ca Dạy Hôm Nay</span>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
              Dành riêng cho HLV
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeClassNotes.map(item => (
              <div
                key={item.classId}
                className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#0F172A]">
                    {item.shiftName} ({item.timeSlot})
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {item.coachName}
                  </span>
                </div>
                <div className="text-xs text-amber-950 font-semibold p-2.5 bg-amber-50/90 rounded-xl border border-amber-200/80 leading-relaxed">
                  "{item.note}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Attendance Section */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>Điểm danh & Chấm Công Giáo Viên</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                  Duyệt cùng học viên
                </span>
              </div>
              <div className="text-base font-extrabold text-[#0F172A] mt-0.5">
                {isCoach
                  ? 'Trạng thái chấm công ca dạy của bạn'
                  : `Danh sách HLV phụ trách tại ${currentFacilityName} (${facilityCoachItems.length} HLV)`}
              </div>
            </div>
          </div>

          {/* Progress Counter for Facility Manager & Admin */}
          {!isCoach && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Tiến độ duyệt:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                facilityCoachItems.length > 0 && facilityCoachItems.every(c => c.isAttended)
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {facilityCoachItems.filter(c => c.isAttended).length} / {facilityCoachItems.length} HLV đã duyệt
              </span>
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800">
              Duyệt điểm danh đồng thời: <strong>Một nút bấm duyệt cho toàn bộ học viên và tất cả Huấn luyện viên</strong>.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isCoach
                ? 'Huấn luyện viên xem trạng thái ca dạy của mình. Điểm danh và chấm công do Quản lý sân hoặc Admin xác nhận.'
                : 'Mặc định các HLV được chọn "Có mặt". Nếu có HLV đi muộn hoặc vắng, Quản lý sân / Admin chọn trạng thái tương ứng rồi bấm "Duyệt Điểm Danh Tất Cả Học Viên & HLV".'}
            </p>
          </div>
        </div>

        {/* Individual Coach Cards List */}
        <div className="space-y-3">
          {facilityCoachItems.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Không có Huấn luyện viên nào có lịch dạy tại cơ sở vào ngày này.
            </div>
          ) : (
            facilityCoachItems.map(item => {
              const itemState = coachAttendanceStates[item.key] || {
                status: (item.attendanceRecord?.status === 'Substituted' ? 'Present' : item.attendanceRecord?.status) || 'Present',
                isEditing: false
              };
              const isAttended = item.isAttended;
              const rec = item.attendanceRecord;

              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAttended
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-white border-indigo-100 shadow-2xs'
                  }`}
                >
                  {/* Coach Info Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.coachAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={item.coachName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-50 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-[#0F172A]">
                            {item.coachName}
                          </span>
                          {item.coachPhone && (
                            <span className="text-[11px] text-slate-400">
                              ({item.coachPhone})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {item.className || 'Ca tập cơ sở'}
                          </span>
                          <span>•</span>
                          <span>{item.timeSlot}</span>
                          <span>•</span>
                          <span>{item.court}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isAttended ? (
                        <>
                          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                            rec?.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : rec?.status === 'Late'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {rec?.status === 'Present' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {rec?.status === 'Late' && <Clock className="w-4 h-4 text-amber-600" />}
                            {rec?.status === 'Absent' && <XCircle className="w-4 h-4 text-rose-600" />}
                            <span>
                              {rec?.status === 'Present'
                                ? 'ĐÃ DUYỆT: CÓ MẶT'
                                : rec?.status === 'Late'
                                ? 'ĐÃ DUYỆT: ĐI MUỘN'
                                : 'ĐÃ DUYỆT: VẮNG MẶT'}
                            </span>
                          </div>

                          {!isCoach && (
                            <button
                              type="button"
                              onClick={() => {
                                setCoachAttendanceStates(prev => ({
                                  ...prev,
                                  [item.key]: {
                                    ...itemState,
                                    isEditing: !itemState.isEditing
                                  }
                                }));
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl transition-colors cursor-pointer"
                            >
                              {itemState.isEditing ? 'Đóng' : 'Sửa'}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Chờ duyệt chung cùng học viên</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Details (if already attended and not editing) */}
                  {isAttended && !itemState.isEditing && (
                    <div className="pt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Duyệt bởi <strong>{rec?.checkedBy || 'Quản lý sân'}</strong> ({rec?.checkedByRole === 'ADMIN' ? 'Admin' : 'Quản lý sân'}) lúc {rec?.checkedAt}
                      </span>
                    </div>
                  )}

                  {/* Controls for Facility Manager & Admin */}
                  {!isCoach && (!isAttended || itemState.isEditing) && (
                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="grid grid-cols-3 gap-2 sm:w-auto w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setCoachAttendanceStates(prev => ({
                              ...prev,
                              [item.key]: {
                                ...itemState,
                                status: 'Present'
                              }
                            }));
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            itemState.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Có mặt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoachAttendanceStates(prev => ({
                              ...prev,
                              [item.key]: {
                                ...itemState,
                                status: 'Late'
                              }
                            }));
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            itemState.status === 'Late'
                              ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-500'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Đi muộn</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCoachAttendanceStates(prev => ({
                              ...prev,
                              [item.key]: {
                                ...itemState,
                                status: 'Absent'
                              }
                            }));
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            itemState.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-2xs ring-2 ring-rose-600'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Vắng mặt</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Roster of Regular Class Students */}
      <div className="space-y-3">
        {/* Banner for Facility Manager when students are already attended by coach */}
        {isFacilityManager && isStudentAttendanceDone && (
          <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-3xl flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-emerald-950">
                  Giáo viên đã điểm danh học viên hoàn tất
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                  ✓ Quản lý sân không cần điểm danh lại
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Ca học này đã được <strong>{targetSession?.attendedBy || targetSession?.coachName || 'Giáo viên'}</strong> điểm danh học viên vào lúc <strong>{targetSession?.attendedAt || 'trước đó'}</strong>. Dữ liệu chuyên cần của học viên đã được ghi nhận đầy đủ.
              </p>
              <div className="text-[11px] text-emerald-900/80 font-medium pt-0.5">
                👉 Quản lý sân chỉ cần thực hiện <strong>chấm công / điểm danh cho Huấn luyện viên dạy ca này</strong> ở thẻ phía trên.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <span>Danh Sách Học Viên Tại Cơ Sở ({classStudents.length})</span>
            {isFacilityManager && isStudentAttendanceDone && (
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200 normal-case tracking-normal">
                ✓ Đã chốt bởi GV (Chế độ xem)
              </span>
            )}
          </h2>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
            Chưa có học viên nào tại cơ sở này trong ngày đã chọn.
          </div>
        ) : (
          classStudents.map((student, index) => {
            const currentStatus = attendanceMap[student.id] || 'Present';
            const isWarning = student.remainingSessions <= 2 && student.remainingSessions > 0;
            const isExpired = student.remainingSessions === 0;
            const allowedLeaves = student.allowedLeaves ?? Math.floor(student.packageSessions / 4);
            const isOutOfLeaves = (student.usedLeaves || 0) >= allowedLeaves;
            const todaySession = student.scheduledSessions?.find(s => s.date === selectedDate);

            return (
              <div
                key={student.id}
                className={`p-4 sm:p-5 bg-white rounded-3xl border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  currentStatus === 'Present'
                    ? 'border-emerald-200 ring-2 ring-[#10B981]/15'
                    : currentStatus === 'Excused'
                    ? 'border-amber-200 ring-2 ring-amber-500/15'
                    : 'border-rose-200 ring-2 ring-rose-500/15'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-7 text-center font-bold text-slate-400 text-xs shrink-0">
                    #{index + 1}
                  </div>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#0F172A] text-base">{student.name}</h3>
                      <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {student.code}
                      </span>
                      {student.className && (
                        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {student.className}
                        </span>
                      )}
                      {student.facilityName?.startsWith('Đa cơ sở') && (
                        <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Đa cơ sở
                        </span>
                      )}
                      {todaySession && (
                        <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                          ⏰ {todaySession.shiftName}{todaySession.timeSlot ? ` (${todaySession.timeSlot})` : ''}
                        </span>
                      )}
                      {student.carriedOverSessions && student.carriedOverSessions > 0 ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          +{student.carriedOverSessions} bảo lưu
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>{student.phone}</span>
                      <span>•</span>
                      <span
                        className={`font-bold ${
                          isExpired
                            ? 'text-rose-600'
                            : isWarning
                            ? 'text-amber-700'
                            : 'text-[#10B981]'
                        }`}
                      >
                        Còn {student.remainingSessions} / {student.packageSessions} buổi
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">
                        Phép: <strong className="text-amber-700">{student.usedLeaves || 0}/{allowedLeaves}</strong>
                      </span>

                      {isOutOfLeaves && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          Hết phép (vắng sẽ trừ buổi)
                        </span>
                      )}
                      {isWarning && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Sắp hết buổi
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          Hết buổi!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3 Large Touch Buttons (CÓ MẶT / CÓ PHÉP / VẮNG) */}
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    disabled={isFacilityManager && isStudentAttendanceDone}
                    onClick={() => handleStatusChange(student.id, 'Present')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Present'
                        ? 'bg-[#10B981] text-white shadow-md shadow-emerald-900/20 ring-2 ring-[#10B981]'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CÓ MẶT</span>
                  </button>

                  <button
                    type="button"
                    disabled={(isFacilityManager && isStudentAttendanceDone) || isOutOfLeaves}
                    onClick={() => {
                      if (isOutOfLeaves) {
                        showToast(
                          `Học viên ${student.name} đã hết số buổi phép tháng (${student.usedLeaves || 0}/${allowedLeaves} phép). Chỉ có thể chuyển thành VẮNG!`,
                          'warning'
                        );
                        handleStatusChange(student.id, 'Absent');
                        return;
                      }
                      handleStatusChange(student.id, 'Excused');
                    }}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isOutOfLeaves
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-300 opacity-60'
                        : isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Excused'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500'
                        : !isOutOfLeaves
                        ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        : ''
                    }`}
                    title={isOutOfLeaves ? 'Học viên đã hết phép tháng, không thể chuyển sang Có phép (chỉ có thể chọn Vắng)' : 'Nghỉ có phép'}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{isOutOfLeaves ? 'HẾT PHÉP' : 'CÓ PHÉP'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isFacilityManager && isStudentAttendanceDone}
                    onClick={() => handleStatusChange(student.id, 'Absent')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>VẮNG</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Roster of Make-up Students (Học Bù) */}
      {sessionMakeupStudents.length > 0 && (
        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Học Viên Học Bù Tại Ca Này ({sessionMakeupStudents.length})</span>
            </h2>
          </div>

          {sessionMakeupStudents.map((makeup, index) => {
            const currentStatus = attendanceMap[makeup.studentId] || 'Present';
            const fullStudent = students.find(s => s.id === makeup.studentId);
            const mAllowedLeaves = fullStudent ? (fullStudent.allowedLeaves ?? Math.floor((fullStudent.packageSessions || 12) / 4)) : 3;
            const mUsedLeaves = fullStudent?.usedLeaves || 0;
            const mOutOfLeaves = fullStudent ? mUsedLeaves >= mAllowedLeaves : false;

            return (
              <div
                key={makeup.studentId}
                className="p-4 sm:p-5 bg-amber-50/50 rounded-3xl border border-amber-200 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 text-center font-bold text-amber-700 text-xs shrink-0">
                    Bù #{index + 1}
                  </div>
                  <img
                    src={makeup.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                    alt={makeup.studentName}
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[#0F172A] text-base">{makeup.studentName}</h3>
                      <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md uppercase">
                        Học Bù
                      </span>
                      {makeup.makeupFromClass && (
                        <span className="text-xs text-amber-900 font-semibold">
                          (Lớp gốc: {makeup.makeupFromClass})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-amber-800/80 mt-1 flex-wrap">
                      <span>{makeup.studentPhone}</span>
                      <span>•</span>
                      <span className="italic">Ghi chú: {makeup.note || 'Học bù ca tập'}</span>
                      {fullStudent && (
                        <>
                          <span>•</span>
                          <span className={mOutOfLeaves ? 'text-rose-600 font-bold' : 'text-amber-900'}>
                            Phép: {mUsedLeaves}/{mAllowedLeaves} {mOutOfLeaves && '(Hết phép)'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    disabled={isFacilityManager && isStudentAttendanceDone}
                    onClick={() => handleStatusChange(makeup.studentId, 'Present')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Present'
                        ? 'bg-[#10B981] text-white shadow-md ring-2 ring-[#10B981]'
                        : 'bg-white text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CÓ MẶT</span>
                  </button>

                  <button
                    type="button"
                    disabled={isFacilityManager && isStudentAttendanceDone}
                    onClick={() => handleStatusChange(makeup.studentId, 'Excused')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      mOutOfLeaves
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-dashed border-slate-300 opacity-60'
                        : isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Excused'
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500'
                        : !mOutOfLeaves
                        ? 'bg-white text-slate-400 hover:bg-slate-100'
                        : ''
                    }`}
                    title={mOutOfLeaves ? 'Học viên đã hết phép tháng, không thể chuyển sang Có phép (chỉ có thể chọn Vắng)' : 'Nghỉ có phép'}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{mOutOfLeaves ? 'HẾT PHÉP' : 'CÓ PHÉP'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isFacilityManager && isStudentAttendanceDone}
                    onClick={() => handleStatusChange(makeup.studentId, 'Absent')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isFacilityManager && isStudentAttendanceDone
                        ? 'cursor-default'
                        : 'active:scale-95 cursor-pointer'
                    } ${
                      currentStatus === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600'
                        : 'bg-white text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>VẮNG</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Floating Bottom Bar on Mobile for Instant 1-tap Save */}
      <div className="fixed bottom-16 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 sm:hidden flex items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-slate-400 block font-semibold">Tiến độ ca:</span>
          <span className="text-[#10B981] font-bold text-sm">
            {presentCount}/{classStudents.length + sessionMakeupStudents.length} HV
          </span>
        </div>
        <button
          onClick={handleApproveAllStudentsAndCoaches}
          className="flex-1 py-2.5 px-4 bg-[#10B981] active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>
            {isEverythingAttended
              ? (canManageCoachAttendance ? 'CẬP NHẬT TẤT CẢ' : 'CẬP NHẬT HỌC VIÊN')
              : (canManageCoachAttendance ? 'DUYỆT TẤT CẢ (HV & HLV)' : 'DUYỆT HỌC VIÊN')}
          </span>
        </button>
      </div>
        </>
      )}

      {/* Make-up Student Selection Modal */}
      <Modal
        isOpen={isMakeupModalOpen}
        onClose={() => setIsMakeupModalOpen(false)}
        title="Thêm Học Viên Học Bù Vào Ca Tập"
        subtitle={`Điểm danh ngày ${selectedDate} • ${currentFacilityName}`}
      >
        <form onSubmit={handleAddMakeupConfirm} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={makeupSearchQuery}
              onChange={e => setMakeupSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc mã học viên..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn học viên muốn học bù *
            </label>
            <div className="max-h-48 overflow-y-auto no-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100">
              {students
                .filter(s => {
                  const isNotInCurrentList = !classStudents.some(cs => cs.id === s.id);
                  const notInMakeup = !sessionMakeupStudents.some(m => m.studentId === s.id);
                  const matches =
                    s.name.toLowerCase().includes(makeupSearchQuery.toLowerCase()) ||
                    s.code.toLowerCase().includes(makeupSearchQuery.toLowerCase()) ||
                    s.phone.includes(makeupSearchQuery);
                  return isNotInCurrentList && notInMakeup && matches;
                })
                .slice(0, 15)
                .map(st => {
                  const isSelected = selectedMakeupStudentId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedMakeupStudentId(st.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">{st.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {st.code} • Lớp gốc: {st.className} • Còn {st.remainingSessions} buổi
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="selectedMakeup"
                        checked={isSelected}
                        onChange={() => setSelectedMakeupStudentId(st.id)}
                        className="text-amber-500"
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lý do / Ghi chú học bù
            </label>
            <input
              type="text"
              value={makeupNote}
              onChange={e => setMakeupNote(e.target.value)}
              placeholder="VD: Học bù ca thứ 4 tuần trước nghỉ phép có báo..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMakeupModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!selectedMakeupStudentId}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Thêm Vào Ca Học Này
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
