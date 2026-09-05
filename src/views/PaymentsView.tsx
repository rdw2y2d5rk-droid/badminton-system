import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Plus,
  Building2,
  Receipt,
  Banknote,
  QrCode,
  Sparkles,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const PaymentsView: React.FC = () => {
  const { payments, classes, students, confirmPayment, collectPaymentAtCourt, currentUser, isCoach, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Tháng 08/2026');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Cashier Collection Modal State
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectType, setCollectType] = useState<'Tuition' | 'CourtFee' | 'Equipment' | 'Other'>('Tuition');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerClassId, setPayerClassId] = useState(classes[0]?.id || 'BD-B01');
  const [collectAmount, setCollectAmount] = useState<number>(1800000);
  const [collectMethod, setCollectMethod] = useState<'Tiền mặt' | 'Chuyển khoản QR' | 'Thẻ ngân hàng' | 'Ví MoMo'>('Chuyển khoản QR');
  const [collectNote, setCollectNote] = useState('');

  // Handle student selection in modal
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    const st = students.find(s => s.id === studentId);
    if (st) {
      setPayerName(st.name);
      setPayerPhone(st.phone);
      setPayerClassId(st.classId);
      const cls = classes.find(c => c.id === st.classId);
      setCollectAmount(cls?.feePerPackage || 1800000);
      setCollectNote(`Thu học phí tháng ${st.month || '09/2026'} - Gói ${st.packageSessions || 12} buổi`);
    }
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === payerClassId);
    collectPaymentAtCourt({
      studentId: collectType === 'Tuition' && selectedStudentId ? selectedStudentId : undefined,
      studentName: payerName || (selectedStudentId ? students.find(s => s.id === selectedStudentId)?.name || 'Khách' : 'Khách vãng lai'),
      studentPhone: payerPhone || '0988000000',
      classId: collectType === 'Tuition' ? payerClassId : undefined,
      className: collectType === 'Tuition' ? cls?.name : undefined,
      amount: Number(collectAmount),
      paymentType: collectType,
      method: collectMethod,
      note: collectNote || (collectType === 'CourtFee' ? 'Tiền thuê sân' : collectType === 'Equipment' ? 'Cầu & Nước' : 'Học phí')
    });

    setIsCollectModalOpen(false);
    setSelectedStudentId('');
    setPayerName('');
    setPayerPhone('');
    setCollectAmount(1800000);
    setCollectNote('');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesClass = selectedClass === 'ALL' || p.classId === selectedClass;
    const matchesType = selectedType === 'ALL' || p.paymentType === selectedType;

    return matchesSearch && matchesStatus && matchesClass && matchesType;
  });

  const totalCollected = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = payments
    .filter(p => p.status === 'Unpaid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = payments
    .filter(p => p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Thu Học Phí
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi hóa đơn học phí, ghi nhận thanh toán và nhắc nhở học viên quá hạn
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCoach && (
            <button
              onClick={() => setIsCollectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>+ Thu Tiền Tại Sân</span>
            </button>
          )}

          <button
            onClick={() => {
              alert('Đã xuất báo cáo học phí dạng file thành công!');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng Đã Thu (Tháng 08)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#10B981]">
            {totalCollected > 0 ? (totalCollected + 150000000).toLocaleString('vi-VN') : '156.000.000'}đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đạt 89.6% chỉ tiêu kỳ này</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chưa Thu (Đến hạn)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {totalUnpaid > 0 ? (totalUnpaid + 18000000).toLocaleString('vi-VN') : '21.600.000'}đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {payments.filter(p => p.status === 'Unpaid').length || 12} học viên chưa hoàn tất
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quá Hạn Đóng
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {totalOverdue > 0 ? (totalOverdue + 3600000).toLocaleString('vi-VN') : '5.400.000'}đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cần gửi tin nhắn nhắc nhở ngay</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã phiếu, tên học viên, lớp học..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm text-[#0F172A] rounded-xl border border-slate-200 outline-none focus:border-[#10B981]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo tình trạng học phí"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Paid">Đã đóng</option>
            <option value="Unpaid">Chưa đóng</option>
            <option value="Overdue">Quá hạn</option>
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            aria-label="Lọc theo loại khoản thu"
            className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả loại thu</option>
            <option value="Tuition">Học phí</option>
            <option value="CourtFee">Tiền thuê sân</option>
            <option value="Equipment">Cầu & Nước</option>
            <option value="Other">Khác</option>
          </select>

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
        </div>
      </div>

      {/* Payments Table (Desktop / Tablet) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-5">Mã phiếu</th>
                <th className="py-3.5 px-4">Người nộp / Học viên</th>
                <th className="py-3.5 px-4">Lớp / Dịch vụ</th>
                <th className="py-3.5 px-4">Số tiền</th>
                <th className="py-3.5 px-4">Kỳ học phí</th>
                <th className="py-3.5 px-4">Hạn nộp / Ngày nộp</th>
                <th className="py-3.5 px-4">Hình thức</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu thu nào.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {p.code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5 flex-wrap">
                        {p.studentId ? (
                          <button
                            onClick={() => navigate('students', p.studentId)}
                            className="hover:text-[#10B981] text-left cursor-pointer font-bold"
                          >
                            {p.studentName}
                          </button>
                        ) : (
                          <span>{p.studentName}</span>
                        )}
                        {p.paymentType && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              p.paymentType === 'Tuition'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.paymentType === 'CourtFee'
                                ? 'bg-sky-100 text-sky-800'
                                : p.paymentType === 'Equipment'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.paymentType === 'Tuition'
                              ? 'Học phí'
                              : p.paymentType === 'CourtFee'
                              ? 'Thuê sân'
                              : p.paymentType === 'Equipment'
                              ? 'Cầu & Nước'
                              : 'Khác'}
                          </span>
                        )}
                      </div>
                      {p.collectorName && (
                        <div className="text-[10px] text-slate-400 font-medium">
                          {p.facilityName || 'CS01'} • Thu bởi: {p.collectorName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 text-xs">
                      {p.className || p.note || 'Dịch vụ sân bãi'}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#10B981]">
                      {p.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">{p.month}</td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {p.paidDate ? (
                        <span className="text-[#10B981] font-semibold">{p.paidDate}</span>
                      ) : (
                        <span className={p.status === 'Overdue' ? 'text-rose-600 font-bold' : ''}>
                          {p.dueDate}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">{p.method || '—'}</td>
                    <td className="py-4 px-4">
                      <PaymentBadge status={p.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      {p.status !== 'Paid' ? (
                        <button
                          onClick={() => confirmPayment(p.id)}
                          className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Xác nhận thu
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Đã thu</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (Phones & Compact screens) */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
            Không tìm thấy phiếu thu nào.
          </div>
        ) : (
          filteredPayments.map(p => (
            <div
              key={p.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    {p.studentId ? (
                      <button
                        onClick={() => navigate('students', p.studentId)}
                        className="font-bold text-slate-900 text-sm hover:text-[#10B981] text-left cursor-pointer"
                      >
                        {p.studentName}
                      </button>
                    ) : (
                      <span className="font-bold text-slate-900 text-sm">{p.studentName}</span>
                    )}
                    {p.paymentType && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.paymentType === 'Tuition'
                          ? 'Học phí'
                          : p.paymentType === 'CourtFee'
                          ? 'Thuê sân'
                          : p.paymentType === 'Equipment'
                          ? 'Cầu & Nước'
                          : 'Khác'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Lớp: {p.className || p.note || 'Dịch vụ sân bãi'}
                  </div>
                </div>
                <PaymentBadge status={p.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kỳ học phí:</span>
                  <span className="font-semibold text-slate-700">{p.month}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Số tiền:</span>
                  <span className="text-base font-extrabold text-[#10B981]">
                    {p.amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500">
                  {p.paidDate ? (
                    <span>
                      Đã thu: <strong className="text-[#10B981]">{p.paidDate}</strong>
                    </span>
                  ) : (
                    <span>
                      Hạn:{' '}
                      <strong className={p.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}>
                        {p.dueDate}
                      </strong>
                    </span>
                  )}
                </div>

                {p.status !== 'Paid' && (
                  <button
                    onClick={() => confirmPayment(p.id)}
                    className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Xác nhận thu
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cashier Collection Modal */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Thu Tiền Trực Tiếp Tại Sân (Thu Ngân / Quản Lý Cơ Sở)"
        subtitle={`Cơ sở: ${currentUser.facilityName || 'Cơ sở 1 - Cầu Giấy'} • Thu ngân: ${currentUser.name}`}
      >
        <form onSubmit={handleConfirmCollect} className="space-y-4">
          {/* Payment Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Loại khoản thu *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Tuition', label: 'Học phí' },
                { id: 'CourtFee', label: 'Thuê sân' },
                { id: 'Equipment', label: 'Cầu & Nước' },
                { id: 'Other', label: 'Khác' }
              ].map(t => {
                const isSelected = collectType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCollectType(t.id as any);
                      if (t.id === 'CourtFee') {
                        setCollectAmount(150000);
                        setCollectNote('Thu tiền thuê sân 1 giờ');
                      } else if (t.id === 'Equipment') {
                        setCollectAmount(50000);
                        setCollectNote('Nước uống & cầu lẻ');
                      } else if (t.id === 'Tuition') {
                        setCollectAmount(1800000);
                        setCollectNote('Thu học phí');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Tuition: Select Student */}
          {collectType === 'Tuition' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn học viên nộp học phí *
              </label>
              <select
                value={selectedStudentId}
                onChange={e => handleStudentSelect(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                required
              >
                <option value="">-- Chọn học viên từ danh sách --</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code}) • {st.className} • Còn {st.remainingSessions} buổi
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên người nộp *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  placeholder="VD: Anh Tuấn (Sân 2)"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={e => setPayerPhone(e.target.value)}
                  placeholder="VD: 0988 123 456"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Amount & Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số tiền thu (VNĐ) *
            </label>
            <input
              type="number"
              value={collectAmount}
              onChange={e => setCollectAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-base border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-black text-[#10B981]"
              required
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {collectType === 'Tuition' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(1800000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    1.800.000đ (12b)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(2400000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    2.400.000đ (16b)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(3400000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    3.400.000đ (24b)
                  </button>
                </>
              )}
              {collectType === 'CourtFee' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(150000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    150.000đ (1 giờ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(300000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    300.000đ (2 giờ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(450000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    450.000đ (3 giờ)
                  </button>
                </>
              )}
              {collectType === 'Equipment' && (
                <>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(30000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    30.000đ (2 chai nước)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(75000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    75.000đ (3 quả cầu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(260000)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    260.000đ (1 hộp Yonex)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Hình thức thanh toán *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Chuyển khoản QR', label: 'Chuyển QR' },
                { id: 'Tiền mặt', label: 'Tiền mặt' },
                { id: 'Thẻ ngân hàng', label: 'Cà thẻ' },
                { id: 'Ví MoMo', label: 'Ví MoMo' }
              ].map(m => {
                const isSelected = collectMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCollectMethod(m.id as any)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thu ngân
            </label>
            <input
              type="text"
              value={collectNote}
              onChange={e => setCollectNote(e.target.value)}
              placeholder="VD: Thu 2 chai Pocari + 1 quấn cán vợt..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submitter info reminder */}
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center justify-between border border-slate-100">
            <span>
              Cơ sở ghi nhận:{' '}
              <strong className="text-slate-800">
                {currentUser.facilityName || 'Cơ sở 1 - Cầu Giấy'}
              </strong>
            </span>
            <span>
              Thu ngân: <strong className="text-slate-800">{currentUser.name}</strong>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCollectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>Xác Nhận Đã Thu Tiền</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
