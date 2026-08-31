import React from 'react';
import { Check, BookOpen, Trash2 } from 'lucide-react';

export default function BookCard({ book, onToggleStatus, onDelete }) {
  const isFinished = book.status === 'finished';

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-emerald-900/5 flex gap-4 transition-all hover:shadow-md">
      <div className="w-20 h-28 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-inner">
        <img
          src={book.coverUrl || 'https://via.placeholder.com/150x225?text=No+Cover'}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-forest-900 text-sm md:text-base leading-tight">
              {book.title}
            </h3>
            <button
              onClick={() => onDelete(book.id)}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">{book.author}</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isFinished
                ? 'bg-emerald-100 text-forest-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isFinished ? 'Selesai Dibaca' : 'Sedang Dibaca'}
          </span>

          <button
            onClick={() => onToggleStatus(book)}
            className="text-xs flex items-center gap-1 font-semibold text-forest-700 hover:text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg transition-colors border border-forest-100"
          >
            {isFinished ? <BookOpen size={12} /> : <Check size={12} />}
            <span>{isFinished ? 'Baca Lagi' : 'Selesai'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}