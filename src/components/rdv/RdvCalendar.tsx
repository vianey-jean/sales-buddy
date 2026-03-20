import React, { useState, useMemo, useEffect } from 'react';
import { RDV } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  User,
  MapPin,
  GripVertical,
  Phone,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Lock,
  CalendarOff
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { ConfirmDialog } from '@/components/shared';
import axios from 'axios';
import { toast } from 'sonner';
import indisponibleApi, { Indisponibilite } from '@/services/api/indisponibleApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

interface RdvCalendarProps {
  rdvs: RDV[];
  onRdvClick: (rdv: RDV) => void;
  onSlotClick: (date: string, time: string) => void;
  onRdvDrop: (rdv: RDV, newDate: string, newTime: string) => void;
  onRdvDelete?: (rdv: RDV) => void;
  onOpenFormWithDateTime?: (rdv: RDV, date: string, time: string) => void;
  highlightRdvId?: string | null;
  highlightDate?: string | null;
  onHighlightComplete?: () => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  planifie: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', border: 'border-blue-400', text: 'text-blue-600' },
  confirme: { bg: 'bg-gradient-to-r from-emerald-500 to-green-600', border: 'border-green-400', text: 'text-green-600' },
  annule: { bg: 'bg-gradient-to-r from-red-500 to-rose-600', border: 'border-red-400', text: 'text-red-600' },
  termine: { bg: 'bg-gradient-to-r from-gray-500 to-slate-600', border: 'border-gray-400', text: 'text-gray-600' },
  reporte: { bg: 'bg-gradient-to-r from-amber-500 to-orange-600', border: 'border-amber-400', text: 'text-amber-600' },
};

const statusLabels: Record<string, string> = {
  planifie: 'Planifié',
  confirme: 'Confirmé',
  annule: 'Annulé',
  termine: 'Terminé',
  reporte: 'Reporté',
};

const RdvCalendar: React.FC<RdvCalendarProps> = ({
  rdvs,
  onRdvClick,
  onSlotClick,
  onRdvDrop,
  onRdvDelete,
  onOpenFormWithDateTime,
  highlightRdvId,
  highlightDate,
  onHighlightComplete,
}) => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedRdv, setDraggedRdv] = useState<RDV | null>(null);
  
  // Indisponibilités
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);
  
  useEffect(() => {
    indisponibleApi.getAll().then(setIndisponibilites).catch(() => {});
  }, []);
  const [dropTarget, setDropTarget] = useState<{ date: string; hour: number } | null>(null);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{ rdv: RDV; date: string; time: string } | null>(null);
  const [newTime, setNewTime] = useState('09:00');
  const [newDate, setNewDate] = useState('');
  
  // Drop conflict checking
  const [dropConflicts, setDropConflicts] = useState<RDV[]>([]);
  const [isCheckingDropConflict, setIsCheckingDropConflict] = useState(false);
  const [hasDropConflict, setHasDropConflict] = useState(false);
  
  // RDV Detail Modal
  const [selectedRdvDetail, setSelectedRdvDetail] = useState<RDV | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Phone action modal
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  
  // Address/Location action modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Confirm dialogs
  const [confirmModifyOpen, setConfirmModifyOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rdvToModify, setRdvToModify] = useState<RDV | null>(null);
  const [rdvToDelete, setRdvToDelete] = useState<RDV | null>(null);
  
  // État pour le clignotement du RDV highlight
  const [blinkingRdvId, setBlinkingRdvId] = useState<string | null>(null);
  const [blinkCount, setBlinkCount] = useState(0);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const rdvsByDay = useMemo(() => {
    const map: Record<string, RDV[]> = {};
    rdvs.forEach(rdv => {
      const dateKey = rdv.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(rdv);
    });
    return map;
  }, [rdvs]);

  // Effet pour naviguer à la semaine du RDV quand on reçoit highlightDate
  React.useEffect(() => {
    if (highlightDate) {
      // Naviguer vers la semaine contenant cette date
      const targetDate = parseISO(highlightDate);
      setCurrentDate(targetDate);
    }
  }, [highlightDate]);

  // Effet pour le clignotement quand on reçoit un highlightRdvId
  React.useEffect(() => {
    if (highlightRdvId) {
      setBlinkingRdvId(highlightRdvId);
      setBlinkCount(0);
    }
  }, [highlightRdvId]);

  // Effet pour gérer le clignotement 4 fois
  React.useEffect(() => {
    if (blinkingRdvId && blinkCount < 8) { // 8 = 4 cycles (on/off)
      const timer = setTimeout(() => {
        setBlinkCount(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    } else if (blinkCount >= 8) {
      // Après 4 clignotements, garder stable (pas rouge)
      setBlinkingRdvId(null);
      onHighlightComplete?.();
    }
  }, [blinkingRdvId, blinkCount, onHighlightComplete]);

  // Check for drop conflicts when newDate or newTime changes in dialog
  useEffect(() => {
    const checkDropConflict = async () => {
      if (!showTimeDialog || !newDate || !newTime || !pendingDrop) {
        setDropConflicts([]);
        setHasDropConflict(false);
        return;
      }

      // Calculate end time (same duration as original rdv)
      const originalStart = pendingDrop.rdv.heureDebut.split(':').map(Number);
      const originalEnd = pendingDrop.rdv.heureFin.split(':').map(Number);
      const durationMinutes = (originalEnd[0] * 60 + originalEnd[1]) - (originalStart[0] * 60 + originalStart[1]);
      
      const newStartParts = newTime.split(':').map(Number);
      const newEndMinutes = newStartParts[0] * 60 + newStartParts[1] + durationMinutes;
      const newEndHour = Math.floor(newEndMinutes / 60) % 24;
      const newEndMin = newEndMinutes % 60;
      const newHeureFin = `${newEndHour.toString().padStart(2, '0')}:${newEndMin.toString().padStart(2, '0')}`;

      setIsCheckingDropConflict(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          date: newDate,
          heureDebut: newTime,
          heureFin: newHeureFin,
          excludeId: pendingDrop.rdv.id // Exclude the rdv being moved
        });
        
        const response = await axios.get(`${API_BASE_URL}/api/rdv/conflicts?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDropConflicts(response.data);
        setHasDropConflict(response.data.length > 0);
      } catch (error) {
        console.error('Error checking drop conflicts:', error);
        setDropConflicts([]);
        setHasDropConflict(false);
      } finally {
        setIsCheckingDropConflict(false);
      }
    };

    const debounce = setTimeout(checkDropConflict, 300);
    return () => clearTimeout(debounce);
  }, [showTimeDialog, newDate, newTime, pendingDrop]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
  };

  const goToToday = () => setCurrentDate(new Date());

  // Check if a specific hour on a date is indisponible
  const getIndispoForSlot = (dateStr: string, hour: number) => {
    return indisponibilites.filter(ind => {
      if (ind.date !== dateStr) return false;
      if (ind.journeeComplete) return true;
      const slotStart = hour * 60;
      const slotEnd = (hour + 1) * 60;
      const [indStartH, indStartM] = ind.heureDebut.split(':').map(Number);
      const [indEndH, indEndM] = ind.heureFin.split(':').map(Number);
      const indStart = indStartH * 60 + indStartM;
      const indEnd = indEndH * 60 + indEndM;
      return slotStart < indEnd && slotEnd > indStart;
    });
  };

  const isDayFullyIndisponible = (dateStr: string) => {
    return indisponibilites.some(ind => ind.date === dateStr && ind.journeeComplete);
  };

  const handleDragStart = (e: React.DragEvent, rdv: RDV) => {
    // Bloquer le drag pour les RDV créés depuis la page Commandes (synchronisés)
    if (rdv.commandeId) {
      e.preventDefault();
      toast.error("Ce rendez-vous ne peut pas être déplacé par la page Commandes");
      return;
    }
    setDraggedRdv(rdv);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', rdv.id);
  };

  const handleDragOver = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ date, hour });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, date: string, hour: number) => {
    e.preventDefault();
    if (draggedRdv) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      setPendingDrop({ rdv: draggedRdv, date, time: timeStr });
      setNewDate(date);
      setNewTime(timeStr);
      setDropConflicts([]);
      setHasDropConflict(false);
      setShowTimeDialog(true);
    }
    setDraggedRdv(null);
    setDropTarget(null);
  };

  const confirmTimeChange = () => {
    if (hasDropConflict) return; // Prevent if there's a conflict
    
    if (pendingDrop && onOpenFormWithDateTime) {
      // Ouvrir le formulaire avec les nouvelles valeurs pré-remplies
      onOpenFormWithDateTime(pendingDrop.rdv, newDate, newTime);
    } else if (pendingDrop) {
      // Fallback: mise à jour directe
      onRdvDrop(pendingDrop.rdv, newDate, newTime);
    }
    setShowTimeDialog(false);
    setPendingDrop(null);
    setDropConflicts([]);
    setHasDropConflict(false);
  };

  const handleRdvClick = (e: React.MouseEvent, rdv: RDV) => {
    e.stopPropagation();
    setSelectedRdvDetail(rdv);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    if (selectedRdvDetail) {
      setRdvToModify(selectedRdvDetail);
      setConfirmModifyOpen(true);
    }
  };

  const confirmModify = () => {
    if (rdvToModify) {
      onRdvClick(rdvToModify);
      setShowDetailModal(false);
    }
    setConfirmModifyOpen(false);
    setRdvToModify(null);
  };

  const handleDeleteFromDetail = () => {
    if (selectedRdvDetail) {
      setRdvToDelete(selectedRdvDetail);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = () => {
    if (rdvToDelete && onRdvDelete) {
      onRdvDelete(rdvToDelete);
      setShowDetailModal(false);
    }
    setConfirmDeleteOpen(false);
    setRdvToDelete(null);
  };

  const getRdvPosition = (rdv: RDV) => {
    const [startHour, startMin] = rdv.heureDebut.split(':').map(Number);
    const [endHour, endMin] = rdv.heureFin.split(':').map(Number);
    
    const top = ((startHour - 8) * 60 + startMin) * (60 / 60);
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60);
    
    return { top: `${top}px`, height: `${Math.max(height, 30)}px` };
  };

  return (
    <Card className="overflow-hidden border-primary/20 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">Planning de la semaine</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="border-blue-800 hover:bg-primary/10"
            >
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')} className="border-red-800">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[200px] text-center px-3 py-2 bg-primary/10 rounded-lg">
              {format(weekDays[0], 'd MMM', { locale: fr })} - {format(weekDays[6], 'd MMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')} className="border-green-800">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-primary/20">
            <div className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-primary/20 bg-muted/30">
              Heure
            </div>
            {weekDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isFullDayIndispo = isDayFullyIndisponible(dateStr);
              const hasPartialIndispo = !isFullDayIndispo && indisponibilites.some(ind => ind.date === dateStr);
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 text-center border-r border-primary/20 last:border-r-0 transition-colors relative",
                    isFullDayIndispo && "bg-red-500/20 dark:bg-red-900/30",
                    isSameDay(day, new Date()) && !isFullDayIndispo && "bg-gradient-to-b from-primary/20 to-primary/10"
                  )}
                >
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    isFullDayIndispo ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className={cn(
                    "text-2xl font-bold mt-1",
                    isFullDayIndispo ? "text-red-500" : isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  {isFullDayIndispo && (
                    <div className="flex items-center justify-center mt-1">
                      <CalendarOff className="w-3 h-3 text-red-500 mr-1" />
                      <span className="text-[9px] font-bold text-red-500">INDISPONIBLE</span>
                    </div>
                  )}
                  {hasPartialIndispo && (
                    <div className="flex items-center justify-center mt-1">
                      <Clock className="w-3 h-3 text-orange-500 mr-1" />
                      <span className="text-[9px] font-bold text-orange-500">Partiel</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-primary/10 h-[60px]">
                <div className="p-1 text-xs font-medium text-muted-foreground text-center border-r border-primary/20 flex items-start justify-center pt-1 bg-muted/20">
                  {hour}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isDropTarget = dropTarget?.date === dateStr && dropTarget?.hour === hour;
                  const slotIndispos = getIndispoForSlot(dateStr, hour);
                  const isIndispo = slotIndispos.length > 0;
                  
                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        "relative border-r border-primary/10 last:border-r-0 transition-all duration-200",
                        isIndispo 
                          ? "bg-red-500/15 dark:bg-red-900/25 cursor-not-allowed" 
                          : "cursor-pointer",
                        isDropTarget && !isIndispo && "bg-primary/30 ring-2 ring-primary ring-inset",
                        isSameDay(day, new Date()) && !isIndispo && "bg-primary/5"
                      )}
                      onClick={() => {
                        if (isIndispo) {
                          toast.error(`Créneau indisponible${slotIndispos[0]?.motif ? ` : ${slotIndispos[0].motif}` : ''}`);
                          return;
                        }
                        onSlotClick(dateStr, `${hour.toString().padStart(2, '0')}:00`);
                      }}
                      onDragOver={(e) => handleDragOver(e, dateStr, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateStr, hour)}
                    />
                  );
                })}
              </div>
            ))}

            {/* RDV Items */}
            {weekDays.map((day, dayIdx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayRdvs = rdvsByDay[dateStr] || [];
              
              return dayRdvs.map((rdv) => {
                const pos = getRdvPosition(rdv);
                const leftPercent = (dayIdx + 1) * (100 / 8);
                const widthPercent = 100 / 8 - 0.5;
                const colors = statusColors[rdv.statut] || statusColors.planifie;
                
                // Vérifier si ce RDV doit clignoter
                const isBlinking = blinkingRdvId === rdv.id;
                const showRedBlink = isBlinking && blinkCount % 2 === 0;
                
                // Vérifier si le RDV est créé depuis Commandes (non déplaçable)
                const isFromCommande = !!rdv.commandeId;
                
                return (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable={!isFromCommande}
                    onDragStart={(e) => handleDragStart(e as any, rdv)}
                    onClick={(e) => handleRdvClick(e, rdv)}
                    className={cn(
                      "absolute rounded-lg border-l-4 px-2 py-1.5",
                      isFromCommande ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                      "text-white text-xs overflow-hidden shadow-lg",
                      "transition-all duration-200 hover:shadow-xl hover:z-20 hover:scale-[1.02]",
                      showRedBlink ? "bg-gradient-to-r from-red-600 to-red-700 border-red-400" : colors.bg,
                      showRedBlink ? "border-red-400" : colors.border,
                      isBlinking && "z-30 scale-105"
                    )}
                    style={{
                      top: pos.top,
                      height: pos.height,
                      left: `calc(${leftPercent}% + 3px)`,
                      width: `calc(${widthPercent}% - 6px)`,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {isFromCommande ? (
                        <Lock className="h-3 w-3 opacity-60 flex-shrink-0" />
                      ) : (
                        <GripVertical className="h-3 w-3 opacity-60 flex-shrink-0" />
                      )}
                      <span className="font-semibold truncate">{rdv.titre}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 opacity-90">
                      <Clock className="h-2.5 w-2.5" />
                      <span className="text-[10px]">{rdv.heureDebut} - {rdv.heureFin}</span>
                    </div>
                    {rdv.clientNom && (
                      <div className="flex items-center gap-1 mt-0.5 opacity-90 truncate">
                        <User className="h-2.5 w-2.5" />
                        <span className="truncate text-[10px]">{rdv.clientNom}</span>
                      </div>
                    )}
                  </motion.div>
                );
              });
            })}
          </div>
        </div>
      </CardContent>

      {/* Time Change Dialog - Opens form with pre-filled date/time */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Modifier la date et l'horaire
            </DialogTitle>
            <DialogDescription>
              {pendingDrop?.rdv?.titre && (
                <span className="text-green-600 font-bold">
                  {pendingDrop.rdv.titre.toUpperCase()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {/* Conflict Alert */}
          {hasDropConflict && dropConflicts.length > 0 && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-bold">Cette horaire de cette date est déjà prise !</span>
                <div className="mt-2 space-y-1">
                  {dropConflicts.map(c => (
                    <div key={c.id} className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {c.titre} - {c.clientNom} ({c.heureDebut} - {c.heureFin})
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs">
                  Veuillez choisir une autre date ou un autre horaire.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Checking conflict indicator */}
          {isCheckingDropConflict && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Vérification de la disponibilité...
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newDate">Nouvelle date</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12 text-blue-800 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">Nouvelle heure de début</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-12 text-red-800 font-bold"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={confirmTimeChange} 
              disabled={hasDropConflict || isCheckingDropConflict}
              className={cn(
                "transition-all",
                hasDropConflict 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
            >
              {hasDropConflict ? (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Créneau non disponible
                </span>
              ) : (
                "Porter ce RDV"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RDV Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-primary/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={cn(
                "p-2 rounded-xl",
                selectedRdvDetail && (statusColors[selectedRdvDetail.statut]?.bg || statusColors.planifie.bg)
              )}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              {selectedRdvDetail?.titre}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRdvDetail && (
            <div className="space-y-4 py-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "text-white",
                    statusColors[selectedRdvDetail.statut]?.bg || statusColors.planifie.bg
                  )}
                >
                  {statusLabels[selectedRdvDetail.statut] || 'Inconnu'}
                </Badge>
              </div>

              {/* Client Info */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div className="font-semibold">{selectedRdvDetail.clientNom}</div>
                  </div>
                </div>
                {selectedRdvDetail.clientTelephone && (
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => {
                      setSelectedPhone(selectedRdvDetail.clientTelephone!);
                      setShowPhoneModal(true);
                    }}
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Téléphone</div>
                      <div className="font-semibold text-primary hover:underline cursor-pointer">
                        {selectedRdvDetail.clientTelephone}
                      </div>
                    </div>
                  </div>
                )}
                {selectedRdvDetail.lieu && (
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => {
                      setSelectedLocation(selectedRdvDetail.lieu!);
                      setShowLocationModal(true);
                    }}
                  >
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Lieu</div>
                      <div className="font-semibold text-primary hover:underline cursor-pointer">{selectedRdvDetail.lieu}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">
                      {format(parseISO(selectedRdvDetail.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Horaire</div>
                    <div className="font-semibold">
                      {selectedRdvDetail.heureDebut} - {selectedRdvDetail.heureFin}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedRdvDetail.description && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div>{selectedRdvDetail.description}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Fermer
            </Button>
            {/* Masquer supprimer/modifier pour les RDV créés depuis une réservation */}
            {!selectedRdvDetail?.commandeId && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteFromDetail}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
                <Button 
                  onClick={handleEditFromDetail}
                  className={cn(
                    "gap-2",
                    selectedRdvDetail?.statut === 'confirme'
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-primary to-primary/80"
                  )}
                  disabled={selectedRdvDetail?.statut === 'confirme'}
                  title={selectedRdvDetail?.statut === 'confirme' ? "Impossible de modifier un rendez-vous confirmé" : "Modifier le rendez-vous"}
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Modify Dialog */}
      <ConfirmDialog
        open={confirmModifyOpen}
        onOpenChange={setConfirmModifyOpen}
        title="Modifier le rendez-vous"
        description={`Êtes-vous sûr de vouloir modifier le rendez-vous "${rdvToModify?.titre}" ?`}
        confirmText="Modifier"
        cancelText="Annuler"
        onConfirm={confirmModify}
        variant="info"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Supprimer le rendez-vous"
        description={`Êtes-vous sûr de vouloir supprimer le rendez-vous "${rdvToDelete?.titre}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDelete}
        variant="danger"
      />

      {/* Phone Action Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-2xl border border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              {selectedPhone}
            </DialogTitle>
            <DialogDescription>Que souhaitez-vous faire avec ce numéro ?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => { window.location.href = `tel:${selectedPhone}`; setShowPhoneModal(false); }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Phone className="w-5 h-5" />
              Appeler ce numéro
            </Button>
            <Button
              onClick={() => {
                if (isMobile) {
                  window.location.href = `sms:${selectedPhone}`;
                } else {
                  window.open(`sms:${selectedPhone}`, '_blank');
                }
                setShowPhoneModal(false);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <User className="w-5 h-5" />
              Envoyer un SMS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Action Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-2xl border border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              Navigation
            </DialogTitle>
            <DialogDescription>Ouvrir l'adresse dans quelle application ?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation)}`, '_blank'); setShowLocationModal(false); }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              Google Maps
            </Button>
            <Button
              onClick={() => { window.open(`https://waze.com/ul?q=${encodeURIComponent(selectedLocation)}`, '_blank'); setShowLocationModal(false); }}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              Waze
            </Button>
            <Button
              onClick={() => { window.open(`https://maps.apple.com/?q=${encodeURIComponent(selectedLocation)}`, '_blank'); setShowLocationModal(false); }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              Apple Maps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RdvCalendar;