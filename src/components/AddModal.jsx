import React, { useState } from 'react';
import { X, BookPlus, Quote as QuoteIcon } from 'lucide-react';

export default function AddModal({ isOpen, onClose, onAddBook, onAddQuote }) {
  const [type, setType] = useState('book');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState('reading');
  const [quoteText, setQuoteText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'book') {
      if (!title || !author) return;
      onAddBook({ title, author, coverUrl, status });
    } else {
      if (!quoteText) return;
      onAddQuote({ quote: quoteText, author: author || 'Anonim' });
    }
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setQuoteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/80 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setType('book')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'book'
                  ? 'bg-[#204E38] text-white shadow-sm'
                  : 'bg-[#F2F6F3] text-[#6C8476] hover:bg-[#E5ECE7]'
              }`}
            >
              <BookPlus size={15} /> + Buku
            </button>
            <button
              onClick={() => setType('quote')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'quote'
                  ? 'bg-[#204E38] text-white shadow-sm'
                  : 'bg-[#F2F6F3] text-[#6C8476] hover:bg-[#E5ECE7]'
              }`}
            >
              <QuoteIcon size={15} /> + Quote
            </button>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'book' ? (
            <>
              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">Judul Buku</label>
                <input
                  type="text"
                  placeholder="Contoh: Filosofi Teras"
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">Penulis</label>
                <input
                  type="text"
                  placeholder="Contoh: Henry Manampiring"
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">URL Cover Buku (Rasio 2:3)</label>
                <input
                  type="url"
                  placeholder="https://images-na.ssl-images-amazon.com/..."
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">Status</label>
                <select
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="reading">Sedang Dibaca (Ongoing)</option>
                  <option value="finished">Selesai Dibaca (Finished)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">Kutipan Kata</label>
                <textarea
                  placeholder="Kutipan menarik dari buku yang kamu baca..."
                  className="w-full text-xs font-medium p-4 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all resize-none h-28"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#6C8476] uppercase tracking-wider mb-1 block">Dari Tokoh / Buku</label>
                <input
                  type="text"
                  placeholder="Contoh: Marcus Aurelius"
                  className="w-full text-xs font-medium px-4 py-3 rounded-2xl bg-[#F8FAF8] border border-[#DCE5DF] outline-none focus:border-[#204E38] focus:bg-white transition-all"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-lg shadow-[#204E38]/20 transition-all active:scale-[0.98] mt-2"
          >
            Simpan ke Track
          </button>
        </form>
      </div>
    </div>
  );
}