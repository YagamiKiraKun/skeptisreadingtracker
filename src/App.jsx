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
import EditBookModal from './components/EditBookModal';
import EditQuoteModal from './components/EditQuoteModal';
import BookDetailModal from './components/BookDetailModal';
import ShareModal from './components/ShareModal';
import MonthlyRecapModal from './components/MonthlyRecapModal';
import ReadingHeatmap from './components/ReadingHeatmap';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { 
  Search, 
  Plus, 
  Trash2, 
  BookOpen, 
  Check, 
  Quote as QuoteIcon, 
  LogOut, 
  Edit2, 
  CheckCheck, 
  Share2, 
  Sparkles, 
  Edit3 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State Modal Detail & Edit
  const [selectedBookForDetail, setSelectedBookForDetail] = useState(null);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [quoteToEdit, setQuoteToEdit] = useState(null);

  // State Konfirmasi Hapus
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: 'book', // 'book' | 'quote'
    id: null,
    title: '',
    message: ''
  });

  // State Share Modal
  const [shareData, setShareData] = useState(null);
  const [shareType, setShareType] = useState('book');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);

  // State Target (Monthly vs Annually)
  const [targetType, setTargetType] = useState('monthly');
  const [monthlyTarget, setMonthlyTarget] = useState(5);
  const [annualTarget, setAnnualTarget] = useState(30);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(5);

  // State Edit Halaman Cepat
  const [editingBookId, setEditingBookId] = useState(null);
  const [editCurrentPage, setEditCurrentPage] = useState('');
  const [editTotalPages, setEditTotalPages] = useState('');

  // 1. Pantau Status Login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Data Realtime
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setQuotes([]);
      return;
    }

    const userDocRef = doc(db, 'userSettings', user.uid);
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.monthlyTarget) setMonthlyTarget(data.monthlyTarget);
        if (data.annualTarget) setAnnualTarget(data.annualTarget);
        if (data.targetType) setTargetType(data.targetType);
        setTempTarget(data.targetType === 'annually' ? (data.annualTarget || 30) : (data.monthlyTarget || 5));
      }
    }).catch((err) => console.error("Error reading target:", err));

    const qBooks = query(collection(db, 'books'), where('userId', '==', user.uid));
    const unsubBooks = onSnapshot(qBooks, (snapshot) => {
      setBooks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Error fetching books:", error));

    const qQuotes = query(collection(db, 'quotes'), where('userId', '==', user.uid));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("Error fetching quotes:", error));

    return () => {
      unsubBooks();
      unsubQuotes();
    };
  }, [user]);

  const handleSaveTarget = async () => {
    const targetNum = parseInt(tempTarget, 10);
    if (isNaN(targetNum) || targetNum <= 0) return;
    
    const updateObj = { targetType };
    if (targetType === 'monthly') {
      setMonthlyTarget(targetNum);
      updateObj.monthlyTarget = targetNum;
    } else {
      setAnnualTarget(targetNum);
      updateObj.annualTarget = targetNum;
    }
    setIsEditingTarget(false);

    if (user) {
      try {
        await setDoc(doc(db, 'userSettings', user.uid), updateObj, { merge: true });
      } catch (err) {
        console.error('Gagal menyimpan target:', err);
      }
    }
  };

  const handleToggleTargetType = async (type) => {
    setTargetType(type);
    setTempTarget(type === 'monthly' ? monthlyTarget : annualTarget);
    setIsEditingTarget(false);
    if (user) {
      try {
        await setDoc(doc(db, 'userSettings', user.uid), { targetType: type }, { merge: true });
      } catch (err) {
        console.error('Gagal update tipe target:', err);
      }
    }
  };

  const handleAddBook = async (bookData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'books'), {
        ...bookData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      alert('Gagal simpan ke database: ' + err.message);
    }
  };

  const handleUpdateBookData = async (bookId, updatedFields) => {
    try {
      await updateDoc(doc(db, 'books', bookId), updatedFields);
      if (selectedBookForDetail && selectedBookForDetail.id === bookId) {
        setSelectedBookForDetail((prev) => ({ ...prev, ...updatedFields }));
      }
    } catch (err) {
      console.error('Gagal update data buku:', err);
    }
  };

  const handleAddQuote = async (quoteData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'quotes'), {
        ...quoteData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      alert('Gagal simpan quote: ' + err.message);
    }
  };

  const handleUpdateQuoteData = async (quoteId, updatedFields) => {
    try {
      await updateDoc(doc(db, 'quotes', quoteId), updatedFields);
    } catch (err) {
      console.error('Gagal update quote:', err);
    }
  };

  const handleToggleStatus = async (book) => {
    try {
      const newStatus = book.status === 'reading' ? 'finished' : 'reading';
      const todayStr = new Date().toISOString().split('T')[0];
      const dates = book.activityDates ? [...new Set([...book.activityDates, todayStr])] : [todayStr];
      const updatedFields = { 
        status: newStatus,
        activityDates: dates,
        currentPage: newStatus === 'finished' && book.totalPages ? book.totalPages : (book.currentPage || 0),
      };
      await updateDoc(doc(db, 'books', book.id), updatedFields);
      if (selectedBookForDetail && selectedBookForDetail.id === book.id) {
        setSelectedBookForDetail((prev) => ({ ...prev, ...updatedFields }));
      }
    } catch (err) {
      console.error('Gagal update status buku:', err);
    }
  };

  const handleSavePageProgress = async (book) => {
    const curP = parseInt(editCurrentPage, 10) || 0;
    const totP = parseInt(editTotalPages, 10) || (book.totalPages || 0);
    const todayStr = new Date().toISOString().split('T')[0];
    const dates = book.activityDates ? [...new Set([...book.activityDates, todayStr])] : [todayStr];
    
    const isNowFinished = totP > 0 && curP >= totP;
    const updatedFields = {
      currentPage: curP,
      totalPages: totP,
      status: isNowFinished ? 'finished' : book.status,
      activityDates: dates,
    };

    try {
      await updateDoc(doc(db, 'books', book.id), updatedFields);
      setEditingBookId(null);
      if (selectedBookForDetail && selectedBookForDetail.id === book.id) {
        setSelectedBookForDetail((prev) => ({ ...prev, ...updatedFields }));
      }
    } catch (err) {
      console.error('Gagal update progress halaman:', err);
    }
  };

  // Trigger modal konfirmasi hapus buku
  const promptDeleteBook = (book) => {
    setDeleteDialog({
      isOpen: true,
      type: 'book',
      id: book.id,
      title: 'Hapus Buku',
      message: `Apakah kamu yakin ingin menghapus "${book.title}" dari koleksimu? Semua data terkait buku ini akan dihapus.`
    });
  };

  // Trigger modal konfirmasi hapus quote
  const promptDeleteQuote = (quote) => {
    setDeleteDialog({
      isOpen: true,
      type: 'quote',
      id: quote.id,
      title: 'Hapus Kutipan',
      message: `Apakah kamu yakin ingin menghapus kutipan ini?`
    });
  };

  // Eksekusi hapus setelah disetujui di modal
  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      if (deleteDialog.type === 'book') {
        await deleteDoc(doc(db, 'books', deleteDialog.id));
        if (selectedBookForDetail?.id === deleteDialog.id) {
          setSelectedBookForDetail(null);
        }
      } else {
        await deleteDoc(doc(db, 'quotes', deleteDialog.id));
      }
    } catch (err) {
      console.error('Gagal menghapus data:', err);
    }
  };

  const handleOpenShare = (data, type) => {
    setShareData(data);
    setShareType(type);
    setIsShareModalOpen(true);
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'reading') return matchesSearch && b.status === 'reading';
    if (activeTab === 'finished') return matchesSearch && b.status === 'finished';
    return matchesSearch;
  });

  const ongoingBooks = books.filter((b) => b.status === 'reading');
  const finishedBooks = books.filter((b) => b.status === 'finished');

  const currentTarget = targetType === 'monthly' ? monthlyTarget : annualTarget;
  const completionPercentage = currentTarget > 0 
    ? Math.min(Math.round((finishedBooks.length / currentTarget) * 100), 100) 
    : 0;

  if (loadingAuth) return null;

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#E9EFEA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-[0_20px_60px_rgba(20,45,30,0.08)] border border-white text-center space-y-6">
          <div className="w-16 h-16 bg-[#204E38] text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-[#204E38]/20">
            <BookOpen size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#13231B] tracking-tight">Minor Notes</h1>
            <p className="text-xs text-[#6C8476] mt-2 leading-relaxed">oleh Skeptis Minor</p>
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

        {/* Konten Utama */}
        <main className="flex-1 flex flex-col gap-4 md:gap-5 overflow-hidden">
          
          {/* Header */}
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

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#204E38] hover:bg-[#153425] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#204E38]/20 transition-all active:scale-95"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Tambah Data</span>
              </button>

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
            </div>
          </header>

          {/* Hero Banner */}
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

          {/* Reading Goals Card Mobile */}
          <div className="block xl:hidden bg-white/80 backdrop-blur-md rounded-[24px] p-4 border border-white/80 shadow-[0_4px_20px_rgba(20,45,30,0.03)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#EAF2ED] p-0.5 rounded-xl">
                <button
                  onClick={() => handleToggleTargetType('monthly')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                    targetType === 'monthly' ? 'bg-[#204E38] text-white' : 'text-[#6C8476]'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => handleToggleTargetType('annually')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                    targetType === 'annually' ? 'bg-[#204E38] text-white' : 'text-[#6C8476]'
                  }`}
                >
                  Tahunan
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {finishedBooks.length > 0 && (
                  <button
                    onClick={() => setIsRecapModalOpen(true)}
                    className="flex items-center gap-1 text-[#204E38] bg-[#EAF2ED] hover:bg-[#DBE8DF] px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all"
                  >
                    <Sparkles size={11} />
                    <span>Rekap</span>
                  </button>
                )}

                {isEditingTarget ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      className="w-11 px-1.5 py-0.5 rounded-lg border border-[#204E38] text-center text-xs font-bold bg-white outline-none"
                      value={tempTarget}
                      onChange={(e) => setTempTarget(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleSaveTarget} className="p-1 bg-[#204E38] text-white rounded-md">
                      <CheckCheck size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempTarget(currentTarget.toString());
                      setIsEditingTarget(true);
                    }}
                    className="flex items-center gap-1 text-[#204E38] bg-[#EAF2ED] px-2 py-0.5 rounded-md text-[10.5px] font-bold"
                  >
                    <span>Target: {currentTarget}</span>
                    <Edit2 size={9} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[#4A6455]">
                <span>{finishedBooks.length} dari {currentTarget} buku ({targetType === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'})</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#E5EDE7] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#204E38] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Konten Grid Koleksi Buku */}
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
                      const curP = book.currentPage || 0;
                      const totP = book.totalPages || 0;
                      const progressPct = totP > 0 ? Math.min(Math.round((curP / totP) * 100), 100) : 0;
                      const isEditingThisBook = editingBookId === book.id;

                      return (
                        <div
                          key={book.id}
                          className="bg-white rounded-[22px] md:rounded-[24px] p-3 md:p-3.5 border border-white/80 shadow-[0_8px_25px_rgba(20,45,30,0.04)] flex flex-col justify-between group hover:shadow-md transition-all"
                        >
                          {/* Cover */}
                          <div 
                            onClick={() => setSelectedBookForDetail(book)}
                            className="w-full aspect-[4/5] bg-[#E6EFE9] rounded-[16px] overflow-hidden relative mb-2.5 shadow-inner flex items-center justify-center p-2 cursor-pointer"
                          >
                            <img
                              src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
                              alt={book.title}
                              crossOrigin="anonymous"
                              className="h-full w-auto object-cover rounded-md shadow-md group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(book);
                              }}
                              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
                                isFinished ? 'bg-[#204E38] text-white' : 'bg-white/80 text-[#6C8476] hover:bg-white'
                              }`}
                              title={isFinished ? 'Tandai sedang dibaca' : 'Tandai selesai'}
                            >
                              <Check size={12} strokeWidth={3} />
                            </button>
                          </div>

                          {/* Info Buku & Progres Halaman */}
                          <div className="space-y-1.5">
                            <div 
                              onClick={() => setSelectedBookForDetail(book)}
                              className="space-y-0.5 cursor-pointer"
                            >
                              <h4 className="font-bold text-xs text-[#13231B] line-clamp-1 leading-snug hover:text-[#204E38] transition-colors">
                                {book.title}
                              </h4>
                              <p className="text-[11px] font-medium text-[#7C9486] line-clamp-1">{book.author}</p>
                            </div>

                            {/* Section Progress Tracker */}
                            <div className="pt-1">
                              {isEditingThisBook ? (
                                <div className="p-2 bg-[#F4F8F5] rounded-xl border border-[#DCE5DF] space-y-1.5">
                                  <div className="flex items-center gap-1 text-[10px]">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Hal"
                                      className="w-12 px-1.5 py-0.5 rounded border border-[#204E38] text-center font-bold bg-white outline-none"
                                      value={editCurrentPage}
                                      onChange={(e) => setEditCurrentPage(e.target.value)}
                                      autoFocus
                                    />
                                    <span className="text-slate-400">/</span>
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Total"
                                      className="w-12 px-1.5 py-0.5 rounded border border-slate-300 text-center font-bold bg-white outline-none"
                                      value={editTotalPages}
                                      onChange={(e) => setEditTotalPages(e.target.value)}
                                    />
                                    <button
                                      onClick={() => handleSavePageProgress(book)}
                                      className="p-1 bg-[#204E38] text-white rounded ml-auto hover:bg-[#153425]"
                                      title="Simpan"
                                    >
                                      <CheckCheck size={11} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#6C8476]">
                                    {totP > 0 ? (
                                      <button
                                        onClick={() => {
                                          setEditingBookId(book.id);
                                          setEditCurrentPage(curP.toString());
                                          setEditTotalPages(totP.toString());
                                        }}
                                        className="hover:underline flex items-center gap-1 text-[#204E38]"
                                        title="Klik untuk ubah halaman"
                                      >
                                        <span>Hal {curP}/{totP}</span>
                                        <Edit2 size={9} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingBookId(book.id);
                                          setEditCurrentPage(curP.toString());
                                          setEditTotalPages('');
                                        }}
                                        className="text-[10px] text-[#204E38] hover:underline flex items-center gap-0.5"
                                      >
                                        <span>+ Set Halaman</span>
                                      </button>
                                    )}
                                    {totP > 0 && <span className="font-bold text-[#204E38]">{progressPct}%</span>}
                                  </div>

                                  {totP > 0 && (
                                    <div className="w-full bg-[#E5EDE7] h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-[#204E38] h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progressPct}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Action */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isFinished ? 'bg-[#E3EFE6] text-[#204E38]' : 'bg-[#FFF6E5] text-[#A67519]'
                            }`}>
                              {isFinished ? 'Selesai' : 'Ongoing'}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setBookToEdit(book)}
                                title="Edit Buku"
                                className="text-slate-400 hover:text-[#204E38] p-1 transition-colors"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenShare(book, 'book')}
                                title="Bagikan"
                                className="text-slate-400 hover:text-[#204E38] p-1 transition-colors"
                              >
                                <Share2 size={13} />
                              </button>
                              <button
                                onClick={() => promptDeleteBook(book)}
                                className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab Kutipan & Catatan */
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-sm text-[#13231B] tracking-tight">Kutipan & Catatan</h3>
                <span className="text-xs font-bold text-[#6C8476]">{quotes.length} Quotes</span>
              </div>

              {quotes.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-sm rounded-[28px] p-8 text-center border border-white">
                  <p className="text-xs font-semibold text-[#6C8476]">Belum ada kutipan yang disimpan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotes.map((q) => (
                    <div key={q.id} className="bg-white rounded-[24px] p-5 border border-white/80 shadow-[0_8px_25px_rgba(20,45,30,0.04)] flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <QuoteIcon size={18} className="text-[#204E38]/30" />
                          {q.pageNumber && (
                            <span className="text-[10px] font-bold bg-[#EAF2ED] text-[#204E38] px-2 py-0.5 rounded-md">
                              Hal. {q.pageNumber}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs italic text-[#25392D] font-medium leading-relaxed">
                          "{q.quote}"
                        </p>

                        {/* Catatan / Refleksi Pribadi */}
                        {q.personalNote && (
                          <div className="bg-[#F4F8F5] p-2.5 rounded-xl border-l-2 border-[#204E38] text-[11px] text-[#3A5043] leading-relaxed">
                            <span className="font-bold text-[#204E38] block text-[10px] mb-0.5">Catatan:</span>
                            {q.personalNote}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[11px] font-bold text-[#204E38] block">— {q.author}</span>
                          {q.bookTitle && (
                            <span className="text-[10px] text-[#7C9486] font-medium block">
                              di: {q.bookTitle}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQuoteToEdit(q)}
                            title="Edit Kutipan"
                            className="text-slate-400 hover:text-[#204E38] p-1 transition-colors"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenShare(q, 'quote')}
                            title="Bagikan"
                            className="text-slate-400 hover:text-[#204E38] p-1 transition-colors"
                          >
                            <Share2 size={13} />
                          </button>
                          <button
                            onClick={() => promptDeleteQuote(q)}
                            className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Panel Kanan (Desktop) */}
        <aside className="hidden xl:flex flex-col w-72 space-y-5 flex-shrink-0">
          
          {/* Target Card Desktop */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#EAF2ED] p-0.5 rounded-xl">
                <button
                  onClick={() => handleToggleTargetType('monthly')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                    targetType === 'monthly' ? 'bg-[#204E38] text-white' : 'text-[#6C8476]'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => handleToggleTargetType('annually')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                    targetType === 'annually' ? 'bg-[#204E38] text-white' : 'text-[#6C8476]'
                  }`}
                >
                  Tahunan
                </button>
              </div>
              
              {finishedBooks.length > 0 && (
                <button
                  onClick={() => setIsRecapModalOpen(true)}
                  className="flex items-center gap-1 text-[#204E38] bg-[#EAF2ED] hover:bg-[#DBE8DF] px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all active:scale-95"
                  title="Buat Rekap Bulanan"
                >
                  <Sparkles size={12} />
                  <span>Rekap</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#4A6455] pt-0.5">
              <span>Target {targetType === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'}:</span>
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
                  <button onClick={handleSaveTarget} className="p-1 bg-[#204E38] text-white rounded-md hover:bg-[#153425]">
                    <CheckCheck size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempTarget(currentTarget.toString());
                    setIsEditingTarget(true);
                  }}
                  className="flex items-center gap-1 text-[#204E38] bg-[#EAF2ED] px-2 py-0.5 rounded-md hover:bg-[#DBE8DF] transition-all"
                >
                  <span>{currentTarget} Buku</span>
                  <Edit2 size={11} />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-[#4A6455]">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#E5EDE7] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#204E38] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 text-[10.5px] text-[#6C8476] leading-relaxed border-t border-slate-100">
              <span className="font-bold text-[#13231B]">{finishedBooks.length}</span> dari {currentTarget} buku target selesai dibaca.
            </div>
          </div>

          <ReadingHeatmap books={books} />

          {/* Ongoing Book List */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-5 border border-white/60 shadow-[0_10px_30px_rgba(20,45,30,0.03)] flex-1 space-y-3">
            <h3 className="font-extrabold text-xs text-[#13231B]">Sedang Dibaca</h3>
            
            {ongoingBooks.length === 0 ? (
              <p className="text-[11px] text-[#8FA597]">Tidak ada buku yang sedang dibaca.</p>
            ) : (
              <div className="space-y-2.5">
                {ongoingBooks.slice(0, 3).map((b) => (
                  <div 
                    key={b.id} 
                    onClick={() => setSelectedBookForDetail(b)}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="w-9 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      <img src={b.coverUrl || 'https://via.placeholder.com/80x120?text=No+Cover'} alt={b.title} crossOrigin="anonymous" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-[#13231B] truncate">{b.title}</h5>
                      <p className="text-[10px] text-[#7C9486] truncate">
                        {b.totalPages ? `Hal ${b.currentPage || 0} / ${b.totalPages}` : b.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

      </div>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsModalOpen(true)}
      />

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddBook={handleAddBook}
        onAddQuote={handleAddQuote}
        books={books}
      />

      <EditBookModal
        isOpen={Boolean(bookToEdit)}
        onClose={() => setBookToEdit(null)}
        book={bookToEdit}
        onSave={handleUpdateBookData}
      />

      {/* Modal Edit Quote */}
      <EditQuoteModal
        isOpen={Boolean(quoteToEdit)}
        onClose={() => setQuoteToEdit(null)}
        quoteData={quoteToEdit}
        onSave={handleUpdateQuoteData}
        books={books}
      />

      <BookDetailModal
        isOpen={Boolean(selectedBookForDetail)}
        onClose={() => setSelectedBookForDetail(null)}
        book={selectedBookForDetail}
        quotes={quotes}
        onEditBook={(b) => setBookToEdit(b)}
        onDeleteBook={(bookId) => {
          const bookObj = books.find((b) => b.id === bookId);
          if (bookObj) promptDeleteBook(bookObj);
        }}
        onToggleStatus={handleToggleStatus}
        onAddQuoteToBook={handleAddQuote}
        onOpenShareQuote={(q) => handleOpenShare(q, 'quote')}
        onOpenShareBook={(b) => handleOpenShare(b, 'book')}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={shareData}
        type={shareType}
      />

      <MonthlyRecapModal
        isOpen={isRecapModalOpen}
        onClose={() => setIsRecapModalOpen(false)}
        finishedBooks={finishedBooks}
      />

      {/* Modal Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.title}
        message={deleteDialog.message}
      />
    </div>
  );
}