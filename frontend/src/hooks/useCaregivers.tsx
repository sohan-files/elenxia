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
      toast({
        title: "Error fetching caregivers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCaregiver = async (newCaregiver: NewCaregiver) => {
    if (!user) return;

    try {
      await apiFetch('/caregivers/', {
        method: 'POST',
        body: JSON.stringify(newCaregiver),
      });

      toast({
        title: "Caregiver added successfully",
        description: `${newCaregiver.name} has been added to your care network.`,
      });

      // Refresh the caregivers list
      await fetchCaregivers();
    } catch (error: any) {
      toast({
        title: "Error adding caregiver",
        description: error.message,
        variant: "destructive",
      });
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

      toast({
        title: "Notification settings updated",
        description: `Notifications ${enabled ? 'enabled' : 'disabled'} for this caregiver.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating notifications",
        description: error.message,
        variant: "destructive",
      });
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