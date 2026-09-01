import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center text-center gap-4">
        
        {/* Icon Peringatan */}
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-sm">
          <AlertTriangle size={26} strokeWidth={2.3} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-[#13231B]">{title || 'Konfirmasi Hapus'}</h3>
          <p className="text-xs text-[#6C8476] leading-relaxed">
            {message || 'Apakah kamu yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <button
            onClick={onClose}
            className="py-3 px-4 bg-[#F4F8F5] hover:bg-[#EAF2ED] text-[#4A6455] rounded-2xl font-bold text-xs transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            Hapus
          </button>
        </div>

      </div>
    </div>
  );
}