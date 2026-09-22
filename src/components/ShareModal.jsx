import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Sparkles, Quote } from 'lucide-react';
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
        backgroundColor: '#F4F7F4',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      setGeneratedImage(image);

      const link = document.createElement('a');
      link.href = image;
      link.download = `minor-notes-quote-${Date.now()}.png`;
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

  // Penyesuaian ukuran font dinamis berdasarkan panjang kutipan agar porsi visual tetap seimbang
  const getQuoteFontSize = (text = '') => {
    if (text.length > 250) return 'text-xs leading-relaxed';
    if (text.length > 120) return 'text-sm leading-relaxed';
    return 'text-base leading-relaxed';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-5 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-1.5 text-[#204E38]">
            <Sparkles size={15} />
            <span className="text-xs font-black tracking-tight">Quote Card (9:16 Story)</span>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Story Format (Flexible Dynamic Height to Prevent Any Text Clipping) */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-[320px] min-h-[520px] bg-[#F4F7F4] rounded-[24px] p-6 flex flex-col justify-between relative select-none border border-slate-200/80 overflow-hidden shrink-0 gap-6"
          >
            {/* Watermark Ornamen Tanda Petik Raksasa di Background */}
            <div className="absolute -right-3 -bottom-8 text-[#86A789]/15 text-[200px] font-serif font-black leading-none pointer-events-none select-none">
              ”
            </div>

            {/* Header Canvas */}
            <div className="flex justify-between items-center z-10 shrink-0">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#204E38]">
                MINOR NOTES
              </span>
              <span className="text-[9.5px] font-semibold text-[#6C8476]">
                skeptisreadingtracker.vercel.app
              </span>
            </div>

            {/* Dynamic White Card Overlay (Auto Heights & Justified Text) */}
            <div className="z-10 bg-white/95 backdrop-blur-sm rounded-[20px] p-5 shadow-[0_6px_20px_rgba(32,78,56,0.05)] border border-white flex flex-col justify-between space-y-4 my-auto">
              {type === 'quote' ? (
                <div className="space-y-3">
                  <div className="w-7 h-7 rounded-full bg-[#EAF2ED] flex items-center justify-center text-[#204E38] shrink-0">
                    <Quote size={13} className="fill-[#204E38]" />
                  </div>

                  {/* Teks Kutipan: Normal Font (Not Italic), Justified, Dynamic Font Size */}
                  <p className={`font-semibold text-[#13231B] text-justify tracking-normal not-italic ${getQuoteFontSize(data.quote)}`}>
                    "{data.quote}"
                  </p>

                  {/* Author & Detail Buku */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-0.5">
                    <p className="text-xs font-black text-[#204E38]">
                      — {data.author}
                    </p>
                    {data.bookTitle && (
                      <p className="text-[10.5px] font-medium text-[#6C8476] leading-snug">
                        Dari buku <span className="font-bold text-[#2A4335]">{data.bookTitle}</span>
                        {data.pageNumber ? ` (Hal. ${data.pageNumber})` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-3 py-1">
                  <div className="w-20 aspect-[3/4.2] bg-[#E6EFE9] rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                    <img
                      src={data.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                      alt={data.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 w-full px-1">
                    <h4 className="text-xs font-black text-[#13231B] leading-tight">{data.title}</h4>
                    <p className="text-[11px] font-semibold text-[#6C8476]">{data.author}</p>
                    <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2ED] text-[#204E38] mt-1">
                      {data.status === 'finished' ? 'Selesai Dibaca' : 'Sedang Dibaca'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Canvas */}
            <div className="z-10 flex justify-between items-end shrink-0 pt-1">
              <div>
                <p className="text-xs font-black text-[#204E38] leading-none">
                  {type === 'quote' ? 'Daily Reflection' : 'Reading Log'}
                </p>
                <p className="text-[9.5px] font-medium text-[#6C8476] leading-none mt-1">
                  Kutipan & Catatan Bacaan
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Preview Khusus untuk Pengguna HP */}
        {generatedImage && (
          <div className="w-full p-2.5 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-1.5 text-center animate-in fade-in duration-200">
            <p className="text-[10px] font-bold text-[#204E38] leading-tight">
              📱 Pengguna HP: Tekan & tahan gambar di bawah ini lalu pilih "Simpan Gambar":
            </p>
            <img 
              src={generatedImage} 
              alt="Hasil Render Story" 
              className="w-full max-w-[150px] mx-auto rounded-[16px] shadow-md border border-slate-200 object-cover"
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
            <span>{isExporting ? 'Proses...' : 'Buat Gambar Story'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}