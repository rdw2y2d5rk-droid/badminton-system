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
  Info
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
    coaches,
    facilities,
    shifts,
    courts,
    navigate,
    addStudent,
    importStudentsFromExcel,
    isCoach,
    currentUser,
    assignedStudents
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedCoach, setSelectedCoach] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFacilityId, setNewFacilityId] = useState(facilities[0]?.id || 'CS01');
  const [newCourtName, setNewCourtName] = useState('Sân 02');
  const [newShiftId, setNewShiftId] = useState(shifts[3]?.id || 'CA04'); // Default 18:00 - 19:30
  const [newFixedDays, setNewFixedDays] = useState<string[]>(['T2', 'T4', 'T6']);
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'BD-B01');

  // Month & Date Mode
  const [enrollmentMode, setEnrollmentMode] = useState<'month' | 'daterange'>('month');
  const [newMonthStr, setNewMonthStr] = useState('Tháng 09/2026');
  const [newStartDate, setNewStartDate] = useState('2026-09-01');
  const [newEndDate, setNewEndDate] = useState('2026-09-30');
  const [newPackageSessions, setNewPackageSessions] = useState(12);

  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Paid');
  const [newEmergency, setNewEmergency] = useState('');
  const [newNote, setNewNote] = useState('');

  // Excel Import State
  const [importText, setImportText] = useState('');
  const [previewRows, setPreviewRows] = useState<Array<Omit<Student, 'id' | 'code'>>>([]);
  const [importFileName, setImportFileName] = useState('');

  // Helper to calculate weekdays between 2 dates
  const calculateSessionsBetweenDates = (start: string, end: string, days: string[]): number => {
    if (!start || !end || days.length === 0) return 0;
    const dayMap: Record<number, string> = {
      0: 'CN',
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7'
    };
    let count = 0;
    const current = new Date(start);
    const stop = new Date(end);
    while (current <= stop) {
      const dayOfWeekStr = dayMap[current.getDay()];
      if (days.includes(dayOfWeekStr)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // Re-calculate sessions when daterange or fixed days change
  const handleDateOrDaysChange = (start: string, end: string, days: string[]) => {
    if (enrollmentMode === 'daterange') {
      const computedSessions = calculateSessionsBetweenDates(start, end, days);
      setNewPackageSessions(computedSessions || 12);
    }
  };

  const toggleDay = (day: string) => {
    const updated = newFixedDays.includes(day)
      ? newFixedDays.filter(d => d !== day)
      : [...newFixedDays, day];
    setNewFixedDays(updated);
    handleDateOrDaysChange(newStartDate, newEndDate, updated);
  };

  const displayStudents = isCoach ? assignedStudents : students;

  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.facilityName && student.facilityName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFacility = selectedFacility === 'ALL' || student.facilityId === selectedFacility;
    const matchesClass = selectedClass === 'ALL' || student.classId === selectedClass;
    const matchesCoach = selectedCoach === 'ALL' || student.coachId === selectedCoach;
    const matchesPayment = selectedPayment === 'ALL' || student.paymentStatus === selectedPayment;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;

    return matchesSearch && matchesFacility && matchesClass && matchesCoach && matchesPayment && matchesStatus;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const targetClass = classes.find(c => c.id === newClassId);
    const targetFacility = facilities.find(f => f.id === newFacilityId);
    const targetShift = shifts.find(s => s.id === newShiftId);

    const sessionsCount = Number(newPackageSessions);
    const allowedLeavesCount = Math.floor(sessionsCount / 4);

    addStudent({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`,
      classId: newClassId,
      className: targetClass?.name || 'Beginner 01',
      coachId: targetClass?.coachId || 'HLV001',
      coachName: targetClass?.coachName || 'Nguyễn Minh Anh',

      // Fixed Facility, Court, Shift, Days
      facilityId: targetFacility?.id || 'CS01',
      facilityName: targetFacility?.name || 'Cơ sở 1 - Cầu Giấy',
      courtName: newCourtName,
      fixedShiftId: targetShift?.id,
      fixedShiftName: targetShift?.timeSlot || '18:00 - 19:30',
      fixedDays: newFixedDays,

      // Month & Dates
      month: newMonthStr,
      startDate: newStartDate,
      endDate: newEndDate,

      // Sessions & Leaves
      packageSessions: sessionsCount,
      attendedSessions: 0,
      remainingSessions: sessionsCount,
      allowedLeaves: allowedLeavesCount,
      usedLeaves: 0,
      carriedOverSessions: 0,

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

  // Excel / CSV Template Download
  const downloadExcelTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'HoTen,SoDienThoai,Email,CoSo,CaHoc,ThuTrongTuan,SoBuoiHoc,HocPhi\n' +
      'Trần Văn Bình,0987111222,binh.tran@gmail.com,Cơ sở 1 - Cầu Giấy,18:00 - 19:30,T2;T4;T6,12,1800000\n' +
      'Lê Thị Mai,0912333444,mai.le@gmail.com,Cơ sở 1 - Cầu Giấy,19:30 - 21:00,T3;T5;T7,12,2200000\n' +
      'Nguyễn Văn Hùng,0934555666,hung.nguyen@gmail.com,Cơ sở 2 - Ba Đình,18:00 - 19:30,T2;T4;T6,12,1800000';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Mau_Import_Hoc_Vien_SmashZone.csv');
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
        const facName = parts[3]?.trim() || 'Cơ sở 1 - Cầu Giấy';
        const shiftStr = parts[4]?.trim() || '18:00 - 19:30';
        const daysStr = parts[5]?.trim() || 'T2;T4;T6';
        const days = daysStr.split(/[;,]/).map(d => d.trim());
        const sessions = Number(parts[6]?.trim()) || 12;

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
          courtName: 'Sân 02',
          fixedShiftName: shiftStr,
          fixedDays: days,
          packageSessions: sessions,
          attendedSessions: 0,
          remainingSessions: sessions,
          allowedLeaves: Math.floor(sessions / 4),
          usedLeaves: 0,
          carriedOverSessions: 0,
          paymentStatus: 'Paid',
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
            placeholder="Tìm tên học viên, mã HV (HV001), SĐT, cơ sở..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-[#0F172A] placeholder:text-slate-400 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Filter */}
          <select
            value={selectedFacility}
            onChange={e => setSelectedFacility(e.target.value)}
            aria-label="Lọc theo cơ sở"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="ALL">Tất cả cơ sở</option>
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            aria-label="Lọc theo lớp học"
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
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
              className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
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
            className="px-3 py-1.5 bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] cursor-pointer"
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
                <th className="py-3.5 px-5">Mã HV</th>
                <th className="py-3.5 px-4">Học viên</th>
                <th className="py-3.5 px-4">SĐT</th>
                <th className="py-3.5 px-4">Cơ sở & Sân</th>
                <th className="py-3.5 px-4">Lịch cố định</th>
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
                  <td colSpan={10} className="py-12 text-center text-slate-400">
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
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div>{student.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{student.className}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                        {student.phone}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <strong className="text-[#0F172A] block">{student.courtName || 'Sân 02'}</strong>
                        <span className="text-slate-400 text-[11px]">
                          {student.facilityName || 'Cơ sở 1 - Cầu Giấy'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                          {student.fixedDays?.join(' · ') || 'T2 · T4 · T6'}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {student.fixedShiftName || '18:00 - 19:30'}
                        </div>
                      </td>
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
                      <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {student.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                    </div>
                    <div className="text-xs text-slate-500">{student.phone}</div>
                  </div>
                </div>
                <PaymentBadge status={student.paymentStatus} />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cơ sở & Sân:</span>
                  <strong className="text-slate-800">{student.facilityName || 'Cơ sở Cầu Giấy'} - {student.courtName || 'Sân 02'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lịch cố định:</span>
                  <strong className="text-emerald-700">{student.fixedDays?.join(' · ') || 'T2 · T4 · T6'} ({student.fixedShiftName || '18:00 - 19:30'})</strong>
                </div>
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
        title="Thêm Học Viên Mới & Đăng Ký Lịch Cố Định"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
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

          {/* Fixed Facility & Court */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ sở đăng ký cố định *</label>
              <select
                value={newFacilityId}
                onChange={e => {
                  setNewFacilityId(e.target.value);
                  const facCourts = courts.filter(c => c.facilityId === e.target.value);
                  if (facCourts.length > 0) setNewCourtName(facCourts[0].name);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sân tập cố định</label>
              <select
                value={newCourtName}
                onChange={e => setNewCourtName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
              >
                {courts
                  .filter(c => c.facilityId === newFacilityId)
                  .map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Fixed Shift & Weekdays */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ca học cố định *</label>
                <select
                  value={newShiftId}
                  onChange={e => setNewShiftId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                >
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.timeSlot})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gán vào Lớp học *</label>
                <select
                  value={newClassId}
                  onChange={e => setNewClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.levelLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weekdays picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Các thứ cố định trong tuần (mặc định học những ngày này) *
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => {
                  const isSelected = newFixedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#10B981] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {day === 'CN' ? 'Chủ Nhật' : `Thứ ${day.substring(1)}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Month vs Date Range Mode */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phương thức đăng ký gói học:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('month')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    enrollmentMode === 'month' ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Đăng ký theo Tháng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnrollmentMode('daterange');
                    handleDateOrDaysChange(newStartDate, newEndDate, newFixedDays);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    enrollmentMode === 'daterange' ? 'bg-[#10B981] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Chọn Ngày BĐ — KT
                </button>
              </div>
            </div>

            {enrollmentMode === 'month' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tháng đăng ký</label>
                  <input
                    type="text"
                    value={newMonthStr}
                    onChange={e => setNewMonthStr(e.target.value)}
                    placeholder="VD: Tháng 09/2026"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số buổi học / tháng</label>
                  <input
                    type="number"
                    min={1}
                    value={newPackageSessions}
                    onChange={e => setNewPackageSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={e => {
                        setNewStartDate(e.target.value);
                        handleDateOrDaysChange(e.target.value, newEndDate, newFixedDays);
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={e => {
                        setNewEndDate(e.target.value);
                        handleDateOrDaysChange(newStartDate, e.target.value, newFixedDays);
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981] font-bold"
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Tự động tính từ các thứ đã chọn:</span>
                  <strong className="text-emerald-700 font-extrabold text-sm">
                    {newPackageSessions} buổi học
                  </strong>
                </div>
              </div>
            )}

            {/* Leave Allowance Callout */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Quy luật tính phép: <strong>{Math.floor(newPackageSessions / 4)} ngày phép</strong> (cứ 4 buổi = 1 phép, số buổi phép được bảo lưu sang tháng sau).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái học phí</label>
              <select
                value={newPaymentStatus}
                onChange={e => setNewPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              >
                <option value="Paid">Đã thanh toán đủ (Paid)</option>
                <option value="Unpaid">Chưa đóng học phí (Unpaid)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Liên hệ khẩn cấp</label>
              <input
                type="text"
                value={newEmergency}
                onChange={e => setNewEmergency(e.target.value)}
                placeholder="VD: Chị Mai (Vợ) - 0909 888 777"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10B981]"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu Học Viên
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
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Instructions and Download Template */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Chưa có file mẫu Excel?</div>
              <div className="text-[11px] text-slate-500">
                Tải file mẫu chuẩn với các cột Họ tên, SĐT, Cơ sở, Ca học, Thứ, Số buổi.
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
              placeholder={`HoTen\tSoDienThoai\tEmail\tCoSo\tCaHoc\tThuTrongTuan\tSoBuoiHoc\nTrần Văn Bình\t0987111222\tbinh@gmail.com\tCơ sở 1 - Cầu Giấy\t18:00 - 19:30\tT2;T4;T6\t12`}
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
