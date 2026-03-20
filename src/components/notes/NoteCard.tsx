import React, { useState } from 'react';
import { GripVertical, Edit3, Trash2, Mic, X, Eye, ArrowRight, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, NoteHistoryEntry, getDrawingUrl } from '@/services/api/noteApi';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const HISTORY_COLORS = [
  { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', border: 'border-pink-200 dark:border-pink-800' },
];

const formatShortDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatFullDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onDragStart }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'edit' | 'delete' | null>(null);

  const drawingUrl = getDrawingUrl(note.drawing);

  const handleConfirm = () => {
    if (confirmAction === 'edit') {
      onEdit();
    } else if (confirmAction === 'delete') {
      onDelete();
    }
    setConfirmAction(null);
    setShowDetail(false);
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => setShowDetail(true)}
        className="group relative rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
        style={{ backgroundColor: note.color === '#ffffff' ? 'rgba(255,255,255,0.9)' : note.color + 'e6' }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-70" />

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              <h4 className={cn("text-sm font-bold text-gray-900 dark:text-white truncate", note.bold && "text-base")}>
                {note.title || 'Sans titre'}
              </h4>
            </div>
            <Eye className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {note.content && (
            <div className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-4 leading-relaxed">
              {note.content.split('\n').map((line, i) => (
                <span key={i} className={cn(
                  note.boldLines?.includes(i) && 'font-bold',
                  note.underlineLines?.includes(i) && 'underline'
                )}>
                  {line}{i < note.content.split('\n').length - 1 && '\n'}
                </span>
              ))}
            </div>
          )}

          {note.voiceText && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-900/10 px-2 py-1 rounded-lg">
              <Mic className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{note.voiceText.substring(0, 60)}...</span>
            </div>
          )}

          {drawingUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-600/50">
              <img src={drawingUrl} alt="Dessin" className="w-full h-16 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}

          {/* Compact history trail on card */}
          {note.history && note.history.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1 flex-wrap">
              {note.history.map((h, i) => {
                const color = HISTORY_COLORS[i % HISTORY_COLORS.length];
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight className="h-2.5 w-2.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold", color.bg, color.text)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", color.dot)} />
                      {h.columnTitle}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <div className="mt-1.5 text-[10px] text-gray-400 font-medium">
            {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className={cn("text-lg font-bold text-gray-900 dark:text-white", note.bold && "text-xl font-black")}>
                {note.title || 'Sans titre'}
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {note.content && (
              <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                {note.content.split('\n').map((line, i) => (
                  <span key={i} className={cn(
                    note.boldLines?.includes(i) && 'font-bold',
                    note.underlineLines?.includes(i) && 'underline'
                  )}>
                    {line}{i < note.content.split('\n').length - 1 && '\n'}
                  </span>
                ))}
              </div>
            )}

            {note.voiceText && (
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Texte vocal</span>
                </div>
                <p className="text-sm text-violet-700 dark:text-violet-300">{note.voiceText}</p>
              </div>
            )}

            {drawingUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={drawingUrl} alt="Dessin" className="w-full h-48 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}

            {/* Full history timeline in detail */}
            {note.history && note.history.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-slate-50/80 dark:from-gray-800/40 dark:to-slate-800/40 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Parcours de la note</span>
                </div>
                <div className="relative pl-4">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-violet-400 rounded-full" />
                  <div className="space-y-3">
                    {note.history.map((h, i) => {
                      const color = HISTORY_COLORS[i % HISTORY_COLORS.length];
                      const isLast = i === note.history.length - 1;
                      return (
                        <div key={i} className="relative flex items-start gap-3">
                          {/* Dot */}
                          <div className={cn(
                            "absolute -left-4 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 shadow-md z-10",
                            color.dot,
                            isLast && "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-cyan-400/50 animate-pulse"
                          )} />
                          {/* Content */}
                          <div className={cn("flex-1 p-2.5 rounded-xl border", color.bg, color.border)}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={cn("text-xs font-bold", color.text)}>{h.columnTitle}</span>
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                <Clock className="h-2.5 w-2.5" />
                                {formatFullDate(h.movedAt)}
                              </div>
                            </div>
                            {i > 0 && (
                              <div className="mt-1 text-[10px] text-gray-400">
                                Après {Math.round((new Date(h.movedAt).getTime() - new Date(note.history[i - 1].movedAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s) en "{note.history[i - 1].columnTitle}"
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Créé le {new Date(note.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {note.updatedAt !== note.createdAt && (
                <> · Modifié le {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
              )}
            </div>

            {/* Confirm action overlay */}
            {confirmAction && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-3">
                  {confirmAction === 'delete' ? '⚠️ Confirmer la suppression de cette note ?' : '✏️ Confirmer la modification de cette note ?'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)} className="flex-1 rounded-xl">Annuler</Button>
                  <Button size="sm" onClick={handleConfirm}
                    className={cn("flex-1 rounded-xl text-white", confirmAction === 'delete' ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600")}>
                    Confirmer
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!confirmAction && (
              <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction('edit')}
                  className="flex-1 rounded-xl text-cyan-600 border-cyan-200 hover:bg-cyan-50 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction('delete')}
                  className="flex-1 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard;
