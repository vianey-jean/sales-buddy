import React, { useState, useEffect, useRef } from 'react';
import { Bold, Underline, Mic, MicOff, Edit3, Palette, StickyNote, Check, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import noteApi, { Note, NoteColumn, getDrawingUrl } from '@/services/api/noteApi';
import { NOTE_COLORS, applySmartPunctuation } from './constants';
import DrawingCanvas from './DrawingCanvas';
import { useToast } from '@/hooks/use-toast';

interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Partial<Note> | null;
  columns: NoteColumn[];
  onSave: (data: Partial<Note>) => void;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({ open, onOpenChange, note, columns, onSave }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Note>>({
    title: '', content: '', columnId: columns[0]?.id || '', color: '#ffffff',
    bold: false, boldLines: [], underlineLines: [], drawing: null, voiceText: ''
  });
  const [showDrawing, setShowDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingDrawing, setUploadingDrawing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (note) {
      setForm({ ...note });
    } else {
      setForm({ title: '', content: '', columnId: columns[0]?.id || '', color: '#ffffff', bold: false, boldLines: [], underlineLines: [], drawing: null, voiceText: '' });
    }
  }, [note, columns, open]);

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
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
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      const combined = finalTranscript + interimTranscript;
      const smartText = applySmartPunctuation(combined);
      setForm(prev => ({ ...prev, voiceText: smartText }));
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const toggleBoldLine = (lineIndex: number) => {
    setForm(prev => {
      const lines = prev.boldLines || [];
      return { ...prev, boldLines: lines.includes(lineIndex) ? lines.filter(l => l !== lineIndex) : [...lines, lineIndex] };
    });
  };

  const toggleUnderlineLine = (lineIndex: number) => {
    setForm(prev => {
      const lines = prev.underlineLines || [];
      return { ...prev, underlineLines: lines.includes(lineIndex) ? lines.filter(l => l !== lineIndex) : [...lines, lineIndex] };
    });
  };

  const handleSaveDrawing = async (dataUrl: string) => {
    setUploadingDrawing(true);
    try {
      // Upload to server as JPEG file
      const res = await noteApi.uploadDrawing(dataUrl);
      const serverUrl = res.data.url; // e.g. /uploads/notes/dessin/dessin_123.jpeg
      setForm(prev => ({ ...prev, drawing: serverUrl }));
      setShowDrawing(false);
      toast({ title: '✅ Dessin enregistré' });
    } catch (err) {
      console.error('Error uploading drawing:', err);
      toast({ title: 'Erreur', description: "Impossible d'enregistrer le dessin", variant: 'destructive' });
    } finally {
      setUploadingDrawing(false);
    }
  };

  // Resolve drawing URL for display
  const drawingDisplayUrl = getDrawingUrl(form.drawing);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
        <div className="p-5 sm:p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <StickyNote className="h-4 w-4 text-white" />
            </div>
            {note?.id ? 'Modifier la note' : 'Nouvelle note'}
          </h2>

          {/* Title */}
          <Input
            placeholder="Titre de la note"
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className={cn("text-base font-semibold rounded-xl border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5", form.bold && "font-black text-lg")}
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
            <button
              onClick={() => setForm({ ...form, bold: !form.bold })}
              className={cn("p-2 rounded-xl transition-all", form.bold ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
            >
              <Bold className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={toggleVoice}
              className={cn("p-2 rounded-xl transition-all", isRecording ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg animate-pulse" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
              title={isRecording ? "Arrêter l'enregistrement" : "Démarrer la prise de note vocale"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowDrawing(!showDrawing)}
              className={cn("p-2 rounded-xl transition-all", showDrawing ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300")}
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <div className="flex items-center gap-1">
              <Palette className="h-4 w-4 text-gray-400" />
              {NOTE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn("w-5 h-5 rounded-full border-2 transition-transform hover:scale-125", form.color === c ? "border-cyan-500 scale-110 shadow-lg" : "border-gray-300 dark:border-gray-600")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 animate-pulse">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">🎙️ Enregistrement en cours...</span>
              <span className="text-xs text-red-400">Dites "point", "virgule", "à la ligne"...</span>
            </div>
          )}

          {/* Content */}
          <div className="space-y-1">
            <Textarea
              placeholder="Contenu de la note..."
              value={form.content || ''}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={6}
              className="rounded-xl border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 resize-none"
            />
            {/* Line formatting */}
            {(form.content || '').split('\n').length > 1 && (
              <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <span className="text-[10px] text-gray-400 w-full mb-1">Formater les lignes :</span>
                {(form.content || '').split('\n').map((line, i) => line.trim() && (
                  <div key={i} className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleBoldLine(i)}
                      className={cn("px-1.5 py-0.5 rounded text-[10px]", form.boldLines?.includes(i) ? "bg-cyan-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}
                    >
                      <Bold className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => toggleUnderlineLine(i)}
                      className={cn("px-1.5 py-0.5 rounded text-[10px]", form.underlineLines?.includes(i) ? "bg-violet-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}
                    >
                      <Underline className="h-2.5 w-2.5" />
                    </button>
                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]">L{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voice text */}
          {form.voiceText && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Mic className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">Texte vocal capturé</span>
              </div>
              <p className="text-sm text-violet-600 dark:text-violet-300 leading-relaxed mb-3 bg-white/50 dark:bg-black/20 p-2 rounded-xl">{form.voiceText}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, content: (form.content || '') + '\n' + form.voiceText, voiceText: '' })}
                  className="text-xs text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-xl"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Ajouter au contenu
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setForm({ ...form, voiceText: '' })}
                  className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer ce contenu
                </Button>
              </div>
            </div>
          )}

          {/* Drawing */}
          {showDrawing && (
            <DrawingCanvas
              initialData={drawingDisplayUrl}
              onSave={handleSaveDrawing}
              onClose={() => setShowDrawing(false)}
            />
          )}
          {uploadingDrawing && (
            <div className="text-center py-3 text-sm text-cyan-600 animate-pulse font-semibold">⏳ Enregistrement du dessin...</div>
          )}
          {form.drawing && !showDrawing && !uploadingDrawing && (
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <img src={drawingDisplayUrl || ''} alt="Dessin" className="w-full h-32 object-contain bg-white" />
              <button onClick={() => setForm({ ...form, drawing: null })} className="w-full py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium transition-colors">
                Supprimer le dessin
              </button>
            </div>
          )}

          {/* Column select */}
          <select
            value={form.columnId}
            onChange={e => setForm({ ...form, columnId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm shadow-sm"
          >
            {columns.map(col => (
              <option key={col.id} value={col.id}>{col.title}</option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1 rounded-xl">Annuler</Button>
            <Button
              onClick={() => onSave(form)}
              disabled={uploadingDrawing}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 rounded-xl shadow-lg"
            >
              <Check className="h-4 w-4 mr-1" /> {note?.id ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteFormModal;
