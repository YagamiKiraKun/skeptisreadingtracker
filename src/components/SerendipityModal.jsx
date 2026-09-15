import React, { useState, useEffect, useCallback } from 'react';
import { X, Shuffle, Quote as QuoteIcon, BookOpen, Share2, ArrowRight } from 'lucide-react';

export default function SerendipityModal({ isOpen, onClose, quotes = [], books = [], onOpenShare, onSelectBook }) {
  const [activeTab, setActiveTab] = useState('quote'); // 'quote' | 'book'
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentBook, setCurrentBook] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  // Fungsi mengacak quote
  const getRandomQuote = useCallback(() => {
    if (!quotes || quotes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, [quotes]);

  // Fungsi mengacak buku
  const getRandomBook = useCallback(() => {
    if (!books || books.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * books.length);
    return books[randomIndex];
  }, [books]);

  // Trigger acak saat modal dibuka atau tab berganti
  const rollData = useCallback(() => {
    setIsRolling(true);
    setTimeout(() => {
      if (activeTab === 'quote') {
        setCurrentQuote(getRandomQuote());
      } else {
        setCurrentBook(getRandomBook());
      }
      setIsRolling(false);
    }, 200);
  }, [activeTab, getRandomQuote, getRandomBook]);

  useEffect(() => {
    if (isOpen) {
      rollData();
    }
  }, [isOpen, activeTab, rollData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full border border-white/80 shadow-2xl flex flex-col items-center gap-5">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-[#204E38] uppercase tracking-wider">Serendipity Reader</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Quote vs Buku */}
        <div className="flex bg-[#F4F8F5] p-1 rounded-2xl w-full border border-[#DCE5DF]">
          <button
            onClick={() => setActiveTab('quote')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'quote' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
            }`}
          >
            Kutipan Acak
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'book' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
            }`}
          >
            Buku Acak
          </button>
        </div>

        {/* Display Card Area */}
        <div className={`w-full transition-all duration-200 ${isRolling ? 'opacity-40 scale-98' : 'opacity-100 scale-100'}`}>
          {activeTab === 'quote' ? (
            currentQuote ? (
              <div className="bg-[#86A789] rounded-[28px] p-6 text-white flex flex-col justify-between shadow-lg min-h-[260px] relative overflow-hidden">
                <div className="space-y-4 z-10">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <QuoteIcon size={14} className="text-white" />
                  </div>

                  <p className="text-xs font-medium leading-relaxed text-white text-justify tracking-tight">
                    "{currentQuote.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/20 flex justify-between items-end z-10 mt-3">
                  <div>
                    <p className="text-[11px] font-bold text-white">— {currentQuote.author}</p>
                    {currentQuote.bookTitle && (
                      <p className="text-[9.5px] text-white/80 font-medium truncate max-w-[170px]">
                        {currentQuote.bookTitle} {currentQuote.pageNumber ? `(Hal. ${currentQuote.pageNumber})` : ''}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenShare(currentQuote, 'quote')}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md transition-all text-white"
                    title="Bagikan Kutipan"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#F4F8F5] rounded-[28px] p-8 text-center border border-[#DCE5DF] space-y-2">
                <QuoteIcon size={24} className="mx-auto text-[#8FA597]" />
                <p className="text-xs font-semibold text-[#6C8476]">Belum ada kutipan tersimpan untuk diacak.</p>
              </div>
            )
          ) : (
            currentBook ? (
              <div className="bg-[#F4F8F5] rounded-[28px] p-5 border border-[#DCE5DF] flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="w-24 aspect-[3/4.5] bg-[#E6EFE9] rounded-xl overflow-hidden shadow-md border border-white/80 p-0.5">
                  <img
                    src={currentBook.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                    alt={currentBook.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                </div>

                <div className="space-y-1 w-full px-2">
                  <h4 className="text-xs font-black text-[#13231B] line-clamp-1">{currentBook.title}</h4>
                  <p className="text-[11px] font-semibold text-[#7C9486] truncate">{currentBook.author}</p>
                  <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                    currentBook.status === 'finished' ? 'bg-[#E3EFE6] text-[#204E38]' : 'bg-[#FFF6E5] text-[#A67519]'
                  }`}>
                    {currentBook.status === 'finished' ? 'Selesai Dibaca' : 'Sedang Dibaca'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onSelectBook) onSelectBook(currentBook);
                  }}
                  className="w-full py-2 bg-white hover:bg-[#EAF2ED] text-[#204E38] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DCE5DF] transition-all"
                >
                  <span>Buka Detail Buku</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <div className="bg-[#F4F8F5] rounded-[28px] p-8 text-center border border-[#DCE5DF] space-y-2">
                <BookOpen size={24} className="mx-auto text-[#8FA597]" />
                <p className="text-xs font-semibold text-[#6C8476]">Belum ada buku tersimpan di koleksi.</p>
              </div>
            )
          )}
        </div>

        {/* Action Button: Acak Lagi */}
        <button
          onClick={rollData}
          disabled={isRolling}
          className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#204E38]/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Shuffle size={14} className={isRolling ? 'animate-spin' : ''} />
          <span>{isRolling ? 'Mengacak...' : 'Acak Lagi (Roll)'}</span>
        </button>

      </div>
    </div>
  );
}