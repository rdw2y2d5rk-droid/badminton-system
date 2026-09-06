import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  Calendar,
  Clock,
  Users,
  BookOpen,
  ChevronRight,
  Shield,
  Star,
  Flame,
  Building2,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { Coach } from '../types';

export const CoachesView: React.FC = () => {
  const { coaches, classes, facilities, shifts, navigate, addCoach, editCoach, isCoach } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Coach form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newExperience, setNewExperience] = useState('5 năm kinh nghiệm');
  const [newCertificate, setNewCertificate] = useState('BWF Level 1 Coach');
  const [newFacilityId, setNewFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [newShiftId, setNewShiftId] = useState(shifts[0]?.id || 'CA04');

  // Admin Assign Facility & Shift Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignCoach, setSelectedAssignCoach] = useState<Coach | null>(null);
  const [assignFacilityId, setAssignFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [assignShiftId, setAssignShiftId] = useState(shifts[0]?.id || 'CA04');

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
  };

  const filteredCoaches = coaches.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleCreateCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const fac = facilities.find(f => f.id === newFacilityId);
    const sh = shifts.find(s => s.id === newShiftId);

    addCoach({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@smashzone.vn`,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      specialty: newSpecialty || 'Kỹ thuật cơ bản & Di chuyển',
      experience: newExperience,
      certificate: newCertificate,
      status: 'Active',
      assignedClassIds: [],
      assignedFacilityId: fac?.id,
      assignedFacilityName: fac?.name,
      assignedShiftId: sh?.id,
      assignedShiftName: `${sh?.name} (${sh?.timeSlot})`,
      rating: 5.0,
      joinedDate: '28/08/2026',
      hourlyRate: 300000
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewSpecialty('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Đội Ngũ Huấn Luyện Viên
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý thông tin HLV, lớp phụ trách và tổng kết số giờ dạy trong tháng ({coaches.length} HLV)
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
            placeholder="Tìm theo tên HLV, mã HLV (HLV001), chuyên môn..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map(coach => {
          const coachClassesList = classes.filter(c => c.coachId === coach.id);
          return (
            <div
              key={coach.id}
              className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-[#10B981]/50 shadow-xs hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#10B981]/30 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-[#0F172A] text-white px-2 py-0.5 rounded">
                        {coach.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {coach.certificate}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A] mt-1 truncate">
                      {coach.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{coach.specialty}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-[#0F172A]">{coach.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{coach.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>{coach.experience}</span>
                  </div>
                </div>

                {/* Sân & Ca dạy do Admin phân công */}
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sân & Ca Phân Công
                    </span>
                    {!isCoach && (
                      <button
                        type="button"
                        onClick={() => openAssignModal(coach)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline hover:no-underline cursor-pointer"
                      >
                        Đổi phân công
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-[#0F172A] truncate">
                        {coach.assignedFacilityName || 'Chưa phân công sân'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-600 truncate">
                        {coach.assignedShiftName || 'Chưa phân công ca dạy'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lớp</span>
                    <strong className="text-sm font-extrabold text-[#0F172A]">
                      {coachClassesList.length}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Học viên</span>
                    <strong className="text-sm font-extrabold text-[#0F172A]">
                      {coach.totalStudents}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Giờ dạy T8</span>
                    <strong className="text-sm font-extrabold text-[#10B981]">
                      {coach.taughtHoursMonth}h
                    </strong>
                  </div>
                </div>

                {/* Assigned Classes */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Lớp đang phụ trách ({coachClassesList.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coachClassesList.map(c => (
                      <span
                        key={c.id}
                        onClick={() => navigate('classes', c.id)}
                        className="text-xs font-bold px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg cursor-pointer transition-colors border border-emerald-100"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9/5.0 Đánh giá
                </span>
                <button
                  onClick={() => navigate('schedule')}
                  className="text-xs font-bold text-[#0F172A] hover:text-[#10B981] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Xem lịch dạy →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Coach Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Huấn Luyện Viên Mới"
        subtitle="Khai báo thông tin hồ sơ và chứng chỉ huấn luyện viên"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCoach} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên HLV *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="VD: hlv@smashzone.vn"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên môn đào tạo *</label>
            <input
              type="text"
              value={newSpecialty}
              onChange={e => setNewSpecialty(e.target.value)}
              placeholder="VD: Smash & Tấn công, Cơ bản 6 góc..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kinh nghiệm</label>
              <input
                type="text"
                value={newExperience}
                onChange={e => setNewExperience(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chứng chỉ</label>
              <input
                type="text"
                value={newCertificate}
                onChange={e => setNewCertificate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ sở / Sân phân công *</label>
              <select
                value={newFacilityId}
                onChange={e => setNewFacilityId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ca dạy phân công *</label>
              <select
                value={newShiftId}
                onChange={e => setNewShiftId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.timeSlot})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
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
