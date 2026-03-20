import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tache } from '@/services/api/tacheApi';

export interface TacheNotification {
  id: string;
  tache: Tache;
  message: string;
}

interface TacheNotificationBarProps {
  notifications: TacheNotification[];
  onClickNotification: (notif: TacheNotification) => void;
  onDismiss: (id: string) => void;
}

const TacheNotificationBar: React.FC<TacheNotificationBarProps> = ({
  notifications, onClickNotification, onDismiss
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-md pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={() => onClickNotification(notif)}
            className={cn(
              'pointer-events-auto cursor-pointer relative flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-2xl shadow-2xl',
              notif.tache.importance === 'pertinent'
                ? 'bg-red-500/90 border-red-300/40 text-white shadow-red-500/40'
                : 'bg-emerald-500/90 border-emerald-300/40 text-white shadow-emerald-500/40'
            )}
          >
            <Bell className="h-5 w-5 shrink-0 animate-bounce" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{notif.tache.description}</p>
              <p className="text-xs opacity-80">{notif.message}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
              className="p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TacheNotificationBar;
