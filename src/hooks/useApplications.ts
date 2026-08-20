import { useState, useEffect, useCallback } from 'react';
import { fetchStudentApplications } from '@/services/applications.service';
import { useAuth } from '@/context/AuthContext';
import type { Application } from '@/types';

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await fetchStudentApplications(user.id);
    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { 
    load(); 
  }, [load]);

  return { applications, loading, reload: load };
}
