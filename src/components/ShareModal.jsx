import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ShareModal({ isOpen, onClose, data, type = 'quote' }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen || !data) return null;

  const handleCopyText = () => {
    let textToCopy = type === 'quote'
      ? `"${data.quote}" — ${data.author}${data.bookTitle ? ` (${data.bookTitle})` : ''}`
      : `Buku: ${data.title} oleh ${data.author} | Minor Notes`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Kualitas HD 3x
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Mencegah kanvas luar menimpa kurva
      });

      const image = canvas.toDataURL('image/png');
      setGeneratedImage(image);

      // Trik auto-download untuk PC
      const link = document.createElement('a');
      link.href = image;
      link.download = `minor-notes-card-${type}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      alert('Gagal membuat gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseModal = () => {
    setGeneratedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-1.5 text-[#204E38]">
            <Sparkles size={15} />
            <span className="text-xs font-black tracking-tight">Editorial Card (4:3)</span>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas 4:3 Editorial Design (Fix Overflow Clipping & Smooth Border Radius) */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-full aspect-[4/3] bg-[#F4F7F4] rounded-[24px] overflow-hidden p-6 md:p-7 flex flex-col justify-between relative select-none border border-slate-200/80"
          >
            {/* Ornaments: Watermark Kutipan Raksasa (Dikunci didalam overflow-hidden agar html2canvas tidak terdistorsi) */}
            <div className="absolute right-0 bottom-0 text-[#86A789]/20 text-[140px] font-serif font-black leading-none pointer-events-none select-none translate-x-2 translate-y-6">
              ”
            </div>

            {/* Header Canvas */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#204E38]">
                MINOR NOTES
              </span>
              <span className="text-[9.5px] font-semibold text-[#6C8476]">
                skeptisreadingtracker.vercel.app
              </span>
            </div>

            {/* Floating White Card Overlay (Kelengkungan Soft Presisi) */}
            <div className="my-auto z-10 bg-white/95 backdrop-blur-sm rounded-[18px] p-5 shadow-[0_4px_16px_rgba(32,78,56,0.06)] border border-white flex flex-col justify-center min-h-[130px]">
              {type === 'quote' ? (
                <div className="space-y-2">
                  <p className="text-xs md:text-sm font-bold text-[#13231B] leading-relaxed text-justify tracking-tight">
                    "{data.quote}"
                  </p>
                  <p className="text-[11px] font-medium text-[#4A6455] pt-1">
                    {data.bookTitle ? `Dari buku ${data.bookTitle}` : 'Catatan Refleksi'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 aspect-[3/4.5] bg-[#E6EFE9] rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={data.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                      alt={data.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-black text-[#13231B] leading-tight truncate">{data.title}</h4>
                    <p className="text-[11px] font-semibold text-[#6C8476] truncate">{data.author}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#EAF2ED] text-[#204E38] mt-1">
                      {data.status === 'finished' ? 'Selesai Dibaca' : 'Sedang Dibaca'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Canvas */}
            <div className="z-10 flex justify-between items-end pt-1">
              <div>
                <p className="text-xs font-black text-[#204E38]">
                  {type === 'quote' ? data.author : 'Koleksi Bacaan'}
                </p>
                <p className="text-[9.5px] font-medium text-[#6C8476]">
                  {type === 'quote' && data.pageNumber ? `Halaman ${data.pageNumber}` : 'Reading Tracker'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Preview Khusus untuk Pengguna HP */}
        {generatedImage && (
          <div className="w-full p-3 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-2 text-center animate-in fade-in duration-200">
            <p className="text-[10.5px] font-bold text-[#204E38] leading-tight">
              📱 Pengguna HP: Tekan & tahan gambar di bawah ini lalu pilih "Simpan Gambar":
            </p>
            <img 
              src={generatedImage} 
              alt="Hasil Render Card" 
              className="w-full aspect-[4/3] max-w-[240px] mx-auto rounded-[16px] shadow-md border border-slate-200 object-cover"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 w-full pt-1">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2.5 bg-[#F4F8F5] hover:bg-[#EAF2ED] text-[#204E38] rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DCE5DF] transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handleGenerateImage}
            disabled={isExporting}
            className="flex-1 py-2.5 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#204E38]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Proses...' : 'Buat Gambar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}