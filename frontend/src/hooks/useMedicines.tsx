import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface MedicineSchedule {
  id: string;
  time_of_day: string;
  days_of_week: number[];
  is_active: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  type: string;
  remaining_count: number;
  refill_threshold: number;
  instructions?: string;
  side_effects?: string;
  schedules?: MedicineSchedule[];
  created_at: string;
}

export interface NewMedicine {
  name: string;
  dosage: string;
  type: string;
  remaining: number;
  times: string[];
  instructions?: string;
}

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMedicines = async () => {
    if (!user) {
      setMedicines([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/medicines/');
      setMedicines(data || []);
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      toast({
        title: "Error fetching medicines",
        description: error.message || "Failed to load medicines",
        variant: "destructive",
      });
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (newMedicine: NewMedicine) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Create the medicine first
      const medicineData = {
        name: newMedicine.name,
        dosage: newMedicine.dosage,
        med_type: newMedicine.type,
        remaining_count: newMedicine.remaining,
        refill_threshold: 5,
        instructions: newMedicine.instructions || '',
      };

      const medicine = await apiFetch('/medicines/', {
        method: 'POST',
        body: JSON.stringify(medicineData),
      });

      // Create schedules for each time
      if (newMedicine.times && newMedicine.times.length > 0) {
        const schedulePromises = newMedicine.times.map(time => 
          apiFetch('/schedules/', {
            method: 'POST',
            body: JSON.stringify({
              medicine: medicine.id,
              time_of_day: time,
              days_of_week: [1, 2, 3, 4, 5, 6, 7], // All days
              is_active: true,
            }),
          })
        );

        await Promise.all(schedulePromises);
      }

      // Refresh the medicines list
      await fetchMedicines();
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      throw new Error(error.message || "Failed to add medicine");
    }
  };

  const editMedicine = async (medicineId: string, updatedMedicine: NewMedicine) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Update the medicine
      const medicineData = {
        name: updatedMedicine.name,
        dosage: updatedMedicine.dosage,
        med_type: updatedMedicine.type,
        remaining_count: updatedMedicine.remaining,
        instructions: updatedMedicine.instructions || '',
      };

      await apiFetch(`/medicines/${medicineId}/`, {
        method: 'PATCH',
        body: JSON.stringify(medicineData),
      });

      // Get existing schedules and delete them
      try {
        const existingSchedules = await apiFetch(`/schedules/?medicine=${medicineId}`);
        if (existingSchedules && existingSchedules.length > 0) {
          const deletePromises = existingSchedules.map((schedule: any) =>
            apiFetch(`/schedules/${schedule.id}/`, { method: 'DELETE' })
          );
          await Promise.all(deletePromises);
        }
      } catch (error) {
        console.warn('Error deleting existing schedules:', error);
      }

      // Create new schedules
      if (updatedMedicine.times && updatedMedicine.times.length > 0) {
        const schedulePromises = updatedMedicine.times.map(time => 
          apiFetch('/schedules/', {
            method: 'POST',
            body: JSON.stringify({
              medicine: medicineId,
              time_of_day: time,
              days_of_week: [1, 2, 3, 4, 5, 6, 7],
              is_active: true,
            }),
          })
        );

        await Promise.all(schedulePromises);
      }

      // Refresh the medicines list
      await fetchMedicines();
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      throw new Error(error.message || "Failed to update medicine");
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      await apiFetch(`/medicines/${medicineId}/`, {
        method: 'DELETE',
      });

      setMedicines(prev => prev.filter(medicine => medicine.id !== medicineId));
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      throw new Error(error.message || "Failed to delete medicine");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [user]);

  return {
    medicines,
    loading,
    addMedicine,
    editMedicine,
    deleteMedicine,
    refetchMedicines: fetchMedicines,
  };
};