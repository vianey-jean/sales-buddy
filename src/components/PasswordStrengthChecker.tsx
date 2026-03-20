
import React, { useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordStrengthCheckerProps {
  password: string;
  onValidityChange?: (isValid: boolean) => void;
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({ 
  password, 
  onValidityChange 
}) => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 6;
  
  const isPasswordValid = hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  
  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'from-red-500 to-orange-500';
    if (strengthScore <= 3) return 'from-yellow-500 to-orange-500';
    if (strengthScore <= 4) return 'from-blue-500 to-indigo-500';
    return 'from-green-500 to-emerald-500';
  };
  
  const getStrengthText = () => {
    if (strengthScore <= 2) return 'Faible';
    if (strengthScore <= 3) return 'Moyen';
    if (strengthScore <= 4) return 'Bon';
    return 'Excellent';
  };
  
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isPasswordValid);
    }
  }, [isPasswordValid, onValidityChange]);
  
  if (!password) return null;
  
  return (
    <AnimatePresence>
      {!isPasswordValid && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sécurité du mot de passe
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getStrengthColor()} transition-all duration-300 rounded-full`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${
                  strengthScore <= 2 ? 'text-red-500' :
                  strengthScore <= 3 ? 'text-yellow-500' :
                  strengthScore <= 4 ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {getStrengthText()}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                Critères requis :
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CriteriaItem met={hasMinLength} text="Au moins 6 caractères" />
                <CriteriaItem met={hasUpperCase} text="Une majuscule (A-Z)" />
                <CriteriaItem met={hasLowerCase} text="Une minuscule (a-z)" />
                <CriteriaItem met={hasNumber} text="Un chiffre (0-9)" />
                <CriteriaItem met={hasSpecialChar} text="Un caractère spécial (!@#$%)" />
              </div>
              
              <div className="mt-4 p-3 rounded-xl border-2 transition-all duration-300 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                <div className="flex items-center">
                  <X className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    🔒 Complétez tous les critères pour sécuriser votre compte.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CriteriaItem: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
    met 
      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
      : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
  }`}>
    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-all duration-200 ${
      met 
        ? 'bg-green-500 scale-110' 
        : 'bg-gray-300 dark:bg-gray-600'
    }`}>
      {met ? (
        <Check className="h-3 w-3 text-white" />
      ) : (
        <div className="w-2 h-2 bg-white dark:bg-gray-400 rounded-full" />
      )}
    </div>
    <span className={`text-xs font-medium transition-colors duration-200 ${
      met 
        ? 'text-green-700 dark:text-green-400' 
        : 'text-gray-600 dark:text-gray-400'
    }`}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthChecker;
