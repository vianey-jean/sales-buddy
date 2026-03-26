import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Edit3, Save, X, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const premiumBtnClass =
  "group relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] px-5 py-3 text-sm font-semibold shadow-lg";

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
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-[28px] backdrop-blur-2xl bg-white/60 dark:bg-white/[0.03]
                 border border-white/20 dark:border-white/10
                 shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                 overflow-hidden p-8"
    >

      {/* Glow premium */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/20 blur-[120px] rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-fuchsia-500/20 blur-[120px] rounded-full" />

      {/* Ligne gradient haut */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-70" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-3 tracking-tight">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-md">
            <Shield className="w-5 h-5 text-violet-500" />
          </div>
          Informations Personnelles
        </h3>

        {!editing ? (
          <Button
            onClick={onEdit}
            className={`${premiumBtnClass}
              bg-white/40 dark:bg-white/10
              border-white/30
              hover:bg-white/60 dark:hover:bg-white/20
              text-violet-600 dark:text-violet-300`}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
            </Button>

            <Button
              onClick={onSave}
              className={`${premiumBtnClass}
                bg-gradient-to-r from-violet-600 to-fuchsia-600
                text-white border-white/20
                shadow-[0_8px_30px_rgba(139,92,246,0.4)]
                hover:shadow-[0_10px_40px_rgba(139,92,246,0.6)]`}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {fields.map(({ icon: Icon, label, key, readonly }) => (
          <motion.div
            key={key}
            whileHover={{ y: -4 }}
            className="group rounded-2xl p-[1px] bg-gradient-to-br from-white/40 to-white/5 dark:from-white/10 dark:to-transparent"
          >
            <div className="rounded-2xl h-full bg-white/70 dark:bg-white/[0.03]
                            backdrop-blur-xl border border-white/20 dark:border-white/10
                            p-5 transition-all duration-300
                            group-hover:border-violet-400/40">

              {/* Header champ */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20
                                flex items-center justify-center shadow-inner">
                  <Icon className="w-4 h-4 text-violet-500" />
                </div>

                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {label}
                </span>
              </div>

              {/* Input / Texte */}
              {editing && !readonly ? (
                key === 'gender' ? (
                  <select
                    value={editForm.gender}
                    onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full rounded-xl border border-white/20
                               bg-white/80 dark:bg-white/5
                               px-3 py-2 text-sm backdrop-blur-md
                               focus:ring-2 focus:ring-violet-500/40 outline-none"
                  >
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                ) : (
                  <Input
                    value={editForm[key as keyof typeof editForm] || ''}
                    onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                    className="rounded-xl border-white/20 bg-white/80 dark:bg-white/5 backdrop-blur-md
                               focus:ring-2 focus:ring-violet-500/40"
                  />
                )
              ) : (
                <p className="text-sm font-semibold text-foreground tracking-tight">
                  {key === 'email'
                    ? profile?.email
                    : key === 'gender'
                      ? (profile?.gender === 'male'
                        ? 'Homme'
                        : profile?.gender === 'female'
                          ? 'Femme'
                          : 'Autre')
                      : (profile as any)?.[key] || '—'}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileInfoCard;