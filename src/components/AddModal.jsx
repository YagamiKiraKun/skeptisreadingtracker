import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Quote as QuoteIcon, Sparkles, Loader2 } from 'lucide-react';

export default function AddModal({ isOpen, onClose, onAddBook, onAddQuote }) {
  const [tab, setTab] = useState('book'); // 'book' | 'quote'
  
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

  // Fungsi pencarian ke Google Books
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

  // Debounce otomatis saat mengetik judul
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

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    onAddQuote({
      quote: quoteText.trim(),
      author: quoteAuthor.trim() || 'Anonim',
    });

    setQuoteText('');
    setQuoteAuthor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-6 max-w-md w-full border border-white/80 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header Tab */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#EAF2ED] p-1 rounded-2xl">
            <button
              onClick={() => setTab('book')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'book' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
              }`}
            >
              <BookOpen size={13} />
              <span>Buku</span>
            </button>
            <button
              onClick={() => setTab('quote')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'quote' ? 'bg-[#204E38] text-white shadow-sm' : 'text-[#6C8476]'
              }`}
            >
              <QuoteIcon size={13} />
              <span>Kutipan</span>
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        {tab === 'book' ? (
          <form onSubmit={handleSubmitBook} className="space-y-3.5 relative">
            
            {/* Input Judul dengan Pencarian Google Books */}
            <div className="space-y-1 relative">
              <label className="text-[11px] font-bold text-[#4A6455] flex items-center justify-between">
                <span>Judul Buku</span>
                {searching && (
                  <span className="text-[10px] text-[#204E38] flex items-center gap-1 font-semibold">
                    <Loader2 size={10} className="animate-spin" /> Mencari data buku...
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2 bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF]">
                <Search size={14} className="text-[#8FA597]" />
                <input
                  type="text"
                  placeholder="Ketik judul buku (cth: The Brothers Karamazov)..."
                  className="bg-transparent text-xs font-medium w-full outline-none text-[#13231B]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Dropdown Hasil Pencarian Otomatis */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white mt-1.5 rounded-2xl shadow-2xl border border-[#DCE5DF] overflow-hidden">
                  <div className="px-3 py-2 bg-[#F4F8F5] border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles size={11} className="text-[#204E38]" />
                      <span className="text-[10px] font-bold text-[#4A6455]">Pilih untuk Isi Otomatis</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowDropdown(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectBook(item)}
                        className="flex items-center gap-3 p-2.5 hover:bg-[#EAF2ED] cursor-pointer transition-colors"
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
                          <p className="text-[10px] text-[#7C9486] truncate">
                            {item.author} {item.pageCount ? `• ${item.pageCount} Hal` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Penulis */}
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

            {/* Input Halaman */}
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

            {/* URL Cover */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">URL Cover (Terisi Otomatis / Manual)</label>
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
              className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 mt-2"
            >
              Simpan Buku
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitQuote} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Kutipan / Catatan</label>
              <textarea
                rows="4"
                placeholder="Tulis kutipan favorit atau catatan penting..."
                className="bg-[#F4F8F5] p-3.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B] resize-none"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#4A6455]">Penulis / Sumber</label>
              <input
                type="text"
                placeholder="Nama penulis atau judul buku..."
                className="bg-[#F4F8F5] px-3.5 py-2.5 rounded-2xl border border-[#DCE5DF] text-xs font-medium w-full outline-none text-[#13231B]"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 mt-2"
            >
              Simpan Kutipan
            </button>
          </form>
        )}

      </div>
    </div>
  );
}