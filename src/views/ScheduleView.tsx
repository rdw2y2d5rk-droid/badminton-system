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
  ListFilter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LevelBadge, SessionStatusBadge } from '../components/common/Badge';

export const ScheduleView: React.FC = () => {
  const {
    sessions,
    classes,
    coaches,
    navigate,
    setAttendanceTarget,
    isCoach,
    assignedSessions
  } = useApp();

  const [viewMode, setViewMode] = useState<'weekly' | 'list'>('weekly');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedCourt, setSelectedCourt] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Days of week
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
    const matchesCoach = selectedCoach === 'ALL' || session.coachId === selectedCoach;
    const matchesCourt = selectedCourt === 'ALL' || session.court === selectedCourt;
    const matchesLevel = selectedLevel === 'ALL' || session.level === selectedLevel;

    return matchesCoach && matchesCourt && matchesLevel;
  });

  const handleStartAttendance = (classId: string, date: string, sessionId: string) => {
    setAttendanceTarget({ classId, date, sessionId });
    navigate('attendance');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Lịch Học & Lịch Sân Cầu Lông
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Lịch chi tiết các ca tập theo tuần từ 24/08/2026 đến 30/08/2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-100 rounded-2xl p-1 flex shadow-xs">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch tuần (Grid)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách ca tập
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981]">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span>Tuần 35 (24/08 — 30/08/2026)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isCoach && (
            <select
              value={selectedCoach}
              onChange={e => setSelectedCoach(e.target.value)}
              aria-label="Lọc theo HLV"
              className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả Huấn Luyện Viên</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  HLV {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedCourt}
            onChange={e => setSelectedCourt(e.target.value)}
            aria-label="Lọc theo sân tập"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả sân tập</option>
            <option value="Sân 01">Sân 01 (VIP)</option>
            <option value="Sân 02">Sân 02</option>
            <option value="Sân 03">Sân 03</option>
            <option value="Sân 04">Sân 04</option>
            <option value="Sân 05">Sân 05</option>
          </select>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            aria-label="Lọc theo cấp độ"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
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
            <div className="min-w-[760px]">
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
                      {day.isToday && (
                        <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[500px]">
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
                        <div className="text-center py-8 text-[11px] text-slate-300">
                          Không có ca
                        </div>
                      ) : (
                        daySessions.map(session => (
                          <div
                            key={session.id}
                            onClick={() => navigate('classes', session.classId)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-2 group ${
                              session.level === 'Beginner'
                                ? 'bg-emerald-50/90 border-emerald-200/90 hover:border-[#10B981]'
                                : session.level === 'Intermediate'
                                ? 'bg-sky-50/90 border-sky-200/90 hover:border-sky-400'
                                : 'bg-amber-50/90 border-amber-200/90 hover:border-amber-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/90 text-slate-800 shadow-2xs">
                                {session.startTime}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                {session.court}
                              </span>
                            </div>

                            <div>
                              <div className="text-xs font-black text-[#0F172A] group-hover:text-[#10B981] leading-tight">
                                {session.className}
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                HLV {session.coachName.split(' ').slice(-2).join(' ')}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-500">
                                {session.totalStudents} HV
                              </span>

                              {session.attendanceDone ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
                                  Đã điểm danh
                                </span>
                              ) : (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleStartAttendance(session.classId, session.date, session.id);
                                  }}
                                  className="text-[10px] font-bold text-white bg-[#10B981] hover:bg-emerald-600 px-2 py-0.5 rounded-md shadow-2xs cursor-pointer"
                                >
                                  Điểm danh
                                </button>
                              )}
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
                  <th className="py-3.5 px-4">Lớp học</th>
                  <th className="py-3.5 px-4">Trình độ</th>
                  <th className="py-3.5 px-4">Sân</th>
                  <th className="py-3.5 px-4">HLV</th>
                  <th className="py-3.5 px-4">Học viên</th>
                  <th className="py-3.5 px-4">Trạng thái điểm danh</th>
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
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">{s.className}</td>
                    <td className="py-3.5 px-4">
                      <LevelBadge level={s.level} />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{s.court}</td>
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
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleStartAttendance(s.classId, s.date, s.id)}
                        className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Điểm danh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
