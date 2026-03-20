import React, { useState, useRef } from 'react';
import { Plus, Edit3, Trash2, MoreVertical, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, NoteColumn } from '@/services/api/noteApi';
import NoteCard from './NoteCard';

interface KanbanColumnProps {
  column: NoteColumn;
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onDragStart: (e: React.DragEvent, noteId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex?: number) => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  isDragOver: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column, notes, onAddNote, onEditNote, onDeleteNote,
  onDragStart, onDragOver, onDrop, onEditColumn, onDeleteColumn, isDragOver
}) => {
  const [showColMenu, setShowColMenu] = useState(false);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  const sortedNotes = [...notes].sort((a, b) => a.order - b.order);

  const handleNoteDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(e);
    setDropIndicatorIndex(index);
  };

  const handleBottomDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);
    setDropIndicatorIndex(sortedNotes.length);
  };

  const handleNoteDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicatorIndex(null);
    onDrop(e, index);
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropIndicatorIndex(null);
    onDrop(e, sortedNotes.length);
  };

  const handleDragLeave = () => {
    setDropIndicatorIndex(null);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={handleColumnDrop}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex-shrink-0 w-[280px] sm:w-[310px] lg:w-[320px] rounded-2xl backdrop-blur-2xl border transition-all duration-300 flex flex-col max-h-[70vh]",
        isDragOver
          ? "border-cyan-400/60 bg-cyan-50/30 dark:bg-cyan-900/10 shadow-xl shadow-cyan-500/10 scale-[1.02]"
          : "border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-lg"
      )}
    >
      {/* Column Header */}
      <div className="p-3 sm:p-4 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full shadow-lg ring-2 ring-white/50" style={{ backgroundColor: column.color }} />
            <h3 className="font-bold text-sm text-gray-800 dark:text-white">{column.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-300 shadow-sm">
              {notes.length}
            </span>
          </div>
          <div className="relative flex items-center gap-1">
            <button onClick={onAddNote} className="p-1.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors active:scale-90">
              <Plus className="h-4 w-4 text-gray-500" />
            </button>
            <button onClick={() => setShowColMenu(!showColMenu)} className="p-1.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors active:scale-90">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            {showColMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-gray-200/80 dark:border-gray-700 py-1.5 min-w-[160px] animate-in fade-in-0 zoom-in-95">
                <button onClick={() => { onEditColumn(); setShowColMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20 text-gray-700 dark:text-gray-200">
                  <Edit3 className="h-4 w-4 text-cyan-500" /> Modifier
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
                <button onClick={() => { onDeleteColumn(); setShowColMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 text-red-600">
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-0 custom-scrollbar">
        {sortedNotes.map((note, index) => (
          <div key={note.id}>
            {/* Drop indicator line */}
            {dropIndicatorIndex === index && (
              <div className="h-1 bg-cyan-400 rounded-full mx-2 my-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
            )}
            <div
              onDragOver={(e) => handleNoteDragOver(e, index)}
              onDrop={(e) => handleNoteDrop(e, index)}
              className="mb-2.5"
            >
              <div className="flex items-start gap-1.5">
                <span className="mt-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 w-4 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <NoteCard
                    note={note}
                    onEdit={() => onEditNote(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onDragStart={(e) => onDragStart(e, note.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Drop indicator at bottom */}
        {dropIndicatorIndex === sortedNotes.length && sortedNotes.length > 0 && (
          <div className="h-1 bg-cyan-400 rounded-full mx-2 my-1 shadow-lg shadow-cyan-400/50 animate-pulse" />
        )}
        {/* Bottom drop zone */}
        <div
          onDragOver={handleBottomDragOver}
          onDrop={(e) => handleNoteDrop(e, sortedNotes.length)}
          className="min-h-[20px]"
        />
        {sortedNotes.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
            <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Glissez une note ici</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
