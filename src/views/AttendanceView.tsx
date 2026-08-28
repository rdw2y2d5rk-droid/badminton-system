import React, { useState, useEffect } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus } from '../types';
import { LevelBadge } from '../components/common/Badge';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    sessions,
    saveAttendance,
    isCoach,
    assignedClasses,
    assignedSessions,
    attendanceTarget,
    setAttendanceTarget
  } = useApp();

  const availableClasses = isCoach ? assignedClasses : classes;
  const initialClassId = attendanceTarget?.classId || availableClasses[0]?.id || 'BD-B01';
  const initialDate = attendanceTarget?.date || '2026-08-28';

  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // Sync if attendanceTarget changes
  useEffect(() => {
    if (attendanceTarget) {
      setSelectedClassId(attendanceTarget.classId);
      if (attendanceTarget.date) setSelectedDate(attendanceTarget.date);
    }
  }, [attendanceTarget]);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Local state for attendance choices: { [studentId]: 'Present' | 'Excused' | 'Absent' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Initialize attendance state when class or date changes
  useEffect(() => {
    // Check if session has existing records
    const sessionMatch = sessions.find(
      s => s.classId === selectedClassId && s.date === selectedDate
    );

    const initialMap: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    if (sessionMatch && sessionMatch.attendanceRecords && sessionMatch.attendanceRecords.length > 0) {
      sessionMatch.attendanceRecords.forEach(rec => {
        initialMap[rec.studentId] = rec.status;
        if (rec.note) initialNotes[rec.studentId] = rec.note;
      });
    } else {
      // Default all students to "Present" for 1-click fast attendance!
      classStudents.forEach(st => {
        initialMap[st.id] = 'Present';
      });
    }

    setAttendanceMap(initialMap);
    setNotesMap(initialNotes);
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach(st => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const excusedCount = Object.values(attendanceMap).filter(s => s === 'Excused').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'Absent').length;

  const handleSaveAttendance = () => {
    const targetSession = sessions.find(
      s => s.classId === selectedClassId && s.date === selectedDate
    );
    const sessionId = targetSession ? targetSession.id : `sess-custom-${Date.now()}`;

    const records = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: attendanceMap[student.id] || 'Present',
      note: notesMap[student.id] || ''
    }));

    saveAttendance(sessionId, records, selectedClassId, selectedDate);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Chế độ điểm danh nhanh dưới 30 giây</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Điểm Danh Học Viên Tại Sân
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Điểm danh thực tế ca tập — Tự động trừ buổi học và lưu lịch sử chuyên cần
          </p>
        </div>

        {/* Quick Save button on Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>LƯU ĐIỂM DANH NGAY</span>
          </button>
        </div>
      </div>

      {/* Class & Date Selection Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Chọn lớp điểm danh
            </label>
            <select
              value={selectedClassId}
              onChange={e => {
                setSelectedClassId(e.target.value);
                setAttendanceTarget(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm font-bold text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              {availableClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.levelLabel} - {c.court})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Ngày điểm danh
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 text-sm font-bold text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>HLV phụ trách:</span>
              <strong className="text-[#0F172A]">{selectedClass?.coachName}</strong>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
              <span>Sân tập & Giờ:</span>
              <strong className="text-[#10B981]">
                {selectedClass?.court} ({selectedClass?.timeSlot})
              </strong>
            </div>
          </div>
        </div>

        {/* Live Attendance Stats Counter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thống kê ca tập:
            </span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Có mặt: {presentCount} / {classStudents.length}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
                Có phép: {excusedCount}
              </span>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                Vắng: {absentCount}
              </span>
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="text-xs font-bold text-[#10B981] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              ✓ Tất cả có mặt
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Roster of Students for Quick Attendance */}
      <div className="space-y-3">
        {classStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
            Chưa có học viên nào trong lớp này.
          </div>
        ) : (
          classStudents.map((student, index) => {
            const currentStatus = attendanceMap[student.id] || 'Present';
            const isWarning = student.remainingSessions <= 2 && student.remainingSessions > 0;
            const isExpired = student.remainingSessions === 0;

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
                  {/* CÓ MẶT */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'Present')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Present'
                        ? 'bg-[#10B981] text-white shadow-md shadow-emerald-900/20 ring-2 ring-[#10B981]'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CÓ MẶT</span>
                  </button>

                  {/* CÓ PHÉP */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'Excused')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Excused'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>CÓ PHÉP</span>
                  </button>

                  {/* VẮNG */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, 'Absent')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-800'
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

      {/* Floating Bottom Bar on Mobile for Instant 1-tap Save (positioned above mobile nav) */}
      <div className="fixed bottom-16 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-30 sm:hidden flex items-center justify-between gap-3">
        <div className="text-xs">
          <span className="text-slate-400 block font-semibold">Đã chọn:</span>
          <span className="text-[#10B981] font-bold text-sm">
            {presentCount}/{classStudents.length} Có mặt
          </span>
        </div>
        <button
          onClick={handleSaveAttendance}
          className="flex-1 py-2.5 px-4 bg-[#10B981] active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>LƯU ĐIỂM DANH</span>
        </button>
      </div>
    </div>
  );
};
