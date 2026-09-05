import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Users,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourtInfo, Facility } from '../types';
import { Modal } from '../components/common/Modal';

export const FacilitiesView: React.FC = () => {
  const {
    facilities,
    courts,
    classes,
    students,
    coaches,
    addFacility,
    editFacility,
    deleteFacility,
    addCourt,
    editCourt,
    deleteCourt,
    currentUser,
    isCoach,
    navigate
  } = useApp();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtInfo | null>(null);

  const [viewDetailCourt, setViewDetailCourt] = useState<CourtInfo | null>(null);

  // Facility Form State
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [facilityPhone, setFacilityPhone] = useState('');
  const [facilityManagerName, setFacilityManagerName] = useState('');
  const [facilityOpenHours, setFacilityOpenHours] = useState('06:00 - 22:30');
  const [facilityDesc, setFacilityDesc] = useState('');

  // Court Form State
  const [courtName, setCourtName] = useState('');
  const [courtFacilityId, setCourtFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [courtType, setCourtType] = useState<'Standard' | 'VIP'>('Standard');
  const [courtSurface, setCourtSurface] = useState('Thảm PVC Yonex 5.0mm');
  const [courtStatus, setCourtStatus] = useState<'Available' | 'InUse' | 'Maintenance'>('Available');
  const [courtPrice, setCourtPrice] = useState(150000);

  const openAddFacilityModal = () => {
    setEditingFacility(null);
    setFacilityName('');
    setFacilityAddress('');
    setFacilityPhone('');
    setFacilityManagerName('');
    setFacilityOpenHours('06:00 - 22:30');
    setFacilityDesc('');
    setIsFacilityModalOpen(true);
  };

  const openEditFacilityModal = (f: Facility) => {
    setEditingFacility(f);
    setFacilityName(f.name);
    setFacilityAddress(f.address);
    setFacilityPhone(f.phone);
    setFacilityManagerName(f.managerName || '');
    setFacilityOpenHours(f.openHours);
    setFacilityDesc(f.description || '');
    setIsFacilityModalOpen(true);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim() || !facilityAddress.trim()) return;

    if (editingFacility) {
      editFacility(editingFacility.id, {
        name: facilityName,
        address: facilityAddress,
        phone: facilityPhone,
        managerName: facilityManagerName,
        openHours: facilityOpenHours,
        description: facilityDesc
      });
    } else {
      addFacility({
        name: facilityName,
        address: facilityAddress,
        phone: facilityPhone,
        managerName: facilityManagerName,
        openHours: facilityOpenHours,
        totalCourts: 0,
        status: 'Active',
        description: facilityDesc
      });
    }
    setIsFacilityModalOpen(false);
  };

  const openAddCourtModal = () => {
    setEditingCourt(null);
    setCourtName('');
    setCourtFacilityId(selectedFacilityId !== 'ALL' ? selectedFacilityId : facilities[0]?.id || 'CS01');
    setCourtType('Standard');
    setCourtSurface('Thảm PVC Li-Ning 4.5mm');
    setCourtStatus('Available');
    setCourtPrice(150000);
    setIsCourtModalOpen(true);
  };

  const openEditCourtModal = (c: CourtInfo) => {
    setEditingCourt(c);
    setCourtName(c.name);
    setCourtFacilityId(c.facilityId);
    setCourtType(c.type);
    setCourtSurface(c.surface);
    setCourtStatus(c.status);
    setCourtPrice(c.pricePerHour || 150000);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) return;
    const facObj = facilities.find(f => f.id === courtFacilityId);

    if (editingCourt) {
      editCourt(editingCourt.id, {
        name: courtName,
        facilityId: courtFacilityId,
        facilityName: facObj ? facObj.name : editingCourt.facilityName,
        type: courtType,
        surface: courtSurface,
        status: courtStatus,
        pricePerHour: Number(courtPrice)
      });
    } else {
      addCourt({
        name: courtName,
        facilityId: courtFacilityId,
        facilityName: facObj ? facObj.name : 'Cơ sở SmashZone',
        type: courtType,
        surface: courtSurface,
        status: courtStatus,
        pricePerHour: Number(courtPrice)
      });
    }
    setIsCourtModalOpen(false);
  };

  // Filter courts
  const filteredCourts = courts.filter(c => {
    const matchesFacility = selectedFacilityId === 'ALL' || c.facilityId === selectedFacilityId;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.currentCoach && c.currentCoach.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.currentClass && c.currentClass.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFacility && matchesSearch;
  });

  // Calculate statistics
  const totalCourtsCount = courts.length;
  const inUseCourtsCount = courts.filter(c => c.status === 'InUse').length;
  const availableCourtsCount = courts.filter(c => c.status === 'Available').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Hệ Thống Cơ Sở & Sân Cầu Lông</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Cơ Sở & Sân Cầu Lông
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý địa điểm tập luyện, theo dõi giáo viên dạy ở đâu và học viên học ở sân nào
          </p>
        </div>

        {currentUser.role !== 'COACH' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddFacilityModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Thêm Cơ Sở</span>
            </button>
            <button
              onClick={openAddCourtModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Sân Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số cơ sở</div>
          <div className="text-3xl font-black text-[#0F172A] mt-1.5">{facilities.length}</div>
          <div className="text-xs text-slate-500 mt-1">Đang vận hành tại Hà Nội</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số sân tập</div>
          <div className="text-3xl font-black text-emerald-600 mt-1.5">{totalCourtsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Sân thảm tiêu chuẩn BWF</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang có ca học</div>
          <div className="text-3xl font-black text-sky-600 mt-1.5">{inUseCourtsCount}</div>
          <div className="text-xs text-slate-500 mt-1">HLV & học viên đang tập</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sân đang trống</div>
          <div className="text-3xl font-black text-amber-600 mt-1.5">{availableCourtsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Sẵn sàng xếp lịch mới</div>
        </div>
      </div>

      {/* Facility Selector Tabs */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFacilityId('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFacilityId === 'ALL'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả cơ sở ({courts.length} sân)
            </button>
            {facilities.map(f => {
              const facCourts = courts.filter(c => c.facilityId === f.id);
              const isSelected = selectedFacilityId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFacilityId(f.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.name} ({facCourts.length} sân)
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm sân, HLV, lớp..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#10B981]"
            />
          </div>
        </div>

        {/* Selected Facility Details Card */}
        {selectedFacilityId !== 'ALL' && (() => {
          const currentFac = facilities.find(f => f.id === selectedFacilityId);
          if (!currentFac) return null;
          const facClasses = classes.filter(c => c.facilityId === currentFac.id);
          const facStudents = students.filter(s => s.facilityId === currentFac.id);

          return (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-[#0F172A]">{currentFac.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {currentFac.code}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {currentFac.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {currentFac.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400" /> Quản lý: <strong>{currentFac.managerName || 'Chưa gán'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentFac.openHours}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-xs">
                  <div className="font-bold text-[#0F172A]">{facClasses.length} lớp học</div>
                  <div className="text-slate-500">{facStudents.length} học viên cố định</div>
                </div>
                {currentUser.role !== 'COACH' && (
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                    <button
                      onClick={() => openEditFacilityModal(currentFac)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Sửa cơ sở"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xoá cơ sở "${currentFac.name}"?`)) {
                          deleteFacility(currentFac.id);
                          setSelectedFacilityId('ALL');
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xoá cơ sở"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Courts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#10B981]" />
            <span>Danh Sách Sân Cầu Lông ({filteredCourts.length} sân)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourts.map(court => {
            // Find active classes and students at this court
            const courtClasses = classes.filter(
              c => c.court === court.name || (c.facilityId === court.facilityId && c.court === court.name)
            );
            const courtStudents = students.filter(
              s => s.courtName === court.name || (s.facilityId === court.facilityId && s.courtName === court.name)
            );
            const assignedCoaches = Array.from(new Set(courtClasses.map(c => c.coachName)));

            return (
              <div
                key={court.id}
                className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
              >
                {/* Court Top Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-[#0F172A]">{court.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          court.type === 'VIP'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {court.type === 'VIP' ? '★ VIP' : 'Tiêu Chuẩn'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{court.facilityName}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      court.status === 'InUse'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse'
                        : court.status === 'Available'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {court.status === 'InUse'
                      ? 'Đang có lớp'
                      : court.status === 'Available'
                      ? 'Sẵn sàng'
                      : 'Bảo trì'}
                  </span>
                </div>

                {/* Court Tech Info */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Chất liệu thảm:</span>
                    <strong className="text-[#0F172A]">{court.surface}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Đơn giá thuê:</span>
                    <strong className="text-[#10B981]">
                      {(court.pricePerHour || 150000).toLocaleString('vi-VN')} đ/giờ
                    </strong>
                  </div>
                </div>

                {/* Teaching Coach & Class Info */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" /> HLV giảng dạy:
                    </span>
                    <span className="font-bold text-[#0F172A] text-right">
                      {assignedCoaches.length > 0 ? assignedCoaches.join(', ') : (court.currentCoach || 'Chưa gán')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Lớp & Học viên:
                    </span>
                    <span className="font-bold text-slate-700 text-right">
                      {courtClasses.length} lớp ({courtStudents.length} học viên)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewDetailCourt(court)}
                    className="text-xs font-bold text-[#10B981] hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem ai học & dạy</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {currentUser.role !== 'COACH' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCourtModal(court)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Sửa thông tin sân"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xoá ${court.name}?`)) {
                            deleteCourt(court.id);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xoá sân"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add/Edit Facility */}
      <Modal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        title={editingFacility ? 'Cập Nhật Thông Tin Cơ Sở' : 'Thêm Cơ Sở Cầu Lông Mới'}
      >
        <form onSubmit={handleSaveFacility} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên cơ sở / Chi nhánh *
            </label>
            <input
              type="text"
              required
              value={facilityName}
              onChange={e => setFacilityName(e.target.value)}
              placeholder="VD: Cơ sở 3 - Thanh Xuân"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ cụ thể *</label>
            <input
              type="text"
              required
              value={facilityAddress}
              onChange={e => setFacilityAddress(e.target.value)}
              placeholder="VD: Số 88 Nguyễn Tuân, Thanh Xuân, Hà Nội"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotline / SĐT</label>
              <input
                type="text"
                value={facilityPhone}
                onChange={e => setFacilityPhone(e.target.value)}
                placeholder="VD: 0988 999 888"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quản lý cơ sở</label>
              <input
                type="text"
                value={facilityManagerName}
                onChange={e => setFacilityManagerName(e.target.value)}
                placeholder="VD: Hoàng Văn Long"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giờ mở cửa</label>
            <input
              type="text"
              value={facilityOpenHours}
              onChange={e => setFacilityOpenHours(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả cơ sở</label>
            <textarea
              rows={3}
              value={facilityDesc}
              onChange={e => setFacilityDesc(e.target.value)}
              placeholder="Thông tin thêm về cơ sở, bãi đỗ xe, tiện ích..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFacilityModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer"
            >
              {editingFacility ? 'Lưu Thay Đổi' : 'Tạo Cơ Sở'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add/Edit Court */}
      <Modal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        title={editingCourt ? 'Cập Nhật Thông Tin Sân' : 'Thêm Sân Cầu Lông Mới'}
      >
        <form onSubmit={handleSaveCourt} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thuộc cơ sở *</label>
            <select
              value={courtFacilityId}
              onChange={e => setCourtFacilityId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.address})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên sân *</label>
              <input
                type="text"
                required
                value={courtName}
                onChange={e => setCourtName(e.target.value)}
                placeholder="VD: Sân 06"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại sân</label>
              <select
                value={courtType}
                onChange={e => setCourtType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              >
                <option value="Standard">Tiêu Chuẩn (Standard)</option>
                <option value="VIP">VIP (VIP Court)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mặt thảm</label>
              <input
                type="text"
                value={courtSurface}
                onChange={e => setCourtSurface(e.target.value)}
                placeholder="VD: Thảm PVC Yonex 5.0mm"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá thuê (đ/h)</label>
              <input
                type="number"
                step="10000"
                value={courtPrice}
                onChange={e => setCourtPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái sân</label>
            <select
              value={courtStatus}
              onChange={e => setCourtStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            >
              <option value="Available">Sẵn sàng hoạt động (Available)</option>
              <option value="InUse">Đang có ca học (InUse)</option>
              <option value="Maintenance">Đang bảo trì thảm/lưới (Maintenance)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCourtModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer"
            >
              {editingCourt ? 'Lưu Thay Đổi' : 'Thêm Sân'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Teachers and Students at Court */}
      {viewDetailCourt && (
        <Modal
          isOpen={!!viewDetailCourt}
          onClose={() => setViewDetailCourt(null)}
          title={`Chi Tiết Hoạt Động: ${viewDetailCourt.name} (${viewDetailCourt.facilityName})`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Cơ sở:</span>
                <span className="font-bold text-[#0F172A]">{viewDetailCourt.facilityName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Mặt thảm:</span>
                <span className="font-bold text-[#0F172A]">{viewDetailCourt.surface}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Đơn giá:</span>
                <span className="font-bold text-[#10B981]">
                  {(viewDetailCourt.pricePerHour || 150000).toLocaleString('vi-VN')} đ/giờ
                </span>
              </div>
            </div>

            {/* Classes & Coaches List */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Huấn Luyện Viên & Các Lớp Dạy Tại Sân
              </h4>
              {classes.filter(c => c.court === viewDetailCourt.name).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Chưa có lớp nào được xếp lịch tại sân này.
                </div>
              ) : (
                <div className="space-y-2">
                  {classes
                    .filter(c => c.court === viewDetailCourt.name)
                    .map(cls => (
                      <div
                        key={cls.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm text-[#0F172A]">{cls.name}</div>
                          <div className="text-xs text-slate-500">
                            HLV: <strong className="text-emerald-700">{cls.coachName}</strong> | Lịch: {cls.scheduleDaysText} ({cls.timeSlot})
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setViewDetailCourt(null);
                            navigate('classes', cls.id);
                          }}
                          className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
                        >
                          Xem lớp
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Students studying at this court */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Danh Sách Học Viên Học Tại Sân Này
              </h4>
              {(() => {
                const targetClasses = classes.filter(c => c.court === viewDetailCourt.name);
                const classIds = targetClasses.map(c => c.id);
                const matchedStudents = students.filter(
                  s => classIds.includes(s.classId) || s.courtName === viewDetailCourt.name
                );

                if (matchedStudents.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      Chưa có học viên nào tại sân này.
                    </div>
                  );
                }

                return (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {matchedStudents.map(st => (
                      <div
                        key={st.id}
                        className="pt-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg"
                        onClick={() => {
                          setViewDetailCourt(null);
                          navigate('students', st.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-[#0F172A]">{st.name}</span>
                          <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                            {st.code}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          {st.className} • Còn {st.remainingSessions} buổi
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
