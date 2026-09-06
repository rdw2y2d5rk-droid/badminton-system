import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  Calendar,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  Flame,
  Award,
  Zap,
  MapPin,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    navigate,
    students,
    sessions,
    payments,
    isCoach,
    isFacilityManager,
    currentUser,
    assignedSessions,
    pendingScheduleCount
  } = useApp();

  // Badges calculation
  const warningStudentsCount = students.filter(
    s => s.remainingSessions <= 2 && s.remainingSessions > 0
  ).length;
  const expiredStudentsCount = students.filter(s => s.remainingSessions === 0).length;
  const unpaidPaymentsCount = payments.filter(
    p => p.status === 'Unpaid' || p.status === 'Overdue'
  ).length;
  
  // Pending today sessions
  const targetSessions = (isCoach || isFacilityManager) ? assignedSessions : sessions;
  const pendingAttendanceCount = targetSessions.filter(
    s => s.date === '2026-08-28' && !s.attendanceDone
  ).length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: null
    },
    {
      id: 'facilities',
      label: 'Sân cầu lông',
      icon: MapPin,
      roles: ['ADMIN'],
      badge: null
    },
    {
      id: 'shifts',
      label: 'Ca học',
      icon: Clock,
      roles: ['ADMIN'],
      badge: null
    },
    {
      id: 'classes',
      label: 'Lớp học',
      icon: BookOpen,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: null
    },
    {
      id: 'students',
      label: 'Học viên',
      icon: Users,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: warningStudentsCount + expiredStudentsCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          {warningStudentsCount + expiredStudentsCount}
        </span>
      ) : null
    },
    {
      id: 'coaches',
      label: 'Huấn luyện viên',
      icon: UserCheck,
      roles: ['ADMIN'], // Only admin sees coaches directory
      badge: null
    },
    {
      id: 'schedule',
      label: isCoach ? 'Lịch dạy' : 'Lịch học',
      icon: Calendar,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: currentUser.role === 'ADMIN' && pendingScheduleCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
          {pendingScheduleCount}
        </span>
      ) : null
    },
    {
      id: 'attendance',
      label: 'Điểm danh',
      icon: CheckSquare,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: pendingAttendanceCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
          {pendingAttendanceCount}
        </span>
      ) : null
    },
    {
      id: 'payments',
      label: 'Học phí & Thu ngân',
      icon: CreditCard,
      roles: ['ADMIN', 'FACILITY_MANAGER'],
      badge: unpaidPaymentsCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
          {unpaidPaymentsCount}
        </span>
      ) : null
    },
    {
      id: 'reports',
      label: 'Thống kê',
      icon: BarChart3,
      roles: ['ADMIN'], // Admin sees system reports
      badge: null
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      roles: ['ADMIN', 'COACH', 'FACILITY_MANAGER'],
      badge: null
    }
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] text-white min-h-screen border-r border-slate-800 shrink-0 sticky top-0 h-screen z-40">
      {/* Brand Logo Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
            B
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight italic text-white flex items-center gap-1.5">
              <span>SMASH PRO</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {currentUser.role === 'ADMIN'
                ? 'Admin Center'
                : currentUser.role === 'FACILITY_MANAGER'
                ? 'Facility Portal'
                : 'Coach Portal'}
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher Pill inside Sidebar */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              currentUser.role === 'ADMIN'
                ? 'bg-[#A3E635]'
                : currentUser.role === 'FACILITY_MANAGER'
                ? 'bg-amber-400'
                : 'bg-[#10B981]'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate font-semibold uppercase tracking-wider">
              {currentUser.role === 'ADMIN'
                ? 'Cấp Quản Trị'
                : currentUser.role === 'FACILITY_MANAGER'
                ? 'Quản Lý Cơ Sở'
                : 'Huấn Luyện Viên'}
            </div>
          </div>
          {isCoach && <Award className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-[#10B981] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge}
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings Link */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#A3E635] flex items-center justify-center font-bold text-xs text-[#0F172A] shrink-0">
              {currentUser.role === 'ADMIN' ? 'AD' : currentUser.role === 'FACILITY_MANAGER' ? 'QL' : 'CO'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser.role === 'FACILITY_MANAGER'
                  ? currentUser.facilityName || 'Quản lý cơ sở'
                  : 'SmashZone Pro v2.4'}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('settings')}
            title="Cài đặt hệ thống"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
