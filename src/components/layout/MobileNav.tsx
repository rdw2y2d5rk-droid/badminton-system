import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  User,
  Menu,
  X,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  Flame,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/mockData';

interface MobileNavProps {
  onOpenSearch?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSearch }) => {
  const {
    activeTab,
    navigate,
    currentUser,
    switchUser,
    isCoach,
    sessions,
    assignedSessions,
    notifications
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const targetSessions = isCoach ? assignedSessions : sessions;
  const pendingAttendanceCount = targetSessions.filter(
    s => s.date === '2026-08-28' && !s.attendanceDone
  ).length;

  const mobileNavItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    {
      id: 'attendance',
      label: 'Điểm danh',
      icon: CheckSquare,
      highlight: true,
      badge: pendingAttendanceCount > 0 ? pendingAttendanceCount : null
    },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'students', label: 'Học viên', icon: User }
  ];

  return (
    <>
      {/* Top Mobile & Tablet Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0F172A] text-white z-40 px-3 sm:px-4 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-bold text-base shadow-xs">
            B
          </div>
          <span className="font-bold text-base tracking-tight italic">SMASH PRO</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-[#A3E635] border border-slate-700">
            {currentUser.role === 'ADMIN' ? 'Admin' : 'HLV'}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          )}

          {/* Quick Attendance */}
          <button
            onClick={() => navigate('attendance')}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 text-white rounded-lg text-xs font-bold"
          >
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>Điểm danh</span>
          </button>

          {/* Drawer Menu Hamburger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-xs"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 bottom-0 right-0 w-4/5 max-w-xs bg-[#0F172A] text-white p-5 flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#A3E635] text-[#0F172A] font-bold text-xs flex items-center justify-center">
                  {currentUser.role === 'ADMIN' ? 'AD' : 'CO'}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{currentUser.name}</div>
                  <div className="text-xs text-[#10B981] font-medium">
                    {currentUser.role === 'ADMIN' ? 'Admin Center' : 'Huấn Luyện Viên'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Role Switcher in Mobile Drawer */}
            <div className="my-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Chuyển vai trò xem
              </div>
              <div className="space-y-1.5">
                {INITIAL_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer ${
                      user.id === currentUser.id
                        ? 'bg-[#10B981] text-white font-bold'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{user.name}</span>
                    <span className="text-[10px] opacity-80 font-semibold">
                      {user.role === 'ADMIN' ? 'Admin' : 'HLV'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* All Navigation Links */}
            <nav className="flex-1 overflow-y-auto space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'classes', label: 'Lớp học', icon: BookOpen },
                { id: 'students', label: 'Học viên', icon: User },
                ...(currentUser.role === 'ADMIN'
                  ? [{ id: 'coaches', label: 'Huấn luyện viên', icon: UserCheck }]
                  : []),
                { id: 'schedule', label: 'Lịch học', icon: Calendar },
                { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
                ...(currentUser.role === 'ADMIN'
                  ? [
                      { id: 'payments', label: 'Học phí', icon: CreditCard },
                      { id: 'reports', label: 'Thống kê', icon: BarChart3 }
                    ]
                  : []),
                { id: 'settings', label: 'Cài đặt', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
                      isActive
                        ? 'bg-[#10B981] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Floating Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 px-2 flex items-center justify-around shadow-lg">
        {mobileNavItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#10B981] font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    item.highlight && !isActive ? 'text-[#10B981]' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
