import React, { useMemo } from 'react';
import { Zap, Flame, Clock } from 'lucide-react';

export default function ReadingPace({ books = [] }) {
  const paceData = useMemo(() => {
    const finishedBooks = books.filter((b) => b.status === 'finished');
    const ongoingBooks = books.filter((b) => b.status === 'reading');

    const totalFinishedPages = finishedBooks.reduce((acc, b) => acc + (b.totalPages || b.currentPage || 0), 0);
    const totalOngoingPages = ongoingBooks.reduce((acc, b) => acc + (b.currentPage || 0), 0);
    const grandTotalPages = totalFinishedPages + totalOngoingPages;

    const allActivityDates = new Set();
    books.forEach((b) => {
      if (Array.isArray(b.activityDates)) {
        b.activityDates.forEach((d) => allActivityDates.add(d));
      }
    });

    const activeDaysCount = Math.max(allActivityDates.size, 1);
    const avgPagesPerDay = Math.round(grandTotalPages / activeDaysCount);
    const avgDaysPerBook = finishedBooks.length > 0 
      ? (activeDaysCount / finishedBooks.length).toFixed(1) 
      : 0;

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
      avgPagesPerDay,
      avgDaysPerBook,
      badgeLabel,
      badgeColor
    };
  }, [books]);

  return (
    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="p-1 rounded-md bg-[#204E38] text-white flex-shrink-0">
          <Zap size={10} />
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${paceData.badgeColor} truncate`}>
          {paceData.badgeLabel}
        </span>
      </div>

      <div className="flex items-center gap-2.5 text-[#13231B] font-extrabold flex-shrink-0">
        <div className="flex items-center gap-1" title="Laju Harian">
          <Flame size={11} className="text-[#204E38]" />
          <span>{paceData.avgPagesPerDay} <span className="text-[9px] font-normal text-[#7C9486]">hal/hari</span></span>
        </div>
        
        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1" title="Tempo / Buku">
          <Clock size={11} className="text-[#204E38]" />
          <span>{paceData.avgDaysPerBook > 0 ? paceData.avgDaysPerBook : '-'} <span className="text-[9px] font-normal text-[#7C9486]">hari/buku</span></span>
        </div>
      </div>
    </div>
  );
}