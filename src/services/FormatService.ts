
/**
 * Service de formatage (fonctions pures)
 * Toutes les fonctions sont déterministes et sans effets de bord
 */

/**
 * Service de formatage immuable
 */
export const FormatService = Object.freeze({
  /**
   * Formate un montant en devise
   * @param amount - Montant à formater
   * @param currency - Code de devise (défaut: EUR)
   * @param locale - Locale pour le formatage (défaut: fr-FR)
   * @returns Montant formaté
   */
  formatCurrency(
    amount: number, 
    currency: string = 'EUR', 
    locale: string = 'fr-FR'
  ): string {
    if (!Number.isFinite(amount)) {
      return '0,00 €';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback si la locale ou la devise n'est pas supportée
      return `${amount.toFixed(2)} ${currency}`;
    }
  },

  /**
   * Formate une date selon le format spécifié
   * @param date - Date à formater (Date ou string)
   * @param format - Format de date ('short', 'medium', 'long', 'full')
   * @param locale - Locale pour le formatage (défaut: fr-FR)
   * @returns Date formatée
   */
  formatDate(
    date: Date | string, 
    format: 'short' | 'medium' | 'long' | 'full' = 'short',
    locale: string = 'fr-FR'
  ): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }

      return new Intl.DateTimeFormat(locale, {
        dateStyle: format
      }).format(dateObj);
    } catch {
      return 'Date invalide';
    }
  },

  /**
   * Formate un nombre avec séparateurs de milliers
   * @param number - Nombre à formater
   * @param decimals - Nombre de décimales (défaut: 0)
   * @param locale - Locale pour le formatage (défaut: fr-FR)
   * @returns Nombre formaté
   */
  formatNumber(
    number: number, 
    decimals: number = 0, 
    locale: string = 'fr-FR'
  ): string {
    if (!Number.isFinite(number)) {
      return '0';
    }

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number);
    } catch {
      return number.toFixed(decimals);
    }
  },

  /**
   * Formate un pourcentage
   * @param ratio - Ratio à formater (0.5 = 50%)
   * @param decimals - Nombre de décimales (défaut: 1)
   * @param locale - Locale pour le formatage (défaut: fr-FR)
   * @returns Pourcentage formaté
   */
  formatPercentage(
    ratio: number, 
    decimals: number = 1, 
    locale: string = 'fr-FR'
  ): string {
    if (!Number.isFinite(ratio)) {
      return '0%';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(ratio);
    } catch {
      return `${(ratio * 100).toFixed(decimals)}%`;
    }
  },

  /**
   * Formate une taille de fichier en unités lisibles
   * @param bytes - Taille en bytes
   * @param decimals - Nombre de décimales (défaut: 1)
   * @returns Taille formatée (ex: "1.5 MB")
   */
  formatFileSize(bytes: number, decimals: number = 1): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return '0 B';
    }

    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  },

  /**
   * Formate un temps en format lisible
   * @param seconds - Durée en secondes
   * @returns Durée formatée (ex: "2h 30m 15s")
   */
  formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0s';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts: string[] = [];
    
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  },

  /**
   * Tronque un texte à une longueur donnée
   * @param text - Texte à tronquer
   * @param maxLength - Longueur maximale
   * @param suffix - Suffixe à ajouter (défaut: "...")
   * @returns Texte tronqué
   */
  truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (typeof text !== 'string') {
      return '';
    }

    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * Capitalise la première lettre d'un texte
   * @param text - Texte à capitaliser
   * @returns Texte avec première lettre en majuscule
   */
  capitalize(text: string): string {
    if (typeof text !== 'string' || text.length === 0) {
      return '';
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  /**
   * Formate un nom complet (prénom + nom)
   * @param firstName - Prénom
   * @param lastName - Nom de famille
   * @returns Nom complet formaté
   */
  formatFullName(firstName: string, lastName: string): string {
    const formattedFirstName = this.capitalize(firstName?.trim() || '');
    const formattedLastName = this.capitalize(lastName?.trim() || '');

    if (!formattedFirstName && !formattedLastName) {
      return 'Nom non renseigné';
    }

    return [formattedFirstName, formattedLastName].filter(Boolean).join(' ');
  }
});
