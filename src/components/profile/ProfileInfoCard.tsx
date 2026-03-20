import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Edit3, Save, X, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

interface ProfileInfoCardProps {
  profile: any;
  editing: boolean;
  editForm: { firstName: string; lastName: string; gender: string; address: string; phone: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; gender: string; address: string; phone: string }>>;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  profile, editing, editForm, setEditForm, onEdit, onCancel, onSave
}) => {
  const fields = [
    { icon: User, label: 'Prénom', key: 'firstName' as const },
    { icon: User, label: 'Nom', key: 'lastName' as const },
    { icon: Mail, label: 'Email', key: 'email' as const, readonly: true },
    { icon: Phone, label: 'Téléphone', key: 'phone' as const },
    { icon: MapPin, label: 'Adresse', key: 'address' as const },
    { icon: User, label: 'Genre', key: 'gender' as const },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" /> Informations Personnelles
        </h3>
        {!editing ? (
          <Button onClick={onEdit} className={`${premiumBtnClass} bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-300/30 text-violet-600 dark:text-violet-400`}>
            <Edit3 className="w-4 h-4 mr-2" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="ghost" className="rounded-xl text-rose-500"><X className="w-4 h-4 mr-1" /> Annuler</Button>
            <Button onClick={onSave} className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30`}>
              <Save className="w-4 h-4 mr-2" /> Enregistrer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {fields.map(({ icon: Icon, label, key, readonly }) => (
          <div key={key} className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-slate-200/50 dark:border-violet-800/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-violet-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            {editing && !readonly ? (
              key === 'gender' ? (
                <select value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full rounded-xl border border-violet-200/30 dark:border-violet-800/20 bg-white dark:bg-white/5 px-3 py-2 text-sm">
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              ) : (
                <Input value={editForm[key as keyof typeof editForm] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                  className="rounded-xl border-violet-200/30 dark:border-violet-800/20" />
              )
            ) : (
              <p className="text-sm font-semibold text-foreground">
                {key === 'email' ? profile?.email : key === 'gender'
                  ? (profile?.gender === 'male' ? 'Homme' : profile?.gender === 'female' ? 'Femme' : 'Autre')
                  : (profile as any)?.[key] || '—'}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileInfoCard;
