import { useEffect, useCallback } from 'react';

/**
 * Hook to warn users when they try to leave a page with unsaved changes
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} message - Optional custom message (used for beforeunload)
 */
const useUnsavedChangesWarning = (hasUnsavedChanges, message = '您有未保存的更改，确定要离开吗？') => {
  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // Return a function that can be used to confirm navigation
  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(message);
    }
    return true;
  }, [hasUnsavedChanges, message]);

  return { confirmNavigation };
};

export default useUnsavedChangesWarning;
