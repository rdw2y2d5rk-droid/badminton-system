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
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LevelBadge, SessionStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SkillLevel } from '../types';

export const ScheduleView: React.FC = () => {
  const {
    sessions,
    classes,
    coaches,
    facilities,
    courts,
    shifts,
    addSession,
    deleteSession,
    navigate,
    setAttendanceTarget,
    isCoach,
    currentUser,
    assignedSessions
  } = useApp();

  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedCourt, setSelectedCourt] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Admin Scheduling Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [modalFacilityId, setModalFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [modalCourtName, setModalCourtName] = useState('Sân 02');
  const [modalShiftId, setModalShiftId] = useState('CA04');
  const [modalClassId, setModalClassId] = useState(classes[0]?.id || 'BD-B01');
  const [modalCoachId, setModalCoachId] = useState('HLV001');
  const [modalDate, setModalDate] = useState('2026-08-28');

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

  const displaySessions = isCoach ? assignedSessions : sessions;

  const filteredSessions = displaySessions.filter(session => {
    const matchesFacility = selectedFacility === 'ALL' || session.facilityId === selectedFacility;
    const matchesCoach = selectedCoach === 'ALL' || session.coachId === selectedCoach;
    const matchesCourt = selectedCourt === 'ALL' || session.court === selectedCourt;
    const matchesShift = selectedShift === 'ALL' || session.shiftId === selectedShift;
    const matchesLevel = selectedLevel === 'ALL' || session.level === selectedLevel;

    return matchesFacility && matchesCoach && matchesCourt && matchesShift && matchesLevel;
  });

  const handleStartAttendance = (classId: string, date: string, sessionId: string) => {
    setAttendanceTarget({ classId, date, sessionId });
    navigate('attendance');
  };

  const openScheduleModal = () => {
    setModalFacilityId(facilities[0]?.id || 'CS01');
    const facCourts = courts.filter(c => c.facilityId === (facilities[0]?.id || 'CS01'));
    setModalCourtName(facCourts[0]?.name || 'Sân 01');
    setModalShiftId(shifts[0]?.id || 'CA04');
    setModalClassId(classes[0]?.id || 'BD-B01');
    setModalCoachId(classes[0]?.coachId || 'HLV001');
    setModalDate('2026-08-28');
    setIsScheduleModalOpen(true);
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
      court: modalCourtName,
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
            <span>Phân Bổ Lịch Dạy & Học Toàn Hệ Thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Lịch Dạy & Lịch Học Tại Sân
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Admin sắp lịch phân bổ giảng viên, học viên, cơ sở và vị trí sân tập cụ thể
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Schedule button */}
          {currentUser.role !== 'COACH' && (
            <button
              onClick={openScheduleModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Sắp Lịch Dạy & Học</span>
            </button>
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

      {/* Toolbar Filters: Facility, Court, Shift, Coach, Level */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span>Tuần 35 (24/08 — 30/08/2026)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <select
            value={selectedFacility}
            onChange={e => {
              setSelectedFacility(e.target.value);
              setSelectedCourt('ALL');
            }}
            aria-label="Lọc theo cơ sở"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả cơ sở</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Court Filter */}
          <select
            value={selectedCourt}
            onChange={e => setSelectedCourt(e.target.value)}
            aria-label="Lọc theo sân tập"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả sân</option>
            {courts
              .filter(c => selectedFacility === 'ALL' || c.facilityId === selectedFacility)
              .map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.facilityName.split(' - ')[1] || c.facilityName})
                </option>
              ))}
          </select>

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
                {s.name} ({s.timeSlot})
              </option>
            ))}
          </select>

          {/* Coach Filter */}
          {!isCoach && (
            <select
              value={selectedCoach}
              onChange={e => setSelectedCoach(e.target.value)}
              aria-label="Lọc theo HLV"
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả HLV</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  HLV {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            aria-label="Lọc theo cấp độ"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả trình độ</option>
            <option value="Beginner">Cơ bản (Beginner)</option>
            <option value="Intermediate">Trung cấp (Intermediate)</option>
            <option value="Advanced">Nâng cao (Advanced)</option>
          </select>
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
                            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2 group relative ${
                              session.level === 'Beginner'
                                ? 'bg-emerald-50/90 border-emerald-200/90 hover:border-[#10B981]'
                                : session.level === 'Intermediate'
                                ? 'bg-sky-50/90 border-sky-200/90 hover:border-sky-400'
                                : 'bg-amber-50/90 border-amber-200/90 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/90 text-slate-800 shadow-2xs">
                                {session.startTime}
                              </span>
                              <span className="text-[10px] font-extrabold text-[#0F172A] bg-white/70 px-1 rounded">
                                {session.court}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-black text-[#0F172A] group-hover:text-[#10B981] leading-tight">
                                {session.className}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5 flex items-center justify-between">
                                <span>HLV {session.coachName.split(' ').slice(-2).join(' ')}</span>
                                {session.facilityName && (
                                  <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
                                    {session.facilityName.split(' - ')[1] || session.facilityName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-500">
                                {session.totalStudents} HV
                              </span>

                              <div className="flex items-center gap-1">
                                {session.attendanceDone ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                                    ✓ Xong
                                  </span>
                                ) : (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleStartAttendance(session.classId, session.date, session.id);
                                    }}
                                    className="text-[10px] font-bold text-white bg-[#10B981] hover:bg-emerald-600 px-2 py-0.5 rounded shadow-2xs cursor-pointer"
                                  >
                                    Điểm danh
                                  </button>
                                )}

                                {currentUser.role === 'ADMIN' && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (confirm('Xoá ca này khỏi lịch?')) {
                                        deleteSession(session.id);
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition-opacity cursor-pointer"
                                    title="Xoá ca"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
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

      {/* VIEW MODE 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ngày</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Cơ sở & Sân</th>
                  <th className="py-3.5 px-4">Lớp học</th>
                  <th className="py-3.5 px-4">Trình độ</th>
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
                      <strong className="text-[#0F172A]">{s.court}</strong>
                      <div className="text-slate-400 text-[11px]">{s.facilityName || 'Cơ sở 1 - Cầu Giấy'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">{s.className}</td>
                    <td className="py-3.5 px-4">
                      <LevelBadge level={s.level} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">{s.coachName}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#0F172A]">
                      {s.totalStudents} HV
                    </td>
                    <td className="py-3.5 px-4">
                      {s.attendanceDone ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Đã điểm danh
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Chưa điểm danh
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleStartAttendance(s.classId, s.date, s.id)}
                        className="px-3 py-1 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Điểm danh
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
        title="Admin Sắp Lịch Dạy & Học Tại Sân"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ sở đào tạo *</label>
              <select
                value={modalFacilityId}
                onChange={e => {
                  setModalFacilityId(e.target.value);
                  const facCourts = courts.filter(c => c.facilityId === e.target.value);
                  if (facCourts.length > 0) setModalCourtName(facCourts[0].name);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sân tập *</label>
              <select
                value={modalCourtName}
                onChange={e => setModalCourtName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {courts
                  .filter(c => c.facilityId === modalFacilityId)
                  .map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
              </select>
            </div>
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
                    {s.name} ({s.timeSlot})
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
                    {c.name} ({c.levelLabel})
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
            Học viên trong lớp này sẽ được tự động xếp vào ca tập và có mặt trong danh sách điểm danh thực tế tại sân.
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
    </div>
  );
};

