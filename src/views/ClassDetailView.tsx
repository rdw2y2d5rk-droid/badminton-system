import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  CheckSquare,
  MessageSquare,
  UserCheck,
  GripVertical,
  ArrowRightLeft,
  Sparkles,
  Plus,
  Search,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Coach, Student } from '../types';

interface ClassDetailViewProps {
  classId: string;
  onBack: () => void;
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ classId, onBack }) => {
  const {
    classes,
    students,
    coaches,
    sessions,
    navigate,
    setAttendanceTarget,
    getClassById,
    currentUser,
    managedFacilityId,
    updateDailyClassNote,
    classCoachStudentAssignments,
    assignStudentToCoachInClass,
    batchAssignStudentsToCoachInClass
  } = useApp();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [detailNoteInput, setDetailNoteInput] = useState('');

  const currentClass = getClassById(classId) || classes.find(c => c.id === classId) || classes[0];
  const canManage =
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'FACILITY_MANAGER' && managedFacilityId && currentClass.facilityId === managedFacilityId);
  const canManageNote = canManage;

  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [reassignModalStudent, setReassignModalStudent] = useState<Student | null>(null);
  const [studentViewMode, setStudentViewMode] = useState<'list' | 'by_coach'>('list');

  // Batch Assign Students State
  const [batchAssignCoach, setBatchAssignCoach] = useState<Coach | null>(null);
  const [batchSelectedStudentIds, setBatchSelectedStudentIds] = useState<string[]>([]);
  const [batchSearchQuery, setBatchSearchQuery] = useState('');

  // Mobile Touch Drag & Drop State
  const [touchStudent, setTouchStudent] = useState<Student | null>(null);
  const [touchDragPos, setTouchDragPos] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (student: Student, e: React.TouchEvent) => {
    if (!canManage) return;
    const touch = e.touches[0];
    setTouchStudent(student);
    setTouchDragPos({ x: touch.clientX, y: touch.clientY });
    setDraggedStudentId(student.id);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30); } catch { /* ignore */ }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStudent) return;
    const touch = e.touches[0];
    setTouchDragPos({ x: touch.clientX, y: touch.clientY });

    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = el?.closest('[data-drop-target]') as HTMLElement | null;
    if (dropZone) {
      const targetId = dropZone.getAttribute('data-drop-target');
      setDragOverTargetId(targetId);
    } else {
      setDragOverTargetId(null);
    }
  };

  const handleTouchEnd = () => {
    if (touchStudent && dragOverTargetId) {
      assignStudentToCoachInClass(
        currentClass.id,
        touchStudent.id,
        dragOverTargetId === 'unassigned' ? null : dragOverTargetId
      );
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([20, 50, 20]); } catch { /* ignore */ }
      }
    }
    setTouchStudent(null);
    setTouchDragPos(null);
    setDragOverTargetId(null);
    setDraggedStudentId(null);
  };

  const classStudents = useMemo(() => {
    if (currentClass.studentIds && currentClass.studentIds.length > 0) {
      return currentClass.studentIds
        .map(id => students.find(s => s.id === id))
        .filter((s): s is typeof students[0] => Boolean(s));
    }
    return students.filter(s => s.classId === currentClass.id);
  }, [currentClass, students]);

  const classCoaches: Coach[] = useMemo(() => {
    if (currentClass.coaches && currentClass.coaches.length > 0) {
      return currentClass.coaches;
    }
    if (currentClass.coachName && currentClass.coachName !== 'Chưa có HLV') {
      const found = coaches.find(c => c.name === currentClass.coachName || c.id === currentClass.coachId);
      if (found) return [found];
      return [{
        id: currentClass.coachId || 'HLV_DEFAULT',
        code: currentClass.coachId || 'HLV_DEFAULT',
        name: currentClass.coachName,
        avatar: currentClass.coachAvatar,
        specialty: 'BWF Certified Coach',
        phone: '0901 000 000',
        email: 'coach@smashpro.vn',
        level: 'Senior',
        rating: 4.9,
        status: 'Active',
        taughtSessionsMonth: 24,
        taughtHoursMonth: 36,
        totalStudents: 18
      }];
    }
    return [];
  }, [currentClass, coaches]);

  const currentAssignments = classCoachStudentAssignments[currentClass.id] || {};

  const coachStudentsMap = useMemo(() => {
    const map: Record<string, Student[]> = {};
    classCoaches.forEach(c => {
      map[c.id] = [];
    });

    const unassigned: Student[] = [];
    const assignedStudentIds = new Set<string>();

    // 1. Explicit assignments from state / localStorage
    classCoaches.forEach(c => {
      const sids = currentAssignments[c.id] || [];
      sids.forEach(sid => {
        const found = classStudents.find(s => s.id === sid);
        if (found && !assignedStudentIds.has(sid)) {
          map[c.id].push(found);
          assignedStudentIds.add(sid);
        }
      });
    });

    // 2. Remaining students: check default coachId or unassigned
    classStudents.forEach(st => {
      if (!assignedStudentIds.has(st.id)) {
        if (classCoaches.length === 1) {
          map[classCoaches[0].id].push(st);
          assignedStudentIds.add(st.id);
        } else if (st.coachId && map[st.coachId]) {
          map[st.coachId].push(st);
          assignedStudentIds.add(st.id);
        } else {
          unassigned.push(st);
        }
      }
    });

    return { map, unassigned };
  }, [classCoaches, classStudents, currentAssignments]);

  const getAssignedCoachForStudent = (studentId: string): Coach | undefined => {
    return classCoaches.find(c => coachStudentsMap.map[c.id]?.some(s => s.id === studentId));
  };

  const openBatchAssignModal = (coach: Coach) => {
    setBatchAssignCoach(coach);
    const currentAssigned = coachStudentsMap.map[coach.id]?.map(s => s.id) || [];
    setBatchSelectedStudentIds(currentAssigned);
    setBatchSearchQuery('');
  };

  const toggleStudentInBatch = (studentId: string) => {
    setBatchSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllInBatch = () => {
    setBatchSelectedStudentIds(classStudents.map(s => s.id));
  };

  const handleSelectUnassignedInBatch = () => {
    const unassignedIds = coachStudentsMap.unassigned.map(s => s.id);
    setBatchSelectedStudentIds(prev => Array.from(new Set([...prev, ...unassignedIds])));
  };

  const handleClearAllInBatch = () => {
    setBatchSelectedStudentIds([]);
  };

  const handleConfirmBatchAssign = () => {
    if (!batchAssignCoach) return;
    batchAssignStudentsToCoachInClass(currentClass.id, batchAssignCoach.id, batchSelectedStudentIds);
    setBatchAssignCoach(null);
  };

  const filteredBatchStudents = useMemo(() => {
    if (!batchSearchQuery.trim()) return classStudents;
    const q = batchSearchQuery.toLowerCase();
    return classStudents.filter(s => s.name.toLowerCase().includes(q));
  }, [classStudents, batchSearchQuery]);

  const handleGoAttendance = (sessionId?: string) => {
    setAttendanceTarget({
      classId: currentClass.id,
      date: currentClass.startDate || '2026-08-28',
      facilityId: currentClass.facilityId,
      sessionId
    });
    navigate('attendance');
  };

  const remainingSlots = Math.max(0, (currentClass.maxStudents || 6) - classStudents.length);
  const cleanShift =
    currentClass.shiftName ||
    (currentClass.scheduleDaysText
      ? currentClass.scheduleDaysText.replace(/\s*\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/g, '').trim()
      : 'Ca học');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50/60 px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs transition-all self-start cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại danh sách ca học</span>
        </button>

        <button
          onClick={() => handleGoAttendance()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Điểm Danh Ca Học Này</span>
        </button>
      </div>

      {/* 1. Class Information Header Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        {/* Class Title & Info Row */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            {!currentClass.id.startsWith('CLS_') && currentClass.code && (
              <span className="text-xs font-black bg-[#0F172A] text-white px-2.5 py-1 rounded-lg">
                {currentClass.code}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
              {cleanShift} • {currentClass.court}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {currentClass.timeSlot}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Đang hoạt động
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Sĩ số: {classStudents.length}/{currentClass.maxStudents || 6} HV ({remainingSlots > 0 ? `Còn ${remainingSlots} chỗ trống` : 'Đã đủ sĩ số'})</span>
            </span>
          </div>

          {/* Pre-session Reminder Note for Coach */}
          {currentClass.preSessionNote && !isEditingNote && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-950 max-w-3xl shadow-2xs">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-amber-900">Nhắc nhở riêng cho HLV: </span>
                  <span className="font-medium text-amber-950">{currentClass.preSessionNote}</span>
                </div>
              </div>
              {canManageNote && (
                <button
                  onClick={() => {
                    setDetailNoteInput(currentClass.preSessionNote || '');
                    setIsEditingNote(true);
                  }}
                  className="text-amber-800 hover:text-amber-950 font-bold text-xs underline shrink-0 cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          )}

          {!currentClass.preSessionNote && !isEditingNote && canManageNote && (
            <div>
              <button
                onClick={() => {
                  setDetailNoteInput('');
                  setIsEditingNote(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Nhắc nhở riêng cho HLV</span>
              </button>
            </div>
          )}

          {isEditingNote && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Nhắc nhở dặn dò HLV trước ca dạy:</span>
              </div>
              <textarea
                rows={2}
                value={detailNoteInput}
                onChange={e => setDetailNoteInput(e.target.value)}
                placeholder="Nhập dặn dò riêng cho HLV (bài tập, tình trạng sân, học viên...)"
                className="w-full p-2.5 bg-white text-xs text-slate-800 rounded-xl border border-amber-200 outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateDailyClassNote(currentClass.id, detailNoteInput);
                    setIsEditingNote(false);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu nhắc nhở HLV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Coaches Section */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Huấn Luyện Viên Phụ Trách ({classCoaches.length})
              </span>
            </div>
            {canManage && studentViewMode === 'by_coach' && (
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                💡 Kéo thả học viên trực tiếp vào thẻ HLV để phân công
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {classCoaches.length > 0 ? (
              classCoaches.map((c: Coach) => {
                const count = coachStudentsMap.map[c.id]?.length || 0;
                const isOver = studentViewMode === 'by_coach' && dragOverTargetId === c.id;

                return (
                  <div
                    key={c.id}
                    data-drop-target={studentViewMode === 'by_coach' ? c.id : undefined}
                    onDragOver={(e) => {
                      if (!canManage || studentViewMode !== 'by_coach') return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverTargetId !== c.id) setDragOverTargetId(c.id);
                    }}
                    onDragLeave={(e) => {
                      if (!canManage || studentViewMode !== 'by_coach') return;
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      if (dragOverTargetId === c.id) setDragOverTargetId(null);
                    }}
                    onDrop={(e) => {
                      if (!canManage || studentViewMode !== 'by_coach') return;
                      e.preventDefault();
                      const sId = e.dataTransfer.getData('text/plain') || draggedStudentId;
                      if (sId) {
                        assignStudentToCoachInClass(currentClass.id, sId, c.id);
                      }
                      setDragOverTargetId(null);
                      setDraggedStudentId(null);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all shadow-2xs ${
                      isOver
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-md scale-[1.02]'
                        : 'bg-slate-50/90 hover:bg-slate-100/80 border-slate-200/80'
                    }`}
                  >
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-[#0F172A] truncate">HLV {c.name}</div>
                      {studentViewMode === 'by_coach' && (
                        <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                          {count} học viên kèm cặp
                        </div>
                      )}
                    </div>

                    {canManage && studentViewMode === 'by_coach' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBatchAssignModal(c);
                        }}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                        title={`Thêm nhiều học viên cho HLV ${c.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-amber-700 font-medium">
                Chưa có Huấn luyện viên phụ trách ca học này.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Full Student Roster & Coach Assignment Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-100 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#0F172A]">
                {studentViewMode === 'list' ? 'Danh Sách Học Viên Trong Ca' : 'Phân Công Học Viên Theo Huấn Luyện Viên'}
              </h2>
              <p className="text-xs text-slate-500">
                {studentViewMode === 'list'
                  ? 'Danh sách học viên theo học trong ca này'
                  : 'Kéo và thả học viên để chỉ định Huấn luyện viên kèm cặp trong ca học'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {classCoaches.length > 0 && (
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStudentViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentViewMode === 'list'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Danh sách thường
                </button>
                <button
                  type="button"
                  onClick={() => setStudentViewMode('by_coach')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentViewMode === 'by_coach'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Phân loại theo HLV
                </button>
              </div>
            )}

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0">
              {classStudents.length} học viên theo học
            </span>
          </div>
        </div>

        {/* Instructional Tip (Only when in by_coach mode) */}
        {canManage && classCoaches.length > 0 && studentViewMode === 'by_coach' && (
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50/80 text-emerald-900 rounded-2xl text-xs border border-emerald-200/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Kéo thả học viên giữa các ô HLV để phân nhóm. Trên điện thoại: Giữ <strong>⠿</strong> để kéo hoặc chạm trực tiếp để đổi HLV.
            </span>
          </div>
        )}

        {classStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            Chưa có học viên nào đăng ký ca học này.
          </div>
        ) : studentViewMode === 'list' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {classStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs select-none hover:border-slate-300 transition-all"
              >
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {student.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0F172A] truncate">
                    {student.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unassigned Students Lane (if any) */}
            {coachStudentsMap.unassigned.length > 0 && (
              <div
                data-drop-target="unassigned"
                onDragOver={(e) => {
                  if (!canManage) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverTargetId !== 'unassigned') setDragOverTargetId('unassigned');
                }}
                onDragLeave={(e) => {
                  if (!canManage) return;
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverTargetId === 'unassigned') setDragOverTargetId(null);
                }}
                onDrop={(e) => {
                  if (!canManage) return;
                  e.preventDefault();
                  const sId = e.dataTransfer.getData('text/plain') || draggedStudentId;
                  if (sId) {
                    assignStudentToCoachInClass(currentClass.id, sId, null);
                  }
                  setDragOverTargetId(null);
                  setDraggedStudentId(null);
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  dragOverTargetId === 'unassigned'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50'
                    : 'bg-amber-50/40 border-amber-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                      Chưa Phân Công HLV ({coachStudentsMap.unassigned.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
                    Kéo học viên vào HLV mong muốn bên dưới để phân công
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {coachStudentsMap.unassigned.map(student => (
                    <div
                      key={student.id}
                      draggable={canManage}
                      onDragStart={(e) => {
                        if (!canManage) return;
                        e.dataTransfer.setData('text/plain', student.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedStudentId(student.id);
                      }}
                      onDragEnd={() => {
                        setDraggedStudentId(null);
                        setDragOverTargetId(null);
                      }}
                      onClick={() => {
                        if (canManage && classCoaches.length > 0) {
                          setReassignModalStudent(student);
                        }
                      }}
                      className={`group flex items-center justify-between gap-2.5 p-2.5 bg-white rounded-xl border transition-all select-none cursor-pointer sm:cursor-grab active:cursor-grabbing ${
                        draggedStudentId === student.id
                          ? 'opacity-40 scale-95 border-dashed border-emerald-400 bg-emerald-50/40 shadow-none'
                          : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {canManage && (
                          <div
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              handleTouchStart(student, e);
                            }}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                            className="p-2 -m-1 sm:p-1 sm:m-0 touch-none cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-emerald-600 active:text-emerald-700 active:bg-emerald-50 rounded-lg transition-colors shrink-0"
                            title="Giữ để kéo thả"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-emerald-700 transition-colors">
                            {student.name}
                          </div>
                        </div>
                      </div>

                      {canManage && classCoaches.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReassignModalStudent(student);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 sm:bg-transparent sm:text-slate-400 sm:opacity-0 sm:group-hover:opacity-100 hover:text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                          title="Chọn HLV"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Columns / Drop Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classCoaches.map((coach: Coach) => {
                const assignedStudents = coachStudentsMap.map[coach.id] || [];
                const isOver = dragOverTargetId === coach.id;

                return (
                  <div
                    key={coach.id}
                    data-drop-target={coach.id}
                    onDragOver={(e) => {
                      if (!canManage) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverTargetId !== coach.id) setDragOverTargetId(coach.id);
                    }}
                    onDragLeave={(e) => {
                      if (!canManage) return;
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      if (dragOverTargetId === coach.id) setDragOverTargetId(null);
                    }}
                    onDrop={(e) => {
                      if (!canManage) return;
                      e.preventDefault();
                      const sId = e.dataTransfer.getData('text/plain') || draggedStudentId;
                      if (sId) {
                        assignStudentToCoachInClass(currentClass.id, sId, coach.id);
                      }
                      setDragOverTargetId(null);
                      setDraggedStudentId(null);
                    }}
                    className={`rounded-2xl border p-4 flex flex-col transition-all min-h-[160px] ${
                      isOver
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400 shadow-md scale-[1.01]'
                        : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {coach.avatar ? (
                          <img
                            src={coach.avatar}
                            alt={coach.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {coach.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-xs font-black text-[#0F172A] truncate">
                            HLV {coach.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-0.5 bg-emerald-100/80 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
                          {assignedStudents.length} học viên
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => openBatchAssignModal(coach)}
                            className="p-1 px-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title={`Thêm học viên cho HLV ${coach.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Thêm</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Drop Zone Area / Student List */}
                    <div className="flex-1 space-y-2">
                      {assignedStudents.length === 0 ? (
                        <div className={`py-4 px-3 rounded-xl border border-dashed flex flex-col items-center justify-center text-center transition-colors ${
                          isOver
                            ? 'border-emerald-500 bg-emerald-100/50 text-emerald-700'
                            : 'border-slate-200 text-slate-400'
                        }`}>
                          <UserCheck className="w-5 h-5 mb-1 opacity-50" />
                          <span className="text-xs font-semibold">
                            {isOver ? 'Thả vào đây để phân công' : 'Chưa có học viên'}
                          </span>
                          <span className="text-[10px] opacity-75 mt-0.5">
                            Kéo thả học viên vào đây
                          </span>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => openBatchAssignModal(coach)}
                              className="mt-2.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Thêm học viên
                            </button>
                          )}
                        </div>
                      ) : (
                        assignedStudents.map(student => (
                          <div
                            key={student.id}
                            draggable={canManage}
                            onDragStart={(e) => {
                              if (!canManage) return;
                              e.dataTransfer.setData('text/plain', student.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedStudentId(student.id);
                            }}
                            onDragEnd={() => {
                              setDraggedStudentId(null);
                              setDragOverTargetId(null);
                            }}
                            onClick={() => {
                              if (canManage && classCoaches.length > 0) {
                                setReassignModalStudent(student);
                              }
                            }}
                            className={`group flex items-center justify-between gap-2.5 p-2.5 bg-white rounded-xl border transition-all select-none cursor-pointer sm:cursor-grab active:cursor-grabbing ${
                              draggedStudentId === student.id
                                ? 'opacity-40 scale-95 border-dashed border-emerald-400 bg-emerald-50/40 shadow-none'
                                : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {canManage && (
                                <div
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handleTouchStart(student, e);
                                  }}
                                  onTouchMove={handleTouchMove}
                                  onTouchEnd={handleTouchEnd}
                                  onTouchCancel={handleTouchEnd}
                                  className="p-2 -m-1 sm:p-1 sm:m-0 touch-none cursor-grab active:cursor-grabbing text-slate-400 group-hover:text-emerald-600 active:text-emerald-700 active:bg-emerald-50 rounded-lg transition-colors shrink-0"
                                  title="Giữ để kéo thả"
                                >
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {student.avatar ? (
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#0F172A] truncate group-hover:text-emerald-700 transition-colors">
                                  {student.name}
                                </div>
                              </div>
                            </div>

                            {canManage && classCoaches.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReassignModalStudent(student);
                                }}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 sm:bg-transparent sm:text-slate-400 sm:opacity-0 sm:group-hover:opacity-100 hover:text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                                title="Đổi Huấn luyện viên"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Touch Drag Preview (Mobile) */}
      {touchStudent && touchDragPos && (
        <div
          style={{
            left: `${touchDragPos.x}px`,
            top: `${touchDragPos.y - 45}px`,
            transform: 'translate(-50%, -50%)'
          }}
          className="fixed z-50 pointer-events-none flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-2xl shadow-2xl border-2 border-white scale-105"
        >
          {touchStudent.avatar ? (
            <img
              src={touchStudent.avatar}
              alt={touchStudent.name}
              className="w-7 h-7 rounded-lg object-cover border border-white/50 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {touchStudent.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-bold whitespace-nowrap">{touchStudent.name}</span>
        </div>
      )}

      {/* Quick Reassign Modal (Accessible / Mobile Fallback) */}
      <Modal
        isOpen={Boolean(reassignModalStudent)}
        onClose={() => setReassignModalStudent(null)}
        title="Chuyển Huấn Luyện Viên Cho Học Viên"
        subtitle={reassignModalStudent ? `Học viên: ${reassignModalStudent.name}` : ''}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            Chọn Huấn luyện viên phụ trách kèm cặp học viên này trong ca:
          </p>
          <div className="space-y-2">
            {classCoaches.map((c: Coach) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  if (reassignModalStudent) {
                    assignStudentToCoachInClass(currentClass.id, reassignModalStudent.id, c.id);
                    setReassignModalStudent(null);
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-bold text-xs text-slate-800">HLV {c.name}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">Chọn HLV này</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                if (reassignModalStudent) {
                  assignStudentToCoachInClass(currentClass.id, reassignModalStudent.id, null);
                  setReassignModalStudent(null);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all text-xs font-semibold cursor-pointer"
            >
              Chuyển về Chưa phân công
            </button>
          </div>
        </div>
      </Modal>

      {/* Batch Assign Students Modal */}
      <Modal
        isOpen={Boolean(batchAssignCoach)}
        onClose={() => setBatchAssignCoach(null)}
        title={batchAssignCoach ? `Thêm & Phân Công Học Viên - HLV ${batchAssignCoach.name}` : ''}
        subtitle="Chọn nhiều học viên để HLV này trực tiếp kèm cặp trong ca học"
      >
        {batchAssignCoach && (
          <div className="space-y-4">
            {/* Search & Quick Actions */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={batchSearchQuery}
                  onChange={(e) => setBatchSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm học viên theo tên..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Quick filter action buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllInBatch}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Chọn tất cả ({classStudents.length})
                </button>
                {coachStudentsMap.unassigned.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectUnassignedInBatch}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    + Chọn tất cả chưa phân công ({coachStudentsMap.unassigned.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearAllInBatch}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Students Checkbox List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 border border-slate-200/90 rounded-2xl p-2 bg-slate-50/50">
              {filteredBatchStudents.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Không tìm thấy học viên nào phù hợp.
                </div>
              ) : (
                filteredBatchStudents.map(student => {
                  const isChecked = batchSelectedStudentIds.includes(student.id);
                  const currentCoach = getAssignedCoachForStudent(student.id);
                  const isWithThisCoach = currentCoach?.id === batchAssignCoach.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentInBatch(student.id)}
                      className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/90 border-emerald-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate ${isChecked ? 'text-emerald-950' : 'text-[#0F172A]'}`}>
                            {student.name}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isWithThisCoach ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200">
                            HLV này đang kèm
                          </span>
                        ) : currentCoach ? (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Đang học HLV {currentCoach.name}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Chưa phân công
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Đã chọn: <strong className="text-emerald-700 font-bold">{batchSelectedStudentIds.length}</strong> / {classStudents.length} học viên
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBatchAssignCoach(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBatchAssign}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Lưu phân công ({batchSelectedStudentIds.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
