import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import { Product } from '@/types';
import ProductSearchInput from '@/components/dashboard/ProductSearchInput';
import { beneficeService } from '@/service/beneficeService';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell, TableBody } from '@/components/dashboard/forms/ModernTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Percent, 
  Save, 
  Search, 
  Eye, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Crown, 
  Diamond,
  Target,
  PiggyBank,
  TrendingDown,
  BarChart3,
  Coins,
  Gem,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import PremiumLoading from '@/components/ui/premium-loading';

interface ProfitCalculation {
  prixAchat: number;
  taxeDouane: number;
  tva: number;
  autresFrais: number;
  coutTotal: number;
  margeDesire: number;
  prixVenteRecommande: number;
  beneficeNet: number;
  tauxMarge: number;
}

interface BeneficeData extends ProfitCalculation {
  id?: string;
  productId: string;
  productDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfitCalculatorProps {
  className?: string;
  onCalculationChange?: (calculation: ProfitCalculation) => void;
  initialValues?: Partial<ProfitCalculation>;
  compact?: boolean;
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  className,
  onCalculationChange,
  initialValues = {},
  compact = false
}) => {
  const { formatEuro } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [beneficesList, setBeneficesList] = useState<BeneficeData[]>([]);
  const [showTable, setShowTable] = useState(true);
  
  const [values, setValues] = useState<ProfitCalculation>({
    prixAchat: initialValues.prixAchat || 0,
    taxeDouane: initialValues.taxeDouane || 0,
    tva: initialValues.tva || 20,
    autresFrais: initialValues.autresFrais || 0,
    coutTotal: 0,
    margeDesire: initialValues.margeDesire || 30,
    prixVenteRecommande: 0,
    beneficeNet: 0,
    tauxMarge: 0
  });

  const [prixVenteCustom, setPrixVenteCustom] = useState<number>(0);
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [beneficeToDelete, setBeneficeToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadBeneficesData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadBeneficesData();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductDescription(product.description);
    setValues(prev => ({
      ...prev,
      prixAchat: product.purchasePrice || 0
    }));
    loadExistingBeneficeData(product.id);
  };

  const loadBeneficesData = async () => {
    try {
      const data = await beneficeService.getBenefices();
      setBeneficesList(data);
    } catch (error) {
      setBeneficesList([]);
    }
  };

  const loadExistingBeneficeData = async (productId: string) => {
    try {
      const beneficeData = await beneficeService.getBeneficeByProductId(productId);
      if (beneficeData) {
        setValues({
          prixAchat: beneficeData.prixAchat || 0,
          taxeDouane: beneficeData.taxeDouane || 0,
          tva: beneficeData.tva || 20,
          autresFrais: beneficeData.autresFrais || 0,
          coutTotal: beneficeData.coutTotal || 0,
          margeDesire: beneficeData.margeDesire || 30,
          prixVenteRecommande: beneficeData.prixVenteRecommande || 0,
          beneficeNet: beneficeData.beneficeNet || 0,
          tauxMarge: beneficeData.tauxMarge || 0
        });
        toast({
          title: "Données chargées",
          description: `Calculs existants chargés pour ${beneficeData.productDescription}`,
        });
      }
    } catch (error) {
      // Aucun calcul existant
    }
  };

  useEffect(() => {
    if (values.prixAchat > 0) {
      const coutSansTva = values.prixAchat + values.taxeDouane + values.autresFrais;
      const coutAvecTva = coutSansTva * (1 + values.tva / 100);
      const prixVenteRecommande = coutAvecTva * (1 + values.margeDesire / 100);
      const beneficeNet = prixVenteRecommande - coutAvecTva;
      const tauxMarge = coutAvecTva > 0 ? (beneficeNet / coutAvecTva) * 100 : 0;
      const newCalculation = { ...values, coutTotal: coutAvecTva, prixVenteRecommande, beneficeNet, tauxMarge };
      setValues(newCalculation);
      onCalculationChange?.(newCalculation);
    }
  }, [values.prixAchat, values.taxeDouane, values.tva, values.autresFrais, values.margeDesire, onCalculationChange]);

  const calculateWithCustomPrice = () => {
    if (prixVenteCustom > 0 && values.coutTotal > 0) {
      const beneficeNet = prixVenteCustom - values.coutTotal;
      const tauxMarge = (beneficeNet / values.coutTotal) * 100;
      const customCalculation = { ...values, prixVenteRecommande: prixVenteCustom, beneficeNet, tauxMarge };
      setValues(customCalculation);
      onCalculationChange?.(customCalculation);
    }
  };

  const updateValue = (field: keyof ProfitCalculation, value: number) => {
    setValues(prev => ({ ...prev, [field]: isNaN(value) ? 0 : value }));
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un produit avant de sauvegarder.", variant: "destructive" , className: "notification-erreur",});
      return;
    }

    const existingBenefice = beneficesList.find(b => b.productId === selectedProduct.id);
    if (existingBenefice) {
      toast({ title: "Erreur", description: "Ce produit a déjà un calcul de bénéfice enregistré.", variant: "destructive" , className: "notification-erreur",});
      return;
    }

    setIsLoading(true);
    try {
      await beneficeService.createBenefice({
        productId: selectedProduct.id,
        productDescription: productDescription || selectedProduct.description,
        ...values
      });
      toast({ title: "Succès", description: "Calcul de bénéfice sauvegardé avec succès!" });
      await loadBeneficesData();
      setSelectedProduct(null);
      setProductDescription('');
      setValues({
        prixAchat: 0,
        taxeDouane: 0,
        tva: 20,
        autresFrais: 0,
        coutTotal: 0,
        margeDesire: 30,
        prixVenteRecommande: 0,
        beneficeNet: 0,
        tauxMarge: 0
      });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le calcul de bénéfice.", variant: "destructive", className: "notification-erreur", });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await beneficeService.deleteBenefice(id);
      toast({ title: "Succès", description: "Calcul de bénéfice supprimé avec succès!" });
      await loadBeneficesData();
      setTimeout(() => window.dispatchEvent(new CustomEvent('benefice-deleted')), 100);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer le calcul de bénéfice.", variant: "destructive", className: "notification-erreur", });
    } finally {
      setDeleteConfirmOpen(false);
      setBeneficeToDelete(null);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setBeneficeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const isRentable = (values.tauxMarge || 0) >= 20;

  if (isLoading) {
    return (
      <PremiumLoading
        text="Calcul des Bénéfices"
        size="md"
        variant="ventes"
        showText={true}
      />
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Ultra Luxe Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 shadow-2xl border border-purple-500/30"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-4 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl shadow-xl">
                <Diamond className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                  <Crown className="h-3 w-3 mr-1" />
                  PREMIUM
                </Badge>
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Calculateur de Bénéfices
              </h1>
              <p className="text-purple-300/80 text-sm mt-1">Analyse financière ultra-précise</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => console.log('Optimisation des marges')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl text-white font-bold shadow-xl shadow-purple-500/30 transition-all duration-300"
            >
              <Zap className="h-5 w-5" />
              Optimiser
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Calculator Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn("relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl", className)}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative p-6 md:p-8">
        <div className="space-y-8">
          {/* Recherche de produit */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur-md opacity-50" />
                <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white shadow-xl">
                  <Search className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Sélection du produit
              </h3>
              <Gem className="h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
            
            <ProductSearchInput
              onProductSelect={handleProductSelect}
              selectedProduct={selectedProduct}
            />
            
            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border-2 border-purple-300/50 dark:border-purple-700/50 shadow-xl"
              >
                <Label htmlFor="productDescription" className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-3">
                  <Edit3 className="h-4 w-4" />
                  Description du produit
                  <Star className="h-4 w-4 text-amber-500" />
                </Label>
                <Input
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Description du produit"
                  className="border-purple-300 focus:border-purple-500 bg-white/90 dark:bg-slate-800/90 text-lg font-medium shadow-inner"
                />
              </motion.div>
            )}
          </motion.div>

          {selectedProduct && (
            <>
              {/* Saisie des coûts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg">
                      <Coins className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Coûts d'acquisition
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="prixAchat" className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-3">
                        <DollarSign className="h-4 w-4" />
                        Prix d'achat (€)
                      </Label>
                      <Input
                        id="prixAchat"
                        type="number"
                        value={values.prixAchat || ''}
                        onChange={(e) => updateValue('prixAchat', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-emerald-300 focus:border-emerald-500 bg-white/80 text-lg font-semibold"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="taxeDouane" className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4" />
                        Taxes douanières (€)
                      </Label>
                      <Input
                        id="taxeDouane"
                        type="number"
                        value={values.taxeDouane || ''}
                        onChange={(e) => updateValue('taxeDouane', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-blue-300 focus:border-blue-500 bg-white/80"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="tva" className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3">
                        <Percent className="h-4 w-4" />
                        TVA (%)
                      </Label>
                      <Input
                        id="tva"
                        type="number"
                        value={values.tva || ''}
                        onChange={(e) => updateValue('tva', Number(e.target.value))}
                        placeholder="20"
                        className="border-purple-300 focus:border-purple-500 bg-white/80"
                      />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                      <Label htmlFor="autresFrais" className="font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2 mb-3">
                        <PiggyBank className="h-4 w-4" />
                        Autres frais (€)
                      </Label>
                      <Input
                        id="autresFrais"
                        type="number"
                        value={values.autresFrais || ''}
                        onChange={(e) => updateValue('autresFrais', Number(e.target.value))}
                        placeholder="0.00"
                        className="border-orange-300 focus:border-orange-500 bg-white/80"
                      />
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Transport, stockage, manutention, etc.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Calcul de marge
                    </h3>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                    <Label htmlFor="margeDesire" className="font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4" />
                      Marge désirée (%)
                    </Label>
                    <Input
                      id="margeDesire"
                      type="number"
                      value={values.margeDesire || ''}
                      onChange={(e) => updateValue('margeDesire', Number(e.target.value))}
                      placeholder="30"
                      className="border-purple-300 focus:border-purple-500 bg-white/80 text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border-2 border-gradient-to-r border-emerald-300 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-blue-600" />
                          Coût total (TTC):
                        </span>
                        <span className="font-bold text-xl text-blue-600">{formatEuro(values.coutTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Crown className="h-5 w-5 text-emerald-600" />
                          Prix de vente recommandé:
                        </span>
                        <span className="font-bold text-emerald-600 text-2xl">
                          {formatEuro(values.prixVenteRecommande || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Bénéfice net:
                        </span>
                        <span className={cn("font-bold text-2xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                          {formatEuro(values.beneficeNet || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-white/70 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-indigo-600" />
                          Taux de marge:
                        </span>
                        <span className={cn("font-bold text-xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                          {(values.tauxMarge || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton de sauvegarde */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isLoading || !selectedProduct}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:via-green-400 hover:to-teal-400 disabled:from-gray-400 disabled:to-gray-500 rounded-2xl text-white font-black text-xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                {isLoading ? (
                  <>
                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Shield className="h-6 w-6" />
                    Valider et Sauvegarder
                    <Crown className="h-5 w-5" />
                  </>
                )}
              </motion.button>
                </div>
              </div>

              {/* Prix de vente personnalisé */}
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                      <Edit3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Tester un prix de vente personnalisé
                    </h3>
                  </div>
                  <ModernActionButton
                    onClick={() => setShowCustomPrice(!showCustomPrice)}
                    variant="outline"
                    gradient="indigo"
                    icon={showCustomPrice ? TrendingDown : TrendingUp}
                  >
                    {showCustomPrice ? 'Masquer' : 'Afficher'}
                  </ModernActionButton>
                </div>
                
                {showCustomPrice && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border-2 border-indigo-200 shadow-lg">
                    <div className="space-y-2">
                      <Label htmlFor="prixVenteCustom" className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Prix de vente personnalisé (€)
                      </Label>
                      <Input
                        id="prixVenteCustom"
                        type="number"
                        value={prixVenteCustom}
                        onChange={(e) => setPrixVenteCustom(Number(e.target.value))}
                        placeholder="0.00"
                        className="border-indigo-300 focus:border-indigo-500 bg-white/80 text-lg font-semibold"
                      />
                    </div>
                    <div className="flex items-end">
                      <ModernActionButton
                        onClick={calculateWithCustomPrice}
                        gradient="indigo"
                        icon={Calculator}
                        className="w-full"
                        buttonSize="lg"
                      >
                        Calculer
                      </ModernActionButton>
                    </div>
                    <div className="flex items-center justify-center">
                      {prixVenteCustom > 0 && (
                        <div className="text-center bg-white/70 rounded-lg p-4 w-full">
                          <span className="text-sm text-gray-600 block mb-1">Marge calculée:</span>
                          <span className={cn("font-bold text-2xl", isRentable ? "text-emerald-600" : "text-red-600")}>
                            {(values.tauxMarge || 0).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Alertes */}
              {!isRentable && values.prixAchat > 0 && (
                <Alert className="border-red-200 bg-red-50 text-red-800 shadow-lg">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="font-semibold">
                    <strong>⚠️ Attention:</strong> Votre marge est inférieure à 20%. 
                    Considérez augmenter votre prix de vente ou réduire vos coûts.
                  </AlertDescription>
                </Alert>
              )}
              
              {isRentable && values.prixAchat > 0 && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 shadow-lg">
                  <TrendingUp className="h-5 w-5" />
                  <AlertDescription className="font-semibold">
                    <strong>🎉 Excellent!</strong> Votre produit est rentable avec une marge de {(values.tauxMarge || 0).toFixed(1)}%.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
        </div>
      </motion.div>

      {/* Table des calculs de bénéfices */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur-md opacity-50" />
                <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white shadow-xl">
                  <Eye className="h-7 w-7" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Historique des Calculs
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tous vos calculs de bénéfices</p>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg">
                <Gem className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTable(!showTable)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white font-bold shadow-lg transition-all duration-300"
            >
              {showTable ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              {showTable ? 'Masquer' : 'Afficher'}
            </motion.button>
          </div>

        {showTable && (
          <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {Array.isArray(beneficesList) && beneficesList.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900">
                      <th className="px-4 py-4 text-left text-white font-bold">
                        <div className="flex items-center gap-2">
                          <Diamond className="h-4 w-4 text-amber-400" />
                          Produit
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-white font-bold">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          Prix d'achat
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-white font-bold hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-blue-400" />
                          Coût total
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-white font-bold">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          Prix vente
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-white font-bold hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-green-400" />
                          Bénéfice
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left text-white font-bold hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                          Marge
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center text-white font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficesList.map((benefice, index) => (
                      <motion.tr 
                        key={benefice.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 group"
                      >
                        <td className="px-4 py-4">
                          <span className="font-bold text-purple-800 dark:text-purple-300 group-hover:text-purple-600">
                            {benefice.productDescription}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
                            {formatEuro(benefice.prixAchat)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="font-bold text-blue-700 dark:text-blue-400">
                            {formatEuro(benefice.coutTotal)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md">
                            {formatEuro(benefice.prixVenteRecommande)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={cn(
                            "font-black text-lg",
                            benefice.beneficeNet > 0 ? "text-emerald-600" : "text-red-600"
                          )}>
                            {formatEuro(benefice.beneficeNet)}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <Badge className={cn(
                            "border-0 shadow-md font-bold",
                            (benefice.tauxMarge || 0) >= 20 
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" 
                              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                          )}>
                            {(benefice.tauxMarge || 0).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => benefice.id && openDeleteConfirm(benefice.id)}
                            className="p-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 rounded-xl text-white shadow-lg shadow-red-500/30 transition-all duration-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-xl opacity-30 animate-pulse" />
                    <div className="relative p-8 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full">
                      <Calculator className="h-16 w-16 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Aucun calcul enregistré
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Commencez par calculer et sauvegarder vos bénéfices
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          </AnimatePresence>
        )}
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-red-50 dark:from-slate-900 dark:to-red-950/30 border-2 border-red-200/50 dark:border-red-800/50 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-2xl font-black">
              <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-white shadow-lg">
                <Trash2 className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Confirmer la suppression
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-4">
              Êtes-vous sûr de vouloir supprimer définitivement ce calcul de bénéfice ? 
              Cette action est <span className="font-bold text-red-600">irréversible</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="px-6 py-3 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
              Non, annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => beneficeToDelete && handleDelete(beneficeToDelete)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 rounded-xl text-white font-bold shadow-lg shadow-red-500/30 transition-all duration-300"
            >
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfitCalculator;
