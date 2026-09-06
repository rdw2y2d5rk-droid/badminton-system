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
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Building2,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  Bell,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentBadge, StudentStatusBadge } from '../components/common/Badge';
import { SessionProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { PaymentStatus, SkillLevel, Student } from '../types';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    facilities,
    shifts,
    courts,
    payments,
    sessionUnitPrice,
    navigate,
    addStudent,
    importStudentsFromExcel,
    isCoach,
    currentUser,
    assignedStudents
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const defaultFacilityId = (currentUser.role === 'FACILITY_MANAGER' && currentUser.facilityId)
    ? currentUser.facilityId
    : (facilities[0]?.id || 'CS01');
  const [newFacilityId, setNewFacilityId] = useState(defaultFacilityId);
  const [newShiftId, setNewShiftId] = useState(shifts[3]?.id || 'CA04'); // Default 18:00 - 19:30

  // Specific Dates & Month Mini-Calendar Picker
  const [selectedCalMonth, setSelectedCalMonth] = useState('2026-08'); // YYYY-MM
  const [newMonthStr, setNewMonthStr] = useState('Tháng 08/2026');
  const [specificDates, setSpecificDates] = useState<string[]>([
    '2026-08-03', '2026-08-05', '2026-08-07', '2026-08-10', '2026-08-12', '2026-08-14', '2026-08-17', '2026-08-19', '2026-08-21', '2026-08-24', '2026-08-26', '2026-08-28'
  ]);

  // Pricing & Sessions
  const [newUnitPrice, setNewUnitPrice] = useState<number>(sessionUnitPrice || 150000);
  const [newSessionsCount, setNewSessionsCount] = useState<number>(12);

  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [newNote, setNewNote] = useState('');

  // Preset helpers for interactive month picker
  const toggleDate = (dateStr: string) => {
    setSpecificDates(prev => {
      const next = prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort();
      setNewSessionsCount(next.length > 0 ? next.length : 12);
      return next;
    });
  };

  const applyQuickPreset = (preset: 'all' | 'weekdays' | 'weekend' | 'clear') => {
    const [year, month] = selectedCalMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: string[] = [];

    if (preset === 'clear') {
      setSpecificDates([]);
      setNewSessionsCount(12);
      return;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dObj = new Date(year, month - 1, day);
      const dayOfWeek = dObj.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (preset === 'all') {
        result.push(dateStr);
      } else if (preset === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
        result.push(dateStr);
      } else if (preset === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        result.push(dateStr);
      }
    }
    setSpecificDates(result);
    setNewSessionsCount(result.length > 0 ? result.length : 12);
  };

  // Excel Import State
  const [importText, setImportText] = useState('');
  const [previewRows, setPreviewRows] = useState<Array<Omit<Student, 'id' | 'code'>>>([]);
  const [importFileName, setImportFileName] = useState('');

  const displayStudents = isCoach ? assignedStudents : students;

  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      (student.className && student.className.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.facilityName && student.facilityName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFacility =
      currentUser.role === 'FACILITY_MANAGER'
        ? (currentUser.facilityId ? student.facilityId === currentUser.facilityId : true)
        : (selectedFacility === 'ALL' || student.facilityId === selectedFacility);
    const matchesPayment = selectedPayment === 'ALL' || student.paymentStatus === selectedPayment;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    return (
      matchesSearch &&
      matchesFacility &&
      matchesPayment &&
      matchesStatus
    );
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const effectiveFacilityId = currentUser.role === 'FACILITY_MANAGER' && currentUser.facilityId
      ? currentUser.facilityId
      : newFacilityId;
    const targetFacility = facilities.find(f => f.id === effectiveFacilityId) || facilities[0];
    const targetShift = shifts.find(s => s.id === newShiftId);

    const sessionsCount = Number(newSessionsCount) || (specificDates.length > 0 ? specificDates.length : 12);
    const unitPrice = Number(newUnitPrice) || sessionUnitPrice || 150000;
    const calculatedTuition = sessionsCount * unitPrice;
    const allowedLeavesCount = Math.floor(sessionsCount / 4);

    addStudent({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      classId: '',
      className: 'Chưa xếp lớp',
      coachId: '',
      coachName: 'Chưa phân công',

      // Sân & Ca học (Thống nhất Sân và Cơ sở)
      facilityId: targetFacility?.id || 'CS01',
      facilityName: targetFacility?.name || 'Sân Cầu Lông Cầu Giấy',
      courtName: targetFacility?.name || 'Sân Cầu Lông Cầu Giấy',
      fixedShiftId: targetShift?.id,
      fixedShiftName: targetShift?.name || 'Ca Tối 1',
      shiftId: targetShift?.id,
      shiftName: targetShift?.name || 'Ca Tối 1',
      timeSlot: targetShift?.timeSlot || '18:00 - 19:30',

      // Month & Specific Dates
      month: newMonthStr,
      specificDates: specificDates,
      scheduleStatus: 'confirmed',

      // Sessions & Leaves & Auto Tuition
      packageSessions: sessionsCount,
      tuitionFee: calculatedTuition,
      attendedSessions: 0,
      remainingSessions: sessionsCount,
      allowedLeaves: allowedLeavesCount,
      usedLeaves: 0,
      carriedOverSessions: 0,

      paymentStatus: newPaymentStatus,
      status: 'Studying',
      joinedDate: '28/08/2026',
      note: newNote ? `${newNote} (Đơn giá: ${unitPrice.toLocaleString('vi-VN')}đ/buổi)` : `Đơn giá: ${unitPrice.toLocaleString('vi-VN')}đ/buổi`,
      skillLevel: 'Beginner'
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNote('');
    setNewPaymentStatus('Unpaid');
  };

  // Excel / CSV Template Download
  const downloadExcelTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'HoTen,SoDienThoai,Email,SanCauLong,CaHoc,NgayHocCuTheTrongThang,HocPhi\n' +
      'Trần Văn Bình,0987111222,binh.tran@gmail.com,Sân Cầu Lông Cầu Giấy,18:00 - 19:30,2026-08-03;2026-08-05;2026-08-07;2026-08-10;2026-08-12;2026-08-14,1800000\n' +
      'Lê Thị Mai,0912333444,mai.le@gmail.com,Sân Cầu Lông Cầu Giấy,19:30 - 21:00,2026-08-04;2026-08-06;2026-08-08;2026-08-11;2026-08-13;2026-08-15,2200000\n' +
      'Nguyễn Văn Hùng,0934555666,hung.nguyen@gmail.com,Sân Cầu Lông Ba Đình,18:00 - 19:30,2026-08-03;2026-08-07;2026-08-10;2026-08-14;2026-08-17;2026-08-21,1800000';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'mau_danh_sach_hoc_vien_smashzone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse Text / CSV content
  const handleParseContent = (raw: string) => {
    setImportText(raw);
    if (!raw.trim()) {
      setPreviewRows([]);
      return;
    }

    const lines = raw.trim().split(/\r?\n/);
    const parsed: Array<Omit<Student, 'id' | 'code'>> = [];

    // Check if first row is header
    const firstLine = lines[0].toLowerCase();
    const startIndex = firstLine.includes('hoten') || firstLine.includes('họ tên') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by tab or comma
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.split(',');

      if (parts.length >= 2) {
        const name = parts[0]?.trim() || `Học viên ${i}`;
        const phone = parts[1]?.trim() || '0900 000 000';
        const email = parts[2]?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        const facName = parts[3]?.trim() || 'Sân Cầu Lông Cầu Giấy';
        const shiftStr = parts[4]?.trim() || '18:00 - 19:30';
        const datesStr = parts[5]?.trim() || '';
        const parsedDates = datesStr
          ? datesStr.split(/[;,]/).map(d => d.trim()).filter(Boolean)
          : ['2026-08-03', '2026-08-05', '2026-08-07', '2026-08-10', '2026-08-12', '2026-08-14', '2026-08-17', '2026-08-19'];
        const sessions = parsedDates.length > 0 ? parsedDates.length : (Number(parts[6]?.trim()) || 12);

        const defaultClass = classes[0];

        parsed.push({
          name,
          phone,
          email,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (i * 1000)}?w=150&auto=format&fit=crop&q=80`,
          classId: defaultClass.id,
          className: defaultClass.name,
          coachId: defaultClass.coachId,
          coachName: defaultClass.coachName,
          facilityId: facilities[0]?.id || 'CS01',
          facilityName: facName,
          courtName: facName,
          fixedShiftName: shiftStr,
          month: 'Tháng 08/2026',
          specificDates: parsedDates,
          scheduleStatus: 'pending_admin',
          packageSessions: sessions,
          attendedSessions: 0,
          remainingSessions: sessions,
          allowedLeaves: Math.floor(sessions / 4),
          usedLeaves: 0,
          carriedOverSessions: 0,
          paymentStatus: 'Unpaid',
          status: 'Studying',
          joinedDate: '28/08/2026',
          emergencyContact: 'Gia đình - ' + phone,
          skillLevel: 'Beginner'
        });
      }
    }

    setPreviewRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      handleParseContent(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;
    importStudentsFromExcel(previewRows);
    setIsImportModalOpen(false);
    setPreviewRows([]);
    setImportText('');
    setImportFileName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5">
            <Users className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Quản Lý Học Viên & Lịch Học Cố Định</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Quản Lý Học Viên
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Đăng ký lịch cố định (thứ, ca, cơ sở), tính phép (4 buổi = 1 phép) và gia hạn cộng dồn ({displayStudents.length} học viên)
          </p>
        </div>

        {currentUser.role !== 'COACH' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Import File Excel / CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Học Viên Mới</span>
            </button>
          </div>
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
            placeholder={
              currentUser.role === 'ADMIN'
                ? 'Tìm tên học viên, SĐT, sân cầu lông...'
                : currentUser.role === 'FACILITY_MANAGER'
                ? 'Tìm tên học viên, mã HV (HV001), SĐT...'
                : 'Tìm tên học viên, mã HV (HV001), SĐT, sân cầu lông...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter - Hidden for Facility Manager */}
          {currentUser.role !== 'FACILITY_MANAGER' && (
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              aria-label="Lọc theo sân cầu lông"
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả sân cầu lông</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}

          {!isCoach && (
            <select
              value={selectedPayment}
              onChange={e => setSelectedPayment(e.target.value)}
              aria-label="Lọc theo học phí"
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
            >
              <option value="ALL">Tất cả học phí</option>
              <option value="Paid">Đã đóng</option>
              <option value="Unpaid">Chưa đóng</option>
              <option value="Overdue">Quá hạn</option>
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            aria-label="Lọc theo trạng thái học viên"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
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
                {currentUser.role !== 'ADMIN' && (
                  <th className="py-3.5 px-5">Mã HV</th>
                )}
                <th className="py-3.5 px-4">Học viên</th>
                <th className="py-3.5 px-4">SĐT</th>
                {currentUser.role !== 'FACILITY_MANAGER' && (
                  <th className="py-3.5 px-4">Sân cầu lông</th>
                )}
                <th className="py-3.5 px-4">Quỹ phép</th>
                <th className="py-3.5 px-4 w-52">Tiến độ buổi học</th>
                <th className="py-3.5 px-4">Học phí</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      7 +
                      (currentUser.role !== 'ADMIN' ? 1 : 0) +
                      (currentUser.role !== 'FACILITY_MANAGER' ? 1 : 0)
                    }
                    className="py-12 text-center text-slate-400"
                  >
                    Không tìm thấy học viên nào.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const allowed = student.allowedLeaves ?? Math.floor(student.packageSessions / 4);
                  const used = student.usedLeaves || 0;
                  const carried = student.carriedOverSessions || 0;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => navigate('students', student.id)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {currentUser.role !== 'ADMIN' && (
                        <td className="py-4 px-5">
                          <span className="font-bold text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                            {student.code}
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4 font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div>{student.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{student.className || 'Chưa xếp lớp'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                        {student.phone}
                      </td>
                      {currentUser.role !== 'FACILITY_MANAGER' && (
                        <td className="py-4 px-4 text-xs">
                          <strong className="text-[#0F172A] block flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{student.facilityName || student.courtName || 'Sân Cầu Lông Cầu Giấy'}</span>
                          </strong>
                          <span className="text-slate-400 text-[11px]">
                            {student.shiftName || student.fixedShiftName || 'Ca Tối 1'}
                          </span>
                        </td>
                      )}
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-1 font-bold">
                          <span className={used >= allowed ? 'text-rose-600' : 'text-[#10B981]'}>
                            {used}/{allowed} phép
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {allowed - used > 0 ? `Còn ${allowed - used} phép` : 'Hết phép tháng'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <SessionProgressBar
                          attended={student.attendedSessions}
                          total={student.packageSessions}
                          remaining={student.remainingSessions}
                          size="md"
                          showDetails={true}
                        />
                        {carried > 0 && (
                          <div className="text-[10px] font-bold text-sky-600 mt-0.5">
                            + {carried} buổi cộng dồn tháng trước
                          </div>
                        )}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredStudents.map(student => {
          const allowed = student.allowedLeaves ?? Math.floor(student.packageSessions / 4);
          const used = student.usedLeaves || 0;
          return (
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
                      {currentUser.role !== 'ADMIN' && (
                        <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {student.code}
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                    </div>
                    <div className="text-xs text-slate-500">{student.phone}</div>
                  </div>
                </div>
                <div>
                  <PaymentBadge status={student.paymentStatus} />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                {currentUser.role !== 'FACILITY_MANAGER' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cơ sở & Sân:</span>
                    <strong className="text-slate-800">{student.facilityName || 'Cơ sở Cầu Giấy'} - {student.courtName || 'Sân 02'}</strong>
                  </div>
                )}
                {currentUser.role === 'ADMIN' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lịch học:</span>
                    <strong className="text-emerald-700">
                      {student.specificDates && student.specificDates.length > 0
                        ? `${student.specificDates.length} buổi linh hoạt`
                        : (student.fixedDays?.join(' · ') || 'T2 - CN')} ({student.fixedShiftName || '18:00 - 19:30'})
                    </strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Quỹ phép:</span>
                  <strong className="text-[#10B981]">{used} / {allowed} phép</strong>
                </div>
              </div>

              <div>
                <SessionProgressBar
                  attended={student.attendedSessions}
                  total={student.packageSessions}
                  remaining={student.remainingSessions}
                  size="sm"
                  showDetails={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add New Student with Fixed Schedule & Leaves */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Học Viên Mới (Chọn Ngày Học Trong Tháng)"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="VD: Trần Minh Quân"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
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
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="VD: minhquan.tran@gmail.com"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          {/* Sân Cầu Lông & Ca Học */}
          <div className={`grid ${currentUser.role === 'FACILITY_MANAGER' ? 'grid-cols-1' : 'grid-cols-2'} gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100`}>
            {currentUser.role !== 'FACILITY_MANAGER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sân cầu lông đăng ký học *
                </label>
                <select
                  value={newFacilityId}
                  onChange={e => setNewFacilityId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold bg-white"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ca học *</label>
              <select
                value={newShiftId}
                onChange={e => setNewShiftId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold bg-white"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Month Mini-Calendar Picker */}
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Chọn Các Ngày Sẽ Học Trong Tháng *</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Click vào từng ngày học viên muốn học linh hoạt trong tháng (không cố định thứ)
                </p>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Tháng:</span>
                <select
                  value={selectedCalMonth}
                  onChange={e => {
                    setSelectedCalMonth(e.target.value);
                    const [y, m] = e.target.value.split('-');
                    setNewMonthStr(`Tháng ${m}/${y}`);
                  }}
                  className="px-3 py-1 text-xs font-bold bg-white border border-emerald-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="2026-08">Tháng 08/2026</option>
                  <option value="2026-09">Tháng 09/2026</option>
                  <option value="2026-10">Tháng 10/2026</option>
                  <option value="2026-11">Tháng 11/2026</option>
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-emerald-100">
              <span className="text-[11px] font-bold text-slate-500 mr-1">Gợi ý nhanh:</span>
              <button
                type="button"
                onClick={() => applyQuickPreset('all')}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Cả tuần (T2 - CN)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('weekdays')}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Ngày thường (T2 - T6)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('weekend')}
                className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Cuối tuần (T7 - CN)
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset('clear')}
                className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer ml-auto"
              >
                ✕ Xoá chọn
              </button>
            </div>

            {/* Mini-Calendar Days Grid */}
            <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-xs">
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 pb-1 border-b border-slate-100">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
                  <div key={w} className={`text-[10px] font-bold ${idx >= 5 ? 'text-rose-500' : 'text-slate-500'}`}>
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Blank days before day 1 */}
                {(() => {
                  const [y, m] = selectedCalMonth.split('-').map(Number);
                  const firstDay = new Date(y, m - 1, 1).getDay(); // 0 = Sun
                  const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0
                  const blanks = [];
                  for (let i = 0; i < offset; i++) {
                    blanks.push(<div key={`blank-${i}`} className="h-8" />);
                  }
                  return blanks;
                })()}

                {/* Days of Month */}
                {(() => {
                  const [y, m] = selectedCalMonth.split('-').map(Number);
                  const daysInMonth = new Date(y, m, 0).getDate();
                  const dayElements = [];
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = specificDates.includes(dateStr);
                    const dayOfWeek = new Date(y, m - 1, d).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    dayElements.push(
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => toggleDate(dateStr)}
                        className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#10B981] text-white shadow-xs ring-1 ring-emerald-500 scale-105'
                            : isWeekend
                            ? 'bg-slate-50 text-rose-500 hover:bg-emerald-50 hover:text-emerald-700'
                            : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title={isSelected ? `Đã chọn ngày ${d}` : `Click để chọn ngày ${d}`}
                      >
                        {d}
                      </button>
                    );
                  }
                  return dayElements;
                })()}
              </div>
            </div>

            {/* Dynamic summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đã chọn: {specificDates.length} ngày học
                </span>
                <span className="px-2.5 py-1 bg-sky-100 text-sky-900 font-bold rounded-lg">
                  Gói học: {specificDates.length} buổi
                </span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Quỹ phép: {Math.floor(specificDates.length / 4)} buổi (4 buổi = 1 phép)
                </span>
              </div>
            </div>
          </div>

          {/* Đơn giá & Số buổi đăng ký */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đơn giá 1 buổi (VNĐ) *
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                required
                value={newUnitPrice}
                onChange={e => setNewUnitPrice(Number(e.target.value))}
                placeholder="VD: 150000"
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl outline-none focus:border-[#10B981] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số buổi học đăng ký *
              </label>
              <input
                type="number"
                min={1}
                required
                value={newSessionsCount}
                onChange={e => setNewSessionsCount(Number(e.target.value))}
                placeholder="VD: 12"
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl outline-none focus:border-[#10B981] bg-white"
              />
            </div>
          </div>

          {/* Automatic Tuition Calculation Card */}
          {(() => {
            const currentSessions = Number(newSessionsCount) || 0;
            const currentTuition = currentSessions * (Number(newUnitPrice) || 0);
            return (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/70 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Số buổi học đăng ký:</span>
                  </span>
                  <span className="font-extrabold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {currentSessions} buổi {specificDates.length > 0 && `(${specificDates.length} ngày đã chọn)`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Đơn giá 1 buổi:</span>
                  <span className="font-bold text-slate-800">
                    {(Number(newUnitPrice) || 0).toLocaleString('vi-VN')}đ / buổi
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-700 uppercase block">
                      Tiền học phí tự động tính:
                    </span>
                    <span className="text-[10px] text-slate-400">
                      = {currentSessions} buổi × {(Number(newUnitPrice) || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#10B981]">
                    {currentTuition.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái học phí ban đầu</label>
            <select
              value={newPaymentStatus}
              onChange={e => setNewPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] bg-white"
            >
              <option value="Unpaid">Chưa đóng học phí (Unpaid)</option>
              <option value="Paid">Đã thanh toán đủ (Paid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú học viên</label>
            <textarea
              rows={2}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Mục tiêu tập luyện, tay thuận, lưu ý sức khỏe..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Học Viên</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Import Excel / CSV */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Danh Sách Học Viên Từ File Excel / CSV"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
          {/* Instructions and Download Template */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Chưa có file mẫu Excel?</div>
              <div className="text-[11px] text-slate-500">
                Tải file mẫu chuẩn với các cột: Họ tên, SĐT, Sân cầu lông, Ca học, Ngày học cụ thể, Học phí.
              </div>
            </div>
            <button
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Tải file mẫu (.csv)</span>
            </button>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn file từ máy tính (.csv, .txt hoặc copy từ Excel)
            </label>
            <input
              type="file"
              accept=".csv, .txt, .tsv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#10B981] file:text-white hover:file:bg-emerald-600 cursor-pointer"
            />
          </div>

          {/* Or Paste textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hoặc dán trực tiếp dữ liệu từ Excel (Copy & Paste):
            </label>
            <textarea
              rows={4}
              value={importText}
              onChange={e => handleParseContent(e.target.value)}
              placeholder={`HoTen\tSoDienThoai\tEmail\tCoSo\tCaHoc\tThuTrongTuan\tSoBuoiHoc\nTrần Văn Bình\t0987111222\tbinh@gmail.com\tCơ sở 1 - Cầu Giấy\t18:00 - 19:30\tT2 - CN\t12`}
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
            />
          </div>

          {/* Live Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A]">
                  Xem trước dữ liệu ({previewRows.length} học viên hợp lệ)
                </span>
                <span className="text-[11px] font-bold text-[#10B981]">✓ Sẵn sàng Import</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Họ tên</th>
                      <th className="p-2">SĐT</th>
                      <th className="p-2">Cơ sở</th>
                      <th className="p-2">Ca học</th>
                      <th className="p-2">Thứ</th>
                      <th className="p-2">Buổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-[#0F172A]">{row.name}</td>
                        <td className="p-2 text-slate-600">{row.phone}</td>
                        <td className="p-2 text-slate-600 truncate max-w-[100px]">{row.facilityName}</td>
                        <td className="p-2 text-slate-600">{row.fixedShiftName}</td>
                        <td className="p-2 font-bold text-emerald-700">{row.fixedDays?.join(', ')}</td>
                        <td className="p-2 font-extrabold text-[#0F172A]">{row.packageSessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={previewRows.length === 0}
              onClick={handleConfirmImport}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                previewRows.length > 0
                  ? 'bg-[#10B981] hover:bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Xác Nhận Import ({previewRows.length} Học Viên)
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
