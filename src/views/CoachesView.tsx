import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Calendar,
  BookOpen,
  Building2,
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Coach } from '../types';

// Định nghĩa dữ liệu một ca dạy chi tiết của HLV
export interface CoachTaughtShift {
  id: string;
  coachId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 'Thứ Hai', 'Thứ Ba', ...
  shiftId: string;
  shiftName: string; // Tên ca từ Quản Lý Ca Học & Lịch Ca (Ca Sáng 1, Ca Sáng 2, Ca Chiều, Ca Tối 1, Ca Tối 2...)
  timeSlot?: string;
  className?: string;
  facilityName: string;
  court?: string;
  status: 'Completed' | 'PendingReview';
}

// Hàm sinh danh sách ca đã dạy trong tháng cho HLV (phân loại ca lấy trực tiếp từ Quản Lý Ca Học & Lịch Ca)
const generateCoachShifts = (
  coach: Coach,
  systemShifts?: { id: string; name: string; timeSlot: string }[],
  facilityDefault?: string
): CoachTaughtShift[] => {
  const shiftsList = systemShifts && systemShifts.length > 0 ? systemShifts : [
    { id: 'CA01', name: 'Ca Sáng 1', timeSlot: '06:00 - 07:30' },
    { id: 'CA02', name: 'Ca Sáng 2', timeSlot: '08:00 - 09:30' },
    { id: 'CA03', name: 'Ca Chiều', timeSlot: '16:30 - 18:00' },
    { id: 'CA04', name: 'Ca Tối 1', timeSlot: '18:00 - 19:30' },
    { id: 'CA05', name: 'Ca Tối 2', timeSlot: '19:30 - 21:00' }
  ];

  const facilityName = coach.assignedFacilityName || facilityDefault || 'Sân Cầu Lông Cầu Giấy';
  const storedKey = `badminton_coach_shifts_v5_${coach.id}`;
  const stored = localStorage.getItem(storedKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }

  const shiftsData: CoachTaughtShift[] = [];
  const daysOfWeek = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const count = Math.max(coach.taughtSessionsMonth || 16, 12);

  for (let i = 0; i < count; i++) {
    const day = Math.min(28, Math.max(1, Math.floor((i / count) * 28) + 1));
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const date = `2026-08-${dayStr}`;
    const dateObj = new Date(2026, 7, day);
    const dayOfWeek = daysOfWeek[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1] || 'Thứ Tư';

    // Phân bổ trực tiếp theo các ca trong Quản Lý Ca Học & Lịch Ca
    const curShift = shiftsList[i % shiftsList.length];

    shiftsData.push({
      id: `SHIFT-${coach.id}-${i + 1}`,
      coachId: coach.id,
      date,
      dayOfWeek,
      shiftId: curShift.id,
      shiftName: curShift.name,
      timeSlot: curShift.timeSlot,
      className: coach.assignedClassIds?.[i % (coach.assignedClassIds.length || 1)] || 'Beginner 01',
      facilityName,
      court: `Sân 0${(i % 3) + 1}`,
      status: 'Completed'
    });
  }

  shiftsData.sort((a, b) => b.date.localeCompare(a.date));
  return shiftsData;
};

