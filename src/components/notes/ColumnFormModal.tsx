import React, { useState, useEffect } from 'react';
import { Columns3, Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoteColumn } from '@/services/api/noteApi';
import { COLUMN_COLORS } from './constants';

interface ColumnFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: NoteColumn | null;
  onSave: (data: Partial<NoteColumn>) => void;
}

const ColumnFormModal: React.FC<ColumnFormModalProps> = ({ open, onOpenChange, column, onSave }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#6b7280');

  useEffect(() => {
    if (column) { setTitle(column.title); setColor(column.color); }
    else { setTitle(''); setColor('#6b7280'); }
  }, [column, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Columns3 className="h-4 w-4 text-white" />
          </div>
          {column ? 'Modifier la colonne' : 'Nouvelle colonne'}
        </h2>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nom de la colonne" className="rounded-xl" />
        <div className="flex gap-2">
          {COLUMN_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn("w-8 h-8 rounded-full border-2 transition-transform hover:scale-110", color === c ? "border-white shadow-lg scale-110 ring-2 ring-cyan-400" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">Annuler</Button>
          <Button onClick={() => onSave({ title, color })} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
            <Check className="h-4 w-4 mr-1" /> {column ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormModal;
