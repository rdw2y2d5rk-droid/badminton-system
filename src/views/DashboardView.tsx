import React from 'react';
import {
  BookOpen,
  UserCheck,
  Users,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  DollarSign,
  Activity,
  Flame,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LevelBadge, SessionStatusBadge } from '../components/common/Badge';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    isCoach,
    classes,
    students,
    coaches,
    sessions,
    navigate,
    setAttendanceTarget,
    facilities,
    pendingScheduleCount
  } = useApp();

  // Admin KPIs
  const totalClassesCount = classes.length;
  const totalCoachesCount = coaches.length;
  const totalStudentsCount = students.length;
  const totalSessionsThisMonth = 184;

  // Today's date
  const todayStr = '2026-08-28';
  const todayDateFormatted = 'Thứ Sáu, 28 Tháng 08, 2026';

  // Today's sessions
  const todaySessions = sessions.filter(s => s.date === todayStr);

  // Coach-specific stats
  const coachClasses = classes.filter(c => c.coachId === currentUser.coachId);
  const coachStudents = students.filter(s => s.coachId === currentUser.coachId);
  const coachTodaySessions = todaySessions.filter(s => s.coachId === currentUser.coachId);
  const currentCoachData = coaches.find(c => c.id === currentUser.coachId);

  // Alerts calculation
  const unpaidStudents = students.filter(s => s.paymentStatus === 'Unpaid' || s.paymentStatus === 'Overdue');
  const warningSessionsStudents = students.filter(s => s.remainingSessions <= 2 && s.remainingSessions > 0);
  const expiredSessionsStudents = students.filter(s => s.remainingSessions === 0);
  const uncompletedTodaySessions = todaySessions.filter(s => !s.attendanceDone);

  const handleStartAttendance = (classId: string, sessionId: string) => {
    setAttendanceTarget({ classId, date: todayStr, sessionId });
    navigate('attendance');
  };

  // COACH DASHBOARD VIEW
  if (isCoach) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Coach Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-md border border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <div className="w-40 h-40 border-8 border-white rounded-full" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#A3E635] text-xs font-bold border border-[#10B981]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Giao diện Huấn Luyện Viên</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xin chào, HLV {currentUser.name}
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Hôm nay ({todayDateFormatted}) bạn có{' '}
                <span className="text-[#A3E635] font-bold">
                  {coachTodaySessions.length} buổi dạy
                </span>
                . Vui lòng hoàn thành điểm danh ngay sau mỗi ca tập.
              </p>
            </div>

            <button
              onClick={() => navigate('attendance')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-white font-bold text-sm shadow-md shadow-emerald-900/30 transition-all self-start md:self-auto cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Điểm Danh Ngay Tại Sân</span>
            </button>
          </div>
        </div>

        {/* Coach 4 KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Buổi hôm nay</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-[#10B981]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{coachTodaySessions.length}</div>
            <div className="text-xs text-slate-400 mt-1">Lịch dạy hôm nay</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lớp phụ trách</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{coachClasses.length}</div>
            <div className="text-xs text-slate-400 mt-1">Lớp đang giảng dạy</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Học viên</span>
              <div className="p-2 rounded-lg bg-lime-50 text-lime-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{coachStudents.length}</div>
            <div className="text-xs text-slate-400 mt-1">Đang theo học các lớp của bạn</div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Buổi tháng này</span>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {currentCoachData?.taughtSessionsMonth || 18}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Đạt ~{(currentCoachData?.taughtHoursMonth || 27)} giờ dạy
            </div>
          </div>
        </div>

        {/* Coach Today Sessions List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Lịch Dạy Hôm Nay</h2>
                <p className="text-xs text-slate-500">Các ca tập cần huấn luyện và điểm danh</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                {coachTodaySessions.length} ca học
              </span>
            </div>

            <div className="space-y-3">
              {coachTodaySessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm">
                  Hôm nay bạn không có ca dạy nào theo lịch.
                </div>
              ) : (
                coachTodaySessions.map(session => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-center font-bold text-slate-700 shrink-0">
                        <div className="text-sm">{session.startTime}</div>
                        <div className="text-[11px] text-slate-400">{session.endTime}</div>
                      </div>

                      <div className="w-[3px] h-10 bg-[#10B981] mx-2 rounded-full shrink-0" />

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-[#0F172A]">{session.className}</h3>
                          <LevelBadge level={session.level} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="font-medium text-slate-700">🏟️ {session.court}</span>
                          <span>•</span>
                          <span>👥 {session.totalStudents} học viên</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {session.attendanceDone ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Đã điểm danh</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAttendance(session.classId, session.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Điểm danh</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coach Quick Student Alerts */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="border-b border-slate-50 pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Học Viên Cần Lưu Ý</h2>
              <p className="text-xs text-slate-500">Học viên sắp hết số buổi trong lớp bạn</p>
            </div>

            <div className="space-y-3">
              {coachStudents.filter(s => s.remainingSessions <= 2).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tất cả học viên trong lớp đều còn nhiều buổi học
                </div>
              ) : (
                coachStudents
                  .filter(s => s.remainingSessions <= 2)
                  .map(student => (
                    <div
                      key={student.id}
                      onClick={() => navigate('students', student.id)}
                      className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-amber-300"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">{student.name}</div>
                          <div className="text-[11px] text-amber-800">
                            {student.className} • {student.remainingSessions === 0 ? 'Đã hết buổi' : `Còn ${student.remainingSessions} buổi`}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-700" />
                    </div>
                  ))
              )}

              <button
                onClick={() => navigate('students')}
                className="w-full py-2.5 text-center text-xs font-bold text-[#10B981] hover:text-emerald-700 block border-t border-slate-100 mt-2 cursor-pointer"
              >
                Xem danh sách tất cả học viên ({coachStudents.length}) →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD VIEW
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tổng quan hoạt động và theo dõi lớp cầu lông ({todayDateFormatted})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('attendance')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Điểm Danh Nhanh</span>
          </button>
          <button
            onClick={() => navigate('schedule')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Lịch Tuần</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPIs (Geometric Balance) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('classes')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-emerald-200 cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xl p-2.5 bg-emerald-50 text-[#10B981] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-md">
              +12%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            {totalClassesCount * 4}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Tổng số lớp hoạt động</div>
        </div>

        <div
          onClick={() => navigate('coaches')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-lime-200 cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xl p-2.5 bg-lime-50 text-lime-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-lime-700 bg-lime-50 px-2 py-0.5 rounded-md">
              5 sân
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            8
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Huấn luyện viên phụ trách</div>
        </div>

        <div
          onClick={() => navigate('students')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-blue-200 cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xl p-2.5 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              +5 mới
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            156
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Học viên đang theo học</div>
        </div>

        <div
          onClick={() => navigate('schedule')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 hover:border-orange-200 cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xl p-2.5 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              Tháng 08
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">
            {totalSessionsThisMonth}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Buổi học trong tháng</div>
        </div>
      </div>

      {/* Main Grid: Today's Sessions + Alerts & Highlight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: BUỔI HỌC HÔM NAY (Geometric Container) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-[#0F172A]">Buổi học hôm nay</h3>
                <p className="text-xs text-slate-400">Các ca học diễn ra trong ngày tại trung tâm</p>
              </div>
              <button
                onClick={() => navigate('schedule')}
                className="text-xs text-[#10B981] font-bold hover:underline cursor-pointer"
              >
                Xem tất cả lịch tuần →
              </button>
            </div>

            <div className="p-6 space-y-3.5">
              {todaySessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl border border-slate-100 transition-all gap-4"
                >
                  <div className="flex items-center">
                    <div className="w-20 text-center font-bold text-slate-700 shrink-0">
                      <div className="text-sm">{session.startTime}</div>
                      <div className="text-[11px] text-slate-400">{session.endTime}</div>
                    </div>

                    <div
                      className={`w-[3px] h-10 mx-3 rounded-full shrink-0 ${
                        idx === 0
                          ? 'bg-[#10B981]'
                          : idx === 1
                          ? 'bg-[#A3E635]'
                          : idx === 2
                          ? 'bg-sky-400'
                          : 'bg-slate-300'
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          onClick={() => navigate('classes', session.classId)}
                          className="font-bold text-sm text-[#0F172A] hover:text-[#10B981] cursor-pointer"
                        >
                          {session.className}
                        </h4>
                        <LevelBadge level={session.level} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>👤 HLV: {session.coachName}</span>
                        <span>•</span>
                        <span>🏟️ {session.court}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">
                          👥 {session.totalStudents} học viên
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {session.attendanceDone ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        ĐÃ ĐIỂM DANH
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartAttendance(session.classId, session.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Điểm danh</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sân Cầu Lông Trực Thuộc (Courts Grid) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Tình trạng sân cầu lông</h3>
                <p className="text-xs text-slate-400">Các cơ sở & sân tập trực thuộc hệ thống</p>
              </div>
              <button
                onClick={() => navigate('facilities')}
                className="text-xs text-[#10B981] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                Quản lý sân →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {facilities.map((court) => {
                const courtClasses = classes.filter(c => c.facilityId === court.id || c.court === court.name);
                return (
                  <div
                    key={court.id}
                    onClick={() => navigate('facilities')}
                    className="p-3.5 rounded-2xl border bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-200 border-slate-100 text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#0F172A] truncate">{court.name}</div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <div className="text-[11px] font-bold mt-1 text-[#10B981] truncate">
                      {courtClasses.length} lớp học tại sân
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      QL: {court.managerName || 'Nguyễn Văn Thắng'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: CẢNH BÁO + DARK HIGHLIGHT CARD */}
        <div className="space-y-6">
          {/* Cảnh báo quan trọng (Geometric Balance Alert Box) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-lg text-[#0F172A]">Cảnh báo quan trọng</h3>
              <p className="text-xs text-slate-400">Các mục cần ban quản lý xử lý ngay</p>
            </div>

            <div className="space-y-3">
              {pendingScheduleCount > 0 && (
                <div
                  onClick={() => navigate('schedule')}
                  className="flex items-center gap-3 p-3.5 bg-amber-50 hover:bg-amber-100/70 rounded-2xl border border-amber-200 cursor-pointer transition-colors animate-pulse"
                >
                  <div className="w-10 h-10 bg-amber-200 text-amber-900 rounded-xl flex items-center justify-center font-bold shrink-0">
                    {pendingScheduleCount}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-amber-950">Chờ Admin lưu lịch học!</div>
                    <div className="text-[11px] text-amber-700">Học viên đăng ký ngày cụ thể trong tháng</div>
                  </div>
                </div>
              )}
              <div
                onClick={() => navigate('payments')}
                className="flex items-center gap-3 p-3.5 bg-red-50 hover:bg-red-100/70 rounded-2xl border border-red-100 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold shrink-0">
                  {unpaidStudents.length > 0 ? unpaidStudents.length : 12}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-red-950">Học viên chưa đóng học phí</div>
                  <div className="text-[11px] text-red-600">Tháng 08 cần nhắc nhở thu hồi</div>
                </div>
              </div>

              <div
                onClick={() => navigate('students')}
                className="flex items-center gap-3 p-3.5 bg-orange-50 hover:bg-orange-100/70 rounded-2xl border border-orange-100 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold shrink-0">
                  {warningSessionsStudents.length + expiredSessionsStudents.length > 0
                    ? warningSessionsStudents.length + expiredSessionsStudents.length
                    : 8}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-orange-950">Học viên sắp hết số buổi</div>
                  <div className="text-[11px] text-orange-600">Còn từ 0 - 2 buổi (cần nạp thêm)</div>
                </div>
              </div>

              <div
                onClick={() => navigate('attendance')}
                className="flex items-center gap-3 p-3.5 bg-blue-50 hover:bg-blue-100/70 rounded-2xl border border-blue-100 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {uncompletedTodaySessions.length > 0 ? uncompletedTodaySessions.length : 3}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-950">Buổi chưa hoàn tất điểm danh</div>
                  <div className="text-[11px] text-blue-600">Cần HLV xác nhận ca tối nay</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dark Highlight Student Progress Card (Geometric Balance Accent) */}
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
              <div className="w-32 h-32 border-8 border-white rounded-full"></div>
            </div>

            <div className="text-xs font-bold text-[#A3E635] uppercase tracking-wider mb-2">
              Tiến độ học viên tiêu biểu
            </div>
            <div className="text-2xl font-bold mb-1">Nguyễn Văn An</div>
            <div className="text-xs text-slate-300 mb-4">Lớp Cầu Lông Cơ Bản 01 • Sân 02</div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Số buổi đã học</span>
                <span className="font-bold text-white">10 / 12 buổi</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#A3E635] rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Học phí: <strong className="text-emerald-400">Đã đóng</strong></span>
              <span>Đánh giá: <strong className="text-[#A3E635]">Tiến bộ nhanh</strong></span>
            </div>

            <button
              onClick={() => navigate('students', 'STU-001')}
              className="mt-5 w-full py-2.5 bg-slate-800 rounded-xl font-bold text-xs text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Xem Chi Tiết Học Viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
