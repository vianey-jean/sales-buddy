/**
 * =============================================================================
 * ClientsPage - Page de gestion des clients
 * =============================================================================
 * 
 * Cette page permet de gérer les clients : ajout, modification, suppression.
 * Elle utilise des sous-composants décomposés pour le hero et la recherche.
 * 
 * @module ClientsPage
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSync } from '@/hooks/useClientSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Phone, MapPin, Users, Sparkles, Crown, Star, Diamond, MessageSquare, PhoneCall, Navigation } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ConfirmDeleteDialog from '@/components/dashboard/forms/ConfirmDeleteDialog';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { motion } from "framer-motion";

// Sous-composants décomposés
import { ClientHero, ClientSearchSection } from './clients';

// ============================================================================
// Types
// ============================================================================

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

// ============================================================================
// Composant Principal
// ============================================================================

const ClientsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const { clients, isLoading, refetch } = useClientSync();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // =========================================================================
  // États
  // =========================================================================
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nom: '', phone: '', adresse: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [phoneActionOpen, setPhoneActionOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [addressActionOpen, setAddressActionOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // =========================================================================
  // Handlers téléphone et adresse
  // =========================================================================
  const handlePhoneClick = (phone: string) => { setSelectedPhone(phone); setPhoneActionOpen(true); };
  const handleCall = () => { window.location.href = `tel:${selectedPhone}`; setPhoneActionOpen(false); };
  const handleMessage = () => {
    if (isMobile) { window.location.href = `sms:${selectedPhone}`; }
    else { toast({ title: "Message", description: `Préparez un message pour ${selectedPhone}`, className: "notification-success" }); }
    setPhoneActionOpen(false);
  };
  const handleAddressClick = (address: string) => {
    if (isMobile) { setSelectedAddress(address); setAddressActionOpen(true); }
    else { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank'); }
  };
  const openGoogleMaps = () => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };
  const openWaze = () => { window.open(`https://waze.com/ul?q=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };
  const openAppleMaps = () => { window.open(`https://maps.apple.com/?q=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };

  // =========================================================================
  // Filtrage et pagination
  // =========================================================================
  const filteredClients = searchQuery.length >= 3 
    ? clients.filter(client => 
        client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.adresse.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  // =========================================================================
  // CRUD Handlers
  // =========================================================================
  const resetForm = () => { setFormData({ nom: '', phone: '', adresse: '' }); setEditingClient(null); };
  const handleAddClient = () => { resetForm(); setIsAddDialogOpen(true); };
  const handleEditClient = (client: Client) => { setFormData({ nom: client.nom, phone: client.phone, adresse: client.adresse }); setEditingClient(client); setIsAddDialogOpen(true); };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.phone.trim() || !formData.adresse.trim()) {
      toast({ title: "Erreur", description: "Tous les champs sont obligatoires", variant: "destructive", className: "notification-erreur" });
      return;
    }
    if (editingClient) { setShowEditConfirm(true); } else { setShowAddConfirm(true); }
  };

  const confirmAdd = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/clients`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Succès", description: "Client ajouté avec succès", className: "notification-success" });
      setIsAddDialogOpen(false); setShowAddConfirm(false); resetForm(); refetch();
    } catch (error) {
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'ajout", variant: "destructive", className: "notification-erreur" });
    } finally { setIsSubmitting(false); }
  };

  const confirmEdit = async () => {
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/clients/${editingClient.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Succès", description: "Client mis à jour avec succès", className: "notification-success" });
      setIsAddDialogOpen(false); setShowEditConfirm(false); resetForm(); refetch();
    } catch (error) {
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la modification", variant: "destructive", className: "notification-erreur" });
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteClient = (client: Client) => { setClientToDelete(client); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/clients/${clientToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Succès", description: "Client supprimé avec succès", className: "notification-success" });
      setShowDeleteConfirm(false); setClientToDelete(null); refetch();
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive", className: "notification-erreur" });
    } finally { setIsSubmitting(false); }
  };

  // =========================================================================
  // Loading
  // =========================================================================
  if (isLoading) {
    if (embedded) return <PremiumLoading text="Bienvenue sur Listes des Clients" size="xl" overlay={false} variant="default" />;
    return (
      <Layout>
        <PremiumLoading text="Bienvenue sur Listes des Clients" size="xl" overlay={true} variant="default" />
      </Layout>
    );
  }

  // =========================================================================
  // Rendu
  // =========================================================================
  const mainContent = (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 dark:from-[#030014] dark:via-[#0a0020]/80 dark:to-[#0e0030]">
      {!embedded && <Navbar />}
      {!embedded && <ScrollToTop />}

      {/* Section héroïque décomposée */}
      <ClientHero clientCount={clients.length} onAddClient={handleAddClient} />

      {/* Contenu principal */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-20 max-w-7xl">
        {/* Recherche décomposée */}
        <ClientSearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredCount={filteredClients.length}
        />

        {/* Grille des clients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {paginatedClients.map((client, index) => (
            <Card 
              key={client.id} 
              className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 card-mirror-light dark:card-mirror mirror-shine backdrop-blur-sm shadow-xl hover:shadow-purple-500/25 relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Badge ÉLITE au hover */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 animate-bounce">
                <Star className="w-3 h-3 inline mr-1" />ÉLITE
              </div>
              
              {/* Mirror shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 rounded-3xl opacity-0 group-hover:opacity-15 blur transition-opacity duration-500 pointer-events-none"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {client.nom}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span className="inline-flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        Membre depuis le {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)} className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full hover:scale-110 transition-transform duration-200">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)} className="h-10 w-10 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full hover:scale-110 transition-transform duration-200">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div onClick={() => handlePhoneClick(client.phone)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors">{client.phone}</span>
                  </div>
                  
                  <div onClick={() => handleAddressClick(client.adresse)} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform duration-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg mt-0.5">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{client.adresse}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State pour recherche sans résultat */}
        {searchQuery.length >= 3 && filteredClients.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full mb-8 shadow-xl">
              <Users className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">Aucun client trouvé</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Aucun client ne correspond à votre recherche "{searchQuery}"</p>
            <Button onClick={() => setSearchQuery('')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl">Effacer la recherche</Button>
          </div>
        )}

        {/* Pagination */}
        {filteredClients.length > 0 && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-12 mb-8 px-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 font-semibold">
              <span className="hidden sm:inline">← Précédent</span><span className="sm:hidden">←</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant={currentPage === 1 ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(1)} className={`min-w-[40px] font-bold transition-all ${currentPage === 1 ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>1</Button>
              {currentPage > 4 && <span className="px-2 text-lg font-bold text-gray-400 dark:text-gray-500">…</span>}
              {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i).filter(page => page > 1 && page < totalPages).map(page => (
                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={`min-w-[40px] font-bold transition-all ${currentPage === page ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>{page}</Button>
              ))}
              {currentPage < totalPages - 3 && <span className="px-2 text-lg font-bold text-gray-400 dark:text-gray-500">…</span>}
              {totalPages > 1 && (
                <Button variant={currentPage === totalPages ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(totalPages)} className={`min-w-[40px] font-bold transition-all ${currentPage === totalPages ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg scale-110' : 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'}`}>{totalPages}</Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 font-semibold">
              <span className="hidden sm:inline">Suivant →</span><span className="sm:hidden">→</span>
            </Button>
          </div>
        )}

        {/* Empty State quand aucun client */}
        {clients.length === 0 && searchQuery.length === 0 && (
          <div className="text-center py-32">
            <div className="relative inline-flex items-center justify-center w-48 h-48 bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-full mb-16 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full animate-pulse"></div>
              <Users className="w-24 h-24 text-purple-600 dark:text-purple-400 relative z-10" />
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Votre Empire Clientèle vous attend</h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed">Commencez à construire votre réseau exclusif de clients VIP</p>
            <Button onClick={handleAddClient} className="group bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-3 transition-all duration-500 border-2 border-purple-400/30">
              <Crown className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" />Créer votre Premier Client Élite<Sparkles className="w-8 h-8 ml-4 group-hover:scale-125 transition-transform duration-300" />
            </Button>
          </div>
        )}
      </div>

      {!embedded && <Footer />}
      
      {/* Dialog principal ajout/modification */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl border border-violet-200/20 dark:border-violet-800/20 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {editingClient ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre portefeuille.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom complet</Label>
                <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Nom et prénom" className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Ex: 0692123456" className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Adresse</Label>
                <Input id="adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} placeholder="Adresse complète" className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting} className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                {editingClient ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmations */}
      <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Confirmer l'ajout</DialogTitle><DialogDescription>Voulez-vous vraiment ajouter ce client ?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowAddConfirm(false)} disabled={isSubmitting}>Annuler</Button><Button onClick={confirmAdd} disabled={isSubmitting}>{isSubmitting ? 'Ajout...' : 'Oui, ajouter'}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Confirmer la modification</DialogTitle><DialogDescription>Voulez-vous vraiment modifier ce client ?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowEditConfirm(false)} disabled={isSubmitting}>Annuler</Button><Button onClick={confirmEdit} disabled={isSubmitting}>{isSubmitting ? 'Modification...' : 'Oui, modifier'}</Button></DialogFooter></DialogContent>
      </Dialog>

      <ConfirmDeleteDialog isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setClientToDelete(null); }} onConfirm={confirmDelete} title="Confirmer la suppression" description={`Voulez-vous vraiment supprimer ${clientToDelete?.nom} ?`} isSubmitting={isSubmitting} />

      {/* Modale téléphone */}
      <Dialog open={phoneActionOpen} onOpenChange={setPhoneActionOpen}>
         <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl border border-violet-200/20 dark:border-violet-800/20 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"><Phone className="w-5 h-5 text-white" /></div>{selectedPhone}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">Que souhaitez-vous faire ?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={handleCall} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"><PhoneCall className="w-6 h-6" />Appeler ce numéro</Button>
            <Button onClick={handleMessage} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"><MessageSquare className="w-6 h-6" />{isMobile ? 'Envoyer un SMS' : 'Envoyer un message'}</Button>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPhoneActionOpen(false)} className="w-full border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale adresse (mobile) */}
      <Dialog open={addressActionOpen} onOpenChange={setAddressActionOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl border border-violet-200/20 dark:border-violet-800/20 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"><Navigation className="w-5 h-5 text-white" /></div>Navigation
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">Ouvrir l'adresse dans quelle application ?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={openGoogleMaps} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"><MapPin className="w-6 h-6" />Google Maps</Button>
            <Button onClick={openWaze} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"><Navigation className="w-6 h-6" />Waze</Button>
            <Button onClick={openAppleMaps} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"><MapPin className="w-6 h-6" />Apple Maps</Button>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddressActionOpen(false)} className="w-full border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );

  if (embedded) return mainContent;
  return mainContent;
};

export default ClientsPage;
