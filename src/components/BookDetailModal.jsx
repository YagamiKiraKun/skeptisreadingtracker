import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Quote as QuoteIcon, 
  FileText, 
  Share2, 
  Check 
} from 'lucide-react';

export default function BookDetailModal({ 
  isOpen, 
  onClose, 
  book, 
  quotes = [], 
  notes = [],
  onEditBook, 
  onDeleteBook, 
  onToggleStatus, 
  onDeleteQuote,
  onDeleteNote,
  onOpenShareQuote,
  onOpenShareBook
}) {
  const [activeFolderTab, setActiveFolderTab] = useState('quotes'); // 'quotes' | 'notes'

  if (!isOpen || !book) return null;

  const bookQuotes = quotes.filter((q) => q.bookId === book.id || q.bookTitle === book.title);
  const bookNotes = notes.filter((n) => n.bookId === book.id || n.bookTitle === book.title);
  
  const isFinished = book.status === 'finished';
  const curP = book.currentPage || 0;
  const totP = book.totalPages || 0;
  const progressPct = totP > 0 ? Math.min(Math.round((curP / totP) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-sm sm:max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#204E38]">Detail Buku</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditBook(book)}
              className="p-1.5 rounded-xl bg-[#F4F8F5] text-[#204E38] hover:bg-[#EAF2ED] transition-colors"
              title="Edit Data Buku"
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => {
                onDeleteBook(book.id);
                onClose();
              }}
              className="p-1.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
              title="Hapus Buku"
            >
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Konten Info Buku */}
        <div className="flex gap-4 items-start">
          <div className="w-20 aspect-[3/4.5] bg-[#E6EFE9] rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-slate-100">
            <img 
              src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} 
              alt={book.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="flex-1 space-y-1.5">
            <div>
              <h2 className="text-sm font-black text-[#13231B] leading-snug">{book.title}</h2>
              <p className="text-xs font-semibold text-[#7C9486]">{book.author}</p>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => onToggleStatus(book)}
                className={`text-[10.5px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                  isFinished 
                    ? 'bg-[#204E38] text-white shadow-sm' 
                    : 'bg-[#FFF6E5] text-[#A67519] border border-[#F5E6CC]'
                }`}
              >
                <Check size={11} strokeWidth={3} />
                <span>{isFinished ? 'Selesai' : 'Sedang Dibaca'}</span>
              </button>

              <button
                onClick={() => onOpenShareBook(book)}
                className="p-1.5 rounded-xl bg-[#F4F8F5] text-[#204E38] hover:bg-[#EAF2ED]"
                title="Bagikan Card Buku"
              >
                <Share2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar Halaman */}
        {totP > 0 && (
          <div className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-[#4A6455]">
              <span>Progress Halaman</span>
              <span>{curP} / {totP} Hal ({progressPct}%)</span>
            </div>
            <div className="w-full bg-[#E5EDE7] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#204E38] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Folder Switcher Rapi (Full Width Segmented Control) */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div className="grid grid-cols-2 bg-[#F4F8F5] p-1 rounded-2xl border border-[#DCE5DF]">
            <button
              onClick={() => setActiveFolderTab('quotes')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFolderTab === 'quotes'
                  ? 'bg-[#204E38] text-white shadow-sm'
                  : 'text-[#6C8476] hover:text-[#204E38]'
              }`}
            >
              <QuoteIcon size={12} />
              <span>Kutipan ({bookQuotes.length})</span>
            </button>

            <button
              onClick={() => setActiveFolderTab('notes')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFolderTab === 'notes'
                  ? 'bg-[#204E38] text-white shadow-sm'
                  : 'text-[#6C8476] hover:text-[#204E38]'
              }`}
            >
              <FileText size={12} />
              <span>Note ({bookNotes.length})</span>
            </button>
          </div>

          {/* TAB 1: KUTIPAN */}
          {activeFolderTab === 'quotes' && (
            <div className="space-y-2.5">
              {bookQuotes.length === 0 ? (
                <div className="py-6 text-center bg-[#F4F8F5]/60 rounded-2xl border border-dashed border-[#DCE5DF]">
                  <p className="text-xs font-medium text-[#7C9486]">
                    Belum ada kutipan untuk buku ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {bookQuotes.map((q) => (
                    <div 
                      key={q.id} 
                      className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2"
                    >
                      <p className="text-xs italic text-[#25392D] font-medium leading-relaxed">
                        "{q.quote}"
                      </p>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-50 text-[10px] text-[#7C9486]">
                        {q.pageNumber ? (
                          <span className="bg-[#EAF2ED] text-[#204E38] px-2 py-0.5 rounded-md font-bold">
                            Hal. {q.pageNumber}
                          </span>
                        ) : <span />}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenShareQuote(q)}
                            className="text-slate-400 hover:text-[#204E38] p-1"
                            title="Bagikan Quote"
                          >
                            <Share2 size={12} />
                          </button>
                          {onDeleteQuote && (
                            <button
                              onClick={() => onDeleteQuote(q.id)}
                              className="text-slate-300 hover:text-rose-500 p-1"
                              title="Hapus Quote"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTE */}
          {activeFolderTab === 'notes' && (
            <div className="space-y-2.5">
              {bookNotes.length === 0 ? (
                <div className="py-6 text-center bg-[#F4F8F5]/60 rounded-2xl border border-dashed border-[#DCE5DF]">
                  <p className="text-xs font-medium text-[#7C9486]">
                    Belum ada note untuk buku ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {bookNotes.map((n) => (
                    <div 
                      key={n.id} 
                      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-[#13231B]">
                          {n.title || 'Catatan'}
                        </h4>
                        {onDeleteNote && (
                          <button
                            onClick={() => onDeleteNote(n.id)}
                            className="text-slate-300 hover:text-rose-500 p-0.5"
                            title="Hapus Note"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#3A5043] leading-relaxed whitespace-pre-line font-normal">
                        {n.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}