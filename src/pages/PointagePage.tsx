import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import entrepriseApi, { Entreprise } from '@/services/api/entrepriseApi';
import pointageApi, { PointageEntry } from '@/services/api/pointageApi';
import travailleurApi, { Travailleur } from '@/services/api/travailleurApi';

import PointageTabNav from '@/components/pointage/PointageTabNav';
import PointageHero from '@/components/pointage/PointageHero';
import PointageCalendar from '@/components/pointage/PointageCalendar';
import PointageEntreprisesList from '@/components/pointage/PointageEntreprisesList';
import PointageTravailleursList from '@/components/pointage/PointageTravailleursList';
import EntrepriseModal from '@/components/pointage/modals/EntrepriseModal';
import TravailleurModal from '@/components/pointage/modals/TravailleurModal';
import PointageFormModal from '@/components/pointage/modals/PointageFormModal';
import DayDetailModal from '@/components/pointage/modals/DayDetailModal';
import EditPointageModal from '@/components/pointage/modals/EditPointageModal';
import ParPersonneModal from '@/components/pointage/modals/ParPersonneModal';
import YearlyTotalModal from '@/components/pointage/modals/YearlyTotalModal';
import MonthDetailModal from '@/components/pointage/modals/MonthDetailModal';
import PointageConfirmDialogs from '@/components/pointage/modals/PointageConfirmDialogs';
import AvanceModal from '@/components/pointage/modals/AvanceModal';
import TacheView from '@/components/tache/TacheView';
import NotesKanbanView from '@/components/notes/NotesKanbanView';
import ShareLinkModal from '@/components/shared/ShareLinkModal';
const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";
const mirrorShine = "absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500";

const PointagePage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pointage' | 'tache' | 'notes'>('pointage');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [pointages, setPointages] = useState<PointageEntry[]>([]);
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showEntrepriseModal, setShowEntrepriseModal] = useState(false);
  const [showPointageModal, setShowPointageModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTravailleurModal, setShowTravailleurModal] = useState(false);
  const [showParPersonneModal, setShowParPersonneModal] = useState(false);
  const [showYearlyModal, setShowYearlyModal] = useState(false);
  const [showAvanceModal, setShowAvanceModal] = useState(false);
  const [showMonthDetailModal, setShowMonthDetailModal] = useState(false);
  const [showSharePointageModal, setShowSharePointageModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingPointage, setEditingPointage] = useState<PointageEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editConfirm, setEditConfirm] = useState(false);

  // Yearly
  const [yearlyPointages, setYearlyPointages] = useState<PointageEntry[]>([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  // Forms
  const [entForm, setEntForm] = useState({ nom: '', adresse: '', typePaiement: 'journalier' as 'journalier' | 'horaire', prix: '' });
  const [ptForm, setPtForm] = useState({ date: new Date().toISOString().split('T')[0], entrepriseId: '', heures: '', prixJournalier: '', travailleurId: '', travailleurNom: '' });
  const [travForm, setTravForm] = useState({ nom: '', prenom: '', adresse: '', phone: '', genre: 'homme' as 'homme' | 'femme', role: 'autre' as 'administrateur' | 'autre' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [entRes, ptRes, travRes] = await Promise.all([
        entrepriseApi.getAll(),
        pointageApi.getByMonth(year, month + 1),
        travailleurApi.getAll()
      ]);
      setEntreprises(entRes.data);
      setPointages(ptRes.data);
      setTravailleurs(travRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getMonthTotal = () => pointages.reduce((sum, p) => sum + p.montantTotal, 0);

  // Entreprise
  const handleAddEntreprise = async () => {
    if (!entForm.nom || !entForm.prix) {
      toast({ title: 'Erreur', description: 'Nom et prix requis', variant: 'destructive' });
      return;
    }
    try {
      await entrepriseApi.create({ nom: entForm.nom, adresse: entForm.adresse, typePaiement: entForm.typePaiement, prix: parseFloat(entForm.prix) });
      toast({ title: '✅ Entreprise ajoutée' });
      setEntForm({ nom: '', adresse: '', typePaiement: 'journalier', prix: '' });
      setShowEntrepriseModal(false);
      fetchData();
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'ajouter", variant: 'destructive' });
    }
  };

  // Travailleur
  const handleAddTravailleur = async () => {
    if (!travForm.nom || !travForm.prenom) {
      toast({ title: 'Erreur', description: 'Nom et prénom requis', variant: 'destructive' });
      return;
    }
    try {
      await travailleurApi.create(travForm);
      toast({ title: '✅ Travailleur ajouté', description: `${travForm.prenom} ${travForm.nom}` });
      setTravForm({ nom: '', prenom: '', adresse: '', phone: '', genre: 'homme', role: 'autre' });
      setShowTravailleurModal(false);
      fetchData();
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'ajouter", variant: 'destructive' });
    }
  };

  // Pointage
  const handleAddPointage = async () => {
    if (!ptForm.date || !ptForm.entrepriseId) {
      toast({ title: 'Erreur', description: 'Date et entreprise requis', variant: 'destructive' });
      return;
    }
    const ent = entreprises.find(e => e.id === ptForm.entrepriseId);
    if (!ent) return;

    let montantTotal = 0, heures = 0, prixJournalier = 0, prixHeure = 0;

    if (ent.typePaiement === 'journalier') {
      prixJournalier = ptForm.prixJournalier ? parseFloat(ptForm.prixJournalier) : ent.prix;
      montantTotal = prixJournalier;
    } else {
      heures = ptForm.heures ? parseFloat(ptForm.heures) : 0;
      prixHeure = ent.prix;
      montantTotal = heures * prixHeure;
    }

    try {
      await pointageApi.create({
        date: ptForm.date,
        entrepriseId: ent.id,
        entrepriseNom: ent.nom,
        typePaiement: ent.typePaiement,
        heures, prixJournalier, prixHeure, montantTotal,
        travailleurId: ptForm.travailleurId || '',
        travailleurNom: ptForm.travailleurNom || ''
      } as any);
      toast({ title: '✅ Pointage enregistré', description: `${ent.nom} - ${montantTotal.toFixed(2)}€` });
      setPtForm({ date: new Date().toISOString().split('T')[0], entrepriseId: '', heures: '', prixJournalier: '', travailleurId: '', travailleurNom: '' });
      setShowPointageModal(false);
      fetchData();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleDeletePointage = async (id: string) => {
    try {
      await pointageApi.delete(id);
      toast({ title: '✅ Pointage supprimé' });
      setDeleteConfirm(null);
      fetchData();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleEditPointage = async () => {
    if (!editingPointage) return;
    try {
      let montantTotal = editingPointage.montantTotal;
      if (editingPointage.typePaiement === 'journalier') {
        montantTotal = editingPointage.prixJournalier;
      } else {
        montantTotal = editingPointage.heures * editingPointage.prixHeure;
      }
      await pointageApi.update(editingPointage.id, { ...editingPointage, montantTotal });
      toast({ title: '✅ Pointage modifié' });
      setEditConfirm(false);
      setShowEditModal(false);
      setEditingPointage(null);
      fetchData();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleShowYearlyTotal = async () => {
    setYearlyLoading(true);
    setShowYearlyModal(true);
    try {
      const res = await pointageApi.getByYear(year);
      setYearlyPointages(res.data);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setYearlyLoading(false);
    }
  };

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0035]">
        <PointageTabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'pointage' ? (
          <>
            <PointageHero
              entreprisesCount={entreprises.length}
              travailleursCount={travailleurs.length}
              pointagesCount={pointages.length}
              monthTotal={getMonthTotal()}
              premiumBtnClass={premiumBtnClass}
              mirrorShine={mirrorShine}
              onAddEntreprise={() => setShowEntrepriseModal(true)}
              onAddTravailleur={() => setShowTravailleurModal(true)}
              onNewPointage={() => { setPtForm({ ...ptForm, date: new Date().toISOString().split('T')[0] }); setShowPointageModal(true); }}
              onPriseAvance={() => setShowAvanceModal(true)}
              onShowParPersonne={() => setShowParPersonneModal(true)}
              onShowYearlyTotal={handleShowYearlyTotal}
              onShowMonthDetail={() => setShowMonthDetailModal(true)}
              onSharePointage={() => setShowSharePointageModal(true)}
              year={year}
            />

            <div className="max-w-7xl mx-auto px-4 pb-12">
              <PointageCalendar
                currentDate={currentDate}
                pointages={pointages}
                onPrevMonth={() => setCurrentDate(new Date(year, month - 1, 1))}
                onNextMonth={() => setCurrentDate(new Date(year, month + 1, 1))}
                onDayClick={(dateStr) => { setSelectedDay(dateStr); setShowDayModal(true); }}
              />
              <PointageEntreprisesList entreprises={entreprises} onRefresh={fetchData} />
              <PointageTravailleursList travailleurs={travailleurs} />
            </div>

            {/* Modals */}
            <EntrepriseModal
              open={showEntrepriseModal} onOpenChange={setShowEntrepriseModal}
              form={entForm} setForm={setEntForm} onSubmit={handleAddEntreprise}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <TravailleurModal
              open={showTravailleurModal} onOpenChange={setShowTravailleurModal}
              form={travForm} setForm={setTravForm} onSubmit={handleAddTravailleur}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <PointageFormModal
              open={showPointageModal} onOpenChange={setShowPointageModal}
              form={ptForm} setForm={setPtForm} entreprises={entreprises} travailleurs={travailleurs}
              onSubmit={handleAddPointage}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <DayDetailModal
              open={showDayModal} onOpenChange={setShowDayModal}
              selectedDay={selectedDay} pointages={pointages}
              onEdit={(pt) => { setEditingPointage({ ...pt }); setShowDayModal(false); setShowEditModal(true); }}
              onDelete={(id) => setDeleteConfirm(id)}
              onAddPointage={() => { setPtForm({ ...ptForm, date: selectedDay || '' }); setShowDayModal(false); setShowPointageModal(true); }}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <EditPointageModal
              open={showEditModal} onOpenChange={setShowEditModal}
              editingPointage={editingPointage} setEditingPointage={setEditingPointage}
              travailleurs={travailleurs}
              onConfirm={() => setEditConfirm(true)}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <ParPersonneModal
              open={showParPersonneModal} onOpenChange={setShowParPersonneModal}
              travailleurs={travailleurs}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <AvanceModal
              open={showAvanceModal} onOpenChange={setShowAvanceModal}
              travailleurs={travailleurs} entreprises={entreprises}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <YearlyTotalModal
              open={showYearlyModal} onOpenChange={setShowYearlyModal}
              year={year} yearlyPointages={yearlyPointages} loading={yearlyLoading}
            />
            <MonthDetailModal
              open={showMonthDetailModal} onOpenChange={setShowMonthDetailModal}
              monthTotal={getMonthTotal()} pointages={pointages}
              year={year} month={month}
            />
            <PointageConfirmDialogs
              deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
              onDelete={handleDeletePointage}
              editConfirm={editConfirm} setEditConfirm={setEditConfirm}
              onEditConfirm={handleEditPointage}
              premiumBtnClass={premiumBtnClass} mirrorShine={mirrorShine}
            />
            <ShareLinkModal
              open={showSharePointageModal}
              onClose={() => setShowSharePointageModal(false)}
              type="pointage"
              typeLabel="Pointage"
            />
          </>
        ) : activeTab === 'tache' ? (
          <TacheView />
        ) : (
          <NotesKanbanView />
        )}
      </div>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default PointagePage;
