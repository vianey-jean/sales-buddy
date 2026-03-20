import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import profileApi, { ProfileData } from '@/services/api/profileApi';
import { motion } from 'framer-motion';
import { User, Camera, Lock, Shield, Sparkles, Crown, Settings } from 'lucide-react';
import ParametresSection from '@/components/profile/ParametresSection';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import PasswordSection from '@/components/profile/PasswordSection';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

const ProfilePage: React.FC = () => {
  const { user, verifySession } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profil' | 'parametres'>('profil');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', gender: '', address: '', phone: '' });

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);

  // Confirmations
  const [confirmProfile, setConfirmProfile] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [confirmPhoto, setConfirmPhoto] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Role-based visibility
  const userRole = (profile as any)?.role || (user as any)?.role || '';
  const isAdminPrincipal = userRole === 'administrateur principale';
  const isAdmin = userRole === 'administrateur' || isAdminPrincipal;
  const canSeeSettings = isAdmin;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setEditForm({ firstName: data.firstName, lastName: data.lastName, gender: data.gender || '', address: data.address || '', phone: data.phone || '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setConfirmPhoto(true);
  };

  const uploadPhoto = async () => {
    if (!pendingPhoto) return;
    try {
      setSaving(true);
      const result = await profileApi.uploadPhoto(pendingPhoto);
      setProfile(prev => prev ? { ...prev, profilePhoto: result.photoUrl } : prev);
      localStorage.setItem('user', JSON.stringify({ ...profile, profilePhoto: result.photoUrl }));
      await verifySession();
      toast({ title: '✅ Photo mise à jour', description: 'Votre photo de profil a été enregistrée', className: 'bg-green-600 text-white border-green-600' });
    } catch (e) {
      toast({ title: 'Erreur', description: "Échec de l'envoi de la photo", variant: 'destructive' });
    } finally {
      setSaving(false);
      setPendingPhoto(null);
      setPhotoPreview(null);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const result = await profileApi.updateProfile(editForm);
      setProfile(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      await verifySession();
      setEditing(false);
      toast({ title: '✅ Profil mis à jour', description: 'Vos informations ont été enregistrées', className: 'bg-green-600 text-white border-green-600' });
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      setSaving(true);
      const result = await profileApi.changePassword(pwForm);
      if (result.success) {
        toast({ title: '✅ Mot de passe modifié', description: 'Votre mot de passe a été changé avec succès', className: 'bg-green-600 text-white border-green-600' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = profile?.profilePhoto ? profileApi.getPhotoUrl(profile.profilePhoto) : null;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes greenPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          50% { opacity: 0.5; box-shadow: 0 0 15px 5px rgba(52, 211, 153, 0.3); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0020] dark:to-[#0e0030] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-300/20 mb-4">
              <Crown className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Profil Utilisateur</span>
              <Sparkles className="w-3 h-3 text-fuchsia-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Mon Profil
            </h1>
          </motion.div>

          {/* TAB TOGGLE */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="flex justify-center gap-3"
          >
            <Button
              onClick={() => setActiveTab('profil')}
              className={`${premiumBtnClass} ${
                activeTab === 'profil'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-violet-400/30 shadow-lg shadow-violet-500/25'
                  : 'bg-white/50 dark:bg-white/5 border-violet-200/30 dark:border-violet-800/20 text-foreground hover:bg-violet-50 dark:hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4 mr-2" /> Profil
            </Button>

            {canSeeSettings && (
              <Button
                onClick={() => setActiveTab('parametres')}
                className={`${premiumBtnClass} ${
                  activeTab === 'parametres'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/30 shadow-lg shadow-amber-500/25'
                    : 'bg-white/50 dark:bg-white/5 border-violet-200/30 dark:border-violet-800/20 text-foreground hover:bg-amber-50 dark:hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" /> Paramètres
              </Button>
            )}
          </motion.div>

          {/* PROFIL TAB */}
          {activeTab === 'profil' && (
            <>
              <ProfileCard
                photoUrl={photoUrl}
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                email={profile?.email}
                userRole={userRole}
                onClickUpload={() => fileInputRef.current?.click()}
              />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />

              <ProfileInfoCard
                profile={profile}
                editing={editing}
                editForm={editForm}
                setEditForm={setEditForm}
                onEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
                onSave={() => setConfirmProfile(true)}
              />

              <PasswordSection
                showPasswordForm={showPasswordForm}
                setShowPasswordForm={setShowPasswordForm}
                pwForm={pwForm}
                setPwForm={setPwForm}
                showPw={showPw}
                setShowPw={setShowPw}
                isNewPasswordValid={isNewPasswordValid}
                setIsNewPasswordValid={setIsNewPasswordValid}
                onSubmit={() => setConfirmPassword(true)}
              />
            </>
          )}

          {/* PARAMETRES TAB */}
          {activeTab === 'parametres' && canSeeSettings && (
            <ParametresSection userRole={userRole} />
          )}

        </div>
      </div>

      {/* CONFIRM DIALOGS */}
      <AlertDialog open={confirmProfile} onOpenChange={setConfirmProfile}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-violet-500" /> Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription>Voulez-vous enregistrer les modifications de votre profil ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={saveProfile} disabled={saving} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              {saving ? 'Enregistrement...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPassword} onOpenChange={setConfirmPassword}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-rose-500" /> Confirmer le changement de mot de passe</AlertDialogTitle>
            <AlertDialogDescription>Voulez-vous vraiment changer votre mot de passe ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={changePassword} disabled={saving} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white">
              {saving ? 'Modification...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPhoto} onOpenChange={v => { setConfirmPhoto(v); if (!v) { setPendingPhoto(null); setPhotoPreview(null); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-violet-500" /> Confirmer la photo</AlertDialogTitle>
            <AlertDialogDescription>Voulez-vous utiliser cette photo comme photo de profil ?</AlertDialogDescription>
          </AlertDialogHeader>
          {photoPreview && (
            <div className="flex justify-center py-4">
              <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-violet-300/30" />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={uploadPhoto} disabled={saving} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
              {saving ? 'Envoi...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProfilePage;
