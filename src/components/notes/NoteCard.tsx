import React, { useState, useCallback, useRef } from 'react';
import { GripVertical, Edit3, Trash2, Mic, MicOff, X, Eye, ArrowRight, Clock, MapPin, GripHorizontal, Bold, Underline, Palette, Check, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, NoteHistoryEntry, getDrawingUrl } from '@/services/api/noteApi';
import noteApi from '@/services/api/noteApi';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { NOTE_COLORS, applySmartPunctuation } from './constants';
import DrawingCanvas from './DrawingCanvas';

const HISTORY_COLORS = [
  { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800' },
  { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', dot: 'bg-pink-500', border: 'border-pink-200 dark:border-pink-800' },
];

const formatFullDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onNoteUpdated?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, onDragStart, onNoteUpdated }) => {
  const { toast } = useToast();
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'edit' | 'delete' | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVoiceText, setEditVoiceText] = useState('');
  const [editDrawing, setEditDrawing] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#ffffff');
  const [editBold, setEditBold] = useState(false);
  const [editBoldLines, setEditBoldLines] = useState<number[]>([]);
  const [editUnderlineLines, setEditUnderlineLines] = useState<number[]>([]);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [uploadingDrawing, setUploadingDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // History state (local, saved only on confirm)
  const [localHistory, setLocalHistory] = useState<NoteHistoryEntry[]>([]);
  const [historyDragIndex, setHistoryDragIndex] = useState<number | null>(null);
  const [historyDropIndex, setHistoryDropIndex] = useState<number | null>(null);
  const [confirmDeleteHistory, setConfirmDeleteHistory] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const drawingUrl = getDrawingUrl(note.drawing);

  const handleOpenDetail = () => {
    setLocalHistory([...(note.history || [])]);
    setIsEditing(false);
    setConfirmAction(null);
    setShowDetail(true);
    setConfirmDeleteHistory(null);
    setHistoryDragIndex(null);
    setHistoryDropIndex(null);
  };

  // Enter edit mode
  const enterEditMode = () => {
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditVoiceText(note.voiceText || '');
    setEditDrawing(note.drawing || null);
    setEditColor(note.color || '#ffffff');
    setEditBold(note.bold || false);
    setEditBoldLines([...(note.boldLines || [])]);
    setEditUnderlineLines([...(note.underlineLines || [])]);
    setLocalHistory([...(note.history || [])]);
    setIsEditing(true);
    setConfirmAction(null);
  };

  // Save all changes to DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await noteApi.update(note.id, {
        title: editTitle,
        content: editContent,
        voiceText: editVoiceText,
        drawing: editDrawing,
        color: editColor,
        bold: editBold,
        boldLines: editBoldLines,
        underlineLines: editUnderlineLines,
        history: localHistory,
      });
      toast({ title: '✅ Note modifiée' });
      setIsEditing(false);
      setConfirmAction(null);
      setShowDetail(false);
      onNoteUpdated?.();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = () => {
    if (confirmAction === 'edit') {
      handleSaveAll();
    } else if (confirmAction === 'delete') {
      onDelete();
      setConfirmAction(null);
      setShowDetail(false);
    }
  };

  // Voice recording
  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Non supporté', description: 'La reconnaissance vocale n\'est pas supportée', variant: 'destructive' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }
      const combined = finalTranscript + interimTranscript;
      setEditVoiceText(applySmartPunctuation(combined));
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  // Drawing save
  const handleSaveDrawing = async (dataUrl: string) => {
    setUploadingDrawing(true);
    try {
      const res = await noteApi.uploadDrawing(dataUrl);
      setEditDrawing(res.data.url);
      setShowDrawingCanvas(false);
      toast({ title: '✅ Dessin enregistré' });
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer le dessin", variant: 'destructive' });
    } finally {
      setUploadingDrawing(false);
    }
  };

  // Bold/underline line toggles
  const toggleBoldLine = (lineIndex: number) => {
    setEditBoldLines(prev => prev.includes(lineIndex) ? prev.filter(l => l !== lineIndex) : [...prev, lineIndex]);
  };
  const toggleUnderlineLine = (lineIndex: number) => {
    setEditUnderlineLines(prev => prev.includes(lineIndex) ? prev.filter(l => l !== lineIndex) : [...prev, lineIndex]);
  };

  // History drag and drop (local only)
  const handleHistoryDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('historyIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setHistoryDragIndex(index);
  };
  const handleHistoryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHistoryDropIndex(index);
  };
  const handleHistoryDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const dragIdx = parseInt(e.dataTransfer.getData('historyIndex'));
    setHistoryDragIndex(null);
    setHistoryDropIndex(null);
    if (isNaN(dragIdx) || dragIdx === dropIdx) return;
    const newHistory = [...localHistory];
    const [moved] = newHistory.splice(dragIdx, 1);
    newHistory.splice(dropIdx, 0, moved);
    setLocalHistory(newHistory);
  };
  const handleHistoryDragEnd = () => {
    setHistoryDragIndex(null);
    setHistoryDropIndex(null);
  };
  const handleDeleteHistoryEntry = (index: number) => {
    if (localHistory.length <= 1) {
      toast({ title: '⚠️ Impossible', description: 'Il faut garder au moins un parcours' });
      return;
    }
    setLocalHistory(prev => prev.filter((_, i) => i !== index));
    setConfirmDeleteHistory(null);
  };

  const editDrawingUrl = getDrawingUrl(editDrawing);

  return (
    <>
      {/* Card preview */}
      <div
        draggable
        onDragStart={onDragStart}
        onClick={handleOpenDetail}
        className="group relative rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
        style={{ backgroundColor: note.color === '#ffffff' ? 'rgba(255,255,255,0.9)' : note.color + 'e6' }}
      >
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
                <span key={i} className={cn(note.boldLines?.includes(i) && 'font-bold', note.underlineLines?.includes(i) && 'underline')}>
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
      <Dialog open={showDetail} onOpenChange={(open) => { if (!open) { setIsEditing(false); setConfirmAction(null); } setShowDetail(open); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
          <div className="p-5 sm:p-6 space-y-4">
            {/* Title */}
            <div className="flex items-start justify-between">
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Titre de la note"
                  className={cn("text-lg font-bold rounded-xl border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5", editBold && "font-black text-xl")}
                />
              ) : (
                <h3 className={cn("text-lg font-bold text-gray-900 dark:text-white", note.bold && "text-xl font-black")}>
                  {note.title || 'Sans titre'}
                </h3>
              )}
             
            </div>

            {/* Toolbar (edit mode only) */}
            {isEditing && (
              <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                <button
                  onClick={() => setEditBold(!editBold)}
                  className={cn("p-2 rounded-xl transition-all", editBold ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={toggleVoice}
                  className={cn("p-2 rounded-xl transition-all", isRecording ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg animate-pulse" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setShowDrawingCanvas(!showDrawingCanvas)}
                  className={cn("p-2 rounded-xl transition-all", showDrawingCanvas ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <div className="flex items-center gap-1">
                  <Palette className="h-4 w-4 text-gray-400" />
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-125", editColor === c ? "border-cyan-500 scale-110 shadow-lg" : "border-gray-300 dark:border-gray-600")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isEditing && isRecording && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">🎙️ Enregistrement en cours...</span>
              </div>
            )}

            {/* Content */}
            {isEditing ? (
              <div className="space-y-1">
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="Contenu de la note..."
                  rows={6}
                  className="rounded-xl border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 resize-none"
                />
                {editContent.split('\n').length > 1 && (
                  <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                    <span className="text-[10px] text-gray-400 w-full mb-1">Formater les lignes :</span>
                    {editContent.split('\n').map((line, i) => line.trim() && (
                      <div key={i} className="flex items-center gap-0.5">
                        <button onClick={() => toggleBoldLine(i)} className={cn("px-1.5 py-0.5 rounded text-[10px]", editBoldLines.includes(i) ? "bg-cyan-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}>
                          <Bold className="h-2.5 w-2.5" />
                        </button>
                        <button onClick={() => toggleUnderlineLine(i)} className={cn("px-1.5 py-0.5 rounded text-[10px]", editUnderlineLines.includes(i) ? "bg-violet-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}>
                          <Underline className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px]">L{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              note.content && (
                <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                  {note.content.split('\n').map((line, i) => (
                    <span key={i} className={cn(note.boldLines?.includes(i) && 'font-bold', note.underlineLines?.includes(i) && 'underline')}>
                      {line}{i < note.content.split('\n').length - 1 && '\n'}
                    </span>
                  ))}
                </div>
              )
            )}

            {/* Voice text */}
            {isEditing ? (
              editVoiceText && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Texte vocal</span>
                  </div>
                  <Textarea
                    value={editVoiceText}
                    onChange={e => setEditVoiceText(e.target.value)}
                    rows={2}
                    className="rounded-xl border-violet-200 dark:border-violet-700 bg-white/50 dark:bg-black/20 resize-none text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditContent(prev => prev + '\n' + editVoiceText); setEditVoiceText(''); }} className="text-xs text-violet-600 hover:bg-violet-100 rounded-xl">
                      <Check className="h-3.5 w-3.5 mr-1" /> Ajouter au contenu
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditVoiceText('')} className="text-xs text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              )
            ) : (
              note.voiceText && (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Mic className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Texte vocal</span>
                  </div>
                  <p className="text-sm text-violet-700 dark:text-violet-300">{note.voiceText}</p>
                </div>
              )
            )}

            {/* Drawing */}
            {isEditing ? (
              <>
                {showDrawingCanvas && (
                  <DrawingCanvas
                    initialData={editDrawingUrl}
                    onSave={handleSaveDrawing}
                    onClose={() => setShowDrawingCanvas(false)}
                  />
                )}
                {uploadingDrawing && (
                  <div className="text-center py-3 text-sm text-cyan-600 animate-pulse font-semibold">⏳ Enregistrement du dessin...</div>
                )}
                {editDrawing && !showDrawingCanvas && !uploadingDrawing && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <img src={editDrawingUrl || ''} alt="Dessin" className="w-full h-32 object-contain bg-white" />
                    <button onClick={() => setEditDrawing(null)} className="w-full py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors">
                      Supprimer le dessin
                    </button>
                  </div>
                )}
              </>
            ) : (
              drawingUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={drawingUrl} alt="Dessin" className="w-full h-48 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )
            )}

            {/* History timeline */}
            {localHistory && localHistory.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/80 to-slate-50/80 dark:from-gray-800/40 dark:to-slate-800/40 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Parcours de la note</span>
                  {isEditing && <span className="text-[10px] text-gray-400 ml-auto">Glissez pour réorganiser</span>}
                </div>
                <div className="relative pl-4">
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-violet-400 rounded-full" />
                  <div className="space-y-3">
                    {localHistory.map((h, i) => {
                      const color = HISTORY_COLORS[i % HISTORY_COLORS.length];
                      const isLast = i === localHistory.length - 1;
                      const isDragging = historyDragIndex === i;
                      const isDropTarget = historyDropIndex === i;

                      return (
                        <div
                          key={i}
                          draggable={isEditing}
                          onDragStart={isEditing ? (e) => handleHistoryDragStart(e, i) : undefined}
                          onDragOver={isEditing ? (e) => handleHistoryDragOver(e, i) : undefined}
                          onDrop={isEditing ? (e) => handleHistoryDrop(e, i) : undefined}
                          onDragEnd={isEditing ? handleHistoryDragEnd : undefined}
                          className={cn(
                            "relative flex items-start gap-3 transition-all duration-200",
                            isDragging && "opacity-40 scale-95",
                            isDropTarget && "translate-y-1"
                          )}
                        >
                          {isDropTarget && historyDragIndex !== null && historyDragIndex !== i && (
                            <div className="absolute -top-2 left-0 right-0 h-1 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse z-20" />
                          )}
                          <div className={cn(
                            "absolute -left-4 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 shadow-md z-10",
                            color.dot,
                            isLast && "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-cyan-400/50 animate-pulse"
                          )} />
                          <div className={cn("flex-1 p-2.5 rounded-xl border group/history", isEditing && "cursor-grab active:cursor-grabbing", color.bg, color.border)}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                {isEditing && <GripHorizontal className="h-3 w-3 text-gray-400 opacity-50 group-hover/history:opacity-100 transition-opacity" />}
                                <span className={cn("text-xs font-bold", color.text)}>{h.columnTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatFullDate(h.movedAt)}
                                </div>
                                {isEditing && (
                                  confirmDeleteHistory === i ? (
                                    <div className="flex items-center gap-1">
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteHistoryEntry(i); }} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Oui</button>
                                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteHistory(null); }} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 transition-colors">Non</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (localHistory.length <= 1) {
                                          toast({ title: '⚠️ Impossible', description: 'Il faut garder au moins un parcours' });
                                          return;
                                        }
                                        setConfirmDeleteHistory(i);
                                      }}
                                      className="p-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover/history:opacity-100"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                            {i > 0 && (
                              <div className="mt-1 text-[10px] text-gray-400">
                                Après {Math.round((new Date(h.movedAt).getTime() - new Date(localHistory[i - 1].movedAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s) en "{localHistory[i - 1].columnTitle}"
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
                  <Button size="sm" onClick={handleConfirm} disabled={saving}
                    className={cn("flex-1 rounded-xl text-white", confirmAction === 'delete' ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600")}>
                    {saving ? '⏳ En cours...' : 'Confirmer'}
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!confirmAction && !isEditing && (
              <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button
                  variant="outline"
                  onClick={enterEditMode}
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

            {/* Edit mode actions */}
            {isEditing && !confirmAction && (
              <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-xl">
                  Annuler
                </Button>
                <Button
                  onClick={() => setConfirmAction('edit')}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 rounded-xl shadow-lg"
                >
                  <Check className="h-4 w-4 mr-1" /> Enregistrer
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
