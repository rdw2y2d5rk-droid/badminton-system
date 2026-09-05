import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Facility } from '../types';
import { Modal } from '../components/common/Modal';

export const FacilitiesView: React.FC = () => {
  const {
    facilities,
    classes,
    students,
    coaches,
    addFacility,
    editFacility,
    deleteFacility,
    currentUser,
    navigate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [viewDetailFacility, setViewDetailFacility] = useState<Facility | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [openHours, setOpenHours] = useState('06:00 - 22:30');
  const [surface, setSurface] = useState('Thảm PVC Yonex 5.0mm BWF');
  const [pricePerHour, setPricePerHour] = useState(150000);
  const [status, setStatus] = useState<'Active' | 'Maintenance' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingFacility(null);
    setName('');
    setPhone('');
    setManagerName('');
    setOpenHours('06:00 - 22:30');
    setSurface('Thảm PVC Yonex 5.0mm BWF');
    setPricePerHour(150000);
    setStatus('Active');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Facility) => {
    setEditingFacility(f);
    setName(f.name);
    setPhone(f.phone || '');
    setManagerName(f.managerName || '');
    setOpenHours(f.openHours);
    setSurface(f.surface || 'Thảm PVC Yonex 5.0mm BWF');
    setPricePerHour(f.pricePerHour || 150000);
    setStatus(f.status);
    setDescription(f.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingFacility) {
      editFacility(editingFacility.id, {
        name: name.trim(),
        phone: phone.trim(),
        managerName: managerName.trim(),
        openHours: openHours.trim(),
        surface: surface.trim(),
        pricePerHour: Number(pricePerHour),
        status,
        description: description.trim()
      });
    } else {
      addFacility({
        name: name.trim(),
        phone: phone.trim(),
        managerName: managerName.trim(),
        openHours: openHours.trim(),
        surface: surface.trim(),
        pricePerHour: Number(pricePerHour),
        totalCourts: 1,
        status,
        description: description.trim()
      });
    }
    setIsModalOpen(false);
  };

  // Filter facilities
  const filteredFacilities = facilities.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.managerName && f.managerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatusFilter === 'ALL' || f.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(f => f.status === 'Active').length;
  const totalCoachesCount = coaches.length;
  const totalStudentsCount = students.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Địa Điểm Đào Tạo & Tập Luyện Cầu Lông</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Danh Sách Sân Cầu Lông
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Thêm, sửa, xoá và cập nhật thông tin sân — Theo dõi giáo viên dạy ở sân nào và học viên học ở sân nào
          </p>
        </div>

        {currentUser.role !== 'COACH' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Sân Cầu Lông</span>
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số sân cầu lông</div>
          <div className="text-3xl font-black text-[#0F172A] mt-1.5">{totalFacilities}</div>
          <div className="text-xs text-slate-500 mt-1">Sân tập trực thuộc hệ thống</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sân đang hoạt động</div>
          <div className="text-3xl font-black text-emerald-600 mt-1.5">{activeFacilities}</div>
          <div className="text-xs text-slate-500 mt-1">Sẵn sàng nhận lớp & học viên</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">HLV đang giảng dạy</div>
          <div className="text-3xl font-black text-sky-600 mt-1.5">{totalCoachesCount}</div>
          <div className="text-xs text-slate-500 mt-1">Phân bổ tại các sân</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên đang theo học</div>
          <div className="text-3xl font-black text-amber-600 mt-1.5">{totalStudentsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Đã đăng ký ca tập cố định</div>
        </div>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === 'ALL'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({facilities.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === 'Active'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đang hoạt động ({facilities.filter(f => f.status === 'Active').length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Maintenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === 'Maintenance'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bảo trì ({facilities.filter(f => f.status === 'Maintenance').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm tên sân, người quản lý..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#10B981]"
          />
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map(facility => {
          // Identify coaches teaching at this court
          const facilityClasses = classes.filter(
            c => c.facilityId === facility.id || c.facilityName === facility.name
          );
          const facilityCoaches = Array.from(
            new Set(facilityClasses.map(c => c.coachName).filter(Boolean))
          );

          // Identify students enrolled at this court
          const facilityStudents = students.filter(
            s => s.facilityId === facility.id || s.facilityName === facility.name
          );

          return (
            <div
              key={facility.id}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-[#0F172A]">{facility.name}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {facility.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                      facility.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : facility.status === 'Maintenance'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {facility.status === 'Active'
                      ? '● Hoạt động'
                      : facility.status === 'Maintenance'
                      ? '▲ Bảo trì'
                      : '■ Tạm dừng'}
                  </span>
                </div>

                {/* Specs Info */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Người quản lý:</span>
                    <strong className="text-[#0F172A]">{facility.managerName || 'Chưa gán'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Hotline sân:</span>
                    <strong className="text-[#0F172A]">{facility.phone || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Giờ mở cửa:</span>
                    <strong className="text-[#0F172A]">{facility.openHours}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Đơn giá thuê:</span>
                    <strong className="text-[#10B981]">
                      {(facility.pricePerHour || 150000).toLocaleString('vi-VN')} đ/giờ
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Mặt thảm:</span>
                    <strong className="text-slate-700 truncate max-w-[180px]">
                      {facility.surface || 'Thảm PVC Yonex 5.0mm'}
                    </strong>
                  </div>
                </div>

                {/* Teaching & Learning overview */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> HLV giảng dạy:
                    </span>
                    <span className="font-bold text-[#0F172A] text-right">
                      {facilityCoaches.length > 0 ? facilityCoaches.join(', ') : 'Chưa có HLV'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-600" /> Học viên đang học:
                    </span>
                    <span className="font-bold text-slate-700 text-right">
                      {facilityStudents.length} học viên ({facilityClasses.length} lớp học)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setViewDetailFacility(facility)}
                  className="text-xs font-bold text-[#10B981] hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem ai học & dạy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {currentUser.role !== 'COACH' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(facility)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Sửa thông tin sân"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xoá sân "${facility.name}" khỏi hệ thống?`)) {
                          deleteFacility(facility.id);
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

      {/* Modal: Add/Edit Facility (Sân Cầu Lông) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? 'Cập Nhật Thông Tin Sân Cầu Lông' : 'Thêm Sân Cầu Lông Mới'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên sân cầu lông *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Sân Cầu Lông Cầu Giấy"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotline / SĐT *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="VD: 0988 123 456"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quản lý phụ trách sân</label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="VD: Nguyễn Văn Thắng"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đơn giá thuê (đ/h)</label>
              <input
                type="number"
                step="10000"
                value={pricePerHour}
                onChange={e => setPricePerHour(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giờ mở cửa</label>
              <input
                type="text"
                value={openHours}
                onChange={e => setOpenHours(e.target.value)}
                placeholder="06:00 - 22:30"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu chuẩn thảm</label>
              <input
                type="text"
                value={surface}
                onChange={e => setSurface(e.target.value)}
                placeholder="VD: Thảm PVC Yonex 5.0mm BWF"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái sân</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                <option value="Active">Đang hoạt động (Active)</option>
                <option value="Maintenance">Đang bảo trì thảm/lưới (Maintenance)</option>
                <option value="Inactive">Tạm dừng hoạt động (Inactive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả & Tiện ích</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="VD: Có chỗ đỗ xe ô tô, điều hoà, phòng tắm nóng lạnh..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer"
            >
              {editingFacility ? 'Lưu Thay Đổi' : 'Tạo Sân Cầu Lông'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Teachers and Students at Court */}
      {viewDetailFacility && (
        <Modal
          isOpen={!!viewDetailFacility}
          onClose={() => setViewDetailFacility(null)}
          title={`Chi Tiết Hoạt Động: ${viewDetailFacility.name}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Hotline:</span>
                <span className="font-bold text-[#0F172A]">{viewDetailFacility.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Đơn giá:</span>
                <span className="font-bold text-[#10B981]">
                  {(viewDetailFacility.pricePerHour || 150000).toLocaleString('vi-VN')} đ/giờ
                </span>
              </div>
            </div>

            {/* Classes & Coaches List */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Huấn Luyện Viên & Lớp Học Giảng Dạy Tại Sân
              </h4>
              {classes.filter(
                c => c.facilityId === viewDetailFacility.id || c.facilityName === viewDetailFacility.name
              ).length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Chưa có lớp nào được xếp lịch tại sân này.
                </div>
              ) : (
                <div className="space-y-2">
                  {classes
                    .filter(
                      c => c.facilityId === viewDetailFacility.id || c.facilityName === viewDetailFacility.name
                    )
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
                            setViewDetailFacility(null);
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
                const matchedStudents = students.filter(
                  s => s.facilityId === viewDetailFacility.id || s.facilityName === viewDetailFacility.name
                );

                if (matchedStudents.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      Chưa có học viên nào tại sân này.
                    </div>
                  );
                }

                return (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                    {matchedStudents.map(st => (
                      <div
                        key={st.id}
                        className="pt-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg"
                        onClick={() => {
                          setViewDetailFacility(null);
                          navigate('students', st.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="font-bold text-[#0F172A]">{st.name}</span>
                            <span className="ml-1 text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                              {st.code}
                            </span>
                          </div>
                        </div>
                        <div className="text-slate-500 text-right">
                          <span className="font-medium text-[#0F172A]">{st.className}</span>
                          <span className="block text-[11px] text-emerald-600">
                            Còn {st.remainingSessions} buổi
                          </span>
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
