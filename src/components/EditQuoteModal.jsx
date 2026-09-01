import React, { useState, useEffect } from 'react';
import { X, Quote as QuoteIcon } from 'lucide-react';

export default function EditQuoteModal({ isOpen, onClose, quoteData, onSave, books = [] }) {
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [personalNote, setPersonalNote] = useState('');

  useEffect(() => {
    if (quoteData) {
      setQuoteText(quoteData.quote || '');
      setQuoteAuthor(quoteData.author || '');
      setSelectedBookId(quoteData.bookId || '');
      setPageNumber(quoteData.pageNumber ? quoteData.pageNumber.toString() : '');
      setPersonalNote(quoteData.personalNote || '');
    }
  }, [quoteData]);

  if (!isOpen || !quoteData) return null;

  const handleBookChange = (bookId) => {
    setSelectedBookId(bookId);
    if (bookId) {
      const selected = books.find((b) => b.id === bookId);
      if (selected && selected.author) {
        setQuoteAuthor(selected.author);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    const selected = books.find((b) => b.id === selectedBookId);

    onSave(quoteData.id, {
      quote: quoteText.trim(),
      author: quoteAuthor.trim() || (selected ? selected.author : 'Anonim'),
      bookId: selectedBookId || null,
      bookTitle: selected ? selected.title : (selectedBookId ? quoteData.bookTitle : null),
      pageNumber: pageNumber.trim() ? parseInt(pageNumber, 10) : null,
      personalNote: personalNote.trim() || null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#204E38] font-bold text-xs">
            <QuoteIcon size={15} />
            <span>Edit Kutipan & Catatan</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {books.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Tautkan ke Buku</label>
              <select
                value={selectedBookId}
                onChange={(e) => handleBookChange(e.target.value)}
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
              >
                <option value="">-- Tanpa Tautan Buku --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">Kutipan</label>
            <textarea
              rows="3"
              className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">Catatan / Refleksi Pribadi (Opsional)</label>
            <textarea
              rows="2"
              className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Penulis / Sumber</label>
              <input
                type="text"
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Halaman</label>
              <input
                type="number"
                min="1"
                placeholder="Contoh: 142"
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 mt-2"
          >
            Simpan Perubahan
          </button>
        </form>

      </div>
    </div>
  );
}