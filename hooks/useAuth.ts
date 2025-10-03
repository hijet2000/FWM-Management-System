
import { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext.tsx';

const useAuth = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export default useAuth;