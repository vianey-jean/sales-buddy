import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { StickyNote, Lock, Eye } from 'lucide-react';
import { getBaseURL } from '@/services/api/api';
import { getDrawingUrl } from '@/services/api/noteApi';

interface SharedNote {
  title: string;
  content: string;
  columnId: string;
  order: number;
  color: string;
  bold: boolean;
  boldLines: number[];
  underlineLines: number[];
  drawing: string | null;
  voiceText: string;
  createdAt: string;
}

interface SharedColumn {
  id: string;
  title: string;
  color: string;
  order: number;
}

const SharedNotesPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [columns, setColumns] = useState<SharedColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchShared = async () => {
      try {
        const base = getBaseURL();
        const res = await fetch(`${base}/api/notes-share/view/${token}`);
        if (!res.ok) throw new Error('Invalid');
        const data = await res.json();
        setNotes(data.notes);
        setColumns(data.columns);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (!token) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md">
          <Lock className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Lien invalide</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Ce lien de partage est invalide ou a été révoqué.</p>
        </div>
      </div>
    );
  }

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/30 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <StickyNote className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 dark:text-white">Notes partagées</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Lecture seule
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {notes.length} notes
          </span>
        </div>
      </div>

      {/* Kanban read-only */}
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {sortedColumns.map((col) => {
              const colNotes = notes.filter(n => n.columnId === col.id).sort((a, b) => a.order - b.order);
              return (
                <div key={col.id} className="flex-shrink-0 w-[300px] rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                  {/* Column header */}
                  <div className="p-4 border-b border-gray-200/40 dark:border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: col.color }} />
                      <h3 className="font-bold text-sm text-gray-800 dark:text-white">{col.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                        {colNotes.length}
                      </span>
                    </div>
                  </div>
                  {/* Notes */}
                  <div className="p-3 space-y-2 max-h-[65vh] overflow-y-auto">
                    {colNotes.map((note, i) => (
                      <div key={i} className="p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/50 shadow-sm"
                        style={{ borderLeftColor: note.color, borderLeftWidth: '3px' }}
                      >
                        {note.title && (
                          <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">{note.title}</h4>
                        )}
                        {note.content && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                        )}
                        {note.drawing && (
                          <img src={getDrawingUrl(note.drawing) || ''} alt="Dessin" className="mt-2 rounded-lg max-h-32 w-full object-contain pointer-events-none" draggable={false} />
                        )}
                        {note.voiceText && (
                          <p className="mt-1 text-[10px] text-gray-400 italic">🎤 {note.voiceText}</p>
                        )}
                      </div>
                    ))}
                    {colNotes.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-6">Aucune note</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNotesPage;
