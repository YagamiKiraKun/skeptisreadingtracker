import React, { useRef, useState } from 'react';
import { X, Download, Share2, Quote as QuoteIcon, Check, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { auth } from '../firebase';

export default function ShareModal({ isOpen, onClose, data, type = 'book' }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  if (!isOpen || !data) return null;

  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || 'Pengguna';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Warm-up & render ke PNG resolusi tinggi (pixelRatio 2)
      await htmlToImage.toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      
      setGeneratedImage(dataUrl);

      // Coba trigger download otomatis lewat elemen <a>
      const link = document.createElement('a');
      link.download = `minor-notes-${type}-${Date.now()}.png`;
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
    let textToCopy = '';
    if (type === 'quote') {
      textToCopy = `"${data.quote}" — ${data.author}${data.bookTitle ? ` (${data.bookTitle})` : ''}`;
    } else {
      textToCopy = `Buku: ${data.title} oleh ${data.author}`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setGeneratedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-4 max-h-[95vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold text-[#204E38]">Simpan Visual Story</span>
          <button 
            onClick={handleCloseModal} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Visual Card 9:16 (Clean Minimalist Editorial) */}
        <div className="w-full flex justify-center">
          <div
            ref={cardRef}
            className="w-[270px] h-[480px] bg-[#86A789] rounded-[28px] p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden flex-shrink-0"
          >
            {/* Inner Frame Line */}
            <div className="absolute inset-3 border border-white/20 rounded-[22px] pointer-events-none" />

            {/* Header Canvas */}
            <div className="flex justify-between items-center z-10 pt-1 px-1">
              <div className="flex items-center gap-1.5">
                <QuoteIcon size={13} className="text-white/90" />
                <span className="text-[9.5px] font-black tracking-wider uppercase text-white/90">
                  Minor Notes
                </span>
              </div>
              
              <span className="text-[9px] font-semibold text-white bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm tracking-wide">
                {userName}
              </span>
            </div>

            {/* Main Content */}
            <div className="my-auto py-2 z-10 flex flex-col justify-center items-center text-center px-1">
              {type === 'quote' ? (
                <div className="space-y-5 w-full relative">
                  <span className="absolute -top-6 left-0 text-4xl font-serif text-white/10 select-none pointer-events-none leading-none">
                    “
                  </span>
                  
                  <p className="text-[11.5px] font-medium leading-relaxed text-white text-justify tracking-tight px-1 relative z-10">
                    "{data.quote}"
                  </p>

                  <div className="pt-3 border-t border-white/20 text-center space-y-0.5">
                    <p className="text-[11px] font-bold text-white tracking-wide">— {data.author}</p>
                    {data.bookTitle && (
                      <p className="text-[9.5px] text-white/80 font-medium">
                        {data.bookTitle} {data.pageNumber ? `(Hal. ${data.pageNumber})` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-26 aspect-[3/4.5] bg-[#6C8476] rounded-xl overflow-hidden shadow-md border border-white/30">
                    <img
                      src={data.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                      alt={data.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-white leading-snug px-2 tracking-tight">{data.title}</h3>
                    <p className="text-[10.5px] font-semibold text-white/85">{data.author}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Canvas */}
            <div className="pb-1 px-1 border-t border-white/20 pt-2.5 flex justify-between items-end z-10 text-[9px] text-white/90">
              <div>
                <p className="font-bold text-white leading-none">Aplikasi Bacaan</p>
                <p className="text-[8px] font-medium opacity-80 mt-0.5 tracking-tight">skeptisreadingtracker.vercel.app</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fallback Image Preview jika di HP Safari terblokir auto-download */}
        {generatedImage && (
          <div className="w-full p-3.5 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-2 text-center animate-in fade-in duration-200">
            <p className="text-[10.5px] font-bold text-[#204E38] leading-tight">
              Jika unduhan tidak mulai otomatis, tekan & tahan gambar di bawah lalu pilih "Simpan Gambar":
            </p>
            <img 
              src={generatedImage} 
              alt="Hasil Render Visual" 
              className="w-36 mx-auto rounded-xl shadow-md border border-slate-200"
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
            <span>{downloading ? 'Memproses...' : 'Simpan Gambar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}