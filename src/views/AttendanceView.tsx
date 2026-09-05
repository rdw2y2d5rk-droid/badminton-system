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
  RotateCcw,
  UserCheck,
  UserPlus,
  Shield,
  Building2,
  Search,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatus, CoachAttendanceRecord } from '../types';
import { LevelBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    sessions,
    saveAttendance,
    saveCoachAttendance,
    addMakeupStudentToSession,
    currentUser,
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

  // Coach Attendance State
  const [coachStatus, setCoachStatus] = useState<'Present' | 'Absent' | 'Substituted'>('Present');
  const [substituteCoachName, setSubstituteCoachName] = useState<string>('');
  const [coachNote, setCoachNote] = useState<string>('');

  // Make-up Student Modal State
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [makeupSearchQuery, setMakeupSearchQuery] = useState('');
  const [selectedMakeupStudentId, setSelectedMakeupStudentId] = useState('');
  const [makeupNote, setMakeupNote] = useState('Học bù ca ngày hôm nay');

  // Sync if attendanceTarget changes
  useEffect(() => {
    if (attendanceTarget) {
      setSelectedClassId(attendanceTarget.classId);
      if (attendanceTarget.date) setSelectedDate(attendanceTarget.date);
    }
  }, [attendanceTarget]);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const targetSession = sessions.find(
    s => s.classId === selectedClassId && s.date === selectedDate
  );
  const sessionMakeupStudents = targetSession?.makeupStudents || [];

  // Local state for attendance choices: { [studentId]: 'Present' | 'Excused' | 'Absent' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  // Initialize attendance state when class or date changes
  useEffect(() => {
    const sessionMatch = sessions.find(
      s => s.classId === selectedClassId && s.date === selectedDate
    );

    const initialMap: Record<string, AttendanceStatus> = {};
    const initialNotes: Record<string, string> = {};

    // 1. Regular class students
    if (sessionMatch && sessionMatch.attendanceRecords && sessionMatch.attendanceRecords.length > 0) {
      sessionMatch.attendanceRecords.forEach(rec => {
        initialMap[rec.studentId] = rec.status;
        if (rec.note) initialNotes[rec.studentId] = rec.note;
      });
    } else {
      classStudents.forEach(st => {
        initialMap[st.id] = 'Present';
      });
    }

    // 2. Make-up students in session
    if (sessionMatch && sessionMatch.makeupStudents) {
      sessionMatch.makeupStudents.forEach(m => {
        if (!initialMap[m.studentId]) {
          initialMap[m.studentId] = m.status || 'Present';
        }
        if (m.note && !initialNotes[m.studentId]) {
          initialNotes[m.studentId] = m.note;
        }
      });
    }

    // 3. Coach attendance
    if (sessionMatch?.coachAttendance) {
      setCoachStatus(sessionMatch.coachAttendance.status);
      setSubstituteCoachName(sessionMatch.coachAttendance.substituteCoachName || '');
      setCoachNote(sessionMatch.coachAttendance.note || '');
    } else {
      setCoachStatus('Present');
      setSubstituteCoachName('');
      setCoachNote('');
    }

    setAttendanceMap(initialMap);
    setNotesMap(initialNotes);
  }, [selectedClassId, selectedDate, targetSession?.makeupStudents?.length]);

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
    sessionMakeupStudents.forEach(m => {
      updated[m.studentId] = status;
    });
    setAttendanceMap(updated);
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'Present').length;
  const excusedCount = Object.values(attendanceMap).filter(s => s === 'Excused').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'Absent').length;

  const handleSaveAttendance = () => {
    const sessionId = targetSession ? targetSession.id : `sess-custom-${Date.now()}`;

    // 1. Save Coach Attendance
    saveCoachAttendance(sessionId, {
      status: coachStatus,
      substituteCoachName: coachStatus === 'Substituted' ? substituteCoachName : undefined,
      note: coachNote
    });

    // 2. Save Regular Class Students Attendance
    const regularRecords = classStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: attendanceMap[student.id] || 'Present',
      note: notesMap[student.id] || ''
    }));

    // 3. Save Make-up Students Attendance
    const makeupRecords = sessionMakeupStudents.map(m => ({
      studentId: m.studentId,
      studentName: m.studentName,
      status: attendanceMap[m.studentId] || m.status || 'Present',
      isMakeup: true,
      makeupFromClass: m.makeupFromClass,
      note: notesMap[m.studentId] || m.note || 'Học bù'
    }));

    saveAttendance(sessionId, [...regularRecords, ...makeupRecords], selectedClassId, selectedDate);
  };

  const handleAddMakeupConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMakeupStudentId) return;

    const targetStudent = students.find(s => s.id === selectedMakeupStudentId);
    if (!targetStudent) return;

    const sessionId = targetSession ? targetSession.id : `sess-custom-${Date.now()}`;
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
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
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
            Ghi nhận chuyên cần, chấm công HLV và tiếp nhận học viên học bù tại cơ sở
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isCoach && (
            <button
              onClick={() => setIsMakeupModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-amber-900/15 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Thêm Học Viên Học Bù</span>
            </button>
          )}

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>LƯU ĐIỂM DANH</span>
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
              <span>Cơ sở & Sân:</span>
              <strong className="text-[#0F172A]">
                {targetSession?.facilityName || 'Cơ sở 1 - Cầu Giấy'} • {selectedClass?.court}
              </strong>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between mt-1">
              <span>Ca tập & Giờ:</span>
              <strong className="text-[#10B981]">
                {selectedClass?.timeSlot}
              </strong>
            </div>
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

      {/* Coach Attendance Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Điểm danh Huấn Luyện Viên
              </div>
              <div className="text-base font-extrabold text-[#0F172A]">
                {selectedClass?.coachName || 'Chưa chỉ định HLV'}
              </div>
            </div>
          </div>

          {/* Coach Attendance Buttons */}
          <div className="grid grid-cols-3 gap-2 sm:w-auto w-full">
            <button
              type="button"
              onClick={() => setCoachStatus('Present')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                coachStatus === 'Present'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              Có mặt
            </button>
            <button
              type="button"
              onClick={() => setCoachStatus('Absent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                coachStatus === 'Absent'
                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              Vắng mặt
            </button>
            <button
              type="button"
              onClick={() => setCoachStatus('Substituted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                coachStatus === 'Substituted'
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              Dạy thay
            </button>
          </div>
        </div>

        {/* Substitute Coach Input if selected */}
        {coachStatus === 'Substituted' && (
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-indigo-900 shrink-0">
              HLV Dạy Thay:
            </span>
            <input
              type="text"
              value={substituteCoachName}
              onChange={e => setSubstituteCoachName(e.target.value)}
              placeholder="Nhập tên HLV dạy thay (VD: HLV Nguyễn Văn Long)..."
              className="flex-1 px-3 py-1.5 bg-white text-xs font-semibold rounded-xl border border-indigo-200 outline-none focus:border-indigo-500 w-full"
            />
          </div>
        )}

        {/* Coach Note */}
        <input
          type="text"
          value={coachNote}
          onChange={e => setCoachNote(e.target.value)}
          placeholder="Ghi chú buổi dạy của HLV (nếu có)..."
          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
        />
      </div>

      {/* Roster of Regular Class Students */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <span>Danh Sách Học Viên Theo Lớp ({classStudents.length})</span>
          </h2>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400">
            Chưa có học viên nào trong lớp này.
          </div>
        ) : (
          classStudents.map((student, index) => {
            const currentStatus = attendanceMap[student.id] || 'Present';
            const isWarning = student.remainingSessions <= 2 && student.remainingSessions > 0;
            const isExpired = student.remainingSessions === 0;
            const allowedLeaves = student.allowedLeaves ?? Math.floor(student.packageSessions / 4);
            const isOutOfLeaves = (student.usedLeaves || 0) >= allowedLeaves;

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
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(makeup.studentId, 'Present')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Present'
                        ? 'bg-[#10B981] text-white shadow-md ring-2 ring-[#10B981]'
                        : 'bg-white text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CÓ MẶT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(makeup.studentId, 'Excused')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Excused'
                        ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500'
                        : 'bg-white text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>CÓ PHÉP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(makeup.studentId, 'Absent')}
                    className={`py-3 sm:py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                      currentStatus === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600'
                        : 'bg-white text-slate-600 hover:bg-rose-50'
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
          <span className="text-slate-400 block font-semibold">Đã chọn:</span>
          <span className="text-[#10B981] font-bold text-sm">
            {presentCount}/{classStudents.length + sessionMakeupStudents.length} Có mặt
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

      {/* Make-up Student Selection Modal */}
      <Modal
        isOpen={isMakeupModalOpen}
        onClose={() => setIsMakeupModalOpen(false)}
        title="Thêm Học Viên Học Bù Vào Ca Tập"
        subtitle={`Ca tập ngày ${selectedDate} • Lớp ${selectedClass?.name}`}
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
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {students
                .filter(s => {
                  const isNotInClass = s.classId !== selectedClassId;
                  const notInMakeup = !sessionMakeupStudents.some(m => m.studentId === s.id);
                  const matches =
                    s.name.toLowerCase().includes(makeupSearchQuery.toLowerCase()) ||
                    s.code.toLowerCase().includes(makeupSearchQuery.toLowerCase()) ||
                    s.phone.includes(makeupSearchQuery);
                  return isNotInClass && notInMakeup && matches;
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
