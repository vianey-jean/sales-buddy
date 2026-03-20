import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ListTodo, CalendarDays, Clock, FileText, AlertTriangle, X, Ban } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';
import tacheApi from '@/services/api/tacheApi';
import rdvApiService from '@/services/api/rdvApi';
import { Travailleur } from '@/services/api/travailleurApi';
import TravailleurSearchInput from '@/components/pointage/TravailleurSearchInput';
import { useToast } from '@/hooks/use-toast';
import indisponibleApi, { Indisponibilite } from '@/services/api/indisponibleApi';

interface TacheFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  travailleurs: Travailleur[];
  editingTache: Tache | null;
  onSubmit: (data: any) => void;
  premiumBtnClass: string;
  mirrorShine: string;
  defaultDate?: string;
  isFollowUp?: boolean;
}

const DAY_START_MINUTES = 4 * 60;
const DAY_END_MINUTES = 23 * 60 + 59;

const isAdminTravailleur = (name: string, travailleursList: Travailleur[]) => {
  if (!name) return false;
  const nameLower = name.trim().toLowerCase();
  return travailleursList.some(t => {
    const fullName = `${t.prenom} ${t.nom}`.trim().toLowerCase();
    const fullNameReverse = `${t.nom} ${t.prenom}`.trim().toLowerCase();
    return (fullName === nameLower || fullNameReverse === nameLower) && t.role === 'administrateur';
  });
};

interface OccupiedSlot {
  heureDebut: string;
  heureFin: string;
  description: string;
  source: 'tache' | 'rdv';
}

const TacheFormModal: React.FC<TacheFormModalProps> = ({
  open, onOpenChange, travailleurs, editingTache, onSubmit, premiumBtnClass, mirrorShine, defaultDate, isFollowUp
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    travailleurId: '',
    travailleurNom: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    heureDebut: '08:00',
    heureFin: '09:00',
    description: '',
    importance: 'optionnel' as 'pertinent' | 'optionnel'
  });
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);

  // Fetch indisponibilités
  useEffect(() => {
    if (!open) return;
    indisponibleApi.getAll().then(setIndisponibilites).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (editingTache) {
      setForm({
        travailleurId: editingTache.travailleurId || '',
        travailleurNom: editingTache.travailleurNom || '',
        date: editingTache.date,
        heureDebut: editingTache.heureDebut,
        heureFin: editingTache.heureFin,
        description: editingTache.description,
        importance: editingTache.importance
      });
    } else {
      setForm({
        travailleurId: '',
        travailleurNom: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        heureDebut: '08:00',
        heureFin: '09:00',
        description: '',
        importance: 'optionnel'
      });
    }
  }, [editingTache, open, defaultDate]);

  const isPertinentEdit = editingTache?.importance === 'pertinent';
  const isFieldDisabledByFollowUp = !!isFollowUp;
  const excludedTacheId = !isFollowUp ? (editingTache?.id || '') : '';

  // Fetch occupied slots filtered by person
  useEffect(() => {
    if (!open || !form.date) {
      setOccupiedSlots([]);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);

    const personName = (form.travailleurNom || '').trim().toLowerCase();

    Promise.all([
      tacheApi.getByDate(form.date),
      isAdminTravailleur(form.travailleurNom, travailleurs) ? rdvApiService.getAll() : Promise.resolve([])
    ])
      .then(([tacheRes, rdvs]) => {
        if (cancelled) return;

        // Filter taches for THIS person only
        const tacheSlots: OccupiedSlot[] = tacheRes.data
          .filter(t => {
            if (t.id === excludedTacheId) return false;
            const tName = (t.travailleurNom || '').trim().toLowerCase();
            return tName === personName;
          })
          .map(t => ({
            heureDebut: t.heureDebut,
            heureFin: t.heureFin,
            description: t.description,
            source: 'tache' as const
          }));

        // For main user: also add RDV slots (date+time only, no name filter)
        let rdvSlots: OccupiedSlot[] = [];
        if (isAdminTravailleur(form.travailleurNom, travailleurs)) {
          const rdvArray = Array.isArray(rdvs) ? rdvs : [];
          rdvSlots = rdvArray
            .filter(r => r.date === form.date && r.statut !== 'annule' && r.statut !== 'termine')
            .map(r => ({
              heureDebut: r.heureDebut,
              heureFin: r.heureFin,
              description: r.titre || 'RDV',
              source: 'rdv' as const
            }));
        }

        setOccupiedSlots([...tacheSlots, ...rdvSlots]);
      })
      .catch(() => {
        if (!cancelled) setOccupiedSlots([]);
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, form.date, excludedTacheId, form.travailleurNom]);

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const safeMinutes = Math.max(0, Math.min(DAY_END_MINUTES, minutes));
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const sortedSlots = [...occupiedSlots].sort(
    (a, b) => timeToMinutes(a.heureDebut) - timeToMinutes(b.heureDebut)
  );

  const occupiedRanges = sortedSlots.map(s => {
    const label = s.source === 'rdv' ? '📅' : '📋';
    return `${label} ${s.heureDebut} - ${s.heureFin}`;
  });

  const availableRanges = (() => {
    const ranges: string[] = [];
    let cursor = DAY_START_MINUTES;

    sortedSlots.forEach(slot => {
      const start = timeToMinutes(slot.heureDebut);
      const end = timeToMinutes(slot.heureFin);

      if (start > cursor) {
        ranges.push(`${minutesToTime(cursor)} - ${minutesToTime(start - 1)}`);
      }

      cursor = Math.max(cursor, end + 1);
    });

    if (cursor <= DAY_END_MINUTES) {
      ranges.push(`${minutesToTime(cursor)} - ${minutesToTime(DAY_END_MINUTES)}`);
    }

    return ranges;
  })();

  // Check indisponibilité for selected date
  const indispoForDate = form.date ? indisponibilites.filter(i => i.date === form.date) : [];
  const isDayFullyIndispo = indispoForDate.some(i => i.journeeComplete);

  const validationMessage = (() => {
    if (!form.heureDebut || !form.heureFin) return '';

    // Check full day indispo
    if (isDayFullyIndispo) {
      return '🚫 Cette journée est marquée comme indisponible. Impossible d\'ajouter une tâche.';
    }

    const startMinutes = timeToMinutes(form.heureDebut);
    const endMinutes = timeToMinutes(form.heureFin);

    if (startMinutes < DAY_START_MINUTES || endMinutes > DAY_END_MINUTES) {
      return 'Les tâches doivent être planifiées entre 04:00 et 23:59.';
    }

    if (endMinutes < startMinutes + 1) {
      return "L'heure de fin doit être au moins 1 minute après l'heure de début.";
    }

    // Check partial indisponibilité overlap
    const indispoConflict = indispoForDate.find(i => {
      if (i.journeeComplete) return false;
      const iStart = timeToMinutes(i.heureDebut);
      const iEnd = timeToMinutes(i.heureFin);
      return startMinutes < iEnd && endMinutes > iStart;
    });

    if (indispoConflict) {
      return `🚫 Ce créneau chevauche une indisponibilité (${indispoConflict.heureDebut} - ${indispoConflict.heureFin}${indispoConflict.motif ? ' : ' + indispoConflict.motif : ''}).`;
    }

    const overlapConflict = sortedSlots.find(slot => {
      const occupiedStart = timeToMinutes(slot.heureDebut);
      const occupiedEnd = timeToMinutes(slot.heureFin);
      return startMinutes <= occupiedEnd && endMinutes >= occupiedStart;
    });

    if (overlapConflict) {
      const sourceLabel = overlapConflict.source === 'rdv' ? 'un rendez-vous' : 'une tâche';
      return `Ce créneau chevauche ${sourceLabel} : "${overlapConflict.description}" (${overlapConflict.heureDebut} - ${overlapConflict.heureFin}).`;
    }

    return '';
  })();

  const handleSubmit = () => {
    if (!form.date || !form.heureDebut || !form.description) return;
    if (validationMessage) {
      toast({ title: 'Horaire occupé', description: validationMessage, variant: 'destructive' });
      return;
    }
    onSubmit(form);
  };

  const personLabel = form.travailleurNom
    ? (isAdminTravailleur(form.travailleurNom, travailleurs) ? `${form.travailleurNom} (tâches + RDV)` : `${form.travailleurNom} (tâches)`)
    : 'jour choisi';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-md">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
            <ListTodo className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            {isFollowUp ? '📅 Reporter la Tâche' : editingTache ? '✏️ Modifier la Tâche' : '✨ Nouvelle Tâche'}
          </DialogTitle>
          {isFollowUp && (
            <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
              ⚠️ Choisissez une nouvelle date et un créneau libre pour reporter cette tâche
            </p>
          )}
          {isPertinentEdit && !isFollowUp && (
            <p className="text-xs text-red-400 font-bold flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Tâche pertinente : seule la description est modifiable
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className={cn(isFieldDisabledByFollowUp && 'opacity-50 pointer-events-none')}>
            <TravailleurSearchInput
              travailleurs={travailleurs}
              selectedId={form.travailleurId}
              selectedNom={form.travailleurNom}
              onSelect={(id, nom) => setForm({ ...form, travailleurId: id, travailleurNom: nom })}
              onClear={() => setForm({ ...form, travailleurId: '', travailleurNom: '' })}
              minChars={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-400" /> Date
            </Label>
            <Input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              disabled={isPertinentEdit && !isFollowUp}
              className="bg-white/10 border border-white/20 focus:border-cyan-400 rounded-xl text-white disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" /> Début
              </Label>
              <Input
                type="time"
                value={form.heureDebut}
                onChange={e => setForm({ ...form, heureDebut: e.target.value })}
                disabled={isPertinentEdit && !isFollowUp}
                className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" /> Fin
              </Label>
              <Input
                type="time"
                value={form.heureFin}
                onChange={e => setForm({ ...form, heureFin: e.target.value })}
                disabled={isPertinentEdit && !isFollowUp}
                className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            <p className="text-xs font-bold text-white/80">
              Créneaux libres pour {personLabel} le {form.date || 'jour choisi'}
            </p>
            {availabilityLoading ? (
              <p className="text-xs text-white/50">Chargement des horaires...</p>
            ) : availableRanges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableRanges.map(range => (
                  <span key={range} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                    {range}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-300">Aucun créneau libre sur cette date.</p>
            )}
            {occupiedRanges.length > 0 && (
              <p className="text-[11px] text-white/55">
                Occupés : {occupiedRanges.join(' • ')}
              </p>
            )}
            {validationMessage && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200">
                {validationMessage}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" /> Tâche à faire
            </Label>
            <Textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez la tâche à effectuer..."
              rows={3}
              disabled={isFieldDisabledByFollowUp}
              className="bg-white/10 border border-white/20 focus:border-amber-400 rounded-xl text-white placeholder:text-white/40 resize-none disabled:opacity-50"
            />
          </div>

          <div className={cn("space-y-2", isFieldDisabledByFollowUp && 'opacity-50 pointer-events-none')}>
            <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Importance
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isPertinentEdit || isFieldDisabledByFollowUp) return;
                  setForm({ ...form, importance: 'pertinent' });
                }}
                disabled={(isPertinentEdit && form.importance === 'optionnel') || isFieldDisabledByFollowUp}
                className={cn(
                  'flex-1 py-3 rounded-xl font-bold text-sm transition-all border',
                  form.importance === 'pertinent'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                )}
              >
                🔴 Pertinent
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingTache?.importance === 'pertinent' || isFieldDisabledByFollowUp) return;
                  setForm({ ...form, importance: 'optionnel' });
                }}
                disabled={editingTache?.importance === 'pertinent' || isFieldDisabledByFollowUp}
                className={cn(
                  'flex-1 py-3 rounded-xl font-bold text-sm transition-all border',
                  form.importance === 'optionnel'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10',
                  (editingTache?.importance === 'pertinent' || isFieldDisabledByFollowUp) && 'opacity-30 cursor-not-allowed'
                )}
              >
                🟢 Optionnel
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!form.date || !form.heureDebut || !form.description || !!validationMessage}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 border-violet-300/40 text-white shadow-[0_20px_70px_rgba(139,92,246,0.6)] disabled:opacity-50 disabled:hover:scale-100")}
            >
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full">
                ✅ {editingTache ? 'Modifier' : 'Enregistrer'}
              </span>
            </Button>
            <Button onClick={() => onOpenChange(false)}
              className={cn(premiumBtnClass, "flex-1 bg-gradient-to-br from-white/20 to-white/5 border-white/20 text-white/90")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center justify-center w-full"><X className="h-4 w-4 mr-2" /> Annuler</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheFormModal;
