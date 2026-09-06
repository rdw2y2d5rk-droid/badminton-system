import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Filter,
  CheckSquare,
  Flame,
  Plus,
  Building2,
  AlertTriangle,
  Layers,
  Trash2,
  CheckCircle2,
  BellRing,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SessionStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SessionSchedule } from '../types';

export const ScheduleView: React.FC = () => {
  const {
    sessions,
    classes,
    coaches,
    facilities,
    shifts,
    students,
    confirmStudentSchedule,
    rejectStudentSchedule,
    addSession,
    editSession,
    deleteSession,
    registerCoachSession,
    claimSessionForCoach,
    navigate,
    setAttendanceTarget,
    isCoach,
    isFacilityManager,
    currentUser,
    assignedSessions
  } = useApp();

  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly');
  const canManageCoachAttendance = isFacilityManager || currentUser.role === 'ADMIN';
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');

  // Pending approval students
  const pendingStudents = students.filter(s => s.scheduleStatus === 'pending_admin');

  // Admin Scheduling Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [modalFacilityId, setModalFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [modalShiftId, setModalShiftId] = useState('CA04');
  const [modalClassId, setModalClassId] = useState(classes[0]?.id || 'BD-B01');
  const [modalCoachId, setModalCoachId] = useState('HLV001');
  const [modalDate, setModalDate] = useState('2026-08-28');

  // Coach Self-Registration Modal
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachDate, setCoachDate] = useState(() => {
    const today = new Date();
    if (today.getHours() >= 18) {
      today.setDate(today.getDate() + 1);
    }
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Days of week for grid
  const weekDays = [
    { day: 'Thứ Hai', date: '2026-08-24', dayNum: '24' },
    { day: 'Thứ Ba', date: '2026-08-25', dayNum: '25' },
    { day: 'Thứ Tư', date: '2026-08-26', dayNum: '26' },
    { day: 'Thứ Năm', date: '2026-08-27', dayNum: '27' },
    { day: 'Thứ Sáu', date: '2026-08-28', dayNum: '28', isToday: true },
    { day: 'Thứ Bảy', date: '2026-08-29', dayNum: '29' },
    { day: 'Chủ Nhật', date: '2026-08-30', dayNum: '30' }
  ];

  // Phân quyền dữ liệu lịch dạy:
  // - HLV: Chỉ được phép nhìn lịch dạy của mình, không được phép nhìn lịch dạy của người khác
  // - Quản lý sân: Nhìn được hết tất cả ca dạy tại sân của mình
  // - Admin: Nhìn được hết toàn bộ hệ thống
  const displaySessions = isCoach
    ? assignedSessions
    : isFacilityManager
    ? sessions.filter(
        s =>
          s.facilityId === (currentUser.facilityId || 'CS01') ||
          (!s.facilityId && (currentUser.facilityId === 'CS01' || !currentUser.facilityId)) ||
          s.facilityName === (currentUser.facilityName || 'Sân Cầu Lông Cầu Giấy')
      )
    : sessions;

  // Danh sách HLV khả dụng để lọc:
  // - Admin: Tất cả HLV
  // - Quản lý sân: Chỉ các HLV dạy tại sân của mình
  // - HLV: Ẩn bộ lọc HLV vì chỉ xem lịch của mình
  const availableCoaches = currentUser.role === 'ADMIN'
    ? coaches
    : coaches.filter(
        c =>
          c.assignedFacilityId === (currentUser.facilityId || 'CS01') ||
          displaySessions.some(s => s.coachId === c.id || s.coachName === c.name)
      );

  const filteredSessions = displaySessions.filter(session => {
    const matchesFacility =
      selectedFacility === 'ALL' ||
      session.facilityId === selectedFacility ||
      session.court === facilities.find(f => f.id === selectedFacility)?.name ||
      session.facilityName === facilities.find(f => f.id === selectedFacility)?.name;
    const matchesCoach =
      selectedCoach === 'ALL' ||
      session.coachId === selectedCoach ||
      (session.coaches && session.coaches.some(c => c.id === selectedCoach));
    const matchesShift = selectedShift === 'ALL' || session.shiftId === selectedShift;

    return matchesFacility && matchesCoach && matchesShift;
  });

  const handleStartAttendance = (classId: string, date: string, sessionId: string) => {
    setAttendanceTarget({ classId, date, sessionId });
    navigate('attendance');
  };

  // Find current Coach profile
  const currentCoach = coaches.find(
    c => c.id === currentUser.coachId || c.code === currentUser.coachId || c.id === currentUser.id
  );

  // Admin Assign Facility & Shift Modal State
  const [isAssignSessionModalOpen, setIsAssignSessionModalOpen] = useState(false);
  const [sessionToAssign, setSessionToAssign] = useState<SessionSchedule | null>(null);
  const [assignSessionFacilityId, setAssignSessionFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [assignSessionShiftId, setAssignSessionShiftId] = useState(shifts[0]?.id || 'CA04');

  const openAssignSessionModal = (session: SessionSchedule) => {
    setSessionToAssign(session);
    setAssignSessionFacilityId(session.facilityId || facilities[0]?.id || 'CS01');
    setAssignSessionShiftId(session.shiftId || shifts[0]?.id || 'CA04');
    setIsAssignSessionModalOpen(true);
  };

  const handleSaveSessionAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToAssign) return;

    const targetFac = facilities.find(f => f.id === assignSessionFacilityId);
    const targetSh = shifts.find(s => s.id === assignSessionShiftId);

    editSession(sessionToAssign.id, {
      facilityId: targetFac?.id,
      facilityName: targetFac?.name,
      court: targetFac?.name,
      shiftId: targetSh?.id,
      startTime: targetSh?.startTime,
      endTime: targetSh?.endTime,
      timeSlot: targetSh?.timeSlot
    });

    setIsAssignSessionModalOpen(false);
    setSessionToAssign(null);
  };

  const openScheduleModal = () => {
    setModalFacilityId(facilities[0]?.id || 'CS01');
    setModalShiftId(shifts[0]?.id || 'CA04');
    setModalClassId(classes[0]?.id || 'BD-B01');
    setModalCoachId(classes[0]?.coachId || 'HLV001');
    setModalDate('2026-08-28');
    setIsScheduleModalOpen(true);
  };

  const openCoachModal = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCoachDate(`${y}-${m}-${d}`);
    setIsCoachModalOpen(true);
  };

  const handleCoachRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachDate) return;

    // Automatically resolve the coach's primary class
    const coachClass =
      classes.find(c => c.coachId === currentCoach?.id || currentCoach?.assignedClassIds?.includes(c.id)) ||
      classes[0];

    const ok = registerCoachSession({
      date: coachDate,
      classId: coachClass?.id
    });
    if (ok) {
      setIsCoachModalOpen(false);
    }
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === modalClassId);
    const targetFacility = facilities.find(f => f.id === modalFacilityId);
    const targetShift = shifts.find(s => s.id === modalShiftId);
    const targetCoach = coaches.find(c => c.id === modalCoachId);

    if (!targetClass || !targetShift || !targetCoach) return;

    // Determine day of week
    const d = new Date(modalDate);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = dayNames[d.getDay()];

    addSession({
      classId: targetClass.id,
      className: targetClass.name,
      level: targetClass.level,
      facilityId: targetFacility?.id,
      facilityName: targetFacility?.name,
      court: targetFacility?.name || 'Sân Cầu Lông',
      shiftId: targetShift.id,
      coachId: targetCoach.id,
      coachName: targetCoach.name,
      coachAvatar: targetCoach.avatar,
      date: modalDate,
      dayOfWeek,
      startTime: targetShift.startTime,
      endTime: targetShift.endTime,
      timeSlot: targetShift.timeSlot,
      status: 'Upcoming',
      attendanceDone: false,
      totalStudents: targetClass.currentStudentsCount || 10,
      attendanceRecords: [],
      coachAttendance: { status: 'Present' },
      makeupStudents: []
    });

    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{isCoach ? 'Lịch Dạy Huấn Luyện Viên' : 'Phân Bổ Lịch Dạy & Học Toàn Hệ Thống'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {isCoach ? 'Lịch Dạy Của Tôi' : 'Lịch Dạy & Lịch Học Tại Sân'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isCoach
              ? 'Giảng viên theo dõi lịch dạy và chủ động đăng ký ngày dạy (Admin sẽ phân công sân & ca)'
              : 'Admin sắp lịch phân bổ giảng viên, học viên, sân cầu lông và ca tập cụ thể'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Coach Self-Registration Button */}
          {currentUser.role === 'COACH' && (
            <button
              onClick={openCoachModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>+ Đăng Ký Ngày Dạy</span>
            </button>
          )}

          {/* Admin Schedule button */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={openScheduleModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Sắp Lịch Dạy & Học</span>
            </button>
          )}

          {isFacilityManager && (
            <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 shadow-2xs flex items-center gap-1.5">
              <span>🏟️ {currentUser.facilityName || 'Sân Cầu Lông Cầu Giấy'} (Sân quản lý)</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-xs">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lưới Tuần
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh Sách
            </button>
          </div>
        </div>
      </div>

      {/* Admin Pending Schedule Approvals Panel */}
      {currentUser.role === 'ADMIN' && pendingStudents.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-3xl border-2 border-amber-400/60 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                  <span>Yêu Cầu Duyệt & Lưu Lịch Học Tháng Mới</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs">
                    {pendingStudents.length} học viên cần Admin lưu lịch
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Học viên đăng ký ngày cụ thể trong tháng. Admin kiểm tra sân, ca tập và nhấn <strong>"💾 Duyệt & Lưu Lịch Học"</strong> để hệ thống tự động sinh lịch buổi học thực tế.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingStudents.map(student => (
              <div
                key={student.id}
                className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-[#0F172A]">{student.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {student.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{student.phone}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700">
                          {student.facilityName || 'Sân Cầu Lông Cầu Giấy'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-200 shrink-0">
                    Chờ duyệt lịch
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ca học đăng ký:</span>
                    <strong className="text-[#0F172A]">{student.shiftName || 'Ca 4'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số buổi học / Số phép:</span>
                    <strong className="text-[#10B981]">
                      {student.packageSessions || (student.specificDates?.length || 0)} buổi ({student.maxLeaveDays || 2} phép)
                    </strong>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1 flex items-center justify-between">
                      <span>Các ngày học cụ thể trong tháng:</span>
                      <span className="font-bold text-[#0F172A]">{student.specificDates?.length || 0} ngày</span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {student.specificDates && student.specificDates.length > 0 ? (
                        student.specificDates.map(dateStr => (
                          <span
                            key={dateStr}
                            className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold text-[10px] border border-emerald-200"
                          >
                            {dateStr.split('-').slice(1).reverse().join('/')}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Chưa chọn ngày cụ thể</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => rejectStudentSchedule(student.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => confirmStudentSchedule(student.id)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>💾 Duyệt & Lưu Lịch Học</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar Filters: Facility (Sân Cầu Lông), Shift, Coach */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span>Tuần 35 (24/08 — 30/08/2026)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sân Cầu Lông Filter - Chỉ Admin mới có quyền chọn tất cả sân cầu lông */}
          {currentUser.role === 'ADMIN' && (
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              aria-label="Lọc theo sân cầu lông"
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả sân cầu lông</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}

          {/* Shift Filter */}
          <select
            value={selectedShift}
            onChange={e => setSelectedShift(e.target.value)}
            aria-label="Lọc theo ca học"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả ca học</option>
            {shifts.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Coach Filter - Chỉ Admin và Quản lý sân (HLV chỉ xem lịch của mình nên ẩn) */}
          {!isCoach && (
            <select
              value={selectedCoach}
              onChange={e => setSelectedCoach(e.target.value)}
              aria-label="Lọc theo HLV"
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">{currentUser.role === 'ADMIN' ? 'Tất cả HLV' : 'Tất cả HLV tại sân'}</option>
              {availableCoaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: WEEKLY GRID */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center divide-x divide-slate-100">
                {weekDays.map(day => (
                  <div
                    key={day.date}
                    className={`py-3.5 px-1 ${
                      day.isToday ? 'bg-emerald-500/10 text-emerald-950 font-black' : 'text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {day.day}
                    </div>
                    <div className="text-base font-extrabold mt-0.5 flex items-center justify-center gap-1">
                      <span>{day.dayNum}</span>
                      {day.isToday && <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[520px]">
                {weekDays.map(day => {
                  const daySessions = filteredSessions.filter(s => s.date === day.date);
                  return (
                    <div
                      key={day.date}
                      className={`p-2 space-y-2.5 transition-colors ${
                        day.isToday ? 'bg-emerald-50/20' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {daySessions.length === 0 ? (
                        <div className="text-center py-10 text-[11px] text-slate-300">
                          Không có ca
                        </div>
                      ) : (
                        daySessions.map(session => (
                          <div
                            key={session.id}
                            onClick={() => navigate('classes', session.classId)}
                            className="p-3 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 hover:border-[#10B981] transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2 group relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/90 text-slate-800 shadow-2xs">
                                {session.startTime}
                              </span>
                              <div className="flex items-center gap-1">
                                {session.isCoachRegistered && (
                                  <span className="text-[9px] font-black px-1 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                                    HLV tự đăng ký
                                  </span>
                                )}
                                <span className="text-[10px] font-extrabold text-[#0F172A] bg-white/70 px-1 rounded truncate max-w-[85px]">
                                  {session.facilityName || session.court}
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-black text-[#0F172A] group-hover:text-[#10B981] leading-tight">
                                {session.className}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                                <span>HLV {session.coachName.split(' ').slice(-2).join(' ')}</span>
                                <span className="font-bold text-slate-700">
                                  {session.totalStudents} HV
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                              <SessionStatusBadge status={session.status} />

                              <div className="flex items-center gap-1">
                                {currentUser.role === 'ADMIN' && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      openAssignSessionModal(session);
                                    }}
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                                    title="Admin phân sân & ca dạy"
                                  >
                                    Phân sân & ca
                                  </button>
                                )}
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleStartAttendance(session.classId, session.date, session.id);
                                  }}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                                    session.attendanceDone
                                      ? canManageCoachAttendance && !session.coachAttendanceDone
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-900 text-white hover:bg-slate-800'
                                  }`}
                                >
                                  {canManageCoachAttendance && session.attendanceDone && !session.coachAttendanceDone
                                    ? 'Chấm HLV'
                                    : session.attendanceDone
                                    ? session.attendedByRole === 'COACH'
                                      ? '✓ GV đã điểm danh'
                                      : '✓ Đã điểm danh'
                                    : 'Điểm danh'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DETAILED LIST */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ngày</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Sân cầu lông</th>
                  <th className="py-3.5 px-4">Lớp học</th>
                  <th className="py-3.5 px-4">HLV phụ trách</th>
                  <th className="py-3.5 px-4">Học viên</th>
                  <th className="py-3.5 px-4">Điểm danh</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0F172A] text-xs">
                      {s.dayOfWeek}, {s.date}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{s.timeSlot}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <strong className="text-[#0F172A]">{s.facilityName || s.court}</strong>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-1.5">
                        <span>{s.className}</span>
                        {s.isCoachRegistered && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                            HLV tự đăng ký
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">{s.coachName}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#0F172A]">
                      {s.totalStudents} HV
                    </td>
                    <td className="py-3.5 px-4">
                      {s.attendanceDone ? (
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                            {s.attendedByRole === 'COACH' ? 'GV đã điểm danh' : 'Đã điểm danh'}
                          </span>
                          {s.coachAttendanceDone && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block w-fit ${
                              s.coachAttendance?.status === 'Late'
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : s.coachAttendance?.status === 'Absent'
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            }`}>
                              {s.coachAttendance?.status === 'Late'
                                ? 'HLV đi muộn'
                                : s.coachAttendance?.status === 'Absent'
                                ? 'HLV vắng mặt'
                                : 'Đã chấm HLV: Có mặt'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                            Chưa điểm danh
                          </span>
                          {s.coachAttendanceDone && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block w-fit ${
                              s.coachAttendance?.status === 'Late'
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : s.coachAttendance?.status === 'Absent'
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            }`}>
                              {s.coachAttendance?.status === 'Late'
                                ? 'HLV đi muộn'
                                : s.coachAttendance?.status === 'Absent'
                                ? 'HLV vắng mặt'
                                : 'Đã chấm HLV: Có mặt'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => openAssignSessionModal(s)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Admin phân công cơ sở & ca dạy"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Phân sân & ca</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleStartAttendance(s.classId, s.date, s.id)}
                        className={`px-3 py-1 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                          canManageCoachAttendance && s.attendanceDone && !s.coachAttendanceDone
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : s.attendanceDone
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'bg-[#10B981] hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {canManageCoachAttendance && s.attendanceDone && !s.coachAttendanceDone
                          ? 'Chấm công HLV'
                          : s.attendanceDone
                          ? 'Xem điểm danh'
                          : 'Điểm danh'}
                      </button>
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            if (confirm('Xoá ca này khỏi lịch?')) {
                              deleteSession(s.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xoá ca"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Scheduling Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Admin Sắp Lịch Dạy & Học Tại Sân Cầu Lông"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sân cầu lông *</label>
            <select
              value={modalFacilityId}
              onChange={e => setModalFacilityId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ca học *</label>
              <select
                value={modalShiftId}
                onChange={e => setModalShiftId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày học *</label>
              <input
                type="date"
                required
                value={modalDate}
                onChange={e => setModalDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lớp học *</label>
              <select
                value={modalClassId}
                onChange={e => {
                  setModalClassId(e.target.value);
                  const cl = classes.find(c => c.id === e.target.value);
                  if (cl) setModalCoachId(cl.coachId);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giáo viên (HLV) giảng dạy *
              </label>
              <select
                value={modalCoachId}
                onChange={e => setModalCoachId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>
                    HLV {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
            Học viên đăng ký tại sân này sẽ được đồng bộ vào ca tập và có mặt trong danh sách điểm danh thực tế.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu & Xuất Lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* Coach Self-Registration Modal */}
      <Modal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        title="Huấn Luyện Viên Đăng Ký Ngày Dạy"
      >
        <form onSubmit={handleCoachRegister} className="space-y-4">
          {/* Policy Banner */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Quy Định Đăng Ký Dạy:</strong>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Giáo viên chủ động chọn ngày muốn giảng dạy. Theo quy định hệ thống, <strong>giáo viên không mặc định dạy cố định ca nào và sân nào</strong>. Sau khi giáo viên đăng ký ngày, <strong>Admin hệ thống sẽ tự phân công sân và ca dạy cụ thể</strong> cho buổi dạy.
              </p>
            </div>
          </div>

          {/* Ngày đăng ký dạy */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ngày đăng ký dạy *
            </label>
            <input
              type="date"
              required
              value={coachDate}
              onChange={e => setCoachDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold text-[#0F172A] bg-white shadow-2xs"
            />
            {coachDate && (
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Lịch chọn:{' '}
                  <strong className="text-emerald-700">
                    {new Date(coachDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </strong>
                </span>
              </p>
            )}
          </div>

          {/* Sân & Ca dạy do Admin phân công */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Phân bổ Sân cầu lông & Ca dạy</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Buổi dạy sau khi đăng ký sẽ gửi thông báo đến <strong>Admin hệ thống</strong>. Admin sẽ trực tiếp phân công cơ sở sân và ca dạy thích hợp cho bạn.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCoachModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!coachDate}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                coachDate
                  ? 'bg-[#10B981] hover:bg-emerald-600 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Đăng Ký Dạy</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Assign Facility & Shift Modal */}
      <Modal
        isOpen={isAssignSessionModalOpen}
        onClose={() => {
          setIsAssignSessionModalOpen(false);
          setSessionToAssign(null);
        }}
        title="Admin Phân Công Sân Cầu Lông & Ca Dạy Cho Buổi Học"
      >
        {sessionToAssign && (
          <form onSubmit={handleSaveSessionAssignment} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Buổi dạy:</span>
                <strong className="text-[#0F172A]">{sessionToAssign.className}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>HLV phụ trách:</span>
                <strong className="text-emerald-700">{sessionToAssign.coachName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ngày học:</span>
                <strong className="text-[#0F172A]">
                  {sessionToAssign.dayOfWeek}, {sessionToAssign.date}
                </strong>
              </div>
              {sessionToAssign.isCoachRegistered && (
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-1.5 text-purple-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  <span>Buổi dạy do HLV tự đăng ký ngày dạy - Admin vui lòng phân sân và ca.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cơ sở / Sân cầu lông *
              </label>
              <select
                value={assignSessionFacilityId}
                onChange={e => setAssignSessionFacilityId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.address || 'Cơ sở'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ca dạy phân công *
              </label>
              <select
                value={assignSessionShiftId}
                onChange={e => setAssignSessionShiftId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAssignSessionModalOpen(false);
                  setSessionToAssign(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Phân Công</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
