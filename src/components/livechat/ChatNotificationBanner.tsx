import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export interface ChatNotifItem {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

interface ChatNotificationBannerProps {
  notifications: ChatNotifItem[];
  onDismiss: (id: string) => void;
  onClick?: (id: string) => void;
}

const ChatNotificationBanner: React.FC<ChatNotificationBannerProps> = ({ notifications, onDismiss, onClick }) => {
  return (
    <div className="fixed bottom-4 left-4 z-[10000] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-blue-600 text-white rounded-2xl shadow-[0_8px_30px_rgba(37,99,235,0.5)] px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-blue-700 transition-colors border border-blue-400/30"
            onClick={() => onClick?.(notif.id)}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{notif.sender}</div>
              <div className="text-xs text-blue-100 truncate">{notif.message}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
              className="p-1 hover:bg-white/20 rounded-lg shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChatNotificationBanner;