// Màu sắc badge phân loại ca theo tên ca trong Quản Lý Ca Học
const getShiftBadgeClass = (shiftName: string) => {
  if (shiftName.includes('Sáng 1')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (shiftName.includes('Sáng 2')) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (shiftName.includes('Chiều')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (shiftName.includes('Tối 1')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (shiftName.includes('Tối 2')) return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
};

export const CoachesView: React.FC = () => {
  const { coaches, classes, facilities, shifts, addCoach, editCoach, isCoach, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Coach form (Chỉ giữ Tên & SĐT)
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Admin Assign Facility & Shift Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignCoach, setSelectedAssignCoach] = useState<Coach | null>(null);
  const [assignFacilityId, setAssignFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [assignShiftId, setAssignShiftId] = useState(shifts[0]?.id || 'CA04');

  // Modal Chi Tiết Ca Dạy
  const [selectedPayrollCoach, setSelectedPayrollCoach] = useState<Coach | null>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [coachShiftsMap, setCoachShiftsMap] = useState<Record<string, CoachTaughtShift[]>>({});

  // Bộ lọc ca trong modal: 'ALL' hoặc Tên Ca (lấy từ Quản Lý Ca Học & Lịch Ca)
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [shiftSearch, setShiftSearch] = useState('');

  const openAssignModal = (coach: Coach) => {
    setSelectedAssignCoach(coach);
    setAssignFacilityId(coach.assignedFacilityId || facilities[0]?.id || 'CS01');
    setAssignShiftId(coach.assignedShiftId || shifts[0]?.id || 'CA04');
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignCoach) return;
    const fac = facilities.find(f => f.id === assignFacilityId);
    const sh = shifts.find(s => s.id === assignShiftId);
    editCoach(selectedAssignCoach.id, {
      assignedFacilityId: fac?.id,
      assignedFacilityName: fac?.name,
      assignedShiftId: sh?.id,
      assignedShiftName: `${sh?.name} (${sh?.timeSlot})`
    });
    setIsAssignModalOpen(false);
    showToast(`Đã cập nhật phân công cho HLV ${selectedAssignCoach.name}`, 'success');
  };

  // Mở Modal Chi Tiết Ca Dạy
  const openPayrollModal = (coach: Coach) => {
    setSelectedPayrollCoach(coach);
    if (!coachShiftsMap[coach.id]) {
      const initialShifts = generateCoachShifts(coach, shifts, facilities[0]?.name);
      setCoachShiftsMap(prev => ({ ...prev, [coach.id]: initialShifts }));
    }
    setShiftFilter('ALL');
    setShiftSearch('');
    setIsPayrollModalOpen(true);
  };

  const filteredCoaches = coaches.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleCreateCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const fac = facilities[0];
    const sh = shifts[0];

    addCoach({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: `${newName.trim().toLowerCase().replace(/\s+/g, '')}@smashzone.vn`,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      specialty: 'Kỹ thuật cơ bản & Di chuyển',
      experience: '5 năm kinh nghiệm',
      certificate: 'BWF Level 1 Coach',
      status: 'Active',
      assignedClassIds: [],
      assignedFacilityId: fac?.id,
      assignedFacilityName: fac?.name,
      assignedShiftId: sh?.id,
      assignedShiftName: sh ? `${sh.name} (${sh.timeSlot})` : undefined,
      rating: 5.0,
      joinedDate: '28/08/2026',
      hourlyRate: 300000
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    showToast('Thêm huấn luyện viên mới thành công!', 'success');
  };

  // Dữ liệu ca dạy hiện tại của HLV đang chọn trong modal
  const activeCoachShifts = useMemo(() => {
    if (!selectedPayrollCoach) return [];
    return coachShiftsMap[selectedPayrollCoach.id] || generateCoachShifts(selectedPayrollCoach, shifts, facilities[0]?.name);
  }, [selectedPayrollCoach, coachShiftsMap, shifts, facilities]);

  // Bộ lọc danh sách ca trong modal
  const filteredActiveShifts = useMemo(() => {
    return activeCoachShifts.filter(shift => {
      const matchFilter = shiftFilter === 'ALL' || shift.shiftName === shiftFilter || shift.shiftId === shiftFilter;
      const matchSearch =
        shift.date.includes(shiftSearch) ||
        shift.shiftName.toLowerCase().includes(shiftSearch.toLowerCase()) ||
        shift.facilityName.toLowerCase().includes(shiftSearch.toLowerCase()) ||
        shift.dayOfWeek.toLowerCase().includes(shiftSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [activeCoachShifts, shiftFilter, shiftSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Đội Ngũ Huấn Luyện Viên
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý thông tin HLV, lớp phụ trách và chi tiết ca dạy để tính thù lao ({coaches.length} HLV)
          </p>
        </div>

        {!isCoach && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Huấn Luyện Viên</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên HLV, số điện thoại, mã HLV (HLV001)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Coaches Grid - Tối giản chỉ giữ lại Tên, SĐT, Số lớp, Số ca đã dạy trong tháng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map(coach => {
          const coachClassesList = classes.filter(c => c.coachId === coach.id);
          const currentShifts = coachShiftsMap[coach.id] || generateCoachShifts(coach);
          const sessionsCount = currentShifts.length || coach.taughtSessionsMonth || 0;

          return (
            <div
              key={coach.id}
              className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* 1. Thông tin cơ bản: Avatar + Tên + SĐT */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] truncate group-hover:text-emerald-700 transition-colors">
                        {coach.name}
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                        {coach.code}
                      </span>
                    </div>

                    <a
                      href={`tel:${coach.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-600 font-semibold mt-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{coach.phone}</span>
                    </a>
                  </div>
                </div>

                {/* 2. Chỉ giữ lại 2 số liệu cốt lõi: Số lớp & Số ca đã dạy trong tháng */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Số lớp */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      Số lớp
                    </span>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#0F172A]">
                        {coachClassesList.length}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">lớp</span>
                    </div>
                  </div>

                  {/* Số ca đã dạy trong tháng */}
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex flex-col justify-between">
                    <span className="text-[11px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Ca dạy (Tháng 8)
                    </span>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-700">
                        {sessionsCount}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">ca</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Nút Xem chi tiết ca dạy */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPayrollModal(coach)}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Xem chi tiết ca dạy</span>
                </button>
                {!isCoach && (
                  <button
                    type="button"
                    onClick={() => openAssignModal(coach)}
                    title="Đổi phân công cơ sở & ca"
                    className="p-2.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <Building2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Chi Tiết Ca Đã Dạy Của HLV */}
      {selectedPayrollCoach && (
        <Modal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          title={`Chi Tiết Ca Đã Dạy: ${selectedPayrollCoach.name}`}
          subtitle={`Danh sách các ca đã dạy trong tháng (${selectedPayrollCoach.code})`}
          maxWidth="3xl"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* 1. HLV Overview Strip */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPayrollCoach.avatar}
                  alt={selectedPayrollCoach.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base">{selectedPayrollCoach.name}</span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      {selectedPayrollCoach.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedPayrollCoach.phone}</span>
                    <span className="text-slate-500">•</span>
                    <span>Kỳ giảng dạy: <strong>Tháng 08/2026</strong></span>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Chỉ để lại KPI: Tổng Ca Đã Dạy */}
            <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Tổng Ca Đã Dạy
                  </span>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Số ca huấn luyện viên đã dạy và hoàn thành trong tháng
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl border border-emerald-200/80 shadow-xs">
                <strong className="text-2xl font-black text-emerald-700">{activeCoachShifts.length}</strong>
                <span className="text-xs font-bold text-emerald-600">ca</span>
              </div>
            </div>

            {/* 3. Bộ lọc phân loại lấy các ca từ Quản Lý Ca Học & Lịch Ca */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShiftFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    shiftFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({activeCoachShifts.length})
                </button>
                {shifts.map(s => {
                  const countForShift = activeCoachShifts.filter(cs => cs.shiftName === s.name || cs.shiftId === s.id).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShiftFilter(s.name)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        shiftFilter === s.name
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {s.name} ({countForShift})
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={shiftSearch}
                  onChange={e => setShiftSearch(e.target.value)}
                  placeholder="Lọc ngày, cơ sở..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 4. Bảng Chi Tiết Ca Dạy - Tinh gọn 5 cột: #, Ngày dạy, Cơ sở, Phân loại, Trạng thái */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 text-[11px] font-extrabold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">#</th>
                      <th className="py-3 px-4">Ngày dạy</th>
                      <th className="py-3 px-4">Cơ sở</th>
                      <th className="py-3 px-4">Phân loại</th>
                      <th className="py-3 px-3.5 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredActiveShifts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Không tìm thấy ca dạy nào phù hợp với bộ lọc
                        </td>
                      </tr>
                    ) : (
                      filteredActiveShifts.map((shift, idx) => (
                        <tr key={shift.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#0F172A] block">{shift.date}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{shift.dayOfWeek}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {shift.facilityName}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${getShiftBadgeClass(shift.shiftName)}`}>
                              {shift.shiftName}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Đã dạy
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50/90 font-bold text-slate-700 border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="py-2.5 px-4 text-slate-500 text-xs">
                        Tổng số: <strong className="text-emerald-700 font-extrabold">{filteredActiveShifts.length}</strong> ca đã dạy
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Phân loại ca được đồng bộ trực tiếp từ Quản Lý Ca Học & Lịch Ca
              </span>
              <button
                type="button"
                onClick={() => setIsPayrollModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Coach Modal - Chỉ còn Tên và Số điện thoại */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Huấn Luyện Viên Mới"
        subtitle="Nhập họ tên và số điện thoại huấn luyện viên"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCoach} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Họ và tên HLV <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="VD: 0912 345 678"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Lưu HLV
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Assign Facility & Shift Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Phân Công Cơ Sở & Ca Dạy: ${selectedAssignCoach?.name || ''}`}
        subtitle="Admin chỉ định sân cầu lông và ca dạy cố định cho huấn luyện viên này"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Huấn luyện viên <strong>{selectedAssignCoach?.name}</strong> ({selectedAssignCoach?.code}) sẽ chỉ được phép đăng ký và giảng dạy tại đúng cơ sở và ca học được phân công dưới đây.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sân cầu lông / Cơ sở phân công *</label>
            <select
              value={assignFacilityId}
              onChange={e => setAssignFacilityId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ca dạy phân công *</label>
            <select
              value={assignShiftId}
              onChange={e => setAssignShiftId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
            >
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.timeSlot})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu Phân Công
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
