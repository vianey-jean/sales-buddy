import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Clock, ListChecks, StickyNote, ChevronDown, ChevronUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import moduleSettingsApi, { ModuleSettings } from '@/services/api/moduleSettingsApi';
import parametresApi from '@/services/api/parametresApi';

const ModuleSettingsSection: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ModuleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    commandes: false,
    pointage: false,
    taches: false,
    notes: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await moduleSettingsApi.getAll();
      setSettings(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const updateModule = async (module: string, key: string, value: any) => {
    if (!settings) return;
    const updated = { ...settings, [module]: { ...settings[module as keyof ModuleSettings], [key]: value } };
    setSettings(updated);
    try {
      await moduleSettingsApi.updateModule(module, updated[module as keyof ModuleSettings]);
      
      // Sync prix to prixpointage.json
      if (module === 'pointage' && (key === 'defaultPrixHeure' || key === 'defaultPrixJournalier')) {
        const prixData: any = {};
        if (key === 'defaultPrixHeure') prixData.prixHeure = value;
        if (key === 'defaultPrixJournalier') prixData.prixJournalier = value;
        await parametresApi.updatePrixPointage(prixData);
      }
      
      // Sync tache settings to parametretache.json
      if (module === 'taches' && (key === 'autoCompleteOnDone' || key === 'showCompletedTasks')) {
        const tacheData: any = {};
        if (key === 'autoCompleteOnDone') tacheData.autoCompleteOnDone = value;
        if (key === 'showCompletedTasks') tacheData.tachesTerminees = value;
        await parametresApi.updateParametreTache(tacheData);
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    }
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${value ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-muted'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, sectionKey, color }: { icon: any; title: string; sectionKey: string; color: string }) => (
    <button
      onClick={() => setExpanded(p => ({ ...p, [sectionKey]: !p[sectionKey] }))}
      className="w-full flex items-center justify-between py-3 group"
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {expanded[sectionKey] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
     

      {/* Pointage */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
        <SectionHeader icon={Clock} title="Pointage" sectionKey="pointage" color="from-emerald-500 to-teal-500" />
        {expanded.pointage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pl-10">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">Prix/heure par défaut (€)</span>
              <Input
                type="number"
                step="0.5"
                value={settings.pointage.defaultPrixHeure}
                onChange={e => updateModule('pointage', 'defaultPrixHeure', parseFloat(e.target.value) || 0)}
                className="w-24 h-8 rounded-lg text-sm text-right"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground">Prix journalier par défaut (€)</span>
              <Input
                type="number"
                step="1"
                value={settings.pointage.defaultPrixJournalier}
                onChange={e => updateModule('pointage', 'defaultPrixJournalier', parseFloat(e.target.value) || 0)}
                className="w-24 h-8 rounded-lg text-sm text-right"
              />
            </div>
            <Toggle label="Arrondir les heures" value={settings.pointage.arrondiHeures} onChange={v => updateModule('pointage', 'arrondiHeures', v)} />
          </motion.div>
        )}
      </div>

      {/* Tâches */}
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
        <SectionHeader icon={ListChecks} title="Tâches" sectionKey="taches" color="from-amber-500 to-orange-500" />
        {expanded.taches && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 pl-10">
            <Toggle label="Marquer terminée automatiquement" value={settings.taches.autoCompleteOnDone} onChange={v => updateModule('taches', 'autoCompleteOnDone', v)} />
            <Toggle label="Afficher les tâches terminées" value={settings.taches.showCompletedTasks} onChange={v => updateModule('taches', 'showCompletedTasks', v)} />
          </motion.div>
        )}
      </div>

     
    </div>
  );
};

export default ModuleSettingsSection;
