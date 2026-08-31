import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Quote, 
  LogOut, 
  BookMarked
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, totalFinished }) {
  const menuItems = [
    { id: 'all', label: 'Library', icon: BookMarked },
    { id: 'reading', label: 'Sedang Baca', icon: BookOpen },
    { id: 'finished', label: 'Selesai Track', icon: CheckCircle2 },
    { id: 'quotes', label: 'Kutipan / Quotes', icon: Quote },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] justify-between flex-shrink-0">
      <div className="space-y-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#204E38] text-white flex items-center justify-center shadow-md shadow-[#204E38]/20">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-[#13231B] tracking-tight">SkeptisReads</h2>
            <p className="text-[10px] font-semibold text-[#6C8476] uppercase tracking-wider">Minor Notes</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-[#204E38] text-white shadow-lg shadow-[#204E38]/20'
                    : 'text-[#6C8476] hover:bg-[#F0F5F2] hover:text-[#13231B]'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target Track Box & Logout */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[#EAF2ED] to-[#DBE8DF] p-4 rounded-2xl border border-[#D0E0D5]">
          <h4 className="font-bold text-xs text-[#204E38] mb-1">Target Track</h4>
          <p className="text-[11px] text-[#4A6455] leading-snug">
            {totalFinished} buku terselesaikan sejauh ini. Terus konsisten!
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#8C9E93] hover:text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut size={15} />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}