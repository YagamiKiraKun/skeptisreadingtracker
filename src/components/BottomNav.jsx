import React from 'react';
import { Layers, BookOpen, CheckCircle2, Quote, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const navItems = [
    { id: 'all', label: 'Semua', icon: Layers },
    { id: 'reading', label: 'Dibaca', icon: BookOpen },
    { id: 'finished', label: 'Selesai', icon: CheckCircle2 },
    { id: 'quotes', label: 'Quotes', icon: Quote },
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4">
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_30px_rgba(20,40,25,0.12)] rounded-full px-3 py-2 w-full max-w-[340px]">
        
        {/* Tab 1 & 2 */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-[#204E38] text-white shadow-md scale-105'
                  : 'text-[#6C8476] hover:text-[#204E38]'
              }`}
              title={item.label}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}

        {/* Tombol Tambah Tengah */}
        <button
          onClick={onOpenAddModal}
          className="p-3 bg-[#204E38] text-white rounded-full shadow-lg active:scale-90 transition-transform -translate-y-2 border-2 border-white flex-shrink-0"
          title="Tambah Data"
        >
          <Plus size={20} strokeWidth={3} />
        </button>

        {/* Tab 3 & 4 */}
        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-[#204E38] text-white shadow-md scale-105'
                  : 'text-[#6C8476] hover:text-[#204E38]'
              }`}
              title={item.label}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}

      </div>
    </div>
  );
}