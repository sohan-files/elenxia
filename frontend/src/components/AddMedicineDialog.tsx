import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X } from "lucide-react";
import OCRScanner from "./OCRScanner";
import { Medicine } from "@/hooks/useMedicines";

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMedicine: (medicine: any) => void;
  editingMedicine?: Medicine | null;
}

const AddMedicineDialog = ({ open, onOpenChange, onAddMedicine, editingMedicine }: AddMedicineDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    type: "tablet",
    times: [] as string[],
    remaining: 30
  });
  const [timeInput, setTimeInput] = useState("");
  const [showOCR, setShowOCR] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name,
        dosage: editingMedicine.dosage,
        type: editingMedicine.type,
        times: editingMedicine.schedules?.map(s => s.time_of_day) || [],
        remaining: editingMedicine.remaining_count
      });
    } else {
      setFormData({
        name: "",
        dosage: "",
        type: "tablet",
        times: [],
        remaining: 30
      });
    }
  }, [editingMedicine, open]);

  const addTime = () => {
    if (timeInput && !formData.times.includes(timeInput)) {
      setFormData(prev => ({
        ...prev,
        times: [...prev.times, timeInput]
      }));
      setTimeInput("");
    }
  };

  const removeTime = (timeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter(time => time !== timeToRemove)
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.dosage && formData.times.length > 0) {
      onAddMedicine({
        ...formData,
        nextDose: formData.times[0] + " Today",
        taken: false
      });
      // Reset form
      setFormData({
        name: "",
        dosage: "",
        type: "tablet",
        times: [],
        remaining: 30
      });
    }
  };

  const handleOCRDetection = (medicines: any[]) => {
    // Prefill the form with the first detected medicine so the user can review/edit
    if (medicines && medicines.length > 0) {
      const first = medicines[0];
      setFormData(prev => ({
        ...prev,
        name: first?.name || "",
        dosage: first?.dosage || "",
        type: first?.type || "tablet",
        // keep times empty so the user explicitly selects schedule
      }));
    }
    setShowOCR(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] pill-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {editingMedicine ? "Update your medicine details" : "Enter your medicine details or scan a prescription"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Scan Prescription Option */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="medicine-button accessibility-focus"
              onClick={() => setShowOCR(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Scan Prescription (OCR)
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>

          {/* Medicine Name */}
          <div className="space-y-2">
            <Label htmlFor="medicine-name" className="text-base font-medium">Medicine Name</Label>
            <Input
              id="medicine-name"
              placeholder="e.g., Metformin, Lisinopril"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="accessibility-focus text-base"
            />
          </div>

          {/* Dosage */}
          <div className="space-y-2">
            <Label htmlFor="dosage" className="text-base font-medium">Dosage</Label>
            <Input
              id="dosage"
              placeholder="e.g., 500mg, 10mg, 1000 IU"
              value={formData.dosage}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              className="accessibility-focus text-base"
            />
          </div>

          {/* Medicine Type */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Medicine Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="accessibility-focus text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="capsule">Capsule</SelectItem>
                <SelectItem value="syrup">Syrup</SelectItem>
                <SelectItem value="injection">Injection</SelectItem>
                <SelectItem value="drops">Drops</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Times */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Schedule Times</Label>
            <div className="flex space-x-2">
              <Input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="accessibility-focus"
              />
              <Button 
                type="button" 
                onClick={addTime}
                variant="outline"
                size="sm"
                className="accessibility-focus"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.times.map((time, index) => (
                <Badge key={index} variant="secondary" className="alert-badge text-sm">
                  {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <button
                    onClick={() => removeTime(time)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Remaining Pills */}
          <div className="space-y-2">
            <Label htmlFor="remaining" className="text-base font-medium">Pills Remaining</Label>
            <Input
              id="remaining"
              type="number"
              value={formData.remaining}
              onChange={(e) => setFormData(prev => ({ ...prev, remaining: parseInt(e.target.value) || 0 }))}
              className="accessibility-focus text-base"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            disabled={!formData.name || !formData.dosage || formData.times.length === 0}
          >
            {editingMedicine ? "Update Medicine" : "Add Medicine"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* OCR Scanner Dialog */}
      <OCRScanner 
        open={showOCR}
        onOpenChange={setShowOCR}
        onMedicineDetected={handleOCRDetection}
      />
    </Dialog>
  );
};

export default AddMedicineDialog;