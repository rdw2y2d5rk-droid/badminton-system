import React from 'react';
import { AttendanceState, PaymentStatus, SessionStatus, SkillLevel, StudentStatus } from '../../types';

export const LevelBadge: React.FC<{ level: SkillLevel; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1';
  
  if (level === 'Beginner') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5"></span>
        Cơ bản
      </span>
    );
  }
  if (level === 'Intermediate') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5"></span>
        Trung cấp
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
      Nâng cao
    </span>
  );
};

export const PaymentBadge: React.FC<{ status: PaymentStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1';
  
  if (status === 'Paid') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5"></span>
        Đã đóng
      </span>
    );
  }
  if (status === 'Unpaid') {
    return (
      <span className={`inline-flex items-center font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Chưa đóng
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
      Quá hạn
    </span>
  );
};

export const SessionStatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
  if (status === 'Ongoing') {
    return (
      <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
        <span className="w-2 h-2 rounded-full bg-[#A3E635] mr-1.5 animate-pulse"></span>
        Đang diễn ra
      </span>
    );
  }
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
        Đã xong
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5"></span>
      Sắp diễn ra
    </span>
  );
};

export const StudentStatusBadge: React.FC<{ status: StudentStatus; remaining: number }> = ({ status, remaining }) => {
  if (remaining === 0 || status === 'Expired') {
    return (
      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
        Đã hết buổi
      </span>
    );
  }
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        Tốt nghiệp
      </span>
    );
  }
  if (status === 'Reserved') {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        Bảo lưu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      Đang học
    </span>
  );
};

export const AttendanceStatusBadge: React.FC<{ status: AttendanceState }> = ({ status }) => {
  if (status === 'Present') {
    return (
      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
        Có mặt
      </span>
    );
  }
  if (status === 'Excused') {
    return (
      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
        Có phép
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
      Vắng
    </span>
  );
};

