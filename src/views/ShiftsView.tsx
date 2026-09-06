import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShiftInfo } from '../types';
import { Modal } from '../components/common/Modal';

export const ShiftsView: React.FC = () => {
  const {
    shifts,
    classes,
    students,
    coaches,
    addShift,
    editShift,
    deleteShift,
    currentUser,
    navigate
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Morning' | 'Afternoon' | 'Evening'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftInfo | null>(null);

  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [category, setCategory] = useState<'Morning' | 'Afternoon' | 'Evening'>('Evening');
  const [description, setDescription] = useState('');

  const [detailShift, setDetailShift] = useState<ShiftInfo | null>(null);

  const openAddModal = () => {
    setEditingShift(null);
    setShiftName('');
    setStartTime('18:00');
    setEndTime('19:30');
    setCategory('Evening');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: ShiftInfo) => {
    setEditingShift(s);
    setShiftName(s.name);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setCategory(s.category);
    setDescription(s.description || '');
    setIsModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim() || !startTime || !endTime) return;

    const timeSlot = `${startTime} - ${endTime}`;

    if (editingShift) {
      editShift(editingShift.id, {
        name: shiftName,
        startTime,
        endTime,
        timeSlot,
        category,
        description,
        isActive: true
      });
    } else {
      addShift({
        name: shiftName,
        startTime,
        endTime,
        timeSlot,
        category,
        description,
        isActive: true
      });
    }

    setIsModalOpen(false);
  };

  const filteredShifts = shifts.filter(s => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  // Check permission: Only ADMIN can manage shifts
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A]">Không Có Quyền Truy Cập</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Quản lý ca học chỉ có Admin hệ thống mới quản lý được. Role quản lý sân không có quyền truy cập hoặc thực hiện thao tác quản lý ca học.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('dashboard')}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Quay Về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Quản Lý Khung Giờ & Ca Tập</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Ca Học & Lịch Ca
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý danh sách các ca học trong ngày; theo dõi chi tiết giáo viên nào dạy ca nào và học viên nào học ca nào
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Ca Học Mới</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-[#10B981] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ca học ({shifts.length})
        </button>
        <button
          onClick={() => setSelectedCategory('Morning')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'Morning'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Ca Sáng</span>
        </button>
        <button
          onClick={() => setSelectedCategory('Afternoon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'Afternoon'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sunset className="w-3.5 h-3.5" />
          <span>Ca Chiều</span>
        </button>
        <button
          onClick={() => setSelectedCategory('Evening')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedCategory === 'Evening'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Ca Tối</span>
        </button>
      </div>

      {/* Shifts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShifts.map(shift => {
          // Find classes in this shift
          const shiftClasses = classes.filter(
            c => c.shiftId === shift.id || c.timeSlot.includes(shift.startTime)
          );
          const shiftCoaches = Array.from(new Set(shiftClasses.map(c => c.coachName)));
          const classIds = shiftClasses.map(c => c.id);
          const shiftStudents = students.filter(
            s => classIds.includes(s.classId) || s.fixedShiftId === shift.id
          );

          return (
            <div
              key={shift.id}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                      shift.category === 'Morning'
                        ? 'bg-amber-500'
                        : shift.category === 'Afternoon'
                        ? 'bg-orange-500'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {shift.category === 'Morning' ? (
                      <Sun className="w-5 h-5" />
                    ) : shift.category === 'Afternoon' ? (
                      <Sunset className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#0F172A]">{shift.name}</h3>
                    <div className="text-xs text-slate-500 font-semibold">{shift.code}</div>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                  {shift.timeSlot}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2">
                {shift.description || 'Khung giờ tập luyện tiêu chuẩn của trung tâm.'}
              </p>

              {/* Shift Stats: Coaches & Classes */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" /> HLV dạy ca này:
                  </span>
                  <span className="font-bold text-[#0F172A] text-right">
                    {shiftCoaches.length > 0 ? shiftCoaches.join(', ') : 'Chưa có HLV'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Số lớp mở:
                  </span>
                  <span className="font-bold text-[#10B981]">{shiftClasses.length} lớp</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Số học viên theo học:
                  </span>
                  <span className="font-bold text-slate-800">{shiftStudents.length} học viên</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setDetailShift(shift)}
                  className="text-xs font-bold text-[#10B981] hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Chi tiết HLV & Học viên</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {currentUser.role === 'ADMIN' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(shift)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Sửa ca học"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xoá ca "${shift.name}"?`)) {
                          deleteShift(shift.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xoá ca học"
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

      {/* Modal: Add/Edit Shift */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShift ? 'Cập Nhật Ca Học' : 'Tạo Ca Học Mới'}
      >
        <form onSubmit={handleSaveShift} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên ca học *</label>
            <input
              type="text"
              required
              value={shiftName}
              onChange={e => setShiftName(e.target.value)}
              placeholder="VD: Ca Chiều Muộn"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giờ bắt đầu *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giờ kết thúc *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại buổi</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            >
              <option value="Morning">Ca Sáng (Morning)</option>
              <option value="Afternoon">Ca Chiều (Afternoon)</option>
              <option value="Evening">Ca Tối (Evening)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ca học</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ghi chú mục đích, đối tượng học viên của ca học..."
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
              {editingShift ? 'Lưu Thay Đổi' : 'Tạo Ca Học'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Shift Details (Teachers & Students) */}
      {detailShift && (
        <Modal
          isOpen={!!detailShift}
          onClose={() => setDetailShift(null)}
          title={`Chi Tiết Ca Học: ${detailShift.name}`}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Khung giờ:</span>
                <span className="font-bold text-[#10B981] text-sm">{detailShift.timeSlot}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Phân loại:</span>
                <span className="font-bold text-[#0F172A]">
                  {detailShift.category === 'Morning'
                    ? 'Buổi Sáng'
                    : detailShift.category === 'Afternoon'
                    ? 'Buổi Chiều'
                    : 'Buổi Tối'}
                </span>
              </div>
            </div>

            {/* Teaching coaches & classes */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Các Lớp & Giáo Viên Dạy Ca Này
              </h4>
              {(() => {
                const shiftClasses = classes.filter(
                  c => c.shiftId === detailShift.id || c.timeSlot.includes(detailShift.startTime)
                );

                if (shiftClasses.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      Chưa có lớp nào dạy trong ca này.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {shiftClasses.map(cls => (
                      <div
                        key={cls.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm text-[#0F172A]">{cls.name}</div>
                          <div className="text-xs text-slate-500">
                            HLV: <strong className="text-emerald-700">{cls.coachName}</strong> | Sân: <strong>{cls.court}</strong> ({cls.facilityName || 'Cơ sở Cầu Giấy'})
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDetailShift(null);
                            navigate('classes', cls.id);
                          }}
                          className="text-xs font-bold text-[#10B981] hover:underline cursor-pointer"
                        >
                          Xem lớp
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Students list */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Danh Sách Học Viên Học Ca Này
              </h4>
              {(() => {
                const shiftClasses = classes.filter(
                  c => c.shiftId === detailShift.id || c.timeSlot.includes(detailShift.startTime)
                );
                const classIds = shiftClasses.map(c => c.id);
                const matchedStudents = students.filter(
                  s => classIds.includes(s.classId) || s.fixedShiftId === detailShift.id
                );

                if (matchedStudents.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      Chưa có học viên nào đăng ký ca này.
                    </div>
                  );
                }

                return (
                  <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {matchedStudents.map(st => (
                      <div
                        key={st.id}
                        className="pt-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg"
                        onClick={() => {
                          setDetailShift(null);
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
