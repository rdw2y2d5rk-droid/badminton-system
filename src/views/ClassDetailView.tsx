import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Award,
  Plus,
  Shield,
  UserCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LevelBadge, PaymentBadge, SessionStatusBadge, StudentStatusBadge } from '../components/common/Badge';
import { SessionProgressBar } from '../components/common/ProgressBar';

interface ClassDetailViewProps {
  classId: string;
  onBack: () => void;
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ classId, onBack }) => {
  const {
    classes,
    students,
    sessions,
    navigate,
    setAttendanceTarget
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'schedule' | 'attendance'>('overview');

  const currentClass = classes.find(c => c.id === classId) || classes[0];
  const classStudents = students.filter(s => s.classId === currentClass.id);
  const classSessions = sessions.filter(s => s.classId === currentClass.id);

  const handleGoAttendance = (sessionId?: string) => {
    setAttendanceTarget({
      classId: currentClass.id,
      date: '2026-08-28',
      sessionId
    });
    navigate('attendance');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0F172A] bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách lớp</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGoAttendance()}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Điểm Danh Lớp Này</span>
          </button>
        </div>
      </div>

      {/* Class Information Header Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black bg-[#0F172A] text-white px-2.5 py-1 rounded-lg">
                {currentClass.code}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {currentClass.name}
              </h1>
              <LevelBadge level={currentClass.level} size="md" />
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentClass.status === 'Active' ? 'Đang hoạt động' : 'Sắp mở'}
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">{currentClass.description}</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shrink-0">
            {currentClass.coachAvatar && (
              <img
                src={currentClass.coachAvatar}
                alt={currentClass.coachName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-300"
              />
            )}
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400">Huấn Luyện Viên</div>
              <div className="text-sm font-extrabold text-[#0F172A]">{currentClass.coachName}</div>
              <div className="text-xs text-[#10B981] font-semibold">BWF Certified Coach</div>
            </div>
          </div>
        </div>

        {/* 4 Info Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Calendar className="w-3.5 h-3.5" /> Lịch tập
            </div>
            <div className="text-base font-extrabold text-[#0F172A]">
              {currentClass.scheduleDaysText}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" /> Khung giờ
            </div>
            <div className="text-base font-extrabold text-[#0F172A]">{currentClass.timeSlot}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" /> Sân tập
            </div>
            <div className="text-base font-extrabold text-[#0F172A]">{currentClass.court}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
              <Users className="w-3.5 h-3.5" /> Số học viên
            </div>
            <div className="text-base font-extrabold text-[#0F172A]">
              {classStudents.length}/{currentClass.maxStudents} HV
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 bg-white px-4 sm:px-6 rounded-2xl shadow-xs overflow-x-auto whitespace-nowrap">
        {[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'students', label: `Học viên (${classStudents.length})` },
          { id: 'schedule', label: `Lịch học (${classSessions.length})` },
          { id: 'attendance', label: 'Lịch sử điểm danh' }
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

      {/* Tab 1: Tổng quan */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">Giới Thiệu & Mục Tiêu Khóa Học</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Khóa học {currentClass.name} dành cho học viên trình độ {currentClass.levelLabel}.
                Chương trình chuẩn hóa kỹ thuật cơ bản gồm 6 góc di chuyển, tư thế ve cầu, phông cầu sâu cuối sân
                và cảm giác cầu trên lưới.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-[#0F172A]">Học phí trọn gói</div>
                  <div className="text-lg font-extrabold text-[#10B981] mt-0.5">
                    {currentClass.feePerPackage.toLocaleString('vi-VN')}đ / 12 buổi
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-xs font-bold text-[#0F172A]">Tỷ lệ điểm danh trung bình</div>
                  <div className="text-lg font-extrabold text-[#0F172A] mt-0.5">92.4%</div>
                </div>
              </div>
            </div>

            {/* Quick Students Roster Preview */}
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A]">Học Viên Trong Lớp</h3>
                <button
                  onClick={() => setActiveTab('students')}
                  className="text-xs font-bold text-[#10B981] hover:text-emerald-600 cursor-pointer transition-colors"
                >
                  Xem tất cả ({classStudents.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classStudents.slice(0, 6).map(student => (
                  <div
                    key={student.id}
                    onClick={() => navigate('students', student.id)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-[#10B981]/40 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0F172A]">{student.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {student.code} • Còn {student.remainingSessions}/{student.packageSessions} buổi
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-[#0F172A] to-slate-800 text-white rounded-3xl shadow-md space-y-4 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="uppercase tracking-wider">Buổi Học Sắp Tới</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  Hôm nay
                </span>
              </div>

              <div>
                <div className="text-xl font-extrabold">{currentClass.name}</div>
                <div className="text-xs text-slate-300 mt-1">
                  18:00 - 19:30 • {currentClass.court} • {classStudents.length} học viên
                </div>
              </div>

              <button
                onClick={() => handleGoAttendance()}
                className="w-full py-2.5 bg-[#10B981] hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Mở Phiếu Điểm Danh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Danh sách học viên */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0F172A]">
              Danh Sách Học Viên ({classStudents.length} học viên)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã HV</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Tiến độ gói học</th>
                  <th className="py-3.5 px-4">Học phí</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => navigate('students', student.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-bold text-[#0F172A] text-xs">
                      {student.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-bold text-[#0F172A]">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{student.phone}</td>
                    <td className="py-3.5 px-4 w-52">
                      <SessionProgressBar
                        attended={student.attendedSessions}
                        total={student.packageSessions}
                        remaining={student.remainingSessions}
                        size="sm"
                        showDetails={false}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <PaymentBadge status={student.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StudentStatusBadge
                        status={student.status}
                        remaining={student.remainingSessions}
                      />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Lịch học */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          {classSessions.map(session => (
            <div
              key={session.id}
              className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#0F172A]">
                    {session.dayOfWeek}, {session.date}
                  </span>
                  <SessionStatusBadge status={session.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Khung giờ: {session.timeSlot}</span>
                  <span>•</span>
                  <span>Sân: {session.court}</span>
                  <span>•</span>
                  <span>HLV: {session.coachName}</span>
                </div>
              </div>

              <div>
                {session.attendanceDone ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Đã điểm danh
                  </span>
                ) : (
                  <button
                    onClick={() => handleGoAttendance(session.id)}
                    className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Điểm danh buổi này
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Lịch sử điểm danh */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0F172A]">Các Buổi Đã Điểm Danh</h3>
            <button
              onClick={() => handleGoAttendance()}
              className="px-3.5 py-1.5 bg-[#10B981] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-600 transition-colors"
            >
              + Điểm danh buổi mới
            </button>
          </div>

          <div className="space-y-3">
            {classSessions
              .filter(s => s.attendanceDone)
              .map(session => {
                const presentCount = session.attendanceRecords?.filter(r => r.status === 'Present').length || 0;
                const absentCount = session.attendanceRecords?.filter(r => r.status === 'Absent').length || 0;
                return (
                  <div
                    key={session.id}
                    className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">
                          Buổi học ngày {session.date} ({session.timeSlot})
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          HLV {session.coachName} • {session.court}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                          Có mặt: {presentCount}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 text-rose-900 rounded-full">
                          Vắng: {absentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
