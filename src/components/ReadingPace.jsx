import React, { useMemo } from 'react';
import { Zap, BookOpen, Flame, Clock } from 'lucide-react';

export default function ReadingPace({ books = [] }) {
  const paceData = useMemo(() => {
    const safeBooks = Array.isArray(books) ? books : [];
    const finishedBooks = safeBooks.filter((b) => b.status === 'finished');
    const ongoingBooks = safeBooks.filter((b) => b.status === 'reading');

    // Total halaman seluruh buku yang selesai
    const totalFinishedPages = finishedBooks.reduce((acc, b) => acc + (b.totalPages || b.currentPage || 0), 0);
    
    // Total halaman pergerakan buku ongoing
    const totalOngoingPages = ongoingBooks.reduce((acc, b) => acc + (b.currentPage || 0), 0);

    const grandTotalPages = totalFinishedPages + totalOngoingPages;

    // Hitung total hari unik aktivitas baca
    const allActivityDates = new Set();
    safeBooks.forEach((b) => {
      if (Array.isArray(b.activityDates)) {
        b.activityDates.forEach((d) => allActivityDates.add(d));
      }
    });

    const activeDaysCount = Math.max(allActivityDates.size, 1);

    // Pace: Rata-rata Halaman per Hari Aktif
    const avgPagesPerDay = Math.round(grandTotalPages / activeDaysCount);

    // Speed: Estimasi Hari per Buku Selesai
    const avgDaysPerBook = finishedBooks.length > 0 
      ? (activeDaysCount / finishedBooks.length).toFixed(1) 
      : 0;

    // Hitung Volume 7 Hari Terakhir
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    let weeklyPages = 0;
    safeBooks.forEach((b) => {
      if (Array.isArray(b.activityDates)) {
        const hasRecentActivity = b.activityDates.some((dStr) => new Date(dStr) >= sevenDaysAgo);
        if (hasRecentActivity) {
          weeklyPages += (b.currentPage || 0);
        }
      }
    });

    // Badge Status Ala Strava
    let badgeLabel = 'Steady Reader';
    let badgeColor = 'bg-[#EAF2ED] text-[#204E38] border-[#DCE5DF]';

    if (avgPagesPerDay >= 30 || (avgDaysPerBook <= 3 && finishedBooks.length > 0)) {
      badgeLabel = '⚡ Fast Pace';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (avgPagesPerDay >= 15) {
      badgeLabel = '🏃 Steady Reader';
      badgeColor = 'bg-[#EAF2ED] text-[#204E38] border-[#DCE5DF]';
    } else {
      badgeLabel = '🧘 Deep Diver';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    }

    return {
      grandTotalPages,
      avgPagesPerDay,
      avgDaysPerBook,
      weeklyPages,
      activeDaysCount,
      badgeLabel,
      badgeColor
    };
  }, [books]);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#204E38] text-white">
            <Zap size={13} />
          </div>
          <div>
            <h3 className="font-black text-xs text-[#13231B] tracking-tight">Reading Pace</h3>
            <p className="text-[9.5px] text-[#7C9486] font-medium">Statistik laju baca ala Strava</p>
          </div>
        </div>

        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${paceData.badgeColor}`}>
          {paceData.badgeLabel}
        </span>
      </div>

      {/* Grid Statistik utama */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Metric 1: Pace Halaman/Hari */}
        <div className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] space-y-1">
          <div className="flex items-center justify-between text-[#7C9486]">
            <span className="text-[10px] font-bold">Laju Harian</span>
            <Flame size={12} className="text-[#204E38]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#13231B]">{paceData.avgPagesPerDay}</span>
            <span className="text-[10px] font-bold text-[#7C9486]">hal/hari</span>
          </div>
        </div>

        {/* Metric 2: Tempo per Buku */}
        <div className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] space-y-1">
          <div className="flex items-center justify-between text-[#7C9486]">
            <span className="text-[10px] font-bold">Waktu / Buku</span>
            <Clock size={12} className="text-[#204E38]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#13231B]">
              {paceData.avgDaysPerBook > 0 ? paceData.avgDaysPerBook : '-'}
            </span>
            <span className="text-[10px] font-bold text-[#7C9486]">hari</span>
          </div>
        </div>
      </div>

      {/* Footer Volume 7 Hari Terakhir */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
        <div className="flex items-center gap-1.5 text-[#6C8476]">
          <BookOpen size={12} className="text-[#204E38]" />
          <span>Volume 7 Hari:</span>
        </div>
        <span className="font-extrabold text-[#13231B] bg-[#EAF2ED] px-2 py-0.5 rounded-lg text-[#204E38]">
          {paceData.weeklyPages} Hal
        </span>
      </div>
    </div>
  );
}