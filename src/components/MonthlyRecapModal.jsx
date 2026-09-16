import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function MonthlyRecapModal({ isOpen, onClose, finishedBooks = [] }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen) return null;

  const now = new Date();
  const currentMonthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const handleCopyText = () => {
    const bookTitles = finishedBooks.map((b) => `• ${b.title} (${b.author})`).join('\n');
    const textToCopy = `Rekap Bacaan ${currentMonthName} — Minor Notes:\nTotal: ${finishedBooks.length} Buku Selesai\n\nDaftar Buku:\n${bookTitles}`;

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
        backgroundColor: '#F4F7F4',
        width: 400,
        height: 300,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      setGeneratedImage(image);

      const link = document.createElement('a');
      link.href = image;
      link.download = `minor-notes-rekap-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Gagal memproses rekap:', err);
      alert('Gagal membuat gambar rekap.');
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
            <span className="text-xs font-black tracking-tight">Monthly Reading Recap (4:3)</span>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas 4:3 Presisi Piksel Pasti (400px x 300px) */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-[400px] h-[300px] bg-[#F4F7F4] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden select-none border border-slate-200/80 shrink-0"
          >
            {/* Watermark Angka Jumlah Buku Raksasa di Background */}
            <div className="absolute -right-2 -bottom-6 text-[#86A789]/15 text-[150px] font-serif font-black leading-none pointer-events-none select-none">
              {finishedBooks.length}
            </div>

            {/* Header Canvas */}
            <div className="flex justify-between items-center z-10 h-5">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#204E38] leading-none">
                MINOR NOTES
              </span>
              <span className="text-[9.5px] font-semibold text-[#6C8476] leading-none">
                {currentMonthName}
              </span>
            </div>

            {/* Floating White Card Container (Tinggi Pasti & Space Terukur) */}
            <div className="z-10 bg-white/95 backdrop-blur-sm rounded-[18px] p-4 shadow-[0_4px_16px_rgba(32,78,56,0.05)] border border-white flex flex-col justify-between h-[165px] my-auto">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 h-6">
                <span className="text-[10px] font-extrabold text-[#204E38] uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <BookOpen size={12} /> BUKU SELESAI DIBACA
                </span>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-[#EAF2ED] text-[#204E38] leading-none">
                  {finishedBooks.length} Buku
                </span>
              </div>

              {finishedBooks.length === 0 ? (
                <p className="text-xs font-medium text-[#7C9486] text-center py-4">
                  Belum ada buku yang tamat bulan ini.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 h-[115px] pt-1">
                  {finishedBooks.map((book, idx) => (
                    <div key={book.id || idx} className="flex items-center gap-2.5 h-12">
                      <div className="w-8 h-11 bg-[#E6EFE9] rounded border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={book.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'}
                          alt={book.title}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[10px] font-bold text-[#13231B] truncate leading-tight">
                          {book.title}
                        </h4>
                        <p className="text-[9px] font-medium text-[#6C8476] truncate leading-tight mt-0.5">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Canvas */}
            <div className="z-10 flex justify-between items-end h-5 pt-1">
              <div>
                <p className="text-xs font-black text-[#204E38] leading-none">
                  Reading Log Summary
                </p>
                <p className="text-[9.5px] font-medium text-[#6C8476] leading-none mt-1">
                  skeptisreadingtracker.vercel.app
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Preview Khusus Pengguna HP */}
        {generatedImage && (
          <div className="w-full p-3 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-2 text-center animate-in fade-in duration-200">
            <p className="text-[10.5px] font-bold text-[#204E38] leading-tight">
              📱 Pengguna HP: Tekan & tahan gambar di bawah ini lalu pilih "Simpan Gambar":
            </p>
            <img 
              src={generatedImage} 
              alt="Hasil Render Rekap" 
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
            <span>{copied ? 'Tersalin!' : 'Salin Rekap'}</span>
          </button>

          <button
            onClick={handleGenerateImage}
            disabled={isExporting}
            className="flex-1 py-2.5 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#204E38]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isExporting ? 'Proses...' : 'Buat Gambar Rekap'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}