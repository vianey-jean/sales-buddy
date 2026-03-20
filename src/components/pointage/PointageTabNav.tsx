import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, ListTodo, StickyNote } from 'lucide-react';

interface PointageTabNavProps {
  activeTab: 'pointage' | 'tache' | 'notes';
  onTabChange: (tab: 'pointage' | 'tache' | 'notes') => void;
}

const PointageTabNav: React.FC<PointageTabNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-6">
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl max-w-lg mx-auto">
        <button
          onClick={() => onTabChange('pointage')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300',
            activeTab === 'pointage'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <Clock className="h-4 w-4" />
          Pointage
        </button>
        <button
          onClick={() => onTabChange('tache')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300',
            activeTab === 'tache'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <ListTodo className="h-4 w-4" />
          Tâches
        </button>
        <button
          onClick={() => onTabChange('notes')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300',
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10'
          )}
        >
          <StickyNote className="h-4 w-4" />
          Notes
        </button>
      </div>
    </div>
  );
};

export default PointageTabNav;
