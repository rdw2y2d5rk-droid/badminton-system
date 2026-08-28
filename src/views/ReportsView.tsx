import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  DollarSign,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { coaches, classes, students, payments } = useApp();
  const [timeRange, setTimeRange] = useState('Tháng 08/2026');

  const levelDistribution = [
    { label: 'Cơ bản (Beginner)', count: 72, percent: 46, color: 'bg-emerald-500' },
    { label: 'Trung cấp (Intermediate)', count: 54, percent: 35, color: 'bg-sky-500' },
    { label: 'Nâng cao (Advanced)', count: 30, percent: 19, color: 'bg-amber-500' }
  ];

  const courtOccupancy = [
    { court: 'Sân 01 (VIP)', percent: 92, hours: 48, status: 'Cao' },
    { court: 'Sân 02', percent: 96, hours: 52, status: 'Tối đa' },
    { court: 'Sân 03', percent: 88, hours: 44, status: 'Cao' },
    { court: 'Sân 04', percent: 84, hours: 42, status: 'Khá' },
    { court: 'Sân 05', percent: 68, hours: 34, status: 'Trung bình' }
  ];

  const coachTeachingHours = [
    { name: 'Nguyễn Minh Anh', hours: 36, sessions: 24, rate: 4.9 },
    { name: 'Trần Quốc Huy', hours: 32, sessions: 21, rate: 4.8 },
    { name: 'Lê Hoàng Nam', hours: 28, sessions: 18, rate: 5.0 },
    { name: 'Phạm Đức Long', hours: 26, sessions: 17, rate: 4.7 },
    { name: 'Vũ Thanh Hằng', hours: 22, sessions: 14, rate: 4.9 }
  ];

  const monthlyRevenueData = [
    { month: 'T04', amount: 112 },
    { month: 'T05', amount: 128 },
    { month: 'T06', amount: 142 },
    { month: 'T07', amount: 148 },
    { month: 'T08 (Hiện tại)', amount: 156, current: true }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Thống Kê & Báo Cáo Hoạt Động
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo hiệu suất vận hành, tỷ lệ điểm danh, chuyên cần và doanh thu trung tâm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            aria-label="Chọn khoảng thời gian báo cáo"
            className="px-3.5 py-2 bg-white text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-none focus:border-[#10B981] shadow-xs cursor-pointer"
          >
            <option value="Tháng 08/2026">Tháng 08/2026</option>
            <option value="Tháng 07/2026">Tháng 07/2026</option>
            <option value="Quý 3/2026">Quý 3/2026</option>
            <option value="Năm 2026">Cả năm 2026</option>
          </select>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tỷ lệ điểm danh
          </div>
          <div className="text-3xl font-extrabold text-[#10B981] mt-1">94.2%</div>
          <div className="text-[11px] text-[#10B981] font-semibold mt-1">
            +2.1% so với tháng trước
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng giờ dạy hoàn thành
          </div>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-1">276 Giờ</div>
          <div className="text-[11px] text-slate-500 mt-1">Trên 5 cụm sân tiêu chuẩn</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng doanh thu tháng
          </div>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-1">156.0 Tr</div>
          <div className="text-[11px] text-[#10B981] font-semibold mt-1">
            Đạt 89.6% kế hoạch tháng 8
          </div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Học viên tái đăng ký
          </div>
          <div className="text-3xl font-extrabold text-sky-600 mt-1">88.5%</div>
          <div className="text-[11px] text-slate-500 mt-1">Gia hạn gói sau 12 buổi</div>
        </div>
      </div>

      {/* Grid: Charts & Visual breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu tăng trưởng */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">
                Tăng Trưởng Doanh Thu (Triệu VNĐ)
              </h3>
              <p className="text-xs text-slate-500">Doanh thu các tháng gần nhất</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>

          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between gap-4 h-44 px-2 border-b border-slate-100">
              {monthlyRevenueData.map(item => {
                const heightPercent = (item.amount / 180) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.amount}Tr
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.current
                            ? 'bg-gradient-to-t from-[#10B981] to-[#A3E635]'
                            : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 truncate mt-1">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phân bổ học viên theo trình độ */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">
                Phân Bổ Học Viên Theo Trình Độ
              </h3>
              <p className="text-xs text-slate-500">156 học viên đang hoạt động</p>
            </div>
            <Users className="w-5 h-5 text-sky-600" />
          </div>

          <div className="space-y-4 pt-2">
            {levelDistribution.map(item => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0F172A]">{item.label}</span>
                  <span className="text-slate-500">
                    {item.count} học viên ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tỷ lệ lấp đầy sân */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">
                Hiệu Suất Sử Dụng Sân Tập
              </h3>
              <p className="text-xs text-slate-500">Tỷ lệ lấp đầy khung giờ cao điểm (18:00 - 21:00)</p>
            </div>
            <Activity className="w-5 h-5 text-amber-600" />
          </div>

          <div className="space-y-3">
            {courtOccupancy.map(court => (
              <div
                key={court.court}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-[#0F172A]">{court.court}</span>
                  <span className="text-slate-500 ml-2">({court.hours} giờ tập/tuần)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#10B981] h-full rounded-full"
                      style={{ width: `${court.percent}%` }}
                    />
                  </div>
                  <strong className="font-bold text-[#0F172A] w-10 text-right">
                    {court.percent}%
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê giờ dạy của các HLV */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#0F172A]">
                Giờ Dạy Của Huấn Luyện Viên
              </h3>
              <p className="text-xs text-slate-500">Tổng kết tháng 08/2026</p>
            </div>
            <Award className="w-5 h-5 text-[#10B981]" />
          </div>

          <div className="space-y-2.5">
            {coachTeachingHours.map(coach => (
              <div
                key={coach.name}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#0F172A]">{coach.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    {coach.sessions} ca
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">{coach.hours} giờ</span>
                  <span className="font-bold text-amber-600">★ {coach.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
