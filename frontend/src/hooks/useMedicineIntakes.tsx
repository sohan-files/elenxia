import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "./useAuth";
import { useToast } from "@/components/ui/use-toast";

export interface MedicineIntake {
  id: string;
  medicine: number;
  scheduled_time: string;
  actual_time?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  created_at: string;
}

export const useMedicineIntakes = () => {
  const [intakes, setIntakes] = useState<MedicineIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTodayIntakes = async () => {
    if (!user) {
      setIntakes([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch recent intakes (server filters by user)
      const data = await apiFetch('/intakes/');
      setIntakes((data || []).map((intake: any) => ({
        ...intake,
        status: intake.status as 'pending' | 'taken' | 'missed' | 'skipped',
      })));
    } catch (error: any) {
      console.error('Error fetching intakes:', error);
      toast({
        title: "Error fetching intakes",
        description: error.message || "Failed to load medication intakes",
        variant: "destructive",
      });
      setIntakes([]);
    } finally {
      setLoading(false);
    }
  };

  const recordIntake = async (medicineId: string, status: 'taken' | 'missed' | 'skipped', notes?: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const now = new Date().toISOString();
      await apiFetch('/intakes/', {
        method: 'POST',
        body: JSON.stringify({
          medicine: parseInt(medicineId),
          scheduled_time: now,
          actual_time: status === 'taken' ? now : null,
          status,
          notes: notes || '',
        })
      });

      await fetchTodayIntakes();
    } catch (error: any) {
      console.error('Error recording intake:', error);
      throw new Error(error.message || "Failed to record medication intake");
    }
  };

  const getComplianceStats = async (days: number = 7) => {
    if (!user) return { compliance: 0, totalDoses: 0, takenDoses: 0 };

    try {
      const data = await apiFetch('/intakes/');
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - days);
      
      const windowed = (data || []).filter((i: any) => 
        new Date(i.scheduled_time) >= windowStart
      );
      
      const totalDoses = windowed.length || 0;
      const takenDoses = windowed.filter((i: any) => i.status === 'taken').length || 0;
      const compliance = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

      return { compliance, totalDoses, takenDoses };
    } catch (error: any) {
      console.error("Error fetching compliance stats:", error);
      return { compliance: 0, totalDoses: 0, takenDoses: 0 };
    }
  };

  useEffect(() => {
    fetchTodayIntakes();
  }, [user]);

  return {
    intakes,
    loading,
    recordIntake,
    getComplianceStats,
    refetchIntakes: fetchTodayIntakes,
  };
};