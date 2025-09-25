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
      toast({
        title: "Error fetching medicines",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (newMedicine: NewMedicine) => {
    if (!user) return;

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

      toast({
        title: "Medicine added successfully",
        description: `${newMedicine.name} has been added to your medication list.`,
      });

      // Refresh the medicines list
      await fetchMedicines();
    } catch (error: any) {
      toast({
        title: "Error adding medicine",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editMedicine = async (medicineId: string, updatedMedicine: NewMedicine) => {
    if (!user) return;

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
      const existingSchedules = await apiFetch(`/schedules/?medicine=${medicineId}`);
      const deletePromises = existingSchedules.map((schedule: any) =>
        apiFetch(`/schedules/${schedule.id}/`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);

      // Create new schedules
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

      toast({
        title: "Medicine updated successfully",
        description: `${updatedMedicine.name} has been updated.`,
      });

      // Refresh the medicines list
      await fetchMedicines();
    } catch (error: any) {
      toast({
        title: "Error updating medicine",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMedicine = async (medicineId: string) => {
    if (!user) return;

    try {
      await apiFetch(`/medicines/${medicineId}/`, {
        method: 'DELETE',
      });

      setMedicines(prev => prev.filter(medicine => medicine.id !== medicineId));

      toast({
        title: "Medicine deleted",
        description: "The medicine has been removed from your list.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting medicine",
        description: error.message,
        variant: "destructive",
      });
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