import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Plus, Pencil, Trash2, GripVertical, AlertTriangle, CheckCircle, Timer, Check, Ban } from 'lucide-react';
import { Tache } from '@/services/api/tacheApi';
import tacheApi from '@/services/api/tacheApi';
import rdvApiService from '@/services/api/rdvApi';
import { Travailleur } from '@/services/api/travailleurApi';
import { useToast } from '@/hooks/use-toast';
import indisponibleApi, { Indisponibilite } from '@/services/api/indisponibleApi';

interface TacheDayModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedDay: string | null;
  taches: Tache[];
  travailleurs: Travailleur[];
  onEdit: (t: Tache) => void;
  onDelete: (id: string) => void;
  onAddTache: () => void;
  onMoveTache: (id: string, newHeure: string) => void;
  onValidateTache: (t: Tache) => void;
  premiumBtnClass: string;
  mirrorShine: string;
}

const HOURS = Array.from({ length: 20 }, (_, i) => i + 4); // 4h to 23h

const isAdminTravailleur = (name: string, travailleursList: Travailleur[]) => {
  if (!name) return false;
  const nameLower = name.trim().toLowerCase();
  return travailleursList.some(t => {
    const fullName = `${t.prenom} ${t.nom}`.trim().toLowerCase();
    const fullNameReverse = `${t.nom} ${t.prenom}`.trim().toLowerCase();
    return (fullName === nameLower || fullNameReverse === nameLower) && t.role === 'administrateur';
  });
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const useCountdown = (heureFin: string, date: string, open: boolean) => {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    const calc = () => {
      const now = new Date();
      const [h, m] = heureFin.split(':').map(Number);
      const end = new Date(date + 'T00:00:00');
      end.setHours(h, m, 0, 0);
      return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
    };
    setRemaining(calc());
    const interval = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(interval);
  }, [heureFin, date, open]);

  return remaining;
};

const CountdownDisplay: React.FC<{ heureFin: string; date: string; open: boolean }> = ({
  heureFin, date, open
}) => {
  const remaining = useCountdown(heureFin, date, open);

  if (remaining <= 0) {
    return <span className="text-[10px] font-black text-red-400 animate-pulse">⏰ À vérifier</span>;
  }

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 3600;

  return (
    <span className={cn(
      'text-[10px] font-mono font-black flex items-center gap-1 px-1.5 py-0.5 rounded-lg',
      isUrgent
        ? 'text-red-400 bg-red-500/10 border border-red-500/20 animate-pulse'
        : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
    )}>
      <Timer className="h-3 w-3" />
      {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
};

const TacheDayModal: React.FC<TacheDayModalProps> = ({
  open, onOpenChange, selectedDay, taches, travailleurs, onEdit, onDelete, onAddTache, onMoveTache, onValidateTache, premiumBtnClass, mirrorShine
}) => {
  const { toast } = useToast();
  const dayTaches = taches.filter(t => t.date === selectedDay);
  const dragRef = useRef<{ tacheId: string; originHeure: string } | null>(null);
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);

  useEffect(() => {
    if (!open || !selectedDay) return;
    indisponibleApi.getAll().then(data => {
      setIndisponibilites(data.filter(i => i.date === selectedDay));
    }).catch(() => {});
  }, [open, selectedDay]);

  const isDayFullyIndispo = indisponibilites.some(i => i.journeeComplete);

  const isHourIndispo = (hour: number) => {
    if (isDayFullyIndispo) return true;
    const hourStart = hour * 60;
    const hourEnd = (hour + 1) * 60;
    return indisponibilites.some(i => {
      if (i.journeeComplete) return true;
      const iStart = timeToMinutes(i.heureDebut);
      const iEnd = timeToMinutes(i.heureFin);
      return hourStart < iEnd && hourEnd > iStart;
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTachesAtHour = (hour: number) => {
    return dayTaches.filter(t => {
      const tHour = parseInt(t.heureDebut.split(':')[0]);
      return tHour === hour;
    });
  };

  const handleDragStart = (e: React.DragEvent, tache: Tache) => {
    if (tache.importance === 'pertinent') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('tacheId', tache.id);
    dragRef.current = { tacheId: tache.id, originHeure: tache.heureDebut };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const tacheId = e.dataTransfer.getData('tacheId');
    if (!tacheId || !selectedDay) return;

    const tache = dayTaches.find(t => t.id === tacheId);
    if (!tache) return;

    const newHeureDebut = `${String(hour).padStart(2, '0')}:00`;
    const duration = Math.max(1, timeToMinutes(tache.heureFin) - timeToMinutes(tache.heureDebut));
    const newEndMinutes = timeToMinutes(newHeureDebut) + duration;

    if (newEndMinutes > 23 * 60 + 59) {
      toast({ title: 'Erreur', description: 'Ce déplacement dépasse la fin de journée autorisée.', variant: 'destructive' });
      return;
    }

    const personName = (tache.travailleurNom || '').trim().toLowerCase();

    // Check conflicts for this person's taches (excluding the dragged one)
    const personTaches = dayTaches.filter(t => {
      if (t.id === tacheId) return false;
      return (t.travailleurNom || '').trim().toLowerCase() === personName;
    });

    const newStart = timeToMinutes(newHeureDebut);
    const newEnd = newStart + duration;

    // Check tache conflicts for this person
    const tacheConflict = personTaches.find(t => {
      const s = timeToMinutes(t.heureDebut);
      const e = timeToMinutes(t.heureFin);
      return newStart <= e && newEnd >= s;
    });

    if (tacheConflict) {
      toast({
        title: '⚠️ Créneau occupé',
        description: `${tache.travailleurNom || 'Cette personne'} a déjà une tâche "${tacheConflict.description}" (${tacheConflict.heureDebut} - ${tacheConflict.heureFin})`,
        variant: 'destructive'
      });
      return;
    }

    // For admin users, also check RDV conflicts
    if (isAdminTravailleur(tache.travailleurNom || '', travailleurs)) {
      try {
        const rdvs = await rdvApiService.getAll();
        const rdvConflict = rdvs.find(r => {
          if (r.date !== selectedDay) return false;
          if (r.statut === 'annule' || r.statut === 'termine') return false;
          const s = timeToMinutes(r.heureDebut);
          const e = timeToMinutes(r.heureFin);
          return newStart <= e && newEnd >= s;
        });

        if (rdvConflict) {
          toast({
            title: '⚠️ RDV en conflit',
            description: `Un rendez-vous "${rdvConflict.titre}" occupe ce créneau (${rdvConflict.heureDebut} - ${rdvConflict.heureFin})`,
            variant: 'destructive'
          });
          return;
        }
      } catch {
        // If RDV check fails, let the backend validate
      }
    }

    onMoveTache(tacheId, newHeureDebut);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="text-center space-y-2 pb-3">
          <DialogTitle className="text-lg font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            📋 {formatDate(selectedDay)}
          </DialogTitle>
          {isDayFullyIndispo && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <Ban className="h-4 w-4" /> Journée indisponible
            </div>
          )}
          <div className="flex justify-center">
            <Button onClick={onAddTache}
              disabled={isDayFullyIndispo}
              className={cn(premiumBtnClass, "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300/40 text-white shadow-lg !py-1.5 !px-3 !text-xs", isDayFullyIndispo && "opacity-50 cursor-not-allowed")}>
              <span className={mirrorShine} />
              <span className="relative flex items-center"><Plus className="h-3 w-3 mr-1" /> Ajouter</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-0.5">
          {HOURS.map(hour => {
            const hourTaches = getTachesAtHour(hour);
            const hourIndispo = isHourIndispo(hour);
            return (
              <div
                key={hour}
                onDragOver={hourIndispo ? undefined : handleDragOver}
                onDrop={hourIndispo ? undefined : (e) => handleDrop(e, hour)}
                className={cn(
                  'flex gap-3 py-2 px-3 rounded-xl transition-all border border-transparent',
                  hourIndispo
                    ? 'bg-red-500/10 border-red-500/20 opacity-60 cursor-not-allowed'
                    : hourTaches.length > 0 ? 'bg-white/5' : 'hover:bg-white/5',
                )}
              >
                <div className="w-14 shrink-0 text-right flex items-start gap-1 justify-end">
                  {hourIndispo && <Ban className="h-3 w-3 text-red-400 mt-0.5" />}
                  <span className={cn("text-xs font-bold", hourIndispo ? "text-red-400" : "text-white/40")}>{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div className="flex-1 min-h-[36px] flex flex-col gap-1">
                  {hourTaches.length === 0 && (
                    <div className="h-[1px] bg-white/5 mt-4" />
                  )}
                  {hourTaches.map(tache => (
                    <div
                      key={tache.id}
                      draggable={tache.importance !== 'pertinent'}
                      onDragStart={(e) => handleDragStart(e, tache)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group',
                        tache.completed && 'opacity-60',
                        tache.importance === 'pertinent'
                          ? 'bg-red-500/15 border-red-500/30 shadow-lg shadow-red-500/10'
                          : 'bg-emerald-500/15 border-emerald-500/30 shadow-lg shadow-emerald-500/10 cursor-grab active:cursor-grabbing'
                      )}
                    >
                      {tache.importance !== 'pertinent' && (
                        <GripVertical className="h-4 w-4 text-white/30 shrink-0" />
                      )}
                      <div className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        tache.importance === 'pertinent' ? 'bg-red-500' : 'bg-emerald-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-bold text-white truncate',
                          tache.completed && 'line-through text-white/50'
                        )}>
                          {tache.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-white/50">
                            {tache.heureDebut} - {tache.heureFin}
                            {tache.travailleurNom && ` • ${tache.travailleurNom}`}
                          </p>
                          {selectedDay && !tache.completed && (
                            <CountdownDisplay
                              heureFin={tache.heureFin}
                              date={selectedDay}
                              open={open}
                            />
                          )}
                          {tache.completed && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="h-3 w-3" /> Terminée
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!tache.completed && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onValidateTache(tache); }}
                            className={cn(
                              'p-1.5 rounded-lg transition-all',
                              'bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30'
                            )}
                            title="Valider cette tâche"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          </button>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {tache.importance === 'pertinent' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                          ) : (
                            <>
                              <button onClick={() => onEdit(tache)} className="p-1 rounded-lg hover:bg-white/10">
                                <Pencil className="h-3 w-3 text-blue-400" />
                              </button>
                              <button onClick={() => onDelete(tache.id)} className="p-1 rounded-lg hover:bg-white/10">
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacheDayModal;
