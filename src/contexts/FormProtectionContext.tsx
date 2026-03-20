import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FormProtectionContextType {
  isFormActive: boolean;
  setFormActive: (active: boolean) => void;
  registerForm: (formId: string) => void;
  unregisterForm: (formId: string) => void;
  activeForms: Set<string>;
}

const FormProtectionContext = createContext<FormProtectionContextType | undefined>(undefined);

export const FormProtectionProvider = ({ children }: { children: ReactNode }) => {
  const [activeForms, setActiveForms] = useState<Set<string>>(new Set());

  const registerForm = useCallback((formId: string) => {
    setActiveForms(prev => {
      const newSet = new Set(prev);
      newSet.add(formId);
      return newSet;
    });
  }, []);

  const unregisterForm = useCallback((formId: string) => {
    setActiveForms(prev => {
      const newSet = new Set(prev);
      newSet.delete(formId);
      return newSet;
    });
  }, []);

  const setFormActive = useCallback((active: boolean) => {
    if (active) {
      registerForm('global');
    } else {
      unregisterForm('global');
    }
  }, [registerForm, unregisterForm]);

  const isFormActive = activeForms.size > 0;

  return (
    <FormProtectionContext.Provider
      value={{
        isFormActive,
        setFormActive,
        registerForm,
        unregisterForm,
        activeForms,
      }}
    >
      {children}
    </FormProtectionContext.Provider>
  );
};

export const useFormProtection = () => {
  const context = useContext(FormProtectionContext);
  if (context === undefined) {
    throw new Error('useFormProtection must be used within a FormProtectionProvider');
  }
  return context;
};
