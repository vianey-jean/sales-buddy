import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Lock, Eye, StickyNote, Clock, ListTodo, KeyRound, ShieldAlert, CheckCircle } from 'lucide-react';
import shareLinksApi from '@/services/api/shareLinksApi';
import { getDrawingUrl } from '@/services/api/noteApi';

const SharedViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<'code' | 'loading' | 'view' | 'error'>('code');
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dataType, setDataType] = useState<string>('');
  const [data, setData] = useState<any>(null);

  if (!token) return <Navigate to="/" replace />;

  const handleVerify = async () => {
    if (!accessCode.trim()) return;
    setStep('loading');
    try {
      const result = await shareLinksApi.verify(token, accessCode.trim().toUpperCase());
      setDataType(result.type);
      // Now fetch the data
      const viewData = await shareLinksApi.viewData(token);
      setData(viewData);
      setStep('view');
    } catch (err: any) {
      setErrorMsg(err.message || 'Accès refusé');
      setStep('error');
    }
  };

  // Code entry screen
  if (step === 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4"
        onContextMenu={e => e.preventDefault()}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Accès protégé</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Entrez le code d'accès pour voir le contenu partagé.
          </p>
          <input
            type="text"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="Code d'accès (ex: A1B2C3D4)"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-center text-lg font-mono font-bold tracking-widest text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
          />
          <button
            onClick={handleVerify}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            Vérifier et accéder
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md">
          <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Accès refusé</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{errorMsg}</p>
          <button
            onClick={() => { setStep('code'); setErrorMsg(''); setAccessCode(''); }}
            className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // View data
  if (!data) return null;

  const typeConfig = {
    notes: { icon: StickyNote, label: 'Notes partagées', color: 'from-amber-400 to-orange-500' },
    pointage: { icon: Clock, label: 'Pointage partagé', color: 'from-cyan-400 to-blue-500' },
    taches: { icon: ListTodo, label: 'Tâches partagées', color: 'from-violet-400 to-purple-500' },
  };
  const config = typeConfig[dataType as keyof typeof typeConfig] || typeConfig.notes;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 select-none"
      onContextMenu={e => e.preventDefault()}>
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 dark:text-white">{config.label}</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Lecture seule
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Protégé par IP
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* NOTES VIEW */}
        {dataType === 'notes' && data.columns && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {[...data.columns].sort((a: any, b: any) => a.order - b.order).map((col: any) => {
                const colNotes = data.notes.filter((n: any) => n.columnId === col.id).sort((a: any, b: any) => a.order - b.order);
                return (
                  <div key={col.id} className="flex-shrink-0 w-[300px] rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                    <div className="p-4 border-b border-gray-200/40 dark:border-gray-700/30">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: col.color }} />
                        <h3 className="font-bold text-sm text-gray-800 dark:text-white">{col.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">{colNotes.length}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 max-h-[65vh] overflow-y-auto">
                      {colNotes.map((note: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/50 shadow-sm"
                          style={{ borderLeftColor: note.color, borderLeftWidth: '3px' }}>
                          {note.title && <h4 className="font-semibold text-sm text-gray-800 dark:text-white mb-1">{note.title}</h4>}
                          {note.content && <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{note.content}</p>}
                          {note.drawing && <img src={getDrawingUrl(note.drawing) || ''} alt="Dessin" className="mt-2 rounded-lg max-h-32 w-full object-contain pointer-events-none" draggable={false} />}
                          {note.voiceText && <p className="mt-1 text-[10px] text-gray-400 italic">🎤 {note.voiceText}</p>}
                        </div>
                      ))}
                      {colNotes.length === 0 && <p className="text-center text-xs text-gray-400 py-6">Aucune note</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* POINTAGE VIEW */}
        {dataType === 'pointage' && data.pointages && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.pointages.sort((a: any, b: any) => b.date.localeCompare(a.date)).map((p: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">📅 {p.date}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                      {p.montantTotal?.toFixed(2)}€
                    </span>
                  </div>
                  <p className="font-bold text-sm text-gray-800 dark:text-white">{p.entrepriseNom}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{p.typePaiement === 'journalier' ? '📋 Journalier' : `⏱️ ${p.heures}h`}</span>
                    {p.travailleurNom && <span>• 👤 {p.travailleurNom}</span>}
                  </div>
                </div>
              ))}
            </div>
            {data.pointages.length === 0 && (
              <p className="text-center text-gray-400 py-12">Aucun pointage</p>
            )}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total général</p>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {data.pointages.reduce((sum: number, p: any) => sum + (p.montantTotal || 0), 0).toFixed(2)}€
              </p>
            </div>
          </div>
        )}

        {/* TACHES VIEW */}
        {dataType === 'taches' && data.taches && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.taches.sort((a: any, b: any) => {
                if (a.date !== b.date) return b.date.localeCompare(a.date);
                return a.heureDebut.localeCompare(b.heureDebut);
              }).map((t: any, i: number) => (
                <div key={i} className={`p-4 rounded-2xl border backdrop-blur-xl shadow-lg ${
                  t.importance === 'pertinent'
                    ? 'border-red-300/40 dark:border-red-700/40 bg-red-50/80 dark:bg-red-900/10'
                    : 'border-emerald-300/40 dark:border-emerald-700/40 bg-emerald-50/80 dark:bg-emerald-900/10'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400">📅 {t.date}</span>
                    <div className="flex items-center gap-1">
                      {t.completed && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.importance === 'pertinent'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                      }`}>
                        {t.importance === 'pertinent' ? '🔴 Pertinent' : '🟢 Optionnel'}
                      </span>
                    </div>
                  </div>
                  <p className={`font-bold text-sm text-gray-800 dark:text-white ${t.completed ? 'line-through opacity-50' : ''}`}>
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>⏰ {t.heureDebut} - {t.heureFin}</span>
                    {t.travailleurNom && <span>• 👤 {t.travailleurNom}</span>}
                  </div>
                </div>
              ))}
            </div>
            {data.taches.length === 0 && (
              <p className="text-center text-gray-400 py-12">Aucune tâche</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedViewPage;
