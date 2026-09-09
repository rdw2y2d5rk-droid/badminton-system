import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Users,
  Clock,
  Calendar,
  ChevronRight,
  CheckSquare,
  Sparkles,
  ChevronLeft,
  Building2,
  Layers,
  Plus,
  X,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Coach, Facility } from '../types';

export const ClassesView: React.FC = () => {
  const {
    coaches,
    navigate,
    isCoach,
    isFacilityManager,
    managedFacilityId,
    setAttendanceTarget,
    facilities,
    shifts,
    students,
    currentUser,
    getDailyClasses,
    addCoachToDailyClass,
    removeCoachFromDailyClass,
    updateDailyClassNote
  } = useApp();

  // Date selection state (default anchor: '2026-08-28')
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-28');

  // Level 1: Mặc định luôn là null để vào màn "Quản Lý Lớp Học Theo Cơ Sở"
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  useEffect(() => {
    try {
      sessionStorage.removeItem('badminton_selected_class_facility_id');
    } catch (_) {}
  }, []);

  const handleSelectFacility = (facilityId: string | null) => {
    setSelectedFacilityId(facilityId);
  };

  // Search query for facilities (Level 1)
  const [facilitySearchQuery, setFacilitySearchQuery] = useState<string>('');

  // Filters for classes within the selected facility (Level 2)
  const [selectedShiftId, setSelectedShiftId] = useState<string>('ALL');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Adding / Managing Coaches & Reminder Notes
  const [selectedClassForCoach, setSelectedClassForCoach] = useState<any | null>(null);
  const [selectedCoachIdsToAdd, setSelectedCoachIdsToAdd] = useState<string[]>([]);
  const [classNoteInput, setClassNoteInput] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const handleOpenCoachModal = (cls: any) => {
    setSelectedClassForCoach(cls);
    setSelectedCoachIdsToAdd([]);
    setClassNoteInput(cls.preSessionNote || '');
    setNoteSaved(false);
  };

  // Permission helper: only ADMIN or FACILITY_MANAGER (of this facility) can add coaches
  const canManageClassCoaches = (cls: { facilityId?: string }) => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'FACILITY_MANAGER' && managedFacilityId && cls.facilityId === managedFacilityId) return true;
    return false;
  };

  // Helper to remove any lingering (HH:mm - HH:mm) from shift name
  const getCleanShiftName = (text?: string) => {
    if (!text) return 'Ca học';
    return text.replace(/\s*\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/g, '').trim();
  };

  // Calculate quick date navigation
  const handleQuickDate = (type: 'prev' | 'today' | 'next') => {
    if (type === 'today') {
      setSelectedDate('2026-08-28');
      return;
    }
    const current = new Date(selectedDate);
    if (type === 'prev') {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const formatDateVi = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()];
      const [y, m, day] = dateStr.split('-');
      return `${dayOfWeek}, ${day}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  // Facilities to display on Level 1
  const facilitiesToShow = useMemo(() => {
    let list = facilities;
    if (isFacilityManager && managedFacilityId) {
      list = facilities.filter(f => f.id === managedFacilityId);
    }
    if (!facilitySearchQuery.trim()) return list;
    const q = facilitySearchQuery.toLowerCase();
    return list.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.code && f.code.toLowerCase().includes(q)) ||
      (f.address && f.address.toLowerCase().includes(q)) ||
      (f.managerName && f.managerName.toLowerCase().includes(q)) ||
      (f.phone && f.phone.includes(q))
    );
  }, [facilities, isFacilityManager, managedFacilityId, facilitySearchQuery]);

  // Current selected facility object (if any)
  const activeFacility = useMemo(() => {
    if (!selectedFacilityId) return null;
    return facilities.find(f => f.id === selectedFacilityId) || null;
  }, [facilities, selectedFacilityId]);

  // System-wide daily classes on selectedDate (for Level 1 stats)
  const allDailyClasses = useMemo(() => {
    return getDailyClasses(selectedDate, 'ALL');
  }, [getDailyClasses, selectedDate]);

  const totalDailyStudentsCount = useMemo(() => {
    return allDailyClasses.reduce((acc, cls) => acc + cls.currentStudentsCount, 0);
  }, [allDailyClasses]);

  // Daily classes for activeFacility (Level 2)
  const dailyClasses = useMemo(() => {
    if (!activeFacility) return [];
    return getDailyClasses(selectedDate, activeFacility.id);
  }, [getDailyClasses, selectedDate, activeFacility]);

  // Filter daily classes
  const filteredClasses = useMemo(() => {
    return dailyClasses.filter(cls => {
      const matchesSearch =
        !searchQuery.trim() ||
        cls.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.timeSlot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.scheduleDaysText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.coaches && cls.coaches.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        cls.studentIds.some(sid => {
          const s = students.find(st => st.id === sid);
          return s && s.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

      const matchesShift = selectedShiftId === 'ALL' || cls.shiftId === selectedShiftId;
      const matchesCoach =
        selectedCoachId === 'ALL' ||
        cls.coachId === selectedCoachId ||
        (cls.coachIds && cls.coachIds.includes(selectedCoachId));

      return matchesSearch && matchesShift && matchesCoach;
    });
  }, [dailyClasses, searchQuery, selectedShiftId, selectedCoachId, students]);

  // Total enrolled students across daily classes in active facility
  const totalEnrolledStudents = useMemo(() => {
    return dailyClasses.reduce((acc, cls) => acc + cls.currentStudentsCount, 0);
  }, [dailyClasses]);

  // Active coaches count at active facility
  const activeFacilityCoachesCount = useMemo(() => {
    if (!activeFacility) return 0;
    const names = new Set(
      dailyClasses.flatMap(c =>
        c.coaches && c.coaches.length > 0
          ? c.coaches.map(coach => coach.name)
          : c.coachName && c.coachName !== 'Chưa có HLV'
          ? [c.coachName]
          : []
      )
    );
    return names.size;
  }, [dailyClasses, activeFacility]);

  const handleQuickAttendance = (cls: typeof dailyClasses[0]) => {
    setAttendanceTarget({
      classId: cls.id,
      date: selectedDate,
      facilityId: cls.facilityId || activeFacility?.id
    });
    navigate('attendance');
  };

  const handleQuickFacilityAttendance = (e: React.MouseEvent, f: Facility) => {
    e.stopPropagation();
    const facClasses = getDailyClasses(selectedDate, f.id);
    setAttendanceTarget({
      classId: facClasses[0]?.id || '',
      date: selectedDate,
      facilityId: f.id
    });
    navigate('attendance');
  };

  // When class in modal updates, resolve its latest state from dailyClasses
  const currentModalClass = useMemo(() => {
    if (!selectedClassForCoach) return null;
    return dailyClasses.find(c => c.id === selectedClassForCoach.id) || selectedClassForCoach;
  }, [selectedClassForCoach, dailyClasses]);

  // Available coaches to add (those not already assigned to this class)
  const availableCoachesToAdd = useMemo(() => {
    if (!currentModalClass) return [];
    const assignedIds = currentModalClass.coachIds || (currentModalClass.coachId ? [currentModalClass.coachId] : []);
    return coaches.filter(c => !assignedIds.includes(c.id));
  }, [currentModalClass, coaches]);

  const handleToggleCoachSelect = (coachId: string) => {
    setSelectedCoachIdsToAdd(prev =>
      prev.includes(coachId) ? prev.filter(id => id !== coachId) : [...prev, coachId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedCoachIdsToAdd.length === availableCoachesToAdd.length) {
      setSelectedCoachIdsToAdd([]);
    } else {
      setSelectedCoachIdsToAdd(availableCoachesToAdd.map(c => c.id));
    }
  };

  const handleCloseModal = () => {
    setSelectedClassForCoach(null);
    setSelectedCoachIdsToAdd([]);
    setClassNoteInput('');
    setNoteSaved(false);
  };

  const handleSaveModalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentModalClass) return;

    if (selectedCoachIdsToAdd.length > 0) {
      addCoachToDailyClass(currentModalClass.id, selectedCoachIdsToAdd, classNoteInput);
    } else if (classNoteInput.trim() !== (currentModalClass.preSessionNote?.trim() || '')) {
      updateDailyClassNote(currentModalClass.id, classNoteInput);
    }

    handleCloseModal();
  };

  // =========================================================================
  // LEVEL 1: HIỂN THỊ DANH SÁCH CƠ SỞ TRƯỚC (Facility Cards View)
  // =========================================================================
  if (!activeFacility) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Level 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Quản Lý Lớp Học Theo Cơ Sở
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Hệ Thống Cơ Sở
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Chọn cơ sở / sân cầu lông để xem chi tiết lịch học, ca tập và danh sách lớp đang mở.
            </p>
          </div>

          {/* Quick Date Navigation */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => handleQuickDate('prev')}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleQuickDate('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                selectedDate === '2026-08-28'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hôm nay (28/08)
            </button>
            <button
              onClick={() => handleQuickDate('next')}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Ngày tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-2 pr-2">
              <Calendar className="w-4 h-4 text-[#10B981]" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="text-xs font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* System Overview KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Cơ Sở Hoạt Động</span>
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{facilitiesToShow.length} cơ sở</div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              {isFacilityManager ? 'Cơ sở bạn quản lý' : 'Đang vận hành toàn hệ thống'}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Tổng Ca Học Hôm Nay</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-sky-700">{allDailyClasses.length} ca</div>
            <div className="text-[11px] text-slate-500">{formatDateVi(selectedDate)}</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Học Viên Học Hôm Nay</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{totalDailyStudentsCount} học viên</div>
            <div className="text-[11px] text-slate-500">Tự động xếp theo lịch đăng ký</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Đội Ngũ Huấn Luyện Viên</span>
              <UserCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{coaches.length} HLV</div>
            <div className="text-[11px] text-slate-500">Sẵn sàng phân công ca dạy</div>
          </div>
        </div>

        {/* Facility Search Toolbar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={facilitySearchQuery}
              onChange={e => setFacilitySearchQuery(e.target.value)}
              placeholder="Tìm cơ sở theo tên, mã cơ sở, địa chỉ, người quản lý, số điện thoại..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 hidden sm:block shrink-0">
            Hiển thị {facilitiesToShow.length} cơ sở
          </div>
        </div>

        {/* Facility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilitiesToShow.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
              Không tìm thấy cơ sở nào phù hợp với từ khóa tìm kiếm.
            </div>
          ) : (
            facilitiesToShow.map(f => {
              const facClasses = getDailyClasses(selectedDate, f.id);
              const facStudentCount = facClasses.reduce((acc, c) => acc + c.currentStudentsCount, 0);
              const facCoachesToday = Array.from(
                new Set(
                  facClasses.flatMap(c =>
                    c.coaches && c.coaches.length > 0
                      ? c.coaches.map(coach => coach.name)
                      : c.coachName && c.coachName !== 'Chưa có HLV'
                      ? [c.coachName]
                      : []
                  )
                )
              );

              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFacility(f.id)}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:h-1.5 transition-all" />

                  <div className="space-y-4">
                    {/* Facility Header */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white flex items-center justify-center border border-emerald-100 transition-colors shrink-0 shadow-2xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {f.code || f.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                f.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {f.status === 'Active' ? 'Đang hoạt động' : 'Bảo trì'}
                            </span>
                          </div>
                          <h2 className="font-extrabold text-[#0F172A] text-lg mt-1 group-hover:text-emerald-700 transition-colors">
                            {f.name}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Facility Meta Details */}
                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {f.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f.address}</span>
                        </div>
                      )}
                      {f.managerName && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Quản lý: <strong className="text-slate-800">{f.managerName}</strong>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-0.5 text-slate-500">
                        {f.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{f.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{f.openHours}</span>
                        </div>
                      </div>
                    </div>

                    {/* Facility Real-time Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/90 group-hover:bg-emerald-50/40 rounded-2xl border border-slate-100 transition-colors">
                      <div className="text-center space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Ca Mở Hôm Nay</div>
                        <div className="text-base font-black text-[#0F172A]">{facClasses.length} ca</div>
                      </div>
                      <div className="text-center space-y-0.5 border-x border-slate-200/80">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">HV Học Hôm Nay</div>
                        <div className="text-base font-black text-emerald-700">{facStudentCount} HV</div>
                      </div>
                      <div className="text-center space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">HLV Dạy Hôm Nay</div>
                        <div className="text-base font-black text-sky-700">{facCoachesToday.length} HLV</div>
                      </div>
                    </div>

                    {/* Active Shifts Preview */}
                    {facClasses.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                          <span>Các ca đang có học viên:</span>
                          <span className="text-emerald-700 font-bold">{facClasses.length} ca</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facClasses.slice(0, 3).map(c => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700"
                            >
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{c.scheduleDaysText}</span>
                              <span className="text-slate-400 font-normal">({c.currentStudentsCount} HV)</span>
                            </span>
                          ))}
                          {facClasses.length > 3 && (
                            <span className="text-[11px] font-bold text-slate-400 self-center px-1">
                              +{facClasses.length - 3} ca khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={e => handleQuickFacilityAttendance(e, f)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Điểm danh nhanh cơ sở này"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Điểm danh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectFacility(f.id)}
                      className="px-4 py-2 bg-[#10B981] group-hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <span>Xem chi tiết lớp học</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // LEVEL 2: CHI TIẾT CÁC LỚP HỌC TẠI CƠ SỞ ĐÃ CHỌN (Facility Classes Detail)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation Bar & Quick Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => handleSelectFacility(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50/60 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-all self-start cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại danh sách cơ sở</span>
        </button>

        {/* Quick Facility Switcher Dropdown (for ADMIN / multi-facility) */}
        {!isFacilityManager && facilities.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-500">Cơ sở:</span>
            <select
              value={activeFacility.id}
              onChange={e => handleSelectFacility(e.target.value)}
              className="text-xs font-extrabold text-[#0F172A] bg-transparent outline-none cursor-pointer pr-1"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Facility Banner & Quick Date Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
              {activeFacility.code || activeFacility.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {activeFacility.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Lớp Học Tại Cơ Sở
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
            {activeFacility.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeFacility.address}
              </span>
            )}
            {activeFacility.managerName && (
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Quản lý sân: <strong className="text-slate-700">{activeFacility.managerName}</strong>
              </span>
            )}
            {activeFacility.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {activeFacility.phone}
              </span>
            )}
          </div>
        </div>

        {/* Date Selector Quick Bar */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-2xs shrink-0 self-start lg:self-auto">
          <button
            onClick={() => handleQuickDate('prev')}
            className="p-2 hover:bg-white text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Ngày trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleQuickDate('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              selectedDate === '2026-08-28'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Hôm nay (28/08)
          </button>
          <button
            onClick={() => handleQuickDate('next')}
            className="p-2 hover:bg-white text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Ngày tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-slate-200 mx-1" />
          <div className="flex items-center gap-2 pr-2">
            <Calendar className="w-4 h-4 text-[#10B981]" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => e.target.value && setSelectedDate(e.target.value)}
              className="text-xs font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Auto-Generation System Banner for this facility */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{formatDateVi(selectedDate)}</span>
              <span className="text-emerald-700 font-extrabold">• {dailyClasses.length} Ca Học Tại {activeFacility.name}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Hệ thống chỉ tạo ra các lớp có học viên đăng ký đúng <strong className="text-slate-800">Ngày</strong>, <strong className="text-slate-800">Ca</strong> và <strong className="text-slate-800">Sân</strong>. <strong className="text-emerald-800">Các HLV của ca học do Admin hệ thống hoặc Quản lý sân thêm/phân công</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setAttendanceTarget({
                classId: dailyClasses[0]?.id || '',
                date: selectedDate,
                facilityId: activeFacility.id
              });
              navigate('attendance');
            }}
            className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Điểm Danh Cơ Sở Hôm Nay</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview for this facility */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ca Đang Mở Tại Cơ Sở</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{dailyClasses.length} ca</div>
          <div className="text-[11px] text-slate-500">Có học viên đăng ký</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Học Viên Xếp Lớp</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{totalEnrolledStudents} HV</div>
          <div className="text-[11px] text-slate-500">Tại {activeFacility.name}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">HLV Tham Gia Dạy</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{activeFacilityCoachesCount} HLV</div>
          <div className="text-[11px] text-slate-500">Được phân công vào ca</div>
        </div>
      </div>

      {/* Toolbar: Filters & Search within this facility */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Tìm ca học, HLV hoặc học viên tại ${activeFacility.name}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Shift Filter */}
          <select
            value={selectedShiftId}
            onChange={e => setSelectedShiftId(e.target.value)}
            aria-label="Lọc theo ca"
            className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả các ca ({shifts.length} ca)</option>
            {shifts.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Coach Filter */}
          {!isCoach && (
            <select
              value={selectedCoachId}
              onChange={e => setSelectedCoachId(e.target.value)}
              aria-label="Lọc theo huấn luyện viên"
              className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả Huấn luyện viên</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  HLV {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Desktop Table View - Bảng ca học tinh gọn, chuẩn typography và layout */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6 w-52 min-w-[200px]">Ca Học</th>
                <th className="py-4 px-6 min-w-[320px]">Huấn Luyện Viên Phụ Trách</th>
                <th className="py-4 px-6 w-44 min-w-[150px] text-center">Học viên</th>
                <th className="py-4 px-6 w-44 min-w-[150px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Không tìm thấy ca học nào tại {activeFacility.name} trong ngày {formatDateVi(selectedDate)}.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => {
                  const enrolledList = cls.studentIds
                    .map(id => students.find(s => s.id === id))
                    .filter((s): s is typeof students[0] => Boolean(s));

                  const canManage = canManageClassCoaches(cls);
                  const classCoaches = cls.coaches && cls.coaches.length > 0 ? cls.coaches : [];
                  const cleanShift = getCleanShiftName(cls.shiftName || cls.scheduleDaysText);

                  return (
                    <tr
                      key={cls.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate('classes', cls.id)}
                    >
                      {/* Ca Học */}
                      <td className="py-4.5 px-6 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-100 shrink-0">
                            <Clock className="w-4.5 h-4.5" />
                          </div>
                          <span className="font-extrabold text-[#0F172A] text-sm group-hover:text-[#10B981] transition-colors whitespace-nowrap">
                            {cleanShift}
                          </span>
                        </div>
                      </td>

                      {/* HLV Phụ Trách & Nhắc nhở riêng cho HLV */}
                      <td className="py-4.5 px-6 align-middle" onClick={e => e.stopPropagation()}>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {classCoaches.length > 0 ? (
                              <>
                                {classCoaches.map(c => (
                                  <span
                                    key={c.id}
                                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 transition-colors shadow-2xs"
                                  >
                                    {c.avatar ? (
                                      <img src={c.avatar} alt={c.name} className="w-4.5 h-4.5 rounded-full object-cover shrink-0" />
                                    ) : (
                                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                        {c.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className="whitespace-nowrap">HLV {c.name}</span>
                                    {canManage && (
                                      <button
                                        onClick={() => removeCoachFromDailyClass(cls.id, c.id)}
                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5"
                                        title={`Xóa HLV ${c.name} khỏi ca học`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </span>
                                ))}

                                {canManage && (
                                  <button
                                    onClick={() => handleOpenCoachModal(cls)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#10B981] rounded-xl text-xs font-bold transition-all border border-emerald-300/80 cursor-pointer shadow-2xs whitespace-nowrap"
                                    title="Thêm hoặc phân công HLV cho ca này"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Thêm HLV</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 whitespace-nowrap">
                                  Chưa có HLV
                                </span>
                                {canManage && (
                                  <button
                                    onClick={() => handleOpenCoachModal(cls)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                                    title="Thêm HLV cho ca học này"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Thêm HLV</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Nhắc nhở gửi riêng cho HLV */}
                          {cls.preSessionNote && (
                            <div className="flex items-start gap-2 p-2 bg-amber-50/90 text-amber-950 border border-amber-200/80 rounded-xl text-xs max-w-xl shadow-2xs">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <span className="font-bold text-amber-900">Nhắc nhở HLV: </span>
                                <span className="text-slate-800">{cls.preSessionNote}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Học viên */}
                      <td className="py-4.5 px-6 text-center whitespace-nowrap align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                            cls.currentStudentsCount > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cls.currentStudentsCount} học viên</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 text-right whitespace-nowrap align-middle" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickAttendance(cls)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-[#10B981] rounded-xl text-xs font-bold transition-all cursor-pointer border border-emerald-200 shadow-2xs group/btn"
                            title="Điểm danh ca học"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Điểm danh</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List - Bỏ mã lớp & tên lớp, hiển thị HLV do Admin/Quản lý sân thêm */}
      <div className="md:hidden space-y-3">
        {filteredClasses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            Không tìm thấy ca học nào tại {activeFacility.name} trong ngày {formatDateVi(selectedDate)}.
          </div>
        ) : (
          filteredClasses.map(cls => {
            const enrolledList = cls.studentIds
              .map(id => students.find(s => s.id === id))
              .filter((s): s is typeof students[0] => Boolean(s));

            const canManage = canManageClassCoaches(cls);
            const classCoaches = cls.coaches && cls.coaches.length > 0 ? cls.coaches : [];

            return (
              <div
                key={cls.id}
                onClick={() => navigate('classes', cls.id)}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {getCleanShiftName(cls.shiftName || cls.scheduleDaysText)}
                      </h3>
                    </div>
                  </div>
                  <span className="font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-xs">
                    {cls.currentStudentsCount} HV
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2.5 text-xs">
                  {/* HLV phụ trách */}
                  <div className="space-y-2" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">HLV phụ trách:</span>
                      {canManage && (
                        <button
                          onClick={() => handleOpenCoachModal(cls)}
                          className="text-[#10B981] font-bold text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm HLV</span>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {classCoaches.length > 0 ? (
                        classCoaches.map(c => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                          >
                            <span>HLV {c.name}</span>
                            {canManage && (
                              <button
                                onClick={() => removeCoachFromDailyClass(cls.id, c.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Chưa có HLV
                        </span>
                      )}
                    </div>

                    {/* Pre-session Reminder Note for Coach */}
                    {cls.preSessionNote && (
                      <div className="p-2 bg-amber-50/90 text-amber-950 border border-amber-200/80 rounded-xl text-xs flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900">Nhắc nhở HLV: </span>
                          <span className="text-slate-800">{cls.preSessionNote}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Học viên */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Học viên:</span>
                    <span className="font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-xs">
                      {cls.currentStudentsCount} học viên
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleQuickAttendance(cls);
                    }}
                    className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Điểm danh</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Phân Công Huấn Luyện Viên & Ghi Chú Ca Học */}
      <Modal
        isOpen={Boolean(selectedClassForCoach)}
        onClose={handleCloseModal}
        title="Phân Công Huấn Luyện Viên Cho Ca Học"
        subtitle={
          currentModalClass
            ? getCleanShiftName(currentModalClass.shiftName || currentModalClass.scheduleDaysText)
            : undefined
        }
        maxWidth="lg"
      >
        <div className="space-y-5">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Quyền quản lý: <strong className="text-emerald-950">Admin hệ thống</strong> và <strong className="text-emerald-950">Quản lý cơ sở</strong> có thể phân công Huấn luyện viên phụ trách và gửi nhắc nhở riêng cho HLV trước buổi dạy.
            </span>
          </div>

          {/* Section 1: Ghi Chú Nhắc Nhở Dành Riêng Cho HLV */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Ghi Chú Nhắc Nhở Dành Riêng Cho HLV</span>
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                Chỉ gửi riêng cho HLV
              </span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Lời nhắc nhở dặn dò này chỉ gửi riêng cho Huấn luyện viên phụ trách ca dạy (không hiển thị cho học viên).
            </p>
            <textarea
              rows={3}
              value={classNoteInput}
              onChange={e => setClassNoteInput(e.target.value)}
              placeholder="Ví dụ: Dặn HLV cho học viên khởi động kỹ khớp gối; Rèn kỹ thuật di chuyển 4 góc sân; Kiểm tra tình trạng lưới cầu..."
              className="w-full p-3 bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-amber-200/90 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400 resize-none transition-all shadow-2xs"
            />
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>{classNoteInput.trim().length > 0 ? `${classNoteInput.length} ký tự` : 'Chưa có ghi chú'}</span>
              <span className="text-amber-800/80 font-medium">Lưu ghi chú và gửi thông báo khi bấm Lưu bên dưới</span>
            </div>
          </div>

          {/* Section 2: Danh Sách HLV Hiện Tại Trong Ca */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách HLV hiện tại trong ca ({currentModalClass?.coaches?.length || 0})
            </label>

            {!currentModalClass?.coaches || currentModalClass.coaches.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có Huấn luyện viên nào được phân công vào ca học này.
              </div>
            ) : (
              <div className="space-y-2">
                {currentModalClass.coaches.map((c: Coach) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-[#0F172A] text-xs sm:text-sm">
                        HLV {c.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCoachFromDailyClass(currentModalClass.id, c.id)}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Thêm Huấn Luyện Viên Mới Vào Ca */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Thêm Huấn Luyện Viên Mới Vào Ca
              </label>
              {availableCoachesToAdd.length > 1 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] font-bold text-[#10B981] hover:underline cursor-pointer"
                >
                  {selectedCoachIdsToAdd.length === availableCoachesToAdd.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              )}
            </div>

            {availableCoachesToAdd.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic text-center">
                Tất cả Huấn luyện viên trong hệ thống đã được thêm vào ca học này.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {availableCoachesToAdd.map(c => {
                    const isSelected = selectedCoachIdsToAdd.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCoachSelect(c.id)}
                          className="w-4 h-4 rounded text-[#10B981] focus:ring-[#10B981] accent-[#10B981] cursor-pointer"
                        />
                        <span className="text-xs font-semibold truncate">
                          {c.name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Đã chọn: <strong className="text-[#10B981] font-bold">{selectedCoachIdsToAdd.length}</strong> HLV để thêm
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions: Đóng & Lưu cùng dòng */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Hủy / Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveModalSubmit}
              disabled={
                selectedCoachIdsToAdd.length === 0 &&
                classNoteInput.trim() === (currentModalClass?.preSessionNote?.trim() || '')
              }
              className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-[#10B981] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>
                {selectedCoachIdsToAdd.length > 0
                  ? classNoteInput.trim()
                    ? `Lưu Phân Công (${selectedCoachIdsToAdd.length} HLV) & Gửi Dặn Dò`
                    : `Thêm ${selectedCoachIdsToAdd.length} HLV Vào Ca`
                  : 'Lưu Nhắc Nhở Dặn Dò Cho HLV'}
              </span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
