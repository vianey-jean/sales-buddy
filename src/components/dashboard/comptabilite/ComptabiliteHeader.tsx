/**
 * ComptabiliteHeader - En-tête du module comptabilité (Version Luxe)
 * 
 * Contient le titre, les sélecteurs de période et les boutons d'action.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ShoppingCart, Receipt, FileDown, Crown, Diamond, Sparkles, Gem, Zap } from 'lucide-react';
import { MONTHS } from '@/hooks/useComptabilite';

export interface ComptabiliteHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onNewAchat: () => void;
  onNewDepense: () => void;
  onExport: () => void;
}

const ComptabiliteHeader: React.FC<ComptabiliteHeaderProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onNewAchat,
  onNewDepense,
  onExport
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-green-900/40 border-2 border-emerald-500/30 shadow-2xl backdrop-blur-xl rounded-2xl sm:rounded-3xl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-tr-full" />
      
      <CardHeader className="text-center pb-4 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4"
        >
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/30">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
              Module Comptabilité
            </CardTitle>
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 animate-pulse hidden sm:block" />
          </div>
        </motion.div>
        <CardDescription className="text-emerald-200 text-sm sm:text-base md:text-lg flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Gérez vos achats, dépenses et analysez votre rentabilité
          <Diamond className="h-4 w-4" />
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
          {/* Sélecteur de mois */}
          <Select value={selectedMonth.toString()} onValueChange={onMonthChange}>
            <SelectTrigger className="w-32 sm:w-40 bg-white/10 backdrop-blur-sm border-2 border-emerald-400/30 text-emerald-100 rounded-xl hover:bg-white/20 transition-all text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-emerald-900/95 backdrop-blur-xl border-emerald-600/50 text-emerald-100 rounded-xl">
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()} className="hover:bg-emerald-700/50 rounded-lg">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sélecteur d'année */}
          <Select value={selectedYear.toString()} onValueChange={onYearChange}>
            <SelectTrigger className="w-24 sm:w-32 bg-white/10 backdrop-blur-sm border-2 border-emerald-400/30 text-emerald-100 rounded-xl hover:bg-white/20 transition-all text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-emerald-900/95 backdrop-blur-xl border-emerald-600/50 text-emerald-100 rounded-xl">
              {[2023, 2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()} className="hover:bg-emerald-700/50 rounded-lg">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Boutons d'action */}
          <Button
            onClick={onNewAchat}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-blue-500/30 rounded-xl transition-all duration-300 hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Nouvel</span> Achat
          </Button>
          
          <Button
            onClick={onNewDepense}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl hover:shadow-orange-500/30 rounded-xl transition-all duration-300 hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Nouvelle</span> Dépense
          </Button>
          
          <Button
            onClick={onExport}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-xl hover:shadow-purple-500/30 rounded-xl transition-all duration-300 hover:scale-105 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <FileDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Exporter</span>
            <span className="xs:hidden">PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComptabiliteHeader;
