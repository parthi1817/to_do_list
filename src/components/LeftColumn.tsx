import React from 'react';
import { Search, X, CheckSquare, Percent, Clock, AlertOctagon } from 'lucide-react';
import type { StatusFilter } from '../types/todo';

interface LeftColumnProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  metrics: {
    totalCount: number;
    completedCount: number;
    pendingCount: number;
    completionRate: number;
    highPriorityCount: number;
  };
  weeklyHeatmap: {
    day: string;
    date: string;
    dayNumber: number;
    isToday: boolean;
    completedCount: number;
    activityScore: number;
    intensity: 0 | 1 | 2 | 3 | 4;
  }[];
}

export const LeftColumn: React.FC<LeftColumnProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  metrics,
  weeklyHeatmap,
}) => {
  // Intensity color maps matching the reference design
  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]'; // Best
      case 3:
        return 'bg-purple-600'; // High
      case 2:
        return 'bg-purple-800/80'; // Medium
      case 1:
        return 'bg-purple-950/70 border border-purple-800/40'; // Low
      default:
        return 'bg-[#181B28]/90 border border-white/5'; // 0
    }
  };

  const statusOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: metrics.totalCount },
    { key: 'active', label: 'Active', count: metrics.pendingCount },
    { key: 'completed', label: 'Completed', count: metrics.completedCount },
  ];

  return (
    <div className="flex flex-col space-y-5 w-full">
      {/* Top Card: Weekly Engagement & Activity Heatmap */}
      <div className="bento-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
                Performance Analytics
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Weekly Engagement
              </h2>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-400 bg-[#161826] px-2.5 py-1 rounded-full border border-gray-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Synced</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks by title or details..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#171926]/90 border border-gray-800 hover:border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-2 mb-6">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onStatusFilterChange(opt.key)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  statusFilter === opt.key
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/30'
                    : 'bg-[#181A27] text-gray-400 hover:text-gray-200 hover:bg-[#1E2132] border border-gray-800/80'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    statusFilter === opt.key
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-black/30 text-gray-400'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            ))}
          </div>

          {/* Heatmap Grid & Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-300">
                Task Completion Heatmap
              </span>
              <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                <span>Low</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-950/70 border border-purple-800/40" />
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-800/80" />
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                <span>Best</span>
              </div>
            </div>

            {/* Grid Visualization */}
            <div className="grid grid-cols-7 gap-2 p-3 bg-[#151724]/90 rounded-2xl border border-gray-800/80">
              {weeklyHeatmap.map((day) => (
                <div key={day.day} className="flex flex-col items-center space-y-1.5">
                  <span
                    className={`text-[10px] font-medium ${
                      day.isToday ? 'text-purple-400 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {day.day}
                  </span>

                  {/* 4 Stacked Activity Blocks for Bento Heatmap */}
                  <div className="flex flex-col space-y-1 w-full">
                    {[3, 2, 1, 0].map((slotIdx) => {
                      // Determine cell illumination based on intensity
                      const cellActive = day.intensity > slotIdx;
                      const intensityToRender = cellActive ? day.intensity : 0;

                      return (
                        <div
                          key={slotIdx}
                          title={`${day.day}: ${day.completedCount} tasks completed`}
                          className={`h-4 w-full rounded-md transition-all duration-300 ${getIntensityClass(
                            intensityToRender
                          )}`}
                        />
                      );
                    })}
                  </div>

                  <span
                    className={`text-[9px] ${
                      day.isToday ? 'text-white font-bold' : 'text-gray-500'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
          <span>Weekly Completion Target</span>
          <span className="text-purple-400 font-semibold">{metrics.completionRate}% achieved</span>
        </div>
      </div>

      {/* Bottom 2x2 Stat Cards (replacing Lecture, GPA, Session, Absence) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stat 1: Total Tasks */}
        <div className="bento-card p-5 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.totalCount}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              All records in Supabase
            </p>
          </div>
        </div>

        {/* Stat 2: Completed (%) */}
        <div className="bento-card p-5 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Completed Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.completionRate}
              <span className="text-lg font-normal text-emerald-400 ml-0.5">%</span>
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-1">
              {metrics.completedCount} of {metrics.totalCount} tasks closed
            </p>
          </div>
        </div>

        {/* Stat 3: Pending Tasks */}
        <div className="bento-card p-5 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.pendingCount}
            </div>
            <p className="text-[11px] text-amber-400/90 mt-1">
              Action items remaining
            </p>
          </div>
        </div>

        {/* Stat 4: High Priority */}
        <div className="bento-card p-5 flex flex-col justify-between group hover:translate-y-[-2px] transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">High Priority</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.highPriorityCount}
            </div>
            <p className="text-[11px] text-rose-400/90 mt-1">
              Critical attention needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
