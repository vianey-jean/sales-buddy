/**
 * =============================================================================
 * ProfileAvatar — Avatar animé avec anneaux pulsants
 * =============================================================================
 * 
 * Affiche la photo de profil de l'utilisateur avec :
 * - Deux anneaux concentriques verts pulsants (animation greenPulse)
 * - Un bouton caméra en bas à droite pour changer la photo
 * - Un fallback avec l'icône User si aucune photo n'est définie
 * 
 * Props :
 * - photoUrl : URL complète de la photo de profil (ou null)
 * - onClickUpload : callback déclenchée au clic pour ouvrir le sélecteur de fichier
 * =============================================================================
 */

import React from 'react';
import { User, Camera } from 'lucide-react';
import profileApi from '@/services/api/profileApi';

interface ProfileAvatarProps {
  /** URL complète de la photo de profil, ou null si aucune photo */
  photoUrl: string | null;
  /** Callback déclenchée au clic pour ouvrir le sélecteur de fichier */
  onClickUpload: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ photoUrl, onClickUpload }) => {
  return (
    <div className="relative cursor-pointer" onClick={onClickUpload}>
      {/* Conteneur principal avec taille fixe de 160x160px */}
      <div className="relative" style={{ width: 160, height: 160 }}>
        {/* Premier anneau pulsant vert (extérieur) */}
        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400" style={{ animation: 'greenPulse 1s ease-in-out infinite' }} />
        {/* Deuxième anneau pulsant vert (intérieur, décalé de 0.5s) */}
        <div className="absolute rounded-full border-[3px] border-emerald-500" style={{ inset: 6, animation: 'greenPulse 1s ease-in-out infinite 0.5s' }} />
        {/* Zone de la photo avec fond gradient violet/fuchsia */}
        <div className="absolute rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center" style={{ inset: 12 }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            /* Icône par défaut si aucune photo */
            <User className="w-1/2 h-1/2 text-white" />
          )}
        </div>
      </div>
      {/* Bouton caméra flottant en bas à droite */}
      <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0a0020] hover:scale-110 transition-transform">
        <Camera className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default ProfileAvatar;
