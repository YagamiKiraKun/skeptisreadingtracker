import React from 'react';
import { Calendar } from 'lucide-react';

export default function ReadingHeatmap({ books = [] }) {
  // Ambil data tanggal aktivitas dari semua buku
  const activityMap = {};
  books.forEach((b) => {
    if (b.activityDates && Array.isArray(b.activityDates)) {
      b.activityDates.forEach((date) => {
        activityMap[date] = (activityMap[date] || 0) + 1;
      });
    } else if (b.createdAt) {
      const dateStr = b.createdAt.split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }
  });

  // Generate 70 hari terakhir (10 minggu)
  const days = [];
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: activityMap[dateStr] || 0
    });
  }

  // Hitung level warna sage green
  const getColorClass = (count) => {
    if (count === 0) return 'bg-[#EAF2ED]';
    if (count === 1) return 'bg-[#A3C4B0]';
    if (count === 2) return 'bg-[#5B8F70]';
    return 'bg-[#204E38]';
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 border border-white/60 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar size={13} className="text-[#204E38]" />
          <h3 className="font-extrabold text-xs text-[#13231B]">Reading Activity</h3>
        </div>
        <span className="text-[10px] font-bold text-[#6C8476]">10 Minggu Terakhir</span>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 justify-center py-1">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} aktivitas`}
            className={`w-2.5 h-2.5 rounded-[3px] transition-all hover:scale-125 ${getColorClass(d.count)}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[9px] font-semibold text-[#8FA597] pt-1 border-t border-slate-100">
        <span>Jarang</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-[2px] bg-[#EAF2ED]" />
          <div className="w-2 h-2 rounded-[2px] bg-[#A3C4B0]" />
          <div className="w-2 h-2 rounded-[2px] bg-[#5B8F70]" />
          <div className="w-2 h-2 rounded-[2px] bg-[#204E38]" />
        </div>
        <span>Aktif</span>
      </div>
    </div>
  );
}