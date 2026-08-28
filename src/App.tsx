import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { DashboardView } from './views/DashboardView';
import { ClassesView } from './views/ClassesView';
import { ClassDetailView } from './views/ClassDetailView';
import { StudentsView } from './views/StudentsView';
import { StudentDetailView } from './views/StudentDetailView';
import { CoachesView } from './views/CoachesView';
import { ScheduleView } from './views/ScheduleView';
import { AttendanceView } from './views/AttendanceView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab, selectedId, navigate } = useApp();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'classes':
        if (selectedId) {
          return (
            <ClassDetailView
              classId={selectedId}
              onBack={() => navigate('classes', null)}
            />
          );
        }
        return <ClassesView />;
      case 'students':
        if (selectedId) {
          return (
            <StudentDetailView
              studentId={selectedId}
              onBack={() => navigate('students', null)}
            />
          );
        }
        return <StudentsView />;
      case 'coaches':
        return <CoachesView />;
      case 'schedule':
        return <ScheduleView />;
      case 'attendance':
        return <AttendanceView />;
      case 'payments':
        return <PaymentsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-[#0F172A] font-sans">
      {/* App Shell with Sidebar & Main Area */}
      <div className="flex flex-1 min-h-screen w-full">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Desktop & Tablet Navbar */}
          <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Page View Container with responsive spacing across Mobile, Tablet, Laptop, and PC */}
          <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 pt-16 sm:pt-18 lg:pt-6 pb-24 lg:pb-8 max-w-full overflow-x-hidden">
            {renderView()}
          </main>
        </div>
      </div>

      {/* Mobile Top and Bottom Navigation Bars */}
      <MobileNav onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Global Modals & Notifications */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
