import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  UserCheck,
  CreditCard,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Shield,
  Zap,
  Flame,
  Building2,
  RotateCw,
  CalendarCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AttendanceStatusBadge, PaymentBadge, StudentStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentId, onBack }) => {
  const {
    students,
    classes,
    payments,
    addSessionsToStudent,
    renewStudentMonth,
    confirmPayment,
    isCoach,
    navigate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'payments'>('profile');
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [extraSessionsCount, setExtraSessionsCount] = useState(12);

  // Monthly Renewal Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewMonth, setRenewMonth] = useState('Tháng 09/2026');
  const [renewStartDate, setRenewStartDate] = useState('2026-09-01');
  const [renewEndDate, setRenewEndDate] = useState('2026-09-30');
  const [renewPackageSessions, setRenewPackageSessions] = useState(12);

  const currentStudent = students.find(s => s.id === studentId) || students[0];
  const studentPayments = payments.filter(p => p.studentId === currentStudent.id);
  const studentClass = classes.find(c => c.id === currentStudent.classId);

  const handleConfirmAddSessions = (e: React.FormEvent) => {
    e.preventDefault();
    addSessionsToStudent(currentStudent.id, Number(extraSessionsCount));
    setIsAddSessionModalOpen(false);
  };

  const attendancePercent =
    currentStudent.packageSessions > 0
      ? Math.round((currentStudent.attendedSessions / currentStudent.packageSessions) * 100)
      : 0;

  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    renewStudentMonth(
      currentStudent.id,
      Number(renewPackageSessions),
      renewMonth,
      renewStartDate,
      renewEndDate
    );
    setIsRenewModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0F172A] bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách học viên</span>
        </button>

        {!isCoach && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRenewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Gia Hạn Tháng Mới (Bảo Lưu)</span>
            </button>
            <button
              onClick={() => setIsAddSessionModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Nạp Thêm Buổi</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Student Header Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={currentStudent.avatar}
              alt={currentStudent.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#10B981]/30 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-[#0F172A] text-white px-2 py-0.5 rounded-md">
                  {currentStudent.code}
                </span>
                <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  {currentStudent.name}
                </h1>
                <StudentStatusBadge
                  status={currentStudent.status}
                  remaining={currentStudent.remainingSessions}
                />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {currentStudent.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentStudent.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tham gia: {currentStudent.joinedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Lớp đang theo học</div>
              <div
                onClick={() => navigate('classes', currentStudent.classId)}
                className="text-base font-extrabold text-[#0F172A] hover:text-[#10B981] cursor-pointer flex items-center gap-1 transition-colors"
              >
                {currentStudent.className}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xs text-slate-500">
                HLV: <strong className="text-slate-800">{currentStudent.coachName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase">Gói đăng ký</div>
            <div className="text-2xl font-extrabold text-[#0F172A] mt-1">
              {currentStudent.packageSessions} Buổi
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {currentStudent.carriedOverSessions && currentStudent.carriedOverSessions > 0 ? (
                <span className="text-emerald-700 font-bold">
                  (Bảo lưu +{currentStudent.carriedOverSessions} buổi cũ)
                </span>
              ) : (
                'Kỳ học: ' + (currentStudent.month || 'Tháng 08/2026')
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase">Đã tham gia</div>
            <div className="text-2xl font-extrabold text-[#10B981] mt-1">
              {currentStudent.attendedSessions} Buổi
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Điểm danh có mặt</div>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              currentStudent.remainingSessions === 0
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : currentStudent.remainingSessions <= 2
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">
              Số buổi còn lại
            </div>
            <div className="text-3xl font-black mt-1">
              {currentStudent.remainingSessions} Buổi
            </div>
            <div className="text-[11px] font-semibold mt-0.5">
              {currentStudent.remainingSessions === 0
                ? 'Đã hết buổi - Cần gia hạn'
                : currentStudent.remainingSessions <= 2
                ? 'Sắp hết buổi'
                : 'Đủ điều kiện tập luyện'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase">Tình trạng học phí</div>
            <div className="mt-1.5">
              <PaymentBadge status={currentStudent.paymentStatus} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {currentStudent.paymentStatus === 'Paid' ? 'Đã hoàn tất' : 'Chưa thanh toán'}
            </div>
          </div>
        </div>

        {/* Fixed Schedule & Leave Quota Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Fixed Venue & Shift */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Đăng ký cơ sở & ca học cố định</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                {currentStudent.month || 'Tháng 08/2026'}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cơ sở & Sân:</span>
                <span className="font-bold text-white">
                  {currentStudent.facilityName || 'Cơ sở 1 - Cầu Giấy'} • {currentStudent.courtName || 'Sân 01'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ca học:</span>
                <span className="font-bold text-emerald-300">
                  {currentStudent.fixedShiftName || 'Ca Tối (18:00 - 19:30)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ngày cố định trong tuần:</span>
                <span className="font-extrabold text-amber-300">
                  {currentStudent.fixedDays && currentStudent.fixedDays.length > 0
                    ? currentStudent.fixedDays.join(', ')
                    : 'Thứ 2, Thứ 4, Thứ 6'}
                </span>
              </div>
            </div>
          </div>

          {/* Leave Quota (4 sessions = 1 leave) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-900 font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Quy luật nghỉ phép (4 buổi = 1 phép)</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-black">
                Bảo lưu số buổi
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Được phép</div>
                <div className="text-base font-black text-amber-900">
                  {currentStudent.allowedLeaves ?? Math.floor(currentStudent.packageSessions / 4)} buổi
                </div>
              </div>
              <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Đã dùng</div>
                <div className="text-base font-black text-rose-600">
                  {currentStudent.usedLeaves || 0} buổi
                </div>
              </div>
              <div className="p-2 bg-white/90 rounded-xl border border-amber-200">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Còn lại</div>
                <div className="text-base font-black text-emerald-600">
                  {Math.max(
                    0,
                    (currentStudent.allowedLeaves ?? Math.floor(currentStudent.packageSessions / 4)) -
                      (currentStudent.usedLeaves || 0)
                  )}{' '}
                  phép
                </div>
              </div>
            </div>
            <div className="text-[11px] text-amber-800/90 mt-2 font-medium leading-tight">
              * Nghỉ có phép bảo lưu số buổi không trừ. Toàn bộ buổi thừa sẽ được cộng dồn (bảo lưu) khi gia hạn tháng mới.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white px-4 sm:px-6 rounded-2xl shadow-xs overflow-x-auto whitespace-nowrap">
        {[
          { id: 'profile', label: 'Hồ sơ & Ghi chú' },
          { id: 'attendance', label: `Lịch sử điểm danh (${currentStudent.attendanceHistory?.length || 0})` },
          { id: 'payments', label: `Lịch sử học phí (${studentPayments.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 sm:py-4 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#10B981] text-[#10B981]'
                : 'border-transparent text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile & Notes */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Thông Tin Cá Nhân & Liên Hệ</h3>
            <div className="space-y-3 text-sm divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Họ và tên:</span>
                <strong className="text-[#0F172A]">{currentStudent.name}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Mã học viên:</span>
                <strong className="text-[#0F172A]">{currentStudent.code}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Số điện thoại:</span>
                <strong className="text-[#0F172A]">{currentStudent.phone}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Email:</span>
                <strong className="text-[#0F172A]">{currentStudent.email}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Liên hệ khẩn cấp:</span>
                <strong className="text-[#0F172A]">{currentStudent.emergencyContact || 'Chưa cập nhật'}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Ngày gia nhập:</span>
                <strong className="text-[#0F172A]">{currentStudent.joinedDate}</strong>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Ghi Chú Chuyên Môn Của HLV</h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
              {currentStudent.note ||
                'Học viên nắm bắt kỹ thuật nhanh, thể lực tốt. Đang hoàn thiện tư thế phông cầu cuối sân và đập cầu góc chéo.'}
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Đánh giá chỉ số
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Kỹ thuật cơ bản</span>
                    <span>8.5 / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Thể lực & Di chuyển</span>
                    <span>8.0 / 10</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0F172A]">Lịch Sử Điểm Danh Tham Gia</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ngày học</th>
                  <th className="py-3.5 px-4">Lớp</th>
                  <th className="py-3.5 px-4">Khung giờ</th>
                  <th className="py-3.5 px-4">Sân tập</th>
                  <th className="py-3.5 px-4">HLV phụ trách</th>
                  <th className="py-3.5 px-4">Trạng thái điểm danh</th>
                  <th className="py-3.5 px-5">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStudent.attendanceHistory && currentStudent.attendanceHistory.length > 0 ? (
                  currentStudent.attendanceHistory.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#0F172A] text-xs">{att.date}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                        {currentStudent.className}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">18:00 - 19:30</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">Sân 02</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{currentStudent.coachName}</td>
                      <td className="py-3.5 px-4">
                        <AttendanceStatusBadge status={att.status} />
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500">{att.note || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Chưa có dữ liệu điểm danh cho học viên này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payments History */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0F172A]">Lịch Sử Thu Học Phí</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã phiếu</th>
                  <th className="py-3.5 px-4">Số tiền</th>
                  <th className="py-3.5 px-4">Kỳ học phí</th>
                  <th className="py-3.5 px-4">Hạn nộp / Ngày nộp</th>
                  <th className="py-3.5 px-4">Hình thức</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0F172A] text-xs">{p.code}</td>
                    <td className="py-3.5 px-4 font-bold text-[#10B981] text-sm">
                      {p.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.month}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {p.paidDate ? (
                        <span className="text-[#10B981] font-semibold">{p.paidDate}</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">{p.dueDate}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.method || '—'}</td>
                    <td className="py-3.5 px-4">
                      <PaymentBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {p.status !== 'Paid' && (
                        <button
                          onClick={() => confirmPayment(p.id)}
                          className="px-3 py-1 bg-[#10B981] text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          Xác nhận đã thu
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      <Modal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        title={`Nạp Thêm Buổi Học: ${currentStudent.name}`}
        subtitle="Gia hạn gói tập luyện mới cho học viên"
      >
        <form onSubmit={handleConfirmAddSessions} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn số buổi muốn cộng thêm *
            </label>
            <select
              value={extraSessionsCount}
              onChange={e => setExtraSessionsCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
            >
              <option value={12}>+12 buổi (Gói 1 tháng - 1.800.000đ)</option>
              <option value={24}>+24 buổi (Gói 2 tháng - 3.400.000đ)</option>
              <option value={36}>+36 buổi (Gói 3 tháng - 4.800.000đ)</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            Số buổi mới sau khi nạp:{' '}
            <strong className="text-emerald-700 font-black">
              {currentStudent.remainingSessions + Number(extraSessionsCount)} buổi
            </strong>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSessionModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              Xác Nhận Nạp Buổi
            </button>
          </div>
        </form>
      </Modal>

      {/* Renew Month Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title={`Gia Hạn Kỳ Học Mới: ${currentStudent.name}`}
        subtitle="Tự động bảo lưu số buổi còn lại và cấp lại số ngày nghỉ phép mới theo quy định"
      >
        <form onSubmit={handleConfirmRenew} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kỳ / Tháng mới *
              </label>
              <input
                type="text"
                value={renewMonth}
                onChange={e => setRenewMonth(e.target.value)}
                placeholder="VD: Tháng 09/2026"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gói buổi học đăng ký kỳ mới *
              </label>
              <select
                value={renewPackageSessions}
                onChange={e => setRenewPackageSessions(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
              >
                <option value={12}>12 buổi (Khoảng 1 tháng - 1.800.000đ)</option>
                <option value={16}>16 buổi (Khoảng 1.5 tháng - 2.400.000đ)</option>
                <option value={24}>24 buổi (Khoảng 2 tháng - 3.400.000đ)</option>
                <option value={36}>36 buổi (Khoảng 3 tháng - 4.800.000đ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày bắt đầu kỳ mới
              </label>
              <input
                type="date"
                value={renewStartDate}
                onChange={e => setRenewStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày kết thúc kỳ mới
              </label>
              <input
                type="date"
                value={renewEndDate}
                onChange={e => setRenewEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          {/* Rollover & Leave Calculation Preview */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2.5 text-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Bảng Tính Tự Động Chuyển Giao & Bảo Lưu</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Buổi cũ chưa dùng (Bảo lưu):</span>
                <span className="text-sm font-extrabold text-[#0F172A]">
                  +{currentStudent.remainingSessions} buổi
                </span>
              </div>
              <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Buổi gói mới nạp:</span>
                <span className="text-sm font-extrabold text-emerald-600">
                  +{renewPackageSessions} buổi
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-600 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-100 block">Tổng buổi khả dụng kỳ mới:</span>
                <span className="text-lg font-black tracking-tight">
                  {currentStudent.remainingSessions + Number(renewPackageSessions)} Buổi Tập
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-100 block">Phép nghỉ mới (4 buổi = 1 phép):</span>
                <span className="text-base font-black text-amber-300">
                  {Math.floor(Number(renewPackageSessions) / 4)} Ngày phép
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 italic leading-snug">
              * Hệ thống sẽ tự động tạo hóa đơn học phí mới ({renewMonth}), đưa trạng thái học phí về &quot;Chưa đóng&quot; và reset số ngày phép đã sử dụng về 0.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRenewModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className="w-4 h-4" />
              <span>Xác Nhận Gia Hạn Tháng Mới</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
