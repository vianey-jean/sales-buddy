/**
 * Tableau des commandes et réservations
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Gift, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Commande, CommandeStatut } from '@/types/commande';
import CommandesStatsButtons from './CommandesStatsButtons';

interface CommandesTableProps {
  filteredCommandes: Commande[];
  totalActiveCommandes: number;
  commandeSearch: string;
  sortDateAsc: boolean;
  setSortDateAsc: (value: boolean) => void;
  handleEdit: (commande: Commande) => void;
  handleStatusChange: (id: string, status: CommandeStatut | 'reporter') => void;
  setDeleteId: (id: string) => void;
  getStatusOptions: (type: 'commande' | 'reservation') => { value: string; label: string }[];
}

const CommandesTable: React.FC<CommandesTableProps> = ({
  filteredCommandes,
  totalActiveCommandes,
  commandeSearch,
  sortDateAsc,
  setSortDateAsc,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions
}) => {
  return (
    <Card className="border-2 border-purple-200/50 dark:border-purple-700/50 shadow-[0_20px_70px_rgba(168,85,247,0.3)] bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm">
      <CardHeader className="border-b-2 border-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-700 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 pb-4 sm:pb-6 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 sm:gap-4 text-base sm:text-xl md:text-2xl font-black tracking-tight">
          <span className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-2xl">
            <Gift className="h-5 w-5 sm:h-7 sm:w-7" />
          </span>
          <span className="truncate">Liste des Commandes</span>
        </CardTitle>
        <CommandesStatsButtons
          filteredCommandes={filteredCommandes}
          totalActiveCommandes={totalActiveCommandes}
          commandeSearch={commandeSearch}
        />
      </CardHeader>
      <CardContent className="p-0">
        {/* Vue mobile - Cards */}
        <div className="block lg:hidden">
          {filteredCommandes.map((commande) => (
            <CommandeMobileCard
              key={commande.id}
              commande={commande}
              handleEdit={handleEdit}
              handleStatusChange={handleStatusChange}
              setDeleteId={setDeleteId}
              getStatusOptions={getStatusOptions}
            />
          ))}
          {filteredCommandes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucune commande trouvée
            </div>
          )}
        </div>

        {/* Vue desktop - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <ModernTable className="min-w-full">
            <ModernTableHeader>
              <ModernTableRow>
                <ModernTableHead className="w-52">Client</ModernTableHead>
                <ModernTableHead>Contact</ModernTableHead>
                <ModernTableHead className="w-52">Produit</ModernTableHead>
                <ModernTableHead>Prix</ModernTableHead>
                <ModernTableHead>Type</ModernTableHead>
                <ModernTableHead>
                  <button
                    onClick={() => setSortDateAsc(!sortDateAsc)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    title={sortDateAsc ? "Trier du plus loin au plus proche" : "Trier du plus proche au plus loin"}
                  >
                    Date
                    {sortDateAsc ? (
                      <ArrowDown className="h-4 w-4 text-purple-600" />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-purple-600" />
                    )}
                  </button>
                </ModernTableHead>
                <ModernTableHead>Statut</ModernTableHead>
                <ModernTableHead>Actions</ModernTableHead>
              </ModernTableRow>
            </ModernTableHeader>

            <TableBody>
              {filteredCommandes.map((commande) => (
                <CommandeTableRow
                  key={commande.id}
                  commande={commande}
                  handleEdit={handleEdit}
                  handleStatusChange={handleStatusChange}
                  setDeleteId={setDeleteId}
                  getStatusOptions={getStatusOptions}
                />
              ))}
            </TableBody>
          </ModernTable>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour une ligne de tableau (desktop)
interface CommandeRowProps {
  commande: Commande;
  handleEdit: (commande: Commande) => void;
  handleStatusChange: (id: string, status: CommandeStatut | 'reporter') => void;
  setDeleteId: (id: string) => void;
  getStatusOptions: (type: 'commande' | 'reservation') => { value: string; label: string }[];
}

const CommandeTableRow: React.FC<CommandeRowProps> = ({
  commande,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions
}) => {
  const renderDateCell = () => {
    if (commande.type === 'commande') {
      return (
        <div>
          <div className="text-xs text-muted-foreground">Arrivage:</div>
          <div>{new Date(commande.dateArrivagePrevue || '').toLocaleDateString()}</div>
          {commande.horaire && (
            <div className="text-xs text-muted-foreground mt-1">
              Horaire: {commande.horaire}
            </div>
          )}
        </div>
      );
    }
    
    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);
    
    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isOverdue = diffDays < 0;
    const isNearDeadline = diffDays >= 0 && diffDays <= 2;
    
    return (
      <div>
        <div className="text-xs text-muted-foreground">Échéance:</div>
        <div className={
          isOverdue 
            ? "animate-pulse text-red-600 dark:text-red-500 font-bold"
            : isNearDeadline 
            ? "animate-pulse text-green-600 dark:text-green-500 font-bold"
            : ""
        }>
          {echeance.toLocaleDateString()}
        </div>
        {commande.horaire && (
          <div className={`text-xs mt-1 ${
            isOverdue 
              ? "animate-pulse text-red-600 dark:text-red-500 font-semibold"
              : isNearDeadline 
              ? "animate-pulse text-green-600 dark:text-green-500 font-semibold"
              : "text-muted-foreground"
          }`}>
            Horaire: {commande.horaire}
          </div>
        )}
      </div>
    );
  };

  return (
     <ModernTableRow className="bg-gradient-to-r from-purple-50/30 via-pink-50/20 to-indigo-50/30 dark:from-gray-900/20 dark:via-purple-900/10 dark:to-indigo-900/10 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-100/40 hover:via-pink-100/30 hover:to-indigo-100/30 transition-all duration-500 rounded-xl backdrop-blur-sm">
  <ModernTableCell className="align-top w-52">
    <div className="font-semibold text-purple-800 dark:text-purple-200 whitespace-normal break-words">{commande.clientNom}</div>
    <div className="text-xs text-muted-foreground whitespace-normal break-words">{commande.clientAddress}</div>
  </ModernTableCell>
  <ModernTableCell className="align-top">
    <span className="text-sm whitespace-normal break-words text-gray-700 dark:text-gray-300">{commande.clientPhone}</span>
  </ModernTableCell>
  <ModernTableCell className="align-top w-52">
    {commande.produits.map((p, idx) => (
      <div key={idx} className="text-sm space-y-0.5">
        <div className="font-medium text-purple-700 dark:text-purple-300 whitespace-normal break-words">{p.nom}</div>
        <div className="text-xs text-muted-foreground">
          Qté: <span className="font-bold text-red-600">{p.quantite}</span>
        </div>
      </div>
    ))}
  </ModernTableCell>
  <ModernTableCell className="align-top">
    {commande.produits.map((p, idx) => (
      <div key={idx} className="text-sm space-y-0.5">
        <div className="text-gray-600 dark:text-gray-400">Unitaire: {p.prixUnitaire}€</div>
        <div className="font-semibold text-purple-700 dark:text-purple-300">Vente: {p.prixVente}€</div>
      </div>
    ))}
    <div className="mt-3 pt-3 border-t-2 border-red-300 dark:border-red-700">
      <div className="text-base font-extrabold text-red-600 dark:text-red-500 shadow-sm">
        Total: {commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0).toFixed(2)}€
      </div>
    </div>
  </ModernTableCell>
  <ModernTableCell className="align-top">
    <Badge
      className={
        commande.type === 'commande'
          ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md hover:from-purple-700 hover:via-pink-600 hover:to-indigo-600"
          : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white shadow-md hover:from-blue-600 hover:via-cyan-500 hover:to-green-500"
      }
      variant={commande.type === 'commande' ? 'default' : 'secondary'}
    >
      {commande.type === 'commande' ? 'Commande' : 'Réservation'}
    </Badge>
  </ModernTableCell>
  <ModernTableCell className="align-top text-sm">
    {renderDateCell()}
  </ModernTableCell>
  <ModernTableCell className="align-top">
    <Select
      value={commande.statut}
      onValueChange={(value) => handleStatusChange(commande.id, value as any)}
    >
      <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        {getStatusOptions(commande.type).map((option) => (
          <SelectItem 
            key={option.value}
            value={option.value}
            className={
              option.value === 'en_route' ? 'text-purple-600 font-semibold' :
              option.value === 'arrive' ? 'text-green-600 font-semibold' :
              option.value === 'en_attente' ? 'text-red-600 font-semibold' :
              option.value === 'valide' ? 'text-blue-600 font-semibold' :
              option.value === 'annule' ? 'text-gray-600 font-semibold' :
              option.value === 'reporter' ? 'text-blue-500 font-semibold' :
              ''
            }
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </ModernTableCell>
  <ModernTableCell className="align-top">
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(commande)}
        className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl shadow-sm transition-all duration-300"
        title="Modifier"
      >
        <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDeleteId(commande.id)}
        className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl shadow-sm transition-all duration-300"
        title="Supprimer"
      >
        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
      </Button>
    </div>
  </ModernTableCell>
</ModernTableRow>

  );
};

// Composant pour une carte mobile
const CommandeMobileCard: React.FC<CommandeRowProps> = ({
  commande,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions
}) => {
  const totalPrice = commande.produits.reduce((sum, p) => sum + (p.prixVente * p.quantite), 0);
  
  const getDateInfo = () => {
    if (commande.type === 'commande') {
      return {
        label: 'Arrivage',
        date: new Date(commande.dateArrivagePrevue || '').toLocaleDateString(),
        isOverdue: false,
        isNearDeadline: false
      };
    }
    
    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);
    
    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      label: 'Échéance',
      date: echeance.toLocaleDateString(),
      isOverdue: diffDays < 0,
      isNearDeadline: diffDays >= 0 && diffDays <= 2
    };
  };
  
  const dateInfo = getDateInfo();

  return (
    <div className="p-4 border-b border-purple-100 dark:border-purple-800/30 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-pink-50/20 hover:to-indigo-50/30 dark:hover:from-purple-900/10 dark:hover:via-pink-900/10 dark:hover:to-indigo-900/10 transition-all duration-500 shadow-lg backdrop-blur-md rounded-2xl">
  {/* En-tête: Client + Type */}
  <div className="flex justify-between items-start mb-3">
    <div className="flex-1 min-w-0">
      <h3 className="font-extrabold text-lg text-purple-800 dark:text-purple-200 truncate">{commande.clientNom}</h3>
      <p className="text-xs text-muted-foreground truncate">{commande.clientAddress}</p>
      <p className="text-xs text-muted-foreground">{commande.clientPhone}</p>
    </div>
    <Badge
      className={`ml-2 text-xs px-3 py-1 rounded-full font-semibold shadow-md ${
        commande.type === 'commande'
          ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white"
          : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white"
      }`}
    >
      {commande.type === 'commande' ? 'CMD' : 'RES'}
    </Badge>
  </div>
  
  {/* Produits */}
  <div className="mb-3 space-y-1">
    {commande.produits.map((p, idx) => (
      <div key={idx} className="flex justify-between text-sm">
        <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200">{p.nom} <span className="text-red-600 font-bold">{`x${p.quantite}`}</span></span>
        <span className="font-semibold ml-2 text-purple-700 dark:text-purple-300">{p.prixVente}€</span>
      </div>
    ))}
    <div className="pt-2 border-t border-red-200 dark:border-red-800">
      <div className="flex justify-between">
        <span className="font-bold text-red-600 dark:text-red-400 tracking-wide">Total</span>
        <span className="font-black text-red-600 dark:text-red-400 text-lg">{totalPrice.toFixed(2)}€</span>
      </div>
    </div>
  </div>
  
  {/* Date + Statut */}
  <div className="flex flex-wrap gap-2 items-center mb-3">
    <div className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${
      dateInfo.isOverdue 
        ? "bg-red-100 text-red-700 animate-pulse"
        : dateInfo.isNearDeadline 
        ? "bg-green-100 text-green-700 animate-pulse"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}>
      {dateInfo.label}: {dateInfo.date}
      {commande.horaire && ` ${commande.horaire}`}
    </div>
    
    <Select
      value={commande.statut}
      onValueChange={(value) => handleStatusChange(commande.id, value as any)}
    >
      <SelectTrigger className="h-8 w-28 text-xs bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        {getStatusOptions(commande.type).map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  {/* Actions */}
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleEdit(commande)}
      className="flex-1 text-xs h-8 bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
    >
      <Edit className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
      Modifier
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDeleteId(commande.id)}
      className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
</div>

  );
};

export default CommandesTable;
