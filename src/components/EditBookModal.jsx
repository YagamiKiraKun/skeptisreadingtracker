import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

export default function EditBookModal({ isOpen, onClose, book, onSave }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setCoverUrl(book.coverUrl || '');
      setTotalPages(book.totalPages ? book.totalPages.toString() : '');
      setCurrentPage(book.currentPage ? book.currentPage.toString() : '0');
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(book.id, {
      title: title.trim(),
      author: author.trim() || 'Anonim',
      coverUrl: coverUrl.trim(),
      totalPages: parseInt(totalPages, 10) || 0,
      currentPage: parseInt(currentPage, 10) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#204E38] font-bold text-xs">
            <BookOpen size={15} />
            <span>Edit Informasi Buku</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">Judul Buku</label>
            <input
              type="text"
              className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">Penulis</label>
            <input
              type="text"
              className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Hal. Saat Ini</label>
              <input
                type="number"
                min="0"
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Total Halaman</label>
              <input
                type="number"
                min="0"
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">URL Cover</label>
            <input
              type="text"
              className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
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