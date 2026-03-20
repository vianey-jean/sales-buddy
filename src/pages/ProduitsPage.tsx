{/** Ajouter les pagionation de la page*/ }

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { productService } from '@/service/api';
import { Product } from '@/types';
import { fournisseurApiService } from '@/services/api/fournisseurApi';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Package, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle2, XCircle,
  AlertTriangle, Camera, Star, Euro, Hash, Sparkles, ChevronLeft, ChevronRight,
  X, PackagePlus, Pencil, ImageOff, ShoppingBag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import SharedPagination from '@/components/shared/Pagination';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import PhotoUploadSection from '@/components/dashboard/PhotoUploadSection';
import EditProductForm from '@/components/dashboard/EditProductForm';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

type FilterType = 'tous' | 'perruque' | 'tissage' | 'extension' | 'autres';

const ProduitsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { products, fetchProducts } = useApp();
  const { toast } = useToast();

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('tous');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);

  // Selected product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add form
  const [addForm, setAddForm] = useState({ description: '', purchasePrice: '', quantity: '', fournisseur: '' });
  const [addPhotos, setAddPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Edit form
  const [editForm, setEditForm] = useState({ description: '', purchasePrice: 0, quantity: 0, additionalQuantity: 0, fournisseur: '' });
  const [editPhotos, setEditPhotos] = useState<{ files: File[]; existingUrls: string[]; mainIndex: number }>({ files: [], existingUrls: [], mainIndex: 0 });

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slideshow
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeFilter !== 'tous') {
      filtered = filtered.filter(p => {
        const desc = p.description.toLowerCase();
        switch (activeFilter) {
          case 'perruque': return desc.includes('perruque');
          case 'tissage': return desc.includes('tissage');
          case 'extension': return desc.includes('extension');
          case 'autres': return !desc.includes('perruque') && !desc.includes('tissage') && !desc.includes('extension');
          default: return true;
        }
      });
    }

    if (searchQuery.length >= 3) {
      filtered = filtered.filter(p =>
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [products, activeFilter, searchQuery]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Search results for quick search
  const searchResults = useMemo(() => {
    if (searchQuery.length < 3) return [];
    return products.filter(p =>
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);
  }, [products, searchQuery]);

  // Photo URL helper
  const getPhotoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob') || url.startsWith('data:')) return url;
    return `${BASE_URL}${url}`;
  };

  // Slideshow auto-advance
  useEffect(() => {
    if (!isViewOpen || !selectedProduct) return;
    const photos = selectedProduct.photos || [];
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isViewOpen, selectedProduct]);

  // ===== ADD =====
  const handleAddSubmit = () => {
    const errors: Record<string, string> = {};
    if (!addForm.description) errors.description = 'Description requise';
    if (!addForm.purchasePrice || Number(addForm.purchasePrice) <= 0) errors.purchasePrice = 'Prix valide requis';
    if (!addForm.quantity || Number(addForm.quantity) < 0) errors.quantity = 'Quantité valide requise';
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }
    setAddErrors({});
    setIsAddConfirmOpen(true);
  };

  const confirmAdd = async () => {
    setIsSubmitting(true);
    try {
      // Auto-create fournisseur if new
      if (addForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(addForm.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      const newProduct = await productService.addProduct({
        description: addForm.description,
        purchasePrice: Number(addForm.purchasePrice),
        quantity: Number(addForm.quantity),
        fournisseur: addForm.fournisseur.trim() || undefined,
      });

      if (newProduct && addPhotos.files.length > 0) {
        await productService.uploadProductPhotos(newProduct.id, addPhotos.files, addPhotos.mainIndex);
      }

      toast({ title: 'Succès', description: 'Produit ajouté avec succès', className: 'notification-success' });
      setIsAddConfirmOpen(false);
      setIsAddOpen(false);
      setAddForm({ description: '', purchasePrice: '', quantity: '', fournisseur: '' });
      setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 });
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: "Erreur lors de l'ajout", variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== EDIT =====
  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      description: product.description,
      purchasePrice: product.purchasePrice,
      quantity: product.quantity,
      additionalQuantity: 0,
      fournisseur: product.fournisseur || '',
    });
    setEditPhotos({ files: [], existingUrls: product.photos || [], mainIndex: 0 });
    setIsEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedProduct) return;
    setIsEditConfirmOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      // Auto-create fournisseur if new
      if (editForm.fournisseur.trim()) {
        try { await fournisseurApiService.create(editForm.fournisseur.trim()); } catch (e) { console.error('Fournisseur create error:', e); }
      }

      await productService.updateProduct({
        ...selectedProduct,
        description: editForm.description,
        purchasePrice: editForm.purchasePrice,
        quantity: editForm.quantity + editForm.additionalQuantity,
        fournisseur: editForm.fournisseur.trim() || undefined,
      });

      const hasNewPhotos = editPhotos.files.length > 0;
      const existingPhotosChanged = JSON.stringify(editPhotos.existingUrls) !== JSON.stringify(selectedProduct.photos || []);
      if (hasNewPhotos || existingPhotosChanged) {
        await productService.replaceProductPhotos(selectedProduct.id, editPhotos.files, editPhotos.existingUrls, editPhotos.mainIndex);
      }

      toast({ title: 'Succès', description: 'Produit modifié avec succès', className: 'notification-success' });
      setIsEditConfirmOpen(false);
      setIsEditOpen(false);
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la modification', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== DELETE =====
  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProduct(selectedProduct.id);
      toast({ title: 'Succès', description: `"${selectedProduct.description}" supprimé`, className: 'notification-success' });
      setIsDeleteConfirmOpen(false);
      setSelectedProduct(null);
      if (fetchProducts) await fetchProducts();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive', className: 'notification-erreur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== VIEW =====
  const openView = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPhotoIndex(0);
    setIsViewOpen(true);
  };

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'tous', label: 'Tous', icon: <Package className="h-3.5 w-3.5" /> },
    { key: 'perruque', label: 'Perruques', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'tissage', label: 'Tissages', icon: <Star className="h-3.5 w-3.5" /> },
    { key: 'extension', label: 'Extensions', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    { key: 'autres', label: 'Autres', icon: <Filter className="h-3.5 w-3.5" /> },
  ];

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0025] dark:to-[#0e0030]">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                ✨ Gestion des Produits
              </h1>
              <p className="text-muted-foreground font-medium">Gérez votre inventaire premium avec élégance</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
          {/* Search + Add */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
          >
            {/* Search */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-400" />
                <Input
                  placeholder="Rechercher un produit (3 caractères min.)..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(e.target.value.length >= 3); }}
                  onFocus={() => { if (searchQuery.length >= 3) setShowSearchResults(true); }}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pl-12 h-14 rounded-2xl border-2 border-violet-200/50 dark:border-violet-800/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl focus:border-violet-500 shadow-lg shadow-violet-500/5 text-base font-medium transition-all duration-300"
                />
              </div>
              {/* Quick search results dropdown */}
              {/* <AnimatePresence>
                {showSearchResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 top-full mt-2 w-full rounded-2xl border border-violet-200/30 dark:border-violet-800/30 bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl shadow-2xl shadow-violet-500/10 overflow-hidden"
                  >
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => { e.preventDefault(); openView(p); setShowSearchResults(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-500/10 transition-all duration-200 text-left border-b border-violet-100/20 dark:border-violet-800/20 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-100 dark:bg-violet-900/30 flex-shrink-0">
                          {p.mainPhoto || (p.photos && p.photos.length > 0) ? (
                            <img src={getPhotoUrl(p.mainPhoto || p.photos![0])} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageOff className="h-4 w-4 text-violet-400" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-foreground">{p.description}</p>
                          <p className="text-xs text-muted-foreground">{p.code} · {p.quantity} en stock · {p.purchasePrice}€</p>
                        </div>
                        <Eye className="h-4 w-4 text-violet-400 flex-shrink-0" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Add button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsAddOpen(true)}
                  className="h-14 px-6 rounded-2xl font-bold bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 border-0 w-full sm:w-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter Produit
                </Button>
              </motion.div>

              {/* Edit button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsEditProductOpen(true)}
                  className="h-14 px-6 rounded-2xl font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 border-0 w-full sm:w-auto"
                >
                  <Pencil className="h-5 w-5 mr-2" />
                  Modifier Produit
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {filters.map(f => (
              <Button
                key={f.key}
                variant="outline"
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "rounded-2xl font-bold transition-all duration-300 border-2 backdrop-blur-xl",
                  activeFilter === f.key
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-violet-500/25"
                    : "border-violet-200/30 dark:border-violet-800/30 hover:border-violet-400 bg-white/50 dark:bg-white/5"
                )}
              >
                {f.icon}
                <span className="ml-1.5">{f.label}</span>
                <Badge variant="secondary" className={cn(
                  "ml-2 text-xs",
                  activeFilter === f.key ? "bg-white/20 text-white" : "bg-violet-100 dark:bg-violet-900/30"
                )}>
                  {f.key === 'tous' ? products.length : products.filter(p => {
                    const d = p.description.toLowerCase();
                    if (f.key === 'perruque') return d.includes('perruque');
                    if (f.key === 'tissage') return d.includes('tissage');
                    if (f.key === 'extension') return d.includes('extension');
                    if (f.key === 'autres') return !d.includes('perruque') && !d.includes('tissage') && !d.includes('extension');
                    return false;
                  }).length}
                </Badge>
              </Button>
            ))}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Produits', value: products.length, gradient: 'from-violet-500 to-purple-600', shadow: 'violet' },
              { label: 'En Stock', value: products.filter(p => p.quantity > 0).length, gradient: 'from-emerald-500 to-teal-600', shadow: 'emerald' },
              { label: 'Rupture', value: products.filter(p => p.quantity === 0).length, gradient: 'from-red-500 to-rose-600', shadow: 'red' },
              { label: 'Valeur Stock', value: `${products.reduce((acc, p) => acc + p.purchasePrice * p.quantity, 0).toFixed(0)}€`, gradient: 'from-amber-500 to-orange-600', shadow: 'amber' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                className={cn(
                  "relative rounded-2xl p-4 overflow-hidden backdrop-blur-xl border border-white/10",
                  "bg-gradient-to-br", stat.gradient,
                  `shadow-xl shadow-${stat.shadow}-500/20`
                )}
              >
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative">
                  <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                  <p className="text-white text-2xl font-black mt-1">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Products Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl border border-violet-200/20 dark:border-violet-800/20 overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-white/5 shadow-2xl shadow-violet-500/5"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-b border-violet-200/20 dark:border-violet-800/20">
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Photo</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Code</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Description</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Prix</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300">Qté</TableHead>
                    <TableHead className="font-black text-violet-700 dark:text-violet-300 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Package className="h-8 w-8 text-violet-400" />
                          </div>
                          <p className="font-bold text-muted-foreground">Aucun produit trouvé</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <TableRow key={product.id}
                        className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-fuchsia-50 dark:hover:from-violet-900/10 dark:hover:to-fuchsia-900/10 transition-all duration-200 border-b border-violet-100/20 dark:border-violet-800/10"
                      >
                        {/* Photo with eye icon */}
                        <TableCell>
                          <div className="relative group cursor-pointer" onClick={() => openView(product)}>
                            <div className="h-12 rounded-xl overflow-hidden border-2 border-violet-200/30 dark:border-violet-800/30 shadow-md">
                              {product.mainPhoto || (product.photos && product.photos.length > 0) ? (
                                <img src={getPhotoUrl(product.mainPhoto || product.photos![0])} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                  <ImageOff className="h-5 w-5 text-violet-400" />
                                </div>
                              )}
                            </div>
                            {/* Eye overlay */}
                            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                            {product.code || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground max-w-[200px] truncate">{product.description}</TableCell>
                        <TableCell>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{product.purchasePrice}€</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-bold border-0",
                            product.quantity > 0
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          )}>
                            {product.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openView(product)}
                              className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-all duration-200 backdrop-blur-xl border border-violet-200/20 dark:border-violet-800/20"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </motion.button>
                            {/* Edit */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(product)}
                              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all duration-200 backdrop-blur-xl border border-blue-200/20 dark:border-blue-800/20"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            {/* Delete */}
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={() => openDelete(product)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200 backdrop-blur-xl border border-red-200/20 dark:border-red-800/20"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>

          {/* Pagination */}
          <SharedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            showFirstLast={true}
            showItemCount={true}
            siblingCount={1}
          />
        </div>

        {/* ========== ADD MODAL ========== */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-green-900/30 to-emerald-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="text-center space-y-4 pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ✨ Nouveau Produit Premium
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="add-desc" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-400" /> Description du produit
                </Label>
                <Input id="add-desc" value={addForm.description}
                  onChange={(e) => { setAddForm({ ...addForm, description: e.target.value }); if (addErrors.description) setAddErrors({ ...addErrors, description: '' }); }}
                  placeholder="Entrez une description premium..."
                  className="bg-white/10 border border-white/20 focus:border-green-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
                {addErrors.description && <p className="text-sm text-red-400">{addErrors.description}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-price" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" /> Prix (€)
                </Label>
                <Input id="add-price" type="number" step="0.01" value={addForm.purchasePrice}
                  onChange={(e) => { setAddForm({ ...addForm, purchasePrice: e.target.value }); if (addErrors.purchasePrice) setAddErrors({ ...addErrors, purchasePrice: '' }); }}
                  className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
                {addErrors.purchasePrice && <p className="text-sm text-red-400">{addErrors.purchasePrice}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-qty" className="text-sm font-bold text-white/80 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-400" /> Quantité en stock
                </Label>
                <Input id="add-qty" type="number" value={addForm.quantity}
                  onChange={(e) => { setAddForm({ ...addForm, quantity: e.target.value }); if (addErrors.quantity) setAddErrors({ ...addErrors, quantity: '' }); }}
                  className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                />
                {addErrors.quantity && <p className="text-sm text-red-400">{addErrors.quantity}</p>}
              </div>
              <FournisseurAutocomplete
                value={addForm.fournisseur}
                onChange={(val) => setAddForm({ ...addForm, fournisseur: val })}
                variant="dark"
              />
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <PhotoUploadSection
                  onPhotosChange={(files, existingUrls, mainIndex) => setAddPhotos({ files, existingUrls, mainIndex })}
                  maxPhotos={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleAddSubmit} disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all duration-300 border-0"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Ajouter au Stock
                </Button>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setAddPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                  className="flex-1 h-12 rounded-xl font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <XCircle className="h-5 w-5 mr-2" /> Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========== ADD CONFIRM ========== */}
        <AlertDialog open={isAddConfirmOpen} onOpenChange={setIsAddConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <PackagePlus className="h-8 w-8 text-white" />
              </div>
              <AlertDialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                ✨ Confirmer l'ajout
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground font-medium">
                Voulez-vous vraiment ajouter ce produit ?
              </AlertDialogDescription>
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800/30 text-left space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Produit:</span><span className="font-bold">{addForm.description}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Prix:</span><span className="font-bold text-amber-600">{addForm.purchasePrice}€</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Quantité:</span><span className="font-bold text-blue-600">{addForm.quantity}</span></div>
                {addForm.fournisseur && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Fournisseur:</span><span className="font-bold text-orange-600">{addForm.fournisseur}</span></div>}
                {addPhotos.files.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Photos:</span><span className="font-bold text-purple-600">{addPhotos.files.length}</span></div>}
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-4">
              <AlertDialogCancel className="flex-1 rounded-xl border-2 font-bold"><XCircle className="h-5 w-5 mr-2" />Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAdd} disabled={isSubmitting}
                className="flex-1 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 border-0"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />{isSubmitting ? 'Ajout...' : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== EDIT MODAL ========== */}
        {selectedProduct && (
          <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) { setIsEditOpen(false); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); } }}>
            <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-blue-900/40 to-indigo-900/30 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center space-y-4 pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Edit className="h-8 w-8 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ✨ Modifier Produit Premium
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-400" /> Description
                  </Label>
                  <Input value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="bg-white/10 border border-white/20 focus:border-blue-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" /> Prix (€)
                  </Label>
                  <Input type="number" step="0.01" value={editForm.purchasePrice}
                    onChange={(e) => setEditForm({ ...editForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border border-white/20 focus:border-yellow-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white/80 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-indigo-400" /> Quantité actuelle: {editForm.quantity}
                  </Label>
                  <Input type="number" value={editForm.additionalQuantity}
                    onChange={(e) => setEditForm({ ...editForm, additionalQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="Ajouter quantité..."
                    className="bg-white/10 border border-white/20 focus:border-indigo-400 rounded-xl text-white placeholder:text-white/40 hover:bg-white/15 transition-all"
                  />
                  <p className="text-sm text-white/50 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-400" /> Quantité finale: <b className="text-white/80">{editForm.quantity + editForm.additionalQuantity}</b>
                  </p>
                </div>
                <FournisseurAutocomplete
                  value={editForm.fournisseur}
                  onChange={(val) => setEditForm({ ...editForm, fournisseur: val })}
                  variant="dark"
                />
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <PhotoUploadSection
                    existingPhotos={selectedProduct.photos || []}
                    existingMainPhoto={selectedProduct.mainPhoto}
                    baseUrl={BASE_URL}
                    onPhotosChange={(files, existingUrls, mainIndex) => setEditPhotos({ files, existingUrls, mainIndex })}
                    maxPhotos={6}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleEditSubmit} disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 border-0"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Envoi...' : 'Sauvegarder'}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditPhotos({ files: [], existingUrls: [], mainIndex: 0 }); }}
                    className="flex-1 h-12 rounded-xl font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <XCircle className="h-5 w-5 mr-2" /> Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ========== EDIT CONFIRM ========== */}
        <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Confirmer la modification
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Voulez-vous vraiment modifier ce produit ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-4">
              <AlertDialogCancel className="rounded-xl border-2 font-bold">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmEdit} disabled={isSubmitting}
                className="rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
              >
                {isSubmitting ? 'Modification...' : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== DELETE CONFIRM ========== */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-700 to-rose-700 bg-clip-text text-transparent">
                ⚠️ Supprimer ce produit ?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold text-red-600">Vous êtes sur le point de supprimer définitivement :</p>
                <p className="text-lg font-bold bg-red-100/50 dark:bg-red-900/20 px-4 py-2 rounded-xl">"{selectedProduct?.description}"</p>
                <p className="text-sm text-red-500 mt-4">⚠️ Cette action est <span className="font-bold">irréversible</span>. Toutes les données et photos seront perdues.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 pt-6">
              <AlertDialogCancel className="flex-1 rounded-xl border-2 font-semibold"><XCircle className="mr-2 h-5 w-5" />Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting}
                className="flex-1 rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/30"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ========== VIEW MODAL (Photo Slideshow) ========== */}
        {selectedProduct && (
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-violet-900/30 to-purple-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center space-y-4 pb-2">
                <div className="mx-auto flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl shadow-violet-500/30">
                  <Eye className="h-8 w-8 text-white" />
                  <span className="text-white font-bold text-lg">Voir Produit</span>
                </div>
                <DialogTitle className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {selectedProduct.description}
                </DialogTitle>
              </DialogHeader>

              {/* Photo slideshow */}
              {(selectedProduct.photos && selectedProduct.photos.length > 0) ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <div className="aspect-[4/3] relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentPhotoIndex}
                        src={getPhotoUrl(selectedProduct.photos[currentPhotoIndex])}
                        alt={`Photo ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-contain bg-black/20"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>
                    {/* Navigation arrows */}
                    {selectedProduct.photos.length > 1 && (
                      <>
                        <button onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? selectedProduct.photos!.length - 1 : prev - 1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xl border border-white/10 transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % selectedProduct.photos!.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-xl border border-white/10 transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    {/* Dots */}
                    {selectedProduct.photos.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {selectedProduct.photos.map((_, i) => (
                          <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                            className={cn(
                              "w-2.5 h-2.5 rounded-full transition-all duration-300",
                              i === currentPhotoIndex ? "bg-white scale-125 shadow-lg" : "bg-white/40 hover:bg-white/60"
                            )}
                          />
                        ))}
                      </div>
                    )}
                    {/* Counter */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-xl text-white text-xs font-bold border border-white/10">
                      {currentPhotoIndex + 1}/{selectedProduct.photos.length}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ImageOff className="h-12 w-12 text-white/30 mx-auto" />
                    <p className="text-white/40 font-medium">Aucune photo</p>
                  </div>
                </div>
              )}

              {/* Product details */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs font-medium">Code</p>
                    <p className="text-white font-bold text-lg">{selectedProduct.code || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs font-medium">Prix d'achat</p>
                    <p className="text-amber-400 font-bold text-lg">{selectedProduct.purchasePrice}€</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs font-medium">Quantité</p>
                    <p className={cn("font-bold text-lg", selectedProduct.quantity > 0 ? "text-emerald-400" : "text-red-400")}>{selectedProduct.quantity}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-white/50 text-xs font-medium">Photos</p>
                    <p className="text-purple-400 font-bold text-lg">{selectedProduct.photos?.length || 0}</p>
                  </div>
                </div>

                {/* Fournisseur */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-white/50 text-xs font-medium">Fournisseur</p>
                  <p className="text-cyan-400 font-bold text-lg">{selectedProduct.fournisseur || '—'}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => { setIsViewOpen(false); openEdit(selectedProduct); }}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
                  >
                    <Edit className="h-5 w-5 mr-2" /> Modifier
                  </Button>
                  <Button onClick={() => { setIsViewOpen(false); openDelete(selectedProduct); }}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 border-0"
                  >
                    <Trash2 className="h-5 w-5 mr-2" /> Supprimer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductForm
        isOpen={isEditProductOpen}
        onClose={() => setIsEditProductOpen(false)}
      />
    </div>
  );

  if (embedded) return content;
  return <Layout>{content}</Layout>;
};

export default ProduitsPage;
