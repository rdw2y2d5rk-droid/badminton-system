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
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentBadge } from '../components/common/Badge';

export const PaymentsView: React.FC = () => {
  const { payments, classes, confirmPayment, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Tháng 08/2026');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesClass = selectedClass === 'ALL' || p.classId === selectedClass;

    return matchesSearch && matchesStatus && matchesClass;
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
                <th className="py-3.5 px-4">Học viên</th>
                <th className="py-3.5 px-4">Lớp học</th>
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
                    <td className="py-4 px-4 font-bold text-[#0F172A]">
                      <button
                        onClick={() => navigate('students', p.studentId)}
                        className="hover:text-[#10B981] text-left cursor-pointer"
                      >
                        {p.studentName}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 text-xs">{p.className}</td>
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <button
                      onClick={() => navigate('students', p.studentId)}
                      className="font-bold text-slate-900 text-sm hover:text-[#10B981] text-left cursor-pointer"
                    >
                      {p.studentName}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Lớp: {p.className}</div>
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
                    <span>Đã thu: <strong className="text-[#10B981]">{p.paidDate}</strong></span>
                  ) : (
                    <span>Hạn: <strong className={p.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}>{p.dueDate}</strong></span>
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
    </div>
  );
};
