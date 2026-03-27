/**
 * Auto-Backup Service
 * - Surveille les modifications des fichiers DB
 * - Ignore les changements venant de profile/settings/parametres
 * - Déclenche une sauvegarde automatique 5 minutes après un changement de données "métier"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../db');
const settingsPath = path.join(dbPath, 'settings.json');

// Routes à ignorer (profile, settings, parametres)
const IGNORED_ROUTE_PREFIXES = [
  '/api/profile',
  '/api/settings',
  '/api/parametres',
  '/api/module-settings',
  '/api/indisponible',
  '/api/auth',
  '/api/messagerie',
  '/api/sync'
];

// Fichiers DB à ignorer pour le déclenchement
const IGNORED_DB_FILES = [
  'settings.json',
  'prixpointage.json',
  'parametretache.json',
  'moduleSettings.json'
];

let backupTimer = null;
let lastAutoBackupDate = null;
let pendingChanges = false;
let autoBackupEnabled = true; // false quand les données viennent de l'injection

const BACKUP_DELAY_MS = 5 * 60 * 1000; // 5 minutes

// Lire un JSON en toute sécurité
const readJson = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return null; }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Collecter toutes les données DB pour le backup
const getDbFiles = () => {
  try {
    return fs.readdirSync(dbPath).filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
};

// Créer le backup automatique (sans encryption, stocké localement)
const performAutoBackup = () => {
  try {
    console.log('🔄 Auto-backup déclenché...');

    const backupData = {};
    getDbFiles().forEach(file => {
      const filePath = path.join(dbPath, file);
      const data = readJson(filePath);
      if (data !== null) {
        backupData[file] = data;
      }
    });

    backupData._metadata = {
      backupDate: new Date().toISOString(),
      version: '1.0',
      type: 'auto',
      filesCount: Object.keys(backupData).length - 1
    };

    // Sauvegarder dans un dossier backups
    const backupsDir = path.join(dbPath, '../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupsDir, `auto-backup-${dateStr}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    // Garder seulement les 10 derniers backups auto
    const backupFiles = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('auto-backup-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length > 10) {
      backupFiles.slice(10).forEach(f => {
        try {
          fs.unlinkSync(path.join(backupsDir, f));
        } catch (e) {
          console.error('Erreur suppression ancien backup:', e.message);
        }
      });
    }

    // Mettre à jour la date du dernier backup dans settings
    const settings = readJson(settingsPath) || {};
    settings.backup = settings.backup || {};
    settings.backup.lastBackupDate = new Date().toISOString();
    settings.backup.lastAutoBackupType = 'auto';
    writeJson(settingsPath, settings);

    lastAutoBackupDate = new Date();
    pendingChanges = false;
    console.log(`✅ Auto-backup terminé: ${backupFile}`);
  } catch (error) {
    console.error('❌ Erreur auto-backup:', error.message);
  }
};

// Planifier un backup dans 5 minutes
const scheduleBackup = () => {
  // Si auto-backup désactivé (données venant d'injection), ne pas planifier
  if (!autoBackupEnabled) {
    console.log('⏸️ Auto-backup désactivé (source: injection). Pas de planification.');
    return;
  }

  if (backupTimer) {
    clearTimeout(backupTimer);
  }

  pendingChanges = true;
  console.log('⏱️ Auto-backup planifié dans 5 minutes...');

  backupTimer = setTimeout(() => {
    if (pendingChanges && autoBackupEnabled) {
      performAutoBackup();
    }
    backupTimer = null;
  }, BACKUP_DELAY_MS);
};

// Désactiver temporairement l'auto-backup (appelé lors d'une injection)
const disableAutoBackup = () => {
  autoBackupEnabled = false;
  if (backupTimer) {
    clearTimeout(backupTimer);
    backupTimer = null;
  }
  pendingChanges = false;
  console.log('🚫 Auto-backup désactivé (injection en cours)');
};

// Réactiver l'auto-backup
const enableAutoBackup = () => {
  autoBackupEnabled = true;
  console.log('✅ Auto-backup réactivé');
};

/**
 * Middleware Express qui détecte les écritures de données métier
 * et planifie un auto-backup après 5 minutes
 */
const autoBackupMiddleware = (req, res, next) => {
  // Seulement les méthodes qui modifient des données
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  // Vérifier si c'est une route ignorée (profile, settings, parametres)
  const isIgnoredRoute = IGNORED_ROUTE_PREFIXES.some(prefix => 
    req.originalUrl.startsWith(prefix) || req.path.startsWith(prefix)
  );

  if (isIgnoredRoute) {
    return next();
  }

  // Intercepter la fin de la réponse pour déclencher le backup seulement si succès
  const originalEnd = res.end;
  res.end = function (...args) {
    originalEnd.apply(res, args);

    // Déclencher seulement si la réponse est un succès (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      scheduleBackup();
    }
  };

  next();
};

// Initialisation
console.log('📦 Auto-backup service initialisé (délai: 5 minutes après modification métier)');

module.exports = { autoBackupMiddleware, performAutoBackup, scheduleBackup, disableAutoBackup, enableAutoBackup };
