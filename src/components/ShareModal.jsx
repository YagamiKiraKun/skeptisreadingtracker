import React, { useRef, useState } from 'react';
import { X, Download, Share2, Quote as QuoteIcon, Check, Image as ImageIcon, Sparkles, BookOpen } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { auth } from '../firebase';

export default function ShareModal({ isOpen, onClose, data, type = 'book' }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen || !data) return null;

  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Reader';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const renderOptions = {
        quality: 1.0,
        pixelRatio: 3,
        cacheBust: true,
      };

      // Execution ganda (warm-up) untuk memastikan teks & layout ter-render jernih
      await htmlToImage.toPng(cardRef.current, renderOptions);
      const dataUrl = await htmlToImage.toPng(cardRef.current, renderOptions);
      
      setGeneratedImage(dataUrl);

      const link = document.createElement('a');
      link.download = `minor-notes-card-${type}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      alert('Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    let textToCopy = type === 'quote'
      ? `"${data.quote}" — ${data.author}${data.bookTitle ? ` (${data.bookTitle})` : ''}`
      : `Buku: ${data.title} oleh ${data.author}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setGeneratedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4 max-h-[95vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-1.5 text-[#204E38]">
            <Sparkles size={15} />
            <span className="text-xs font-black tracking-tight">Visual Story Card</span>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Visual Card 9:16 — PURE VECTOR MINIMALIST (STABLE) */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-[270px] h-[480px] bg-[#86A789] rounded-[32px] p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden flex-shrink-0"
          >
            {/* Subtle Inner Frame */}
            <div className="absolute inset-3 border border-white/20 rounded-[24px] pointer-events-none" />

            {/* Header Canvas */}
            <div className="flex justify-between items-center z-10 pt-1 px-1 border-b border-white/20 pb-2.5">
              <span className="text-[8.5px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md text-white">
                {type === 'quote' ? 'QUOTE' : 'BOOK SPOTLIGHT'}
              </span>
              
              <span className="text-[9px] font-medium text-white/90">
                curated by {userName}
              </span>
            </div>

            {/* Main Content Area */}
            <div className="my-auto py-2 z-10 flex flex-col justify-center items-center text-center px-1 w-full">
              {type === 'quote' ? (
                <div className="space-y-4 w-full relative flex flex-col items-center">
                  
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md shadow-sm border border-white/20">
                    <QuoteIcon size={14} className="text-white" />
                  </div>

                  {/* Teks Quote */}
                  <p className="text-[11.5px] font-medium leading-relaxed text-white text-justify px-2 tracking-tight">
                    "{data.quote}"
                  </p>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold tracking-wider text-white">— {data.author}</p>
                  </div>

                  {/* Tag Buku Minimalis (Vector Only) */}
                  {data.bookTitle && (
                    <div className="mt-1 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-2.5 flex items-center gap-2.5 w-full max-w-[210px] text-left shadow-sm">
                      <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                        <BookOpen size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9.5px] font-bold text-white truncate leading-tight">{data.bookTitle}</p>
                        {data.pageNumber && (
                          <p className="text-[8.5px] text-white/80 font-medium mt-0.5">Halaman {data.pageNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Mode Share Card Buku (Minimalist Monogram Card) */
                <div className="space-y-4 flex flex-col items-center w-full">
                  <div className="w-24 aspect-[3/4] bg-white/15 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col items-center justify-center p-3 shadow-lg space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <BookOpen size={20} />
                    </div>
                    <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">
                      {data.title ? data.title.substring(0, 3) : 'BOOK'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 w-full">
                    <h3 className="text-xs font-black text-white leading-snug tracking-tight">{data.title}</h3>
                    <p className="text-[10.5px] font-semibold text-white/90">{data.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Canvas */}
            <div className="pb-1 px-1 border-t border-white/20 pt-2.5 flex justify-between items-end z-10 text-[9px] text-white/90">
              <div className="text-left">
                <p className="font-black text-white tracking-widest text-[8px] uppercase">MINOR NOTES</p>
                <p className="text-[7.5px] font-mono opacity-80 mt-0.5">skeptisreadingtracker.vercel.app</p>
              </div>
              <span className="text-[8px] font-mono bg-white/15 px-2 py-0.5 rounded-md text-white/90">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Fallback Image Preview */}
        {generatedImage && (
          <div className="w-full p-3.5 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-2 text-center animate-in fade-in duration-200">
            <p className="text-[10.5px] font-bold text-[#204E38] leading-tight">
              Kartu Siap! Tekan & tahan gambar di bawah lalu pilih "Simpan Gambar":
            </p>
            <img 
              src={generatedImage} 
              alt="Hasil Render Card" 
              className="w-36 mx-auto rounded-2xl shadow-lg border border-slate-200"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <button
            onClick={handleCopyText}
            className="py-2.5 px-3 bg-[#F4F8F5] hover:bg-[#EAF2ED] text-[#4A6455] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-[#DCE5DF]"
          >
            {copied ? <Check size={14} className="text-[#204E38]" /> : <Share2 size={14} />}
            <span>{copied ? 'Tercopy!' : 'Copy Teks'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="py-2.5 px-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#204E38]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloading ? <ImageIcon size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Memproses...' : 'Simpan Card'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}