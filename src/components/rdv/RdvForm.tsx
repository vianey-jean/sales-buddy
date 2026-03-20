import React, { useState, useEffect, useCallback } from 'react';
import { RDV, RDVFormData } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Calendar, CalendarOff, Clock, User, MapPin, Phone, Search, CheckCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { cn } from '@/lib/utils';
import indisponibleApi from '@/services/api/indisponibleApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface RdvFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RDVFormData) => Promise<void>;
  rdv?: RDV | null;
  defaultDate?: string;
  defaultTime?: string;
  conflicts?: RDV[];
  viewOnly?: boolean;
}

const RdvForm: React.FC<RdvFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rdv,
  defaultDate,
  defaultTime,
  conflicts = [],
  viewOnly = false,
}) => {
  const [formData, setFormData] = useState<RDVFormData>({
    titre: '',
    description: '',
    clientNom: '',
    clientTelephone: '',
    clientAdresse: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    heureDebut: defaultTime || '09:00',
    heureFin: '10:00',
    lieu: '',
    statut: 'planifie',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client search
  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [noClientFound, setNoClientFound] = useState(false);

  // Conflict checking
  const [timeConflicts, setTimeConflicts] = useState<RDV[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  // Indisponibilité checking
  const [isIndisponible, setIsIndisponible] = useState(false);
  const [indispoMessage, setIndispoMessage] = useState('');

  useEffect(() => {
    if (rdv) {
      setFormData({
        titre: rdv.titre,
        description: rdv.description || '',
        clientNom: rdv.clientNom,
        clientTelephone: rdv.clientTelephone || '',
        clientAdresse: rdv.clientAdresse || '',
        date: defaultDate || rdv.date,
        heureDebut: defaultTime || rdv.heureDebut,
        heureFin: defaultTime ? addHour(defaultTime) : rdv.heureFin,
        lieu: rdv.lieu || '',
        statut: rdv.statut,
      });
      setClientSearch(rdv.clientNom);
      setSelectedClient({
        id: '',
        nom: rdv.clientNom,
        phone: rdv.clientTelephone || '',
        adresse: rdv.clientAdresse || ''
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        clientNom: '',
        clientTelephone: '',
        clientAdresse: '',
        date: defaultDate || new Date().toISOString().split('T')[0],
        heureDebut: defaultTime || '09:00',
        heureFin: defaultTime ? addHour(defaultTime) : '10:00',
        lieu: '',
        statut: 'planifie',
      });
      setClientSearch('');
      setSearchResults([]);
      setSelectedClient(null);
    }
  }, [rdv, defaultDate, defaultTime, isOpen]);

  // Search clients when typing
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length < 3) {
        setSearchResults([]);
        setShowResults(false);
        setNoClientFound(false);
        return;
      }

      if (selectedClient && selectedClient.nom === clientSearch) {
        return; // Don't search if we already selected this client
      }

      setIsSearching(true);
      setNoClientFound(false);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/rdv/search-clients`, {
          params: { q: clientSearch },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(response.data);
        setShowResults(response.data.length > 0);
        setNoClientFound(response.data.length === 0);
      } catch (error) {
        console.error('Error searching clients:', error);
        setSearchResults([]);
        setNoClientFound(true);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchClients, 300);
    return () => clearTimeout(debounce);
  }, [clientSearch, selectedClient]);

  // Check for time conflicts and indisponibilité when date, heureDebut, or heureFin changes
  useEffect(() => {
    const checkTimeConflict = async () => {
      if (!formData.date || !formData.heureDebut || !formData.heureFin) {
        setTimeConflicts([]);
        setHasConflict(false);
        setIsIndisponible(false);
        return;
      }

      setIsCheckingConflict(true);
      try {
        // Check indisponibilité
        const indispoResult = await indisponibleApi.checkDisponibilite(formData.date, formData.heureDebut, formData.heureFin);
        if (!indispoResult.disponible) {
          setIsIndisponible(true);
          const indispo = indispoResult.indisponibilites[0];
          setIndispoMessage(
            indispo?.journeeComplete
              ? `Cette journée est marquée comme indisponible${indispo.motif ? ` (${indispo.motif})` : ''}`
              : `Créneau indisponible: ${indispo?.heureDebut} - ${indispo?.heureFin}${indispo?.motif ? ` (${indispo.motif})` : ''}`
          );
        } else {
          setIsIndisponible(false);
          setIndispoMessage('');
        }

        // Check RDV conflicts
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          date: formData.date,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
        });
        if (rdv?.id) {
          params.append('excludeId', rdv.id);
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/rdv/conflicts?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTimeConflicts(response.data);
        setHasConflict(response.data.length > 0);
      } catch (error) {
        console.error('Error checking conflicts:', error);
        setTimeConflicts([]);
        setHasConflict(false);
      } finally {
        setIsCheckingConflict(false);
      }
    };

    const debounce = setTimeout(checkTimeConflict, 300);
    return () => clearTimeout(debounce);
  }, [formData.date, formData.heureDebut, formData.heureFin, rdv?.id]);

  function addHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const handleChange = (field: keyof RDVFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-fill heureFin when heureDebut changes
      if (field === 'heureDebut' && value) {
        updated.heureFin = addHour(value);
      }
      return updated;
    });
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.nom);
    setFormData(prev => ({
      ...prev,
      clientNom: client.nom,
      clientTelephone: client.phone,
      clientAdresse: client.adresse,
      lieu: client.adresse, // Auto-fill lieu with address
    }));
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    if (!formData.titre.trim() || !formData.clientNom.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {viewOnly ? 'Détails du rendez-vous' : rdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </span>
            {!viewOnly && <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />}
          </DialogTitle>
        </DialogHeader>

        {/* Real-time conflict detection */}
        <AnimatePresence>
          {hasConflict && timeConflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-bold">Cette horaire de cette date est déjà prise !</span>
                  <div className="mt-2 space-y-1">
                    {timeConflicts.map(c => (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indisponibilité warning */}
        <AnimatePresence>
          {isIndisponible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="mb-4 border-orange-500/50 bg-orange-500/10">
                <CalendarOff className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-bold">🚫 Jour / créneau indisponible !</span>
                  <div className="mt-1 text-sm">{indispoMessage}</div>
                  <div className="mt-1 text-xs">Veuillez choisir une autre date ou un autre horaire.</div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checking conflict indicator */}
        {isCheckingConflict && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Vérification de la disponibilité...
          </div>
        )}

        {conflicts.length > 0 && (
          <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Attention : {conflicts.length} conflit(s) détecté(s) sur ce créneau !
              {conflicts.map(c => (
                <div key={c.id} className="text-sm mt-1 font-medium">
                  • {c.titre} ({c.heureDebut} - {c.heureFin})
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="titre" className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Titre du rendez-vous *
            </Label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => handleChange('titre', e.target.value)}
              placeholder="Ex: Livraison perruque, Consultation..."
              className="h-12 text-base border-primary/20 focus:border-primary/50 bg-background/50"
              required
              disabled={viewOnly}
            />
          </div>

          {/* Client Search */}
          <div className="space-y-2 relative">
            <Label htmlFor="clientSearch" className="text-sm font-semibold flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              Rechercher un client * <span className="text-xs text-muted-foreground font-normal">(min. 3 caractères)</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="clientSearch"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setSelectedClient(null);
                  setFormData(prev => ({
                    ...prev,
                    clientNom: e.target.value,
                    clientTelephone: '',
                    clientAdresse: '',
                  }));
                }}
                placeholder="Tapez le nom du client..."
                className="h-12 pl-10 text-base border-primary/20 focus:border-primary/50 bg-background/50"
                required
                disabled={viewOnly}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* No client found notification */}
            <AnimatePresence>
              {noClientFound && clientSearch.length >= 3 && !selectedClient && !viewOnly && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
                >
                  <p className="text-destructive font-bold text-sm">
                    Aucun client trouvé sur "{clientSearch}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && !viewOnly && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-1 bg-background border border-primary/20 rounded-xl shadow-xl overflow-hidden"
                >
                  {searchResults.map((client, index) => (
                    <motion.button
                      key={client.id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleClientSelect(client)}
                      className="w-full p-4 text-left hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0"
                    >
                      <div className="font-semibold text-foreground">{client.nom}</div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3" />
                          {client.adresse}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Client Info */}
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-400">Client sélectionné</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedClient.nom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedClient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{selectedClient.adresse}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="h-12 border-primary/20 focus:border-primary/50 bg-background/50"
                required
                disabled={viewOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heureDebut" className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Début *
              </Label>
              <Input
                id="heureDebut"
                type="time"
                value={formData.heureDebut}
                onChange={(e) => handleChange('heureDebut', e.target.value)}
                className="h-12 border-primary/20 focus:border-primary/50 bg-background/50"
                required
                disabled={viewOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heureFin" className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Fin *
              </Label>
              <Input
                id="heureFin"
                type="time"
                value={formData.heureFin}
                onChange={(e) => handleChange('heureFin', e.target.value)}
                className="h-12 border-primary/20 focus:border-primary/50 bg-background/50"
                required
                disabled={viewOnly}
              />
            </div>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="lieu" className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Lieu du rendez-vous
            </Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => handleChange('lieu', e.target.value)}
              placeholder="Adresse ou lieu du rendez-vous"
              className="h-12 border-primary/20 focus:border-primary/50 bg-background/50"
              disabled={viewOnly}
            />
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="statut" className="text-sm font-semibold">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => handleChange('statut', value as RDVFormData['statut'])}
              disabled={viewOnly}
            >
              <SelectTrigger className="h-12 border-primary/20 focus:border-primary/50 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planifie">📅 Planifié</SelectItem>
                <SelectItem value="confirme">✅ Confirmé</SelectItem>
                <SelectItem value="annule">❌ Annulé</SelectItem>
                <SelectItem value="termine">✔️ Terminé</SelectItem>
                <SelectItem value="reporte">🔄 Reporté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Détails du rendez-vous..."
              rows={3}
              className="border-primary/20 focus:border-primary/50 bg-background/50 resize-none"
              disabled={viewOnly}
            />
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6"
            >
              {viewOnly ? 'Fermer' : 'Annuler'}
            </Button>
            {!viewOnly && (
              <Button 
                type="submit" 
                disabled={isSubmitting || hasConflict || isIndisponible || isCheckingConflict}
                className={cn(
                  "h-12 px-8 shadow-lg transition-all",
                  (hasConflict || isIndisponible)
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </span>
                ) : (hasConflict || isIndisponible) ? (
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Créneau non disponible
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {rdv ? 'Modifier' : 'Créer le rendez-vous'}
                  </span>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RdvForm;