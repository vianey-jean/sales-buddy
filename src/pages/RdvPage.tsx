/**
 * =============================================================================
 * RdvPage - Page de gestion des rendez-vous
 * =============================================================================
 * 
 * Utilise des composants extraits pour le hero, stats, recherche et liste.
 * 
 * @module RdvPage
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RdvCalendar, RdvForm } from '@/components/rdv';
import RdvStatsDetailsModal from '@/components/rdv/RdvStatsDetailsModal';
import { ConfirmDialog } from '@/components/shared';
import { useRdv } from '@/hooks/useRdv';
import { RDV, RDVFormData } from '@/types/rdv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, List } from 'lucide-react';
import { parseISO, isSameMonth } from 'date-fns';
import PremiumLoading from '@/components/ui/premium-loading';

// Composants extraits
import { RdvHero, RdvPageStatsCards, RdvSearchBar, RdvListView } from '@/pages/rdv';

const ITEMS_PER_PAGE = 20;

const RdvPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { rdvs, loading, createRdv, updateRdv, deleteRdv, markAsNotified, checkConflicts } = useRdv();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RDV | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rdvToDelete, setRdvToDelete] = useState<RDV | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();
  const [conflicts, setConflicts] = useState<RDV[]>([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Pour le highlight du RDV depuis les notifications
  const [highlightRdvId, setHighlightRdvId] = useState<string | null>(null);
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
 
  // Stats modal state
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsModalTitle, setStatsModalTitle] = useState('');
  const [statsModalRdvs, setStatsModalRdvs] = useState<RDV[]>([]);
  const [statsModalColor, setStatsModalColor] = useState('from-primary to-primary');

  // Gérer les params URL pour highlight du RDV depuis notification
  useEffect(() => {
    const rdvIdToHighlight = searchParams.get('highlightRdv');
    const dateToHighlight = searchParams.get('date');
    if (rdvIdToHighlight) {
      setHighlightRdvId(rdvIdToHighlight);
      setHighlightDate(dateToHighlight);
      setActiveTab('calendar');
    }
  }, [searchParams]);

  // Callback quand le highlight est terminé
  const handleHighlightComplete = useCallback(() => {
    setHighlightRdvId(null);
    setHighlightDate(null);
    searchParams.delete('highlightRdv');
    searchParams.delete('date');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Stats du mois en cours
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonthOnly = rdvs.filter(rdv => isSameMonth(parseISO(rdv.date), now));
    return {
      today: currentMonthOnly.filter(r => r.date === today).length,
      confirmed: currentMonthOnly.filter(r => r.statut === 'confirme').length,
      pending: currentMonthOnly.filter(r => r.statut === 'planifie').length,
      cancelled: currentMonthOnly.filter(r => r.statut === 'annule').length,
      total: currentMonthOnly.length,
    };
  }, [rdvs]);

  // RDV du mois en cours (exclure annulés)
  const currentMonthRdvs = useMemo(() => {
    const now = new Date();
    return rdvs
      .filter(rdv => isSameMonth(parseISO(rdv.date), now) && rdv.statut !== 'annule')
      .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut));
  }, [rdvs]);

  // Suggestions de recherche
  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 3) return [];
    const query = searchQuery.toLowerCase();
    return currentMonthRdvs.filter(rdv =>
      rdv.titre.toLowerCase().includes(query) || rdv.clientNom.toLowerCase().includes(query) ||
      rdv.description?.toLowerCase().includes(query) || rdv.lieu?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [currentMonthRdvs, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(currentMonthRdvs.length / ITEMS_PER_PAGE);
  const paginatedRdvs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentMonthRdvs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentMonthRdvs, currentPage]);

  // RDV d'aujourd'hui, en attente et tous du mois (pour les modales stats)
  const todayRdvs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rdvs.filter(r => r.date === today && r.statut !== 'annule');
  }, [rdvs]);

  const pendingRdvsForStats = useMemo(() => {
    const now = new Date();
    return rdvs.filter(r => isSameMonth(parseISO(r.date), now) && r.statut === 'planifie');
  }, [rdvs]);

  const allMonthRdvs = useMemo(() => {
    const now = new Date();
    return rdvs.filter(r => isSameMonth(parseISO(r.date), now))
      .sort((a, b) => a.date.localeCompare(b.date) || a.heureDebut.localeCompare(b.heureDebut));
  }, [rdvs]);

  // Handlers
  const handleOpenForm = useCallback((rdv?: RDV, date?: string, time?: string) => {
    setSelectedRdv(rdv || null);
    setDefaultDate(date);
    setDefaultTime(time);
    setConflicts([]);
    setIsFormOpen(true);
    setShowSearchSuggestions(false);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedRdv(null);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setConflicts([]);
  }, []);

  const handleSubmit = useCallback(async (data: RDVFormData) => {
    const existingConflicts = await checkConflicts(data.date, data.heureDebut, data.heureFin, selectedRdv?.id);
    if (existingConflicts.length > 0) setConflicts(existingConflicts);
    if (selectedRdv) await updateRdv(selectedRdv.id, data);
    else await createRdv(data);
    handleCloseForm();
  }, [selectedRdv, updateRdv, createRdv, checkConflicts, handleCloseForm]);

  const handleDelete = useCallback(async () => {
    if (rdvToDelete) { await deleteRdv(rdvToDelete.id); setDeleteDialogOpen(false); setRdvToDelete(null); }
  }, [rdvToDelete, deleteRdv]);

  const confirmDelete = useCallback((rdv: RDV) => { setRdvToDelete(rdv); setDeleteDialogOpen(true); }, []);

  const handleRdvDrop = useCallback(async (rdv: RDV, newDate: string, newTime: string) => {
    const [startH, startM] = rdv.heureDebut.split(':').map(Number);
    const [endH, endM] = rdv.heureFin.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    const [newH, newM] = newTime.split(':').map(Number);
    const newEndMinutes = newH * 60 + newM + durationMinutes;
    const newEndH = Math.floor(newEndMinutes / 60);
    const newEndMCalc = newEndMinutes % 60;
    const newHeureFin = `${newEndH.toString().padStart(2, '0')}:${newEndMCalc.toString().padStart(2, '0')}`;
    await updateRdv(rdv.id, { date: newDate, heureDebut: newTime, heureFin: newHeureFin });
  }, [updateRdv]);

  const handleSuggestionClick = (rdv: RDV) => {
    handleOpenForm(rdv);
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  // Handler pour ouvrir la modale stats
  const handleOpenStatsModal = useCallback((type: 'today' | 'month' | 'pending' | 'total') => {
    const configs = {
      today: { title: "Rendez-vous d'aujourd'hui", rdvs: todayRdvs, color: 'from-blue-500 to-blue-600' },
      month: { title: 'Rendez-vous ce mois', rdvs: currentMonthRdvs, color: 'from-emerald-500 to-emerald-600' },
      pending: { title: 'Rendez-vous en attente', rdvs: pendingRdvsForStats, color: 'from-amber-500 to-orange-500' },
      total: { title: 'Total du mois', rdvs: allMonthRdvs, color: 'from-purple-500 to-purple-600' },
    };
    const config = configs[type];
    setStatsModalTitle(config.title);
    setStatsModalRdvs(config.rdvs);
    setStatsModalColor(config.color);
    setStatsModalOpen(true);
  }, [todayRdvs, currentMonthRdvs, pendingRdvsForStats, allMonthRdvs]);

  const handleStatsModalRdvClick = useCallback((rdv: RDV) => {
    setStatsModalOpen(false);
    handleOpenForm(rdv);
  }, [handleOpenForm]);

  const statusColors: Record<string, string> = {
    planifie: 'bg-blue-500', confirme: 'bg-green-500', annule: 'bg-red-500', termine: 'bg-gray-500',
  };
  const statusLabels: Record<string, string> = {
    planifie: 'Planifié', confirme: 'Confirmé', annule: 'Annulé', termine: 'Terminé',
  };

  if (loading) {
    if (embedded) return <PremiumLoading text="Chargement des rendez-vous..." size="xl" variant="dashboard" />;
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20">
          <PremiumLoading text="Chargement des rendez-vous..." size="xl" variant="dashboard" />
        </div>
      </Layout>
    );
  }

  const content = (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-purple-950/30 dark:to-indigo-950/50">
        {/* Hero */}
        <RdvHero onNewRdv={() => handleOpenForm()} />

        <div className="max-w-7xl mx-auto px-4 pb-8">
          {/* Stats Cards */}
          <RdvPageStatsCards stats={stats} currentMonthCount={currentMonthRdvs.length} onOpenModal={handleOpenStatsModal} />

          {/* Search Bar */}
          <RdvSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showSearchSuggestions={showSearchSuggestions}
            setShowSearchSuggestions={setShowSearchSuggestions}
            searchSuggestions={searchSuggestions}
            statusColors={statusColors}
            statusLabels={statusLabels}
            onSuggestionClick={handleSuggestionClick}
            onEditRdv={(rdv) => handleOpenForm(rdv)}
            onDeleteRdv={(rdv) => { confirmDelete(rdv); setShowSearchSuggestions(false); }}
          />

          {/* Tabs: Calendar / List */}
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Liste ({currentMonthRdvs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <RdvCalendar
                rdvs={rdvs}
                onRdvClick={(rdv) => handleOpenForm(rdv)}
                onSlotClick={(date, time) => handleOpenForm(undefined, date, time)}
                onRdvDrop={handleRdvDrop}
                onRdvDelete={confirmDelete}
                highlightRdvId={highlightRdvId}
                highlightDate={highlightDate}
                onHighlightComplete={handleHighlightComplete}
              />
            </TabsContent>

            <TabsContent value="list">
              <RdvListView
                paginatedRdvs={paginatedRdvs}
                currentMonthTotal={currentMonthRdvs.length}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                statusColors={statusColors}
                statusLabels={statusLabels}
                onPageChange={setCurrentPage}
                onRdvClick={(rdv) => handleOpenForm(rdv)}
                onEditRdv={(rdv) => handleOpenForm(rdv)}
                onDeleteRdv={confirmDelete}
                onNewRdv={() => handleOpenForm()}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Form Dialog */}
        <RdvForm isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={handleSubmit} rdv={selectedRdv} defaultDate={defaultDate} defaultTime={defaultTime} conflicts={conflicts} />

        {/* Delete Confirmation */}
        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Supprimer le rendez-vous" description={`Êtes-vous sûr de vouloir supprimer le rendez-vous "${rdvToDelete?.titre}" ? Cette action est irréversible.`} confirmText="Supprimer" cancelText="Annuler" onConfirm={handleDelete} variant="danger" />

        {/* Stats Details Modal */}
        <RdvStatsDetailsModal isOpen={statsModalOpen} onClose={() => setStatsModalOpen(false)} title={statsModalTitle} rdvs={statsModalRdvs} onRdvClick={handleStatsModalRdvClick} accentColor={statsModalColor} />
      </div>
    </>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default RdvPage;
