import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Crown, Sparkles } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface ProfileCardProps {
  photoUrl: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole: string;
  onClickUpload: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  photoUrl, firstName, lastName, email, userRole, onClickUpload
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
      <div className="flex flex-col items-center gap-6">
        <ProfileAvatar photoUrl={photoUrl} onClickUpload={onClickUpload} />
        <div className="text-center">
          <h2 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{email}</p>
          {userRole && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs font-bold border border-violet-500/20">
              <Shield className="w-3 h-3" /> {userRole}
            </span>
          )}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En ligne
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
