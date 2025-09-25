import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface Caregiver {
  id: string;
  name: string;
  relationship?: string;
  phone_number?: string;
  email?: string;
  notifications_enabled: boolean;
  emergency_contact: boolean;
  created_at: string;
}

export interface NewCaregiver {
  name: string;
  relationship?: string;
  phone_number?: string;
  email?: string;
}

export const useCaregivers = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCaregivers = async () => {
    if (!user) {
      setCaregivers([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/caregivers/');
      setCaregivers(data || []);
    } catch (error: any) {
      console.error('Error fetching caregivers:', error);
      toast({
        title: "Error fetching caregivers",
        description: error.message || "Failed to load caregivers",
        variant: "destructive",
      });
      setCaregivers([]);
    } finally {
      setLoading(false);
    }
  };

  const addCaregiver = async (newCaregiver: NewCaregiver) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await apiFetch('/caregivers/', {
        method: 'POST',
        body: JSON.stringify(newCaregiver),
      });

      // Refresh the caregivers list
      await fetchCaregivers();
    } catch (error: any) {
      console.error('Error adding caregiver:', error);
      throw new Error(error.message || "Failed to add caregiver");
    }
  };

  const toggleNotifications = async (caregiverId: string, enabled: boolean) => {
    try {
      await apiFetch(`/caregivers/${caregiverId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ notifications_enabled: enabled }),
      });

      setCaregivers(prev => prev.map(caregiver => 
        caregiver.id === caregiverId 
          ? { ...caregiver, notifications_enabled: enabled }
          : caregiver
      ));
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      throw new Error(error.message || "Failed to update notification settings");
    }
  };

  useEffect(() => {
    fetchCaregivers();
  }, [user]);

  return {
    caregivers,
    loading,
    addCaregiver,
    toggleNotifications,
    refetchCaregivers: fetchCaregivers,
  };
};