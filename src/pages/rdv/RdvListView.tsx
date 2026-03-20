/**
 * =============================================================================
 * RdvListView - Vue en liste des rendez-vous du mois
 * =============================================================================
 * 
 * Affiche les RDV en grille de 4 colonnes avec pagination.
 * Chaque carte montre le statut, titre, client, date, heure et lieu.
 * 
 * @module RdvListView
 */

import React from 'react';
import { RDV } from '@/types/rdv';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, User, Phone, MapPin, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RdvListViewProps {
  paginatedRdvs: RDV[];
  currentMonthTotal: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  onPageChange: (page: number) => void;
  onRdvClick: (rdv: RDV) => void;
  onEditRdv: (rdv: RDV) => void;
  onDeleteRdv: (rdv: RDV) => void;
  onNewRdv: () => void;
}

const RdvListView: React.FC<RdvListViewProps> = ({
  paginatedRdvs,
  currentMonthTotal,
  currentPage,
  totalPages,
  itemsPerPage,
  statusColors,
  statusLabels,
  onPageChange,
  onRdvClick,
  onEditRdv,
  onDeleteRdv,
  onNewRdv,
}) => {
  if (currentMonthTotal === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Aucun rendez-vous ce mois-ci</h3>
          <p className="text-muted-foreground mt-1">Créez votre premier rendez-vous pour commencer</p>
          <Button onClick={onNewRdv} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedRdvs.map((rdv, index) => {
          const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
          return (
            <motion.div
              key={rdv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/30 overflow-hidden group"
                onClick={() => onRdvClick(rdv)}
              >
                <div className={cn("h-2", statusColors[rdv.statut])} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs font-bold">#{globalIndex}</Badge>
                    <Badge className={cn("text-white text-xs", statusColors[rdv.statut])}>{statusLabels[rdv.statut]}</Badge>
                  </div>

                  <h3 className="font-bold text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors">{rdv.titre}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="truncate">{rdv.clientNom}</span></div>
                    {rdv.clientTelephone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>{rdv.clientTelephone}</span></div>}
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span>{format(parseISO(rdv.date), 'd MMM yyyy', { locale: fr })}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>{rdv.heureDebut} - {rdv.heureFin}</span></div>
                    {rdv.lieu && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span className="truncate">{rdv.lieu}</span></div>}
                  </div>

                  {/* Masquer les boutons modifier/supprimer pour les RDV créés depuis une réservation */}
                  {!rdv.commandeId && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn("flex-1", rdv.statut === 'confirme' ? "text-gray-400 border-gray-200 cursor-not-allowed opacity-50" : "text-blue-600 border-blue-200 hover:bg-blue-50")}
                        onClick={(e) => { e.stopPropagation(); if (rdv.statut !== 'confirme') onEditRdv(rdv); }}
                        disabled={rdv.statut === 'confirme'}
                        title={rdv.statut === 'confirme' ? "Impossible de modifier un rendez-vous confirmé" : "Modifier le rendez-vous"}
                      >
                        <Edit className="h-3 w-3 mr-1" />Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); onDeleteRdv(rdv); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="icon" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
                className={cn("w-10 h-10", currentPage === page && "bg-primary text-primary-foreground")}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-4 text-sm text-muted-foreground">
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, currentMonthTotal)} sur {currentMonthTotal}
          </span>
        </div>
      )}
    </div>
  );
};

export default RdvListView;
