import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, LinkIcon, X, Trash2, Plus, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import shareLinksApi, { ShareLink } from '@/services/api/shareLinksApi';

interface ShareLinkModalProps {
  open: boolean;
  onClose: () => void;
  type: 'notes' | 'pointage' | 'taches';
  typeLabel: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ open, onClose, type, typeLabel }) => {
  const { toast } = useToast();
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchLinks();
  }, [open]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await shareLinksApi.list(type);
      setLinks(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await shareLinksApi.generate(type);
      toast({ title: '✅ Nouveau lien créé' });
      fetchLinks();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await shareLinksApi.revoke(id);
      toast({ title: '✅ Lien révoqué' });
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleCopy = (link: ShareLink) => {
    const url = `${window.location.origin}/shared/${link.token}`;
    const text = `🔗 Lien: ${url}\n🔑 Code d'accès: ${link.accessCode}`;
    navigator.clipboard.writeText(text);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✅ Lien et code copiés !' });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bold text-gray-800 dark:text-white">Partage {typeLabel}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Créez des liens de partage sécurisés. Chaque lien est protégé par un code unique et verrouillé à l'adresse IP du premier visiteur.
        </p>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 mb-4 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {generating ? 'Création...' : 'Créer un nouveau lien'}
        </button>

        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Aucun lien créé</p>
          ) : (
            links.map(link => (
              <div key={link.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] text-gray-400">
                      {new Date(link.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(link)}
                      className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                      title="Copier le lien et le code"
                    >
                      {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRevoke(link.id)}
                      className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                      title="Révoquer ce lien"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all bg-white dark:bg-gray-800 rounded-lg px-2 py-1.5 mb-1.5">
                  {`${window.location.origin}/shared/${link.token}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono tracking-widest">{link.accessCode}</span>
                  <span className="text-[10px] text-gray-400 ml-1">code d'accès</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
