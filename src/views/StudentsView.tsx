import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  Filter,
  AlertTriangle,
  ChevronRight,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentBadge, StudentStatusBadge } from '../components/common/Badge';
import { SessionProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { PaymentStatus, SkillLevel } from '../types';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    coaches,
    navigate,
    addStudent,
    isCoach,
    assignedStudents
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'BD-B01');
  const [newPackageSessions, setNewPackageSessions] = useState(12);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Paid');
  const [newEmergency, setNewEmergency] = useState('');
  const [newNote, setNewNote] = useState('');

  const displayStudents = isCoach ? assignedStudents : students;

  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || student.classId === selectedClass;
    const matchesCoach = selectedCoach === 'ALL' || student.coachId === selectedCoach;
    const matchesPayment = selectedPayment === 'ALL' || student.paymentStatus === selectedPayment;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    return matchesSearch && matchesClass && matchesCoach && matchesPayment && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const targetClass = classes.find(c => c.id === newClassId);

    addStudent({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      classId: newClassId,
      className: targetClass?.name || 'Beginner 01',
      coachId: targetClass?.coachId || 'HLV001',
      coachName: targetClass?.coachName || 'Nguyễn Minh Anh',
      packageSessions: Number(newPackageSessions),
      attendedSessions: 0,
      remainingSessions: Number(newPackageSessions),
      paymentStatus: newPaymentStatus,
      status: 'Studying',
      joinedDate: '28/08/2026',
      emergencyContact: newEmergency || 'Gia đình - ' + newPhone,
      note: newNote,
      skillLevel: targetClass?.level || 'Beginner'
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNote('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Học Viên
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi tiến độ số buổi học, điểm danh và tình trạng học phí ({displayStudents.length} học viên)
          </p>
        </div>

        {!isCoach && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Học Viên Mới</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, mã HV (HV001), SĐT, lớp..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            aria-label="Lọc theo lớp học"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {!isCoach && (
            <select
              value={selectedCoach}
              onChange={e => setSelectedCoach(e.target.value)}
              aria-label="Lọc theo huấn luyện viên"
              className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả HLV</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  HLV {c.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedPayment}
            onChange={e => setSelectedPayment(e.target.value)}
            aria-label="Lọc theo học phí"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả học phí</option>
            <option value="Paid">Đã đóng</option>
            <option value="Unpaid">Chưa đóng</option>
            <option value="Overdue">Quá hạn</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái học viên"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Studying">Đang học</option>
            <option value="Expired">Đã hết buổi</option>
            <option value="Reserved">Bảo lưu</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Mã HV</th>
                <th className="py-3.5 px-4">Họ tên</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Lớp</th>
                <th className="py-3.5 px-4">HLV</th>
                <th className="py-3.5 px-4">Gói học</th>
                <th className="py-3.5 px-4 w-56">Tiến độ & Còn lại</th>
                <th className="py-3.5 px-4">Học phí</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy học viên nào.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => navigate('students', student.id)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {student.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                      {student.phone}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800 text-xs">
                      {student.className}
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{student.coachName}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {student.packageSessions} buổi
                    </td>
                    <td className="py-4 px-4">
                      <SessionProgressBar
                        attended={student.attendedSessions}
                        total={student.packageSessions}
                        remaining={student.remainingSessions}
                        size="md"
                        showDetails={true}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <PaymentBadge status={student.paymentStatus} />
                    </td>
                    <td className="py-4 px-4">
                      <StudentStatusBadge
                        status={student.status}
                        remaining={student.remainingSessions}
                      />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all inline" />
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
        {filteredStudents.map(student => (
          <div
            key={student.id}
            onClick={() => navigate('students', student.id)}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {student.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{student.phone}</div>
                </div>
              </div>
              <PaymentBadge status={student.paymentStatus} />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Lớp: <strong className="text-slate-900">{student.className}</strong>
                </span>
                <span>HLV: {student.coachName}</span>
              </div>

              <SessionProgressBar
                attended={student.attendedSessions}
                total={student.packageSessions}
                remaining={student.remainingSessions}
                size="md"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Học Viên Mới"
        subtitle="Đăng ký học viên mới và gán vào lớp học phù hợp"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="VD: Trần Minh Quân"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="VD: 0901 234 567"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="VD: minhquan@gmail.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lớp học đăng ký *</label>
              <select
                value={newClassId}
                onChange={e => setNewClassId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.levelLabel} - HLV {c.coachName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gói số buổi học *</label>
              <select
                value={newPackageSessions}
                onChange={e => setNewPackageSessions(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value={12}>Gói tiêu chuẩn 12 buổi</option>
                <option value={24}>Gói nâng cao 24 buổi</option>
                <option value={36}>Gói toàn diện 36 buổi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái học phí *</label>
              <select
                value={newPaymentStatus}
                onChange={e => setNewPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
              >
                <option value="Paid">Đã đóng đủ</option>
                <option value="Unpaid">Chưa đóng (Thu sau)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Liên hệ khẩn cấp / Người thân</label>
            <input
              type="text"
              value={newEmergency}
              onChange={e => setNewEmergency(e.target.value)}
              placeholder="VD: Mẹ - 0912 345 678"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú huấn luyện</label>
            <textarea
              rows={2}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Tay thuận, thể lực, mục tiêu tập luyện..."
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
              Lưu Học Viên
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
