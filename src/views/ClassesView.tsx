import React, { useState, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Coach } from '../types';

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
    removeCoachFromDailyClass
  } = useApp();

  // Date selection state (default anchor: '2026-08-28')
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-28');

  // Filters
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    isFacilityManager && managedFacilityId ? managedFacilityId : 'ALL'
  );
  const [selectedShiftId, setSelectedShiftId] = useState<string>('ALL');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Adding / Managing Coaches
  const [selectedClassForCoach, setSelectedClassForCoach] = useState<any | null>(null);
  const [selectedCoachIdsToAdd, setSelectedCoachIdsToAdd] = useState<string[]>([]);

  // Permission helper: only ADMIN or FACILITY_MANAGER (of this facility) can add coaches
  const canManageClassCoaches = (cls: { facilityId?: string }) => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'FACILITY_MANAGER' && managedFacilityId && cls.facilityId === managedFacilityId) return true;
    return false;
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

  // Determine active facilities for this view
  const effectiveFacilities = useMemo(() => {
    if (selectedFacilityId !== 'ALL') {
      return facilities.filter(f => f.id === selectedFacilityId);
    }
    if (isFacilityManager && managedFacilityId) {
      return facilities.filter(f => f.id === managedFacilityId);
    }
    return facilities;
  }, [facilities, selectedFacilityId, isFacilityManager, managedFacilityId]);

  // Generate dynamic daily classes (Số sân × Số ca)
  const dailyClasses = useMemo(() => {
    return getDailyClasses(selectedDate, selectedFacilityId);
  }, [getDailyClasses, selectedDate, selectedFacilityId]);

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

  // Total enrolled students across all daily classes
  const totalEnrolledStudents = useMemo(() => {
    return dailyClasses.reduce((acc, cls) => acc + cls.currentStudentsCount, 0);
  }, [dailyClasses]);

  const handleQuickAttendance = (cls: typeof dailyClasses[0]) => {
    setAttendanceTarget({
      classId: cls.id,
      date: selectedDate,
      facilityId: cls.facilityId
    });
    navigate('attendance');
  };

  const managedFacility = facilities.find(f => f.id === managedFacilityId);

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

  const handleAddMultipleCoachesSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentModalClass || selectedCoachIdsToAdd.length === 0) return;
    addCoachToDailyClass(currentModalClass.id, selectedCoachIdsToAdd);
    setSelectedCoachIdsToAdd([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Quản Lý Lớp Học Theo Ngày
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Tự động tạo theo học viên đăng ký
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isCoach
              ? `Danh sách các ca học có học viên đăng ký do bạn phụ trách trong ngày (${filteredClasses.length} ca)`
              : isFacilityManager
              ? `Các ca học có học viên đăng ký tại ${managedFacility?.name || 'cơ sở'} (${filteredClasses.length} ca). Quản lý sân và Admin tự thêm/phân công HLV cho ca học.`
              : `Chỉ tạo các lớp có học viên đăng ký đúng ngày, ca, sân (${dailyClasses.length} ca có học viên). HLV do Admin và Quản lý sân thêm/phân công.`}
          </p>
        </div>

        {/* Date Selector Quick Bar */}
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

      {/* Auto-Generation System Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>{formatDateVi(selectedDate)}</span>
              <span className="text-emerald-700 font-extrabold">• {dailyClasses.length} Ca Học Có Học Viên Đăng Ký</span>
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
                facilityId: selectedFacilityId !== 'ALL' ? selectedFacilityId : facilities[0]?.id
              });
              navigate('attendance');
            }}
            className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Điểm Danh Theo Ngày</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Số Ca Đang Mở</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{dailyClasses.length} ca</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Có học viên đăng ký
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Học Viên Xếp Lớp</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700">{totalEnrolledStudents} HV</div>
          <div className="text-[11px] text-slate-500">Tự động xếp theo lịch đăng ký</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Số Sân Hoạt Động</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{effectiveFacilities.length} sân</div>
          <div className="text-[11px] text-slate-500">
            {isFacilityManager ? managedFacility?.name : 'Toàn hệ thống cơ sở'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Số Ca Học / Ngày</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{shifts.length} ca</div>
          <div className="text-[11px] text-slate-500">Từ 06:00 đến 21:30</div>
        </div>
      </div>

      {/* Toolbar: Filters & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sân, ca học, giờ học, HLV hoặc tên học viên..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Facility Filter */}
          {!isFacilityManager ? (
            <select
              value={selectedFacilityId}
              onChange={e => setSelectedFacilityId(e.target.value)}
              aria-label="Lọc theo sân"
              className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả các sân ({facilities.length} sân = {facilities.length * shifts.length} ca)</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({shifts.length} ca)
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2 bg-emerald-50 text-xs font-bold text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sân: {managedFacility?.name || 'Sân của bạn'}</span>
            </div>
          )}

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
                {s.name} ({s.startTime} - {s.endTime})
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

      {/* Desktop Table View - Bỏ mã lớp & tên lớp, hiển thị Tên Sân, Ca học & Giờ, HLV do Admin/QL sân thêm */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Sân Cầu Lông</th>
                <th className="py-3.5 px-4">Ca Học & Giờ</th>
                <th className="py-3.5 px-4">Huấn Luyện Viên Phụ Trách</th>
                <th className="py-3.5 px-4">Học viên</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy ca học nào phù hợp với bộ lọc trong ngày {formatDateVi(selectedDate)}.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => {
                  const enrolledList = cls.studentIds
                    .map(id => students.find(s => s.id === id))
                    .filter((s): s is typeof students[0] => Boolean(s));

                  const canManage = canManageClassCoaches(cls);
                  const classCoaches = cls.coaches && cls.coaches.length > 0 ? cls.coaches : [];

                  return (
                    <tr
                      key={cls.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate('classes', cls.id)}
                    >
                      {/* Sân cầu lông */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-100 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-[#0F172A] text-sm group-hover:text-[#10B981] transition-colors">
                              {cls.court}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">Sân cầu lông đạt chuẩn</div>
                          </div>
                        </div>
                      </td>

                      {/* Ca & Giờ */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 font-extrabold text-[#0F172A] text-sm">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span>{cls.scheduleDaysText}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">
                          Khung giờ: {cls.timeSlot}
                        </div>
                      </td>

                      {/* HLV & Do Admin/Quản lý sân thêm */}
                      <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {classCoaches.length > 0 ? (
                            <>
                              {classCoaches.map(c => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-800 border border-slate-200"
                                >
                                  {c.avatar ? (
                                    <img src={c.avatar} alt={c.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                      {c.name.charAt(0)}
                                    </div>
                                  )}
                                  <span>HLV {c.name}</span>
                                  {canManage && (
                                    <button
                                      onClick={() => removeCoachFromDailyClass(cls.id, c.id)}
                                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition-colors cursor-pointer"
                                      title={`Xóa HLV ${c.name} khỏi ca học này`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </span>
                              ))}

                              {/* Button thêm HLV nếu còn HLV chưa phân công */}
                              {canManage && (
                                <button
                                  onClick={() => setSelectedClassForCoach(cls)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#10B981] rounded-lg text-xs font-bold transition-all border border-emerald-300/80 cursor-pointer"
                                  title="Thêm HLV vào ca này"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Thêm</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                                Chưa có HLV
                              </span>
                              {canManage && (
                                <button
                                  onClick={() => setSelectedClassForCoach(cls)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                                  title="Thêm HLV cho ca học này"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Thêm HLV</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Học viên */}
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickAttendance(cls)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#10B981] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200"
                            title="Điểm danh ca học"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Điểm danh</span>
                          </button>
                          <button
                            onClick={() => navigate('classes', cls.id)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết ca học"
                          >
                            <ChevronRight className="w-4 h-4" />
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
            Không tìm thấy ca học nào trong ngày {formatDateVi(selectedDate)}.
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
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-extrabold text-slate-900 text-base">{cls.court}</h3>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cls.scheduleDaysText}</span> • <span className="text-slate-500 font-normal">{cls.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2.5 text-xs">
                  {/* HLV phụ trách */}
                  <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">HLV phụ trách:</span>
                      {canManage && (
                        <button
                          onClick={() => setSelectedClassForCoach(cls)}
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
                  </div>

                  {/* Học viên */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-semibold">Học viên:</span>
                    <span className="font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-xs">
                      {cls.currentStudentsCount} học viên
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Tự động tạo theo học viên đăng ký</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleQuickAttendance(cls);
                    }}
                    className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* Modal: Thêm / Phân Công Huấn Luyện Viên Cho Ca Học */}
      <Modal
        isOpen={Boolean(selectedClassForCoach)}
        onClose={() => {
          setSelectedClassForCoach(null);
          setSelectedCoachIdsToAdd([]);
        }}
        title="Thêm Huấn Luyện Viên Cho Ca Học"
        subtitle={
          currentModalClass
            ? `${currentModalClass.court} • ${currentModalClass.scheduleDaysText} (${currentModalClass.timeSlot})`
            : undefined
        }
        maxWidth="md"
      >
        <div className="space-y-5">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Quyền quản lý: <strong className="text-emerald-950">Admin hệ thống</strong> và <strong className="text-emerald-950">Quản lý sân</strong> có thể thêm một hoặc nhiều Huấn luyện viên phụ trách ca học này.
            </span>
          </div>

          {/* Current Coaches in this class */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách HLV hiện tại trong ca ({currentModalClass?.coaches?.length || 0})
            </label>

            {!currentModalClass?.coaches || currentModalClass.coaches.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                Chưa có Huấn luyện viên nào được thêm vào ca học này.
              </div>
            ) : (
              <div className="space-y-2">
                {currentModalClass.coaches.map((c: Coach) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-[#0F172A] text-xs sm:text-sm">
                      HLV {c.name}
                    </span>

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

          {/* Multi-select to Add New Coaches */}
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

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Đã chọn: <strong className="text-[#10B981] font-bold">{selectedCoachIdsToAdd.length}</strong> HLV
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMultipleCoachesSubmit}
                    disabled={selectedCoachIdsToAdd.length === 0}
                    className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-[#10B981] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {selectedCoachIdsToAdd.length > 0
                        ? `Thêm ${selectedCoachIdsToAdd.length} HLV Vào Ca`
                        : 'Thêm HLV Vào Ca'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setSelectedClassForCoach(null);
                setSelectedCoachIdsToAdd([]);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
