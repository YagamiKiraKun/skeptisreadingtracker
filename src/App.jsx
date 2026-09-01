import React, { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logoutUser 
} from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import AddModal from './components/AddModal';
import { 
  Search, 
  Trash2, 
  BookOpen, 
  Check, 
  Quote as QuoteIcon, 
  TrendingUp, 
  LogOut, 
  Edit2, 
  CheckCheck 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Target Bulanan
  const [monthlyTarget, setMonthlyTarget] = useState(5);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(5);

  // 1. Pantau Status Login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Data Buku, Quotes, dan Setting Target User secara Realtime
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setQuotes([]);
      return;
    }

    // Ambil target bulanan tersimpan dari Firestore
    const userDocRef = doc(db, 'userSettings', user.uid);
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists() && docSnap.data().monthlyTarget) {
        setMonthlyTarget(docSnap.data().monthlyTarget);
        setTempTarget(docSnap.data().monthlyTarget);
      }
    }).catch((err) => console.error("Error reading target:", err));

    // Realtime Sync Buku
    const qBooks = query(collection(db, 'books'), where('userId', '==', user.uid));
    const unsubBooks = onSnapshot(qBooks, (snapshot) => {
      setBooks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching books:", error);
    });

    // Realtime Sync Quotes
    const qQuotes = query(collection(db, 'quotes'), where('userId', '==', user.uid));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching quotes:", error);
    });

    return () => {
      unsubBooks();
      unsubQuotes();
    };
  }, [user]);

  // Simpan Target Bulanan
  const handleSaveTarget = async () => {
    const targetNum = parseInt(tempTarget, 10);
    if (isNaN(targetNum) || targetNum <= 0) return;
    
    setMonthlyTarget(targetNum);
    setIsEditingTarget(false);

    if (user) {
      try {
        await setDoc(doc(db, 'userSettings', user.uid), { monthlyTarget: targetNum }, { merge: true });
      } catch (err) {
        console.error('Gagal menyimpan target:', err);
      }
    }
  };

  // Tambah Buku ke Firestore
  const handleAddBook = async (bookData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'books'), {
        ...bookData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saat menyimpan buku:', err);
      alert('Gagal simpan ke database: ' + err.message);
    }
  };

  // Tambah Quote ke Firestore
  const handleAddQuote = async (quoteData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'quotes'), {
        ...quoteData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saat menyimpan quote:', err);
      alert('Gagal simpan quote: ' + err.message);
    }
  };

  // Ubah Status Baca
  const handleToggleStatus = async (book) => {
    try {
      const newStatus = book.status === 'reading' ? 'finished' : 'reading';
      await updateDoc(doc(db, 'books', book.id), { status: newStatus });
    } catch (err) {
      console.error('Gagal update status buku:', err);
    }
  };

  // Hapus Buku
  const handleDeleteBook = async (id) => {
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (err) {
      console.error('Gagal hapus buku:', err);
    }
  };

  // Hapus Quote
  const handleDeleteQuote = async (id) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (err) {
      console.error('Gagal hapus quote:', err);
    }
  };

  // Filter Buku
  const filteredBooks = books.filter((b) => {
    const matchesSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'reading') return matchesSearch && b.status === 'reading';
    if (activeTab === 'finished') return matchesSearch && b.status === 'finished';
    return matchesSearch;
  });

  const ongoingBooks = books.filter((b) => b.status === 'reading');
  const finishedBooks = books.filter((b) => b.status === 'finished');
  
  // Persentase Progress
  const completionPercentage = monthlyTarget > 0 
    ? Math.min(Math.round((finishedBooks.length / monthlyTarget) * 100), 100) 
    : 0;

  if (loadingAuth) return null;

  // Layar Login
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#E9EFEA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-[0_20px_60px_rgba(20,45,30,0.08)] border border-white text-center space-y-6">
          <div className="w-16 h-16 bg-[#204E38] text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-[#204E38]/20">
            <BookOpen size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#13231B] tracking-tight">SkeptisReads</h1>
            <p className="text-xs text-[#6C8476] mt-2 leading-relaxed">
              Minor Notes & personal reading tracker minimalis.
            </p>
          </div>
          <button
            onClick={loginWithGoogle}
            className="w-full py-3.5 px-4 bg-[#204E38] hover:bg-[#153425] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-lg shadow-[#204E38]/20 transition-all active:scale-95"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#E9EFEA] p-3 md:p-6 lg:p-8 flex justify-center items-stretch pb-24 lg:pb-8">
      <div className="w-full max-w-[1400px] flex gap-6">
        
        {/* Sidebar Kiri */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={logoutUser}
          totalFinished={finishedBooks.length}
        />

        {/* Konten Tengah */}
        <main className="flex-1 flex flex-col gap-5 overflow-hidden">
          
          {/* Top Bar Header */}
          <header className="flex items-center justify-between gap-3 bg-white/70 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-[24px] md:rounded-[28px] border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)]">
            <div className="flex-1 flex items-center gap-2.5 bg-[#F4F8F5] px-3.5 py-2 md:px-4 md:py-2.5 rounded-2xl border border-[#DCE5DF] max-w-md">
              <Search size={16} className="text-[#8FA597]" />
              <input
                type="text"
                placeholder="Cari buku atau penulis..."
                className="bg-transparent text-xs font-medium w-full outline-none text-[#13231B] placeholder:text-[#8FA597]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <img
                src={user.photoURL || 'https://via.placeholder.com/80'}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-9 h-9 md:w-10 md:h-10 rounded-2xl object-cover border border-white shadow-sm"
              />
              <button
                onClick={logoutUser}
                title="Keluar"
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Hero Banner Pastel Minimalis (Gaya image_0f2b4f) */}
          <div className="bg-gradient-to-r from-[#A1B8A8] to-[#86A789] text-white p-5 md:p-6 rounded-[28px] md:rounded-[32px] shadow-[0_10px_25px_rgba(45,75,55,0.06)] flex justify-between items-center relative overflow-hidden">
            <div className="space-y-1 z-10">
              <p className="text-[11px] md:text-xs font-semibold text-[#EBF2ED] tracking-wide">
                Hello {user.displayName ? user.displayName.split(' ')[0] : 'Reader'},
              </p>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Continue Reading!
              </h1>
              <p className="text-[11px] text-[#D8E6DC] font-medium">
                {ongoingBooks.length} buku sedang aktif dalam track bacaanmu.
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-3.5 py-2.5 md:px-4 md:py-3 rounded-2xl border border-white/30 text-center min-w-[75px] md:min-w-[90px] z-10">
              <p className="text-[10px] font-bold text-[#EBF2ED] uppercase tracking-wider">Koleksi</p>
              <p className="text-xl md:text-2xl font-black text-white mt-0.5">{books.length}</p>
            </div>
          </div>

          {/* Konten Grid */}
          {activeTab !== 'quotes' ? (
            <div className="space-y-5 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-extrabold text-sm text-[#13231B] tracking-tight">
                    {activeTab === 'all' ? 'Popular / Semua Koleksi' : 'Koleksi Terpilih'}
                  </h3>
                  <span className="text-xs font-bold text-[#6C8476]">{filteredBooks.length} Buku</span>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-[28px] p-8 text-center border border-white">
                    <p className="text-xs font-semibold text-[#6C8476]">Tidak ada buku yang sesuai.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
                    {filteredBooks.map((book) => {
                      const isFinished = book.status === 'finished';
                      return (
                        <div
                          key={book.id}
                          className="bg-white rounded-[22px] md:rounded-[24px] p-3 md:p-3.5 border border-white/80 shadow-[0_8px_25px_rgba(20,45,30,0.04)] flex flex-col justify-between group hover:shadow-md transition-all"
                        >
                          <div className="w-full aspect-[4/5] bg-[#E6EFE9] rounded-[16px] overflow-hidden relative mb-2.5 shadow-inner flex items-center justify-center p-2">
                            <img
                              src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                              alt={book.title}
                              className="h-full w-auto object-cover rounded-md shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            <button
                              onClick={() => handleToggleStatus(book)}
                              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
                                isFinished ? 'bg-[#204E38] text-white' : 'bg-white/80 text-[#6C8476] hover:bg-white'
                              }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="font-bold text-xs text-[#13231B] line-clamp-1 leading-snug">{book.title}</h4>
                            <p className="text-[11px] font-medium text-[#7C9486] line-clamp-1">{book.author}</p>
                          </div>

                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isFinished ? 'bg-[#E3EFE6] text-[#204E38]' : 'bg-[#FFF6E5] text-[#A67519]'
                            }`}>
                              {isFinished ? 'Selesai' : 'Ongoing'}
                            </span>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-sm text-[#13231B] tracking-tight">Kutipan</h3>
                <span className="text-xs font-bold text-[#6C8476]">{quotes.length} Quotes</span>
              </div>

              {quotes.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-[28px] p-8 text-center border border-white">
                  <p className="text-xs font-semibold text-[#6C8476]">Belum ada kutipan yang disimpan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotes.map((q) => (
                    <div key={q.id} className="bg-white rounded-[24px] p-5 border border-white/80 shadow-[0_8px_25px_rgba(20,45,30,0.04)] flex flex-col justify-between">
                      <div>
                        <QuoteIcon size={20} className="text-[#204E38]/30 mb-2" />
                        <p className="text-xs italic text-[#25392D] font-medium leading-relaxed">"{q.quote}"</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-[#204E38]">— {q.author}</span>
                        <button
                          onClick={() => handleDeleteQuote(q.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Panel Kanan - Reading Goals Interaktif */}
        <aside className="hidden xl:flex flex-col w-72 space-y-6 flex-shrink-0">
          
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-[#13231B]">Reading Goals</h3>
              <div className="flex items-center gap-1">
                <TrendingUp size={15} className="text-[#204E38]" />
              </div>
            </div>

            {/* Input Edit Target Bulan Ini */}
            <div className="flex items-center justify-between text-xs font-bold text-[#4A6455] pt-1">
              <span>Target Bulan Ini:</span>
              {isEditingTarget ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    className="w-12 px-2 py-0.5 rounded-lg border border-[#204E38] text-center text-xs font-bold bg-white outline-none"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="p-1 bg-[#204E38] text-white rounded-md hover:bg-[#153425]"
                    title="Simpan"
                  >
                    <CheckCheck size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTarget(true)}
                  className="flex items-center gap-1 text-[#204E38] bg-[#EAF2ED] px-2 py-0.5 rounded-md hover:bg-[#DBE8DF] transition-all"
                  title="Klik untuk ubah target"
                >
                  <span>{monthlyTarget} Buku</span>
                  <Edit2 size={11} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#4A6455]">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#E5EDE7] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#204E38] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#6C8476] leading-relaxed border-t border-slate-100">
              <span className="font-bold text-[#13231B]">{finishedBooks.length}</span> dari {monthlyTarget} buku target bulan ini selesai dibaca.
            </div>
          </div>

          {/* Ongoing Book Quick List */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] flex-1 space-y-4">
            <h3 className="font-extrabold text-xs text-[#13231B]">Sedang Dibaca</h3>
            
            {ongoingBooks.length === 0 ? (
              <p className="text-[11px] text-[#8FA597]">Tidak ada buku yang sedang dibaca.</p>
            ) : (
              <div className="space-y-3">
                {ongoingBooks.slice(0, 4).map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all">
                    <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img src={b.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-[#13231B] truncate">{b.title}</h5>
                      <p className="text-[10px] text-[#7C9486] truncate">{b.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* Floating Navbar Khusus Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsModalOpen(true)}
      />

      {/* Modal Form Tambah Data */}
      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBook={handleAddBook}
        onAddQuote={handleAddQuote}
      />
    </div>
  );
}