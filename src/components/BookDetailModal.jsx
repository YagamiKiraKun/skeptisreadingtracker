import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Quote as QuoteIcon, 
  Plus, 
  Share2, 
  Check 
} from 'lucide-react';

export default function BookDetailModal({ 
  isOpen, 
  onClose, 
  book, 
  quotes = [], 
  onEditBook, 
  onDeleteBook, 
  onToggleStatus, 
  onAddQuoteToBook,
  onOpenShareQuote,
  onOpenShareBook
}) {
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newPageNumber, setNewPageNumber] = useState('');
  const [newPersonalNote, setNewPersonalNote] = useState('');

  if (!isOpen || !book) return null;

  const bookQuotes = quotes.filter((q) => q.bookId === book.id || q.bookTitle === book.title);
  const isFinished = book.status === 'finished';
  const curP = book.currentPage || 0;
  const totP = book.totalPages || 0;
  const progressPct = totP > 0 ? Math.min(Math.round((curP / totP) * 100), 100) : 0;

  const handleSaveQuote = (e) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    onAddQuoteToBook({
      quote: newQuoteText.trim(),
      author: book.author || 'Anonim',
      bookId: book.id,
      bookTitle: book.title,
      pageNumber: newPageNumber.trim() ? parseInt(newPageNumber, 10) : null,
      personalNote: newPersonalNote.trim() || null
    });
    setNewQuoteText('');
    setNewPageNumber('');
    setNewPersonalNote('');
    setIsAddingQuote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-lg w-full border border-white/80 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
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
          <div className="w-24 aspect-[3/4.5] bg-[#E6EFE9] rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-slate-100">
            <img 
              src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'} 
              alt={book.title} 
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-base font-black text-[#13231B] leading-snug">{book.title}</h2>
              <p className="text-xs font-semibold text-[#7C9486] mt-0.5">{book.author}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onToggleStatus(book)}
                className={`text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                  isFinished 
                    ? 'bg-[#204E38] text-white shadow-sm' 
                    : 'bg-[#FFF6E5] text-[#A67519] border border-[#F5E6CC]'
                }`}
              >
                <Check size={12} strokeWidth={3} />
                <span>{isFinished ? 'Selesai Dibaca' : 'Sedang Dibaca'}</span>
              </button>

              <button
                onClick={() => onOpenShareBook(book)}
                className="p-1.5 rounded-xl bg-[#F4F8F5] text-[#204E38] hover:bg-[#EAF2ED]"
                title="Bagikan Card Buku"
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar Halaman */}
        {totP > 0 && (
          <div className="bg-[#F4F8F5] p-3.5 rounded-2xl border border-[#DCE5DF] space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#4A6455]">
              <span>Progress Halaman</span>
              <span>{curP} / {totP} Hal ({progressPct}%)</span>
            </div>
            <div className="w-full bg-[#E5EDE7] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#204E38] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Section Quotes Terkait Buku Ini */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <QuoteIcon size={14} className="text-[#204E38]" />
              <h3 className="font-extrabold text-xs text-[#13231B]">
                Kutipan & Catatan ({bookQuotes.length})
              </h3>
            </div>
            <button
              onClick={() => setIsAddingQuote(!isAddingQuote)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#204E38] bg-[#EAF2ED] hover:bg-[#DBE8DF] px-2.5 py-1 rounded-xl transition-all"
            >
              <Plus size={12} />
              <span>{isAddingQuote ? 'Batal' : 'Tambah'}</span>
            </button>
          </div>

          {/* Form Tambah Quote Cepat */}
          {isAddingQuote && (
            <form onSubmit={handleSaveQuote} className="p-3 bg-[#F4F8F5] rounded-2xl border border-[#DCE5DF] space-y-2.5">
              <textarea
                rows="2"
                placeholder="Tulis kutipan kalimat dari buku..."
                className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs outline-none text-[#13231B] resize-none"
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                autoFocus
                required
              />
              <textarea
                rows="2"
                placeholder="Catatan / refleksimu tentang bagian ini (opsional)..."
                className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs outline-none text-[#13231B] resize-none placeholder:text-slate-400"
                value={newPersonalNote}
                onChange={(e) => setNewPersonalNote(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Hal (opsional)"
                  className="w-32 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none text-[#13231B]"
                  value={newPageNumber}
                  onChange={(e) => setNewPageNumber(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#204E38] hover:bg-[#153425] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          )}

          {/* List Quotes & Notes */}
          {bookQuotes.length === 0 ? (
            <div className="py-4 text-center bg-[#F4F8F5]/60 rounded-2xl border border-dashed border-[#DCE5DF]">
              <p className="text-[11px] font-medium text-[#7C9486]">
                Belum ada kutipan atau catatan untuk buku ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {bookQuotes.map((q) => (
                <div 
                  key={q.id} 
                  className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2"
                >
                  <p className="text-xs italic text-[#25392D] font-medium leading-relaxed">
                    "{q.quote}"
                  </p>

                  {/* Refleksi / Personal Note */}
                  {q.personalNote && (
                    <div className="bg-[#F4F8F5] p-2.5 rounded-xl border-l-2 border-[#204E38] text-[11px] text-[#3A5043]">
                      <span className="font-bold text-[#204E38] block text-[10px] mb-0.5">Catatan:</span>
                      {q.personalNote}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-50 text-[10px] text-[#7C9486]">
                    {q.pageNumber ? (
                      <span className="bg-[#EAF2ED] text-[#204E38] px-2 py-0.5 rounded-md font-bold">
                        Hal. {q.pageNumber}
                      </span>
                    ) : <span />}
                    <button
                      onClick={() => onOpenShareQuote(q)}
                      className="text-slate-400 hover:text-[#204E38] p-1"
                      title="Bagikan Quote"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}