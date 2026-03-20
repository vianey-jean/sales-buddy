import { useState } from 'react';
import { Plus, Target, Edit2, Check, X, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useObjectif } from '@/hooks/useObjectif';
import { toast } from 'sonner';
import ObjectifStatsModal from './ObjectifStatsModal';
import { cn } from '@/lib/utils';

const ObjectifIndicator: React.FC = () => {
  const { data, loading, updateObjectif } = useObjectif();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newObjectif, setNewObjectif] = useState('');
  const [editValue, setEditValue] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProgressColor = () => {
    if (!data) return 'text-muted-foreground';
    
    const percentage = (data.totalVentesMois / data.objectif) * 100;
    
    if (percentage >= 100) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressGradient = () => {
    if (!data) return 'from-slate-500 to-slate-600';
    
    const percentage = (data.totalVentesMois / data.objectif) * 100;
    
    if (percentage >= 100) return 'from-emerald-500 to-teal-500';
    if (percentage >= 50) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-pink-500';
  };

  // Validation centralisée - retourne true si valide, false sinon
  const validateObjectif = (value: number): boolean => {
    // Vérification valeur valide
    if (isNaN(value) || value <= 0) {
      toast.error('Veuillez entrer une valeur valide');
      return false;
    }

    // Vérification: seule une augmentation stricte est autorisée (pas de diminution ni égalité)
    if (data && value <= data.objectif) {
      toast.error('L\'objectif doit être strictement supérieur à l\'actuel.');
      return false;
    }

    return true;
  };

  const handleAddObjectif = async () => {
    const value = parseFloat(newObjectif);
    
    // Validation centralisée avant tout appel API
    if (!validateObjectif(value)) {
      // Fermer la modal et réinitialiser
      setNewObjectif('');
      setIsDialogOpen(false);
      return;
    }

    // Si la valeur est égale à l'actuel, rien à faire
    if (data && value === data.objectif) {
      setNewObjectif('');
      setIsDialogOpen(false);
      return;
    }

    try {
      await updateObjectif(value);
      setNewObjectif('');
      setIsDialogOpen(false);
      toast.success('Objectif mis à jour');
    } catch (error: any) {
      // Fermer la modal en cas d'erreur aussi
      setNewObjectif('');
      setIsDialogOpen(false);
      if (error?.response?.data?.message === 'OBJECTIF_MUST_INCREASE') {
        toast.error('On ne peut pas baisser un objectif.');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  const handleEditStart = () => {
    if (data) {
      setEditValue(data.objectif.toString());
      setIsEditing(true);
    }
  };

  const handleEditSave = async () => {
    const value = parseFloat(editValue);
    
    // Validation centralisée avant tout appel API
    if (!validateObjectif(value)) {
      // Annuler le mode édition immédiatement
      setIsEditing(false);
      setEditValue('');
      return;
    }

    // Si la valeur est égale à l'actuel, juste fermer l'édition
    if (data && value === data.objectif) {
      setIsEditing(false);
      setEditValue('');
      return;
    }

    try {
      await updateObjectif(value);
      setIsEditing(false);
      setEditValue('');
      toast.success('Objectif mis à jour');
    } catch (error: any) {
      // Annuler le mode édition en cas d'erreur
      setIsEditing(false);
      setEditValue('');
      if (error?.response?.data?.message === 'OBJECTIF_MUST_INCREASE') {
        toast.error('On ne peut pas baisser un objectif.');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200/30 dark:border-violet-800/30 animate-pulse">
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (!data) return null;

  const percentage = Math.round((data.totalVentesMois / data.objectif) * 100);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-950 border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-violet-500/5 backdrop-blur-xl">
      {/* Icon */}
     
      {/* Total Ventes */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:block">
          Ventes
        </span>
        <span className={cn("font-bold text-sm", getProgressColor())}>
          {formatCurrency(data.totalVentesMois)}
        </span>
      </div>
      
      {/* Separator */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
      
      {/* Objectif - Editable */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:block">
          Objectif
        </span>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="font-bold h-7 w-20 text-xs px-2 rounded-lg"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={handleEditSave}
            >
              <Check className="h-3 w-3 text-emerald-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20"
              onClick={handleEditCancel}
            >
              <X className="h-3 w-3 text-rose-500" />
            </Button>
          </div>
        ) : (
          <button
            onClick={handleEditStart}
            className="font-bold text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer flex items-center gap-1 transition-colors"
          >
            {formatCurrency(data.objectif)}
            <Edit2 className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>

      {/* Mini Progress */}
      {/* <div className="hidden md:flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {percentage}%
        </span>
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", getProgressGradient())}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div> */}

      {/* Stats Modal Button */}
     
      
      {/* Add New Objectif Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:scale-110"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-slate-50 to-violet-50/50 dark:from-[#030014] dark:via-[#0a0020] dark:to-[#0e0030] border border-violet-200/20 dark:border-violet-800/20 rounded-2xl shadow-[0_30px_80px_-20px_rgba(139,92,246,0.2)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-bold">
                Nouvel Objectif du Mois
              </span>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Objectif de ventes (€)
              </label>
              <Input
                type="number"
                placeholder="Ex: 2000"
                value={newObjectif}
                onChange={(e) => setNewObjectif(e.target.value)}
                className="text-lg h-12 rounded-xl border-slate-200/50 dark:border-slate-700/50 focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
            
            <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Objectif actuel: <strong className="text-violet-600 dark:text-violet-400">{formatCurrency(data.objectif)}</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ventes ce mois: <strong className={getProgressColor()}>{formatCurrency(data.totalVentesMois)}</strong>
              </p>
            </div>
            
            <Button 
              onClick={handleAddObjectif} 
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Target className="mr-2 h-5 w-5" />
              Définir l'objectif
            </Button>
          </div>
        </DialogContent>
      </Dialog>
       <ObjectifStatsModal />
    </div>
  );
};

export default ObjectifIndicator;
