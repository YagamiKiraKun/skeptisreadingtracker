import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Quote as QuoteIcon, FileText, Loader2 } from 'lucide-react';

export default function AddModal({ isOpen, onClose, onAddBook, onAddQuote, onAddNote, books = [] }) {
  const [tab, setTab] = useState('book'); // 'book' | 'quote' | 'note'
  
  // State Form Buku
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('0');

  // State Search Google Books
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // State Form Quote
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [selectedBookIdForQuote, setSelectedBookIdForQuote] = useState('');
  const [pageNumber, setPageNumber] = useState('');

  // State Form Note / Review Bebas
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedBookIdForNote, setSelectedBookIdForNote] = useState('');

  const searchGoogleBooks = async (queryText) => {
    if (!queryText || queryText.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryText.trim())}&maxResults=6`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const formatted = data.items.map((item) => {
          const info = item.volumeInfo || {};
          let img = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
          if (img.startsWith('http://')) img = img.replace('http://', 'https://');
          return {
            title: info.title || '',
            author: info.authors ? info.authors.join(', ') : 'Penulis Tidak Diketahui',
            coverUrl: img,
            pageCount: info.pageCount || ''
          };
        });
        setSearchResults(formatted);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error fetching Google Books:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.length >= 2) {
        searchGoogleBooks(title);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title]);

  if (!isOpen) return null;

  const handleSelectBook = (selected) => {
    setTitle(selected.title);
    setAuthor(selected.author);
    setCoverUrl(selected.coverUrl);
    if (selected.pageCount) setTotalPages(selected.pageCount.toString());
    setShowDropdown(false);
  };

  const handleSubmitBook = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddBook({
      title: title.trim(),
      author: author.trim() || 'Anonim',
      coverUrl: coverUrl.trim(),
      totalPages: parseInt(totalPages, 10) || 0,
      currentPage: parseInt(currentPage, 10) || 0,
      status: 'reading',
      activityDates: [new Date().toISOString().split('T')[0]]
    });

    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setTotalPages('');
    setCurrentPage('0');
    setSearchResults([]);
    setShowDropdown(false);
    onClose();
  };

  const handleBookSelectionForQuote = (bookId) => {
    setSelectedBookIdForQuote(bookId);
    if (bookId) {
      const selected = books.find((b) => b.id === bookId);
      if (selected && selected.author) {
        setQuoteAuthor(selected.author);
      }
    }
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    const selected = books.find((b) => b.id === selectedBookIdForQuote);

    onAddQuote({
      quote: quoteText.trim(),
      author: quoteAuthor.trim() || (selected ? selected.author : 'Anonim'),
      bookId: selectedBookIdForQuote || null,
      bookTitle: selected ? selected.title : null,
      pageNumber: pageNumber.trim() ? parseInt(pageNumber, 10) : null
    });

    setQuoteText('');
    setQuoteAuthor('');
    setSelectedBookIdForQuote('');
    setPageNumber('');
    onClose();
  };

  const handleSubmitNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    const selected = books.find((b) => b.id === selectedBookIdForNote);

    onAddNote({
      title: noteTitle.trim() || 'Catatan Refleksi',
      content: noteContent.trim(),
      bookId: selectedBookIdForNote || null,
      bookTitle: selected ? selected.title : null
    });

    setNoteTitle('');
    setNoteContent('');
    setSelectedBookIdForNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        {/* Switcher Tab 3 Opsi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#EAF2ED] p-1 rounded-2xl">
            <button
              onClick={() => setTab('book')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'book' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
              }`}
            >
              <BookOpen size={12} />
              <span>Buku</span>
            </button>
            <button
              onClick={() => setTab('quote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'quote' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
              }`}
            >
              <QuoteIcon size={12} />
              <span>Kutipan</span>
            </button>
            <button
              onClick={() => setTab('note')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'note' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
              }`}
            >
              <FileText size={12} />
              <span>Catatan</span>
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* TAB 1: FORM BUKU */}
        {tab === 'book' && (
          <form onSubmit={handleSubmitBook} className="space-y-3.5 relative">
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-[#4A6455] flex items-center justify-between">
                <span>Judul Buku</span>
                {searching && (
                  <span className="text-[10px] text-[#204E38] flex items-center gap-1 font-semibold">
                    <Loader2 size={10} className="animate-spin" /> Mencari buku...
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2 bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF]">
                <Search size={14} className="text-[#8FA597]" />
                <input
                  type="text"
                  placeholder="Ketik judul buku..."
                  className="bg-transparent text-xs font-medium w-full outline-none text-[#13231B]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white mt-1.5 rounded-2xl shadow-2xl border border-[#DCE5DF] overflow-hidden">
                  <div className="px-3 py-2 bg-[#F4F8F5] border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#4A6455]">Pilih untuk Isi Otomatis</span>
                    <button 
                      type="button" 
                      onClick={() => setShowDropdown(false)}
                      className="text-[10px] font-bold text-slate-400"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectBook(item)}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#EAF2ED] cursor-pointer"
                      >
                        <div className="w-8 h-12 bg-[#EAF2ED] rounded flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt="cover" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={14} className="text-[#8FA597]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#13231B] truncate">{item.title}</p>
                          <p className="text-[10px] text-[#7C9486] truncate">{item.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Penulis</label>
              <input
                type="text"
                placeholder="Nama penulis..."
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
                  placeholder="0"
                  className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A6455]">Total Halaman</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Contoh: 320"
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
                placeholder="https://..."
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Simpan Buku
            </button>
          </form>
        )}

        {/* TAB 2: FORM KUTIPAN */}
        {tab === 'quote' && (
          <form onSubmit={handleSubmitQuote} className="space-y-3">
            {books.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A6455]">Tautkan ke Buku</label>
                <select
                  value={selectedBookIdForQuote}
                  onChange={(e) => handleBookSelectionForQuote(e.target.value)}
                  className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                >
                  <option value="">-- Pilih Buku --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Teks Kutipan</label>
              <textarea
                rows="4"
                placeholder="Ketik kutipan kalimat dari buku..."
                className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A6455]">Penulis / Sumber</label>
                <input
                  type="text"
                  placeholder="Nama penulis..."
                  className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A6455]">Halaman (Opsional)</label>
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
              className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Simpan Kutipan
            </button>
          </form>
        )}

        {/* TAB 3: FORM CATATAN & REVIEW */}
        {tab === 'note' && (
          <form onSubmit={handleSubmitNote} className="space-y-3">
            {books.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A6455]">Tautkan ke Buku</label>
                <select
                  value={selectedBookIdForNote}
                  onChange={(e) => setSelectedBookIdForNote(e.target.value)}
                  className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                >
                  <option value="">-- Pilih Buku --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Judul / Topik Catatan</label>
              <input
                type="text"
                placeholder="Misal: Review Bab 1, Kesan Pertama..."
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Isi Catatan / Review Bebas</label>
              <textarea
                rows="5"
                placeholder="Tulis ulasan, analisis, atau refleksi pribadimu..."
                className="bg-[#F4F8F5] p-3 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Simpan Catatan
            </button>
          </form>
        )}

      </div>
    </div>
  );
}