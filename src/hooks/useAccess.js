import { useMemo } from 'react';
import { useAuth } from 'hooks/useAuth';

// Hook to check user access rights
export default function useAccess() {
  const { user } = useAuth();

  const rightsSet = useMemo(() => new Set(user?.accessRights || []), [user]);

  const hasAccess = (right) => {
    if (!right) return false;
    return rightsSet.has(right);
  };

  return { hasAccess };
}
