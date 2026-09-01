import React, { useRef, useState } from 'react';
import { toBlob, toPng } from 'html-to-image';
import { X, Share2, BookOpen, Quote as QuoteIcon } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, data, type }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !data) return null;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const blob = await toBlob(cardRef.current, { 
        quality: 1.0,
        pixelRatio: 2
      });

      const fileName = `${type === 'book' ? 'reading' : 'quote'}-minornotes.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Minor Notes',
        });
      } else {
        const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error saat membagikan:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-5 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-xs font-bold text-[#204E38]">Preview Card</span>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* Card Story: Solid Pastel Sage Green (#86A789) */}
        <div 
          ref={cardRef} 
          className="w-full aspect-[9/16] bg-[#86A789] rounded-[28px] p-6 text-white flex flex-col justify-between items-center shadow-md relative overflow-hidden"
        >
          {/* Top Brand Label */}
          <div className="flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 z-10">
            <BookOpen size={13} className="text-white" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-white">Minor Notes</span>
          </div>

          {/* Konten Utama */}
          {type === 'book' ? (
            <div className="flex flex-col items-center text-center space-y-4 z-10 w-full px-2">
              <span className="text-[11px] font-semibold text-[#EAF2EC] uppercase tracking-widest">
                Currently Reading
              </span>
              
              {/* Cover Buku */}
              <div className="w-36 aspect-[3/4.5] rounded-xl overflow-hidden shadow-[0_12px_25px_rgba(20,45,30,0.18)] border-2 border-white/50 bg-[#E6EFE9]">
                <img 
                  src={data.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} 
                  alt={data.title} 
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white leading-snug line-clamp-2">{data.title}</h3>
                <p className="text-xs text-[#EAF2EC] font-medium">{data.author}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-4 z-10 w-full px-3 my-auto">
              <QuoteIcon size={32} className="text-white/40 mb-1" />
              <p className="text-sm italic font-medium leading-relaxed text-white">
                "{data.quote}"
              </p>
              <span className="text-xs font-bold text-[#EAF2EC] tracking-wide">— {data.author}</span>
            </div>
          )}

          {/* Footer Card */}
          <div className="text-center z-10 border-t border-white/20 pt-3 w-full">
            <p className="text-[10px] text-[#EAF2EC] font-semibold tracking-wide">Reading Journey</p>
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={loading}
          className="w-full py-3.5 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#204E38]/20 transition-all active:scale-95"
        >
          {loading ? (
            <span>Menyiapkan Gambar...</span>
          ) : (
            <>
              <Share2 size={16} />
              <span>Bagikan</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}