import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Users,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Flame,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';

export const ClassesView: React.FC = () => {
  const {
    classes,
    coaches,
    navigate,
    addClass,
    isCoach,
    assignedClasses,
    setAttendanceTarget,
    facilities
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New class form state
  const [newClassName, setNewClassName] = useState('');
  const [newClassCoachId, setNewClassCoachId] = useState('HLV001');
  const [newClassScheduleDays, setNewClassScheduleDays] = useState(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
  const [newClassTimeSlot, setNewClassTimeSlot] = useState('18:00 - 19:30');
  const [newClassCourt, setNewClassCourt] = useState(facilities[0]?.name || 'Sân Cầu Lông Cầu Giấy');
  const [newClassMaxStudents, setNewClassMaxStudents] = useState(14);
  const [newClassFee, setNewClassFee] = useState(1800000);
  const [newClassDesc, setNewClassDesc] = useState('');

  const displayClasses = isCoach ? assignedClasses : classes;

  const filteredClasses = displayClasses.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.court.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCoach = selectedCoach === 'ALL' || cls.coachId === selectedCoach;
    const matchesStatus = selectedStatus === 'ALL' || cls.status === selectedStatus;

    return matchesSearch && matchesCoach && matchesStatus;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const coachObj = coaches.find(c => c.id === newClassCoachId);
    const targetFac = facilities.find(f => f.name === newClassCourt) || facilities[0];

    addClass({
      name: newClassName,
      level: 'Beginner',
      levelLabel: '',
      coachId: newClassCoachId,
      coachName: coachObj ? coachObj.name : 'Nguyễn Minh Anh',
      coachAvatar: coachObj?.avatar,
      facilityId: targetFac?.id,
      facilityName: targetFac?.name,
      scheduleDays: newClassScheduleDays,
      scheduleDaysText: 'T2 - CN',
      timeSlot: newClassTimeSlot,
      court: newClassCourt,
      maxStudents: Number(newClassMaxStudents),
      status: 'Active',
      feePerPackage: Number(newClassFee),
      totalSessions: 12,
      description: newClassDesc || 'Khóa học đào tạo cầu lông chuẩn kỹ thuật.',
      startDate: '01/09/2026'
    });

    setIsAddModalOpen(false);
    setNewClassName('');
    setNewClassDesc('');
  };

  const handleQuickAttendance = (classId: string) => {
    setAttendanceTarget({ classId, date: '2026-08-28' });
    navigate('attendance');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Lớp Cầu Lông
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isCoach
              ? `Các lớp cầu lông do bạn phụ trách (${displayClasses.length} lớp)`
              : `Danh sách các lớp đang hoạt động và xếp lịch trên toàn trung tâm (${classes.length} lớp)`}
          </p>
        </div>

        {!isCoach && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Lớp Mới</span>
          </button>
        )}
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã lớp, tên lớp, HLV, sân..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isCoach && (
            <select
              value={selectedCoach}
              onChange={e => setSelectedCoach(e.target.value)}
              aria-label="Lọc theo huấn luyện viên"
              className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả Huấn luyện viên</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  HLV {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Active">Đang hoạt động</option>
            <option value="Upcoming">Sắp mở</option>
            <option value="Paused">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã lớp</th>
                <th className="py-3.5 px-4">Tên lớp</th>
                <th className="py-3.5 px-4">Huấn luyện viên</th>
                <th className="py-3.5 px-4">Lịch học & Giờ</th>
                <th className="py-3.5 px-4">Sân</th>
                <th className="py-3.5 px-4 text-center">Học viên</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredClasses.map(cls => (
                  <tr
                    key={cls.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate('classes', cls.id)}
                  >
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {cls.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                      {cls.name}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {cls.coachAvatar && (
                          <img
                            src={cls.coachAvatar}
                            alt={cls.coachName}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                        )}
                        <span className="font-medium text-slate-800">{cls.coachName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 text-xs">
                        {cls.scheduleDaysText}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{cls.timeSlot}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 px-2.5 py-1 bg-slate-100 rounded-md">
                        <MapPin className="w-3 h-3 text-slate-400" /> {cls.court}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-[#0F172A] text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {cls.currentStudentsCount}/{cls.maxStudents}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          cls.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cls.status === 'Upcoming'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cls.status === 'Active'
                          ? 'Đang hoạt động'
                          : cls.status === 'Upcoming'
                          ? 'Sắp mở'
                          : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleQuickAttendance(cls.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#10B981] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Điểm danh</span>
                        </button>
                        <button
                          onClick={() => navigate('classes', cls.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredClasses.map(cls => (
          <div
            key={cls.id}
            onClick={() => navigate('classes', cls.id)}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {cls.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                </div>
                <div className="text-xs text-slate-500 mt-1">HLV: {cls.coachName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">Lịch & Giờ:</span>
                <span className="font-semibold">{cls.scheduleDaysText}</span> ({cls.timeSlot})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Sân & Học viên:</span>
                <span className="font-semibold">{cls.court}</span> ({cls.currentStudentsCount}/{cls.maxStudents} HV)
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                {cls.status === 'Active' ? 'Đang hoạt động' : 'Sắp mở'}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleQuickAttendance(cls.id);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Điểm danh</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Thêm lớp mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Lớp Cầu Lông Mới"
        subtitle="Khởi tạo lớp học mới và phân công HLV phụ trách"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên lớp học *</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="VD: Beginner 03, Smash Pro..."
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Huấn luyện viên *</label>
              <select
                value={newClassCoachId}
                onChange={e => setNewClassCoachId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              >
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>
                    HLV {c.name} ({c.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sân cầu lông *</label>
              <select
                value={newClassCourt}
                onChange={e => setNewClassCourt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lịch học trong tuần</label>
              <div className="px-3.5 py-2 text-sm bg-emerald-50/60 border border-emerald-200/80 rounded-xl font-bold text-emerald-800 flex items-center justify-between">
                <span>Thứ 2 — Chủ Nhật (T2 - CN)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Mở suốt tuần</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khung giờ học *</label>
              <select
                value={newClassTimeSlot}
                onChange={e => setNewClassTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value="18:00 - 19:30">18:00 - 19:30 (Tối ca 1)</option>
                <option value="19:30 - 21:00">19:30 - 21:00 (Tối ca 2)</option>
                <option value="06:00 - 07:30">06:00 - 07:30 (Sáng sớm)</option>
                <option value="08:00 - 10:00">08:00 - 10:00 (Cuối tuần)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số học viên tối đa</label>
              <input
                type="number"
                min="4"
                max="20"
                value={newClassMaxStudents}
                onChange={e => setNewClassMaxStudents(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Học phí trọn gói (12 buổi)</label>
              <input
                type="number"
                step="100000"
                value={newClassFee}
                onChange={e => setNewClassFee(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả khóa học</label>
            <textarea
              rows={2}
              value={newClassDesc}
              onChange={e => setNewClassDesc(e.target.value)}
              placeholder="Nội dung huấn luyện, đối tượng phù hợp..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
              Tạo Lớp Học
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
