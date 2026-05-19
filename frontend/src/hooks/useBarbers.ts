import { useState, useEffect } from 'react';
import { barberApi, Barber } from '@api/barber.api';

export const useBarbers = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await barberApi.getAll();
        if (response.success && response.data) {
          setBarbers(response.data);
        }
      } catch (err) {
        setError('Error loading barbers');
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();
  }, []);

  return { barbers, loading, error };
};