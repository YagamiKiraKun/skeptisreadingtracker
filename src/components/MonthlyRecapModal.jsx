import React, { useRef, useState, useMemo } from 'react';
import { toBlob, toPng } from 'html-to-image';
import { X, Share2, BookOpen, Star, Sparkles, Check } from 'lucide-react';

export default function MonthlyRecapModal({ isOpen, onClose, finishedBooks = [] }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // State buku yang dipilih sebagai "Best Read"
  const [selectedBestId, setSelectedBestId] = useState(null);

  // Dapatkan nama bulan & tahun saat ini (Bahasa Indonesia)
  const currentMonthYear = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, []);

  // Tentukan Best Read (default: buku pertama yang selesai jika belum dipilih)
  const bestBook = useMemo(() => {
    if (!finishedBooks.length) return null;
    if (selectedBestId) {
      return finishedBooks.find((b) => b.id === selectedBestId) || finishedBooks[0];
    }
    return finishedBooks[0];
  }, [finishedBooks, selectedBestId]);

  // Sisa buku yang dibaca selain Best Read
  const otherBooks = useMemo(() => {
    if (!bestBook) return [];
    return finishedBooks.filter((b) => b.id !== bestBook.id);
  }, [finishedBooks, bestBook]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const blob = await toBlob(cardRef.current, { 
        quality: 1.0,
        pixelRatio: 2
      });

      const fileName = `rekap-${currentMonthYear.toLowerCase().replace(' ', '-')}-minornotes.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Monthly Recap - ${currentMonthYear}`,
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
        console.error('Error saat share rekap:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-5 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4 max-h-[95vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#204E38]" />
            <span className="text-xs font-bold text-[#204E38]">Rekap Bacaan Bulanan</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {finishedBooks.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <BookOpen size={28} className="mx-auto text-[#8FA597]" />
            <p className="text-xs font-semibold text-[#6C8476]">
              Belum ada buku yang selesai dibaca bulan ini.
            </p>
          </div>
        ) : (
          <>
            {/* Pemilih Best Read (Jika buku selesai > 1) */}
            {finishedBooks.length > 1 && (
              <div className="w-full space-y-1.5 bg-[#F4F8F5] p-2.5 rounded-2xl border border-[#DCE5DF]">
                <span className="text-[10px] font-bold text-[#4A6455] px-1 flex items-center gap-1">
                  <Star size={11} className="text-[#204E38] fill-[#204E38]" /> Pilih Best Read Bulan Ini:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                  {finishedBooks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBestId(b.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border ${
                        bestBook?.id === b.id
                          ? 'bg-[#204E38] text-white border-[#204E38] shadow-sm'
                          : 'bg-white text-[#4A6455] border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Canvas Rekap (Rasio 9:16 - Solid Sage Green) */}
            <div 
              ref={cardRef} 
              className="w-full aspect-[9/16] bg-[#86A789] rounded-[28px] p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden"
            >
              {/* Top Header Card */}
              <div className="flex items-center justify-between z-10 w-full">
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  <BookOpen size={12} className="text-white" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white">Minor Notes</span>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#EAF2EC] bg-black/10 px-2.5 py-1 rounded-full">
                  {currentMonthYear}
                </span>
              </div>

              {/* SECTION ATAS: Best Read Highlight */}
              {bestBook && (
                <div className="flex flex-col items-center text-center space-y-2 z-10 my-auto py-2">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-[#13231B] bg-[#EAF2EC] px-2.5 py-0.5 rounded-full shadow-sm">
                    <Star size={10} className="fill-[#13231B]" />
                    <span>Best Read of the Month</span>
                  </div>

                  <div className="w-24 aspect-[3/4.5] rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(20,45,30,0.25)] border-2 border-white/60 bg-[#E6EFE9] my-1">
                    <img 
                      src={bestBook.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} 
                      alt={bestBook.title} 
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="space-y-0.5 px-2 max-w-full">
                    <h3 className="text-sm font-black text-white leading-tight line-clamp-1">{bestBook.title}</h3>
                    <p className="text-[10px] text-[#EAF2EC] font-medium">{bestBook.author}</p>
                  </div>
                </div>
              )}

              {/* SECTION BAWAH: List Buku Lainnya Yang Selesai */}
              <div className="z-10 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#EAF2EC] px-0.5">
                  <span>Books Completed</span>
                  <span className="bg-white/20 px-1.5 py-0.2 rounded-md">{finishedBooks.length} Buku</span>
                </div>

                {otherBooks.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {otherBooks.slice(0, 4).map((b) => (
                      <div key={b.id} className="flex flex-col items-center group">
                        <div className="w-full aspect-[3/4.5] bg-white/30 rounded-lg overflow-hidden border border-white/40 shadow-sm">
                          <img 
                            src={b.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} 
                            alt={b.title} 
                            crossOrigin="anonymous" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <p className="text-[8px] font-semibold text-[#EAF2EC] truncate w-full text-center mt-1">
                          {b.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-[#EAF2EC]/90 py-1 font-medium">
                    1 buku diselesaikan bulan ini.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center z-10 border-t border-white/20 pt-2 w-full mt-2">
                <p className="text-[9px] text-[#EAF2EC] font-semibold tracking-wide">Minor Notes &bull; oleh Skeptis Minor</p>
              </div>
            </div>

            {/* Action Share Button */}
            <button
              onClick={handleShare}
              disabled={loading}
              className="w-full py-3.5 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#204E38]/20 transition-all active:scale-95"
            >
              {loading ? (
                <span>Menyiapkan Gambar Rekap...</span>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>Bagikan Rekap Bulanan</span>
                </>
              )}
            </button>
          </>
        )}

      </div>
    </div>
  );
}