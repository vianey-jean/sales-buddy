import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Travailleur } from '@/services/api/travailleurApi';

interface PointageTravailleurs_ListProps {
  travailleurs: Travailleur[];
}

const PointageTravailleursList: React.FC<PointageTravailleurs_ListProps> = ({ travailleurs }) => {
  const [show, setShow] = useState(true);

  if (travailleurs.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="mt-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
      <button onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity">
        <h3 className="text-lg font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" /> Listes de mes Travailleurs ({travailleurs.length})
        </h3>
        {show ? <ChevronUp className="h-5 w-5 text-purple-500" /> : <ChevronDown className="h-5 w-5 text-purple-500" />}
      </button>
      {show && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {travailleurs.map(trav => (
            <div key={trav.id} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {trav.prenom[0]}{trav.nom[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{trav.prenom} {trav.nom}</h4>
                    {trav.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{trav.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'text-[10px] px-2 py-1 rounded-full font-bold',
                    trav.role === 'administrateur' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  )}>
                    {trav.role === 'administrateur' ? '👑 Admin' : '👤 Autre'}
                  </span>
                  <span className={cn(
                    'text-[10px] px-2 py-1 rounded-full font-bold',
                    trav.genre === 'homme' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  )}>
                    {trav.genre === 'homme' ? '👨 Homme' : '👩 Femme'}
                  </span>
                </div>
              </div>
              {trav.adresse && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{trav.adresse}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PointageTravailleursList;
