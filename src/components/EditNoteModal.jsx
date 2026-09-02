import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

export default function EditNoteModal({ isOpen, onClose, noteData, onSave, books = [] }) {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    if (noteData) {
      setNoteTitle(noteData.title || '');
      setNoteContent(noteData.content || '');
      setSelectedBookId(noteData.bookId || '');
    }
  }, [noteData]);

  if (!isOpen || !noteData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const selected = books.find((b) => b.id === selectedBookId);

    onSave(noteData.id, {
      title: noteTitle.trim() || 'Catatan Refleksi',
      content: noteContent.trim(),
      bookId: selectedBookId || null,
      bookTitle: selected ? selected.title : (selectedBookId ? noteData.bookTitle : null),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#204E38] font-bold text-xs">
            <FileText size={15} />
            <span>Edit Note</span>
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
                onChange={(e) => setSelectedBookId(e.target.value)}
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
            <label className="text-[11px] font-bold text-[#4A6455]">Judul / Topik Note</label>
            <input
              type="text"
              className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-semibold w-full outline-none text-[#13231B]"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#4A6455]">Isi Note</label>
            <textarea
              rows="5"
              className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              autoFocus
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