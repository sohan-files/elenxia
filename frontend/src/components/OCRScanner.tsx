import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Upload, Scan, FileText, X, Edit3 } from "lucide-react";
import Tesseract from "tesseract.js";

interface OCRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMedicineDetected: (medicines: any[]) => void;
}

const OCRScanner = ({ open, onOpenChange, onMedicineDetected }: OCRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any[]>([]);
  const [editableMedicines, setEditableMedicines] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseMedicinesFromText = (text: string) => {
    const lines = text
      .split(/\r?\n|\s{2,}/)
      .map((l) => l.trim())
      .filter(Boolean);

    const candidates: { name: string; dosage?: string }[] = [];

    // Basic patterns: WORD dosage (e.g., Metformin 500mg)
    const dosageRegex = /(\d+\s?(mg|mcg|g|ml|iu))/i;
    const nameRegex = /\b([A-Z][a-zA-Z]{3,})\b/;

    for (const line of lines) {
      const dosageMatch = line.match(dosageRegex);
      const nameMatch = line.match(nameRegex);
      if (nameMatch && dosageMatch) {
        const name = nameMatch[1];
        const dosage = dosageMatch[1].replace(/\s+/g, "");
        candidates.push({ name, dosage });
      }
    }

    // Deduplicate by name+dosage
    const unique = new Map<string, { name: string; dosage?: string }>();
    for (const c of candidates) {
      const key = `${c.name.toLowerCase()}_${(c.dosage || "").toLowerCase()}`;
      if (!unique.has(key)) unique.set(key, c);
    }

    // Map to UI structure
    return Array.from(unique.values()).map((c) => ({
      name: c.name,
      dosage: c.dosage || "",
      type: "tablet",
      instructions: "",
      remaining: 0,
    }));
  };

  const processImage = async (file: File) => {
    setIsScanning(true);
    setShowResults(false);
    setScanResult([]);

    try {
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: () => {},
      });
      const rawText = data.text || "";
      const meds = parseMedicinesFromText(rawText);

      if (meds.length === 0) {
        toast({
          title: "No medications detected",
          description: "Try a clearer image with medicine name and dosage (e.g., 500mg)",
        });
        setScanResult([]);
      } else {
        toast({
          title: "Prescription scanned",
          description: `Found ${meds.length} potential medications`,
        });
        setScanResult(meds);
        setEditableMedicines(meds.map(med => ({ ...med, times: [] })));
      }
      setShowResults(true);
    } catch (error: any) {
      toast({ title: "Scan failed", description: error.message || String(error), variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      toast({
        title: "Camera feature",
        description: "Camera capture would be implemented here with proper permissions",
      });
    } catch (error) {
      toast({
        title: "Camera not available",
        description: "Please use file upload instead",
        variant: "destructive",
      });
    }
  };

  const updateMedicine = (index: number, field: string, value: any) => {
    setEditableMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const addTimeSlot = (index: number) => {
    const newTime = "09:00";
    setEditableMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, times: [...(med.times || []), newTime] } : med
    ));
  };

  const removeTimeSlot = (index: number, timeIndex: number) => {
    setEditableMedicines(prev => prev.map((med, i) => 
      i === index ? { 
        ...med, 
        times: med.times?.filter((_: any, ti: number) => ti !== timeIndex) || [] 
      } : med
    ));
  };

  const updateTimeSlot = (index: number, timeIndex: number, newTime: string) => {
    setEditableMedicines(prev => prev.map((med, i) => 
      i === index ? { 
        ...med, 
        times: med.times?.map((time: string, ti: number) => ti === timeIndex ? newTime : time) || [] 
      } : med
    ));
  };

  const confirmMedicines = () => {
    onMedicineDetected(editableMedicines);
    setScanResult([]);
    setEditableMedicines([]);
    setShowResults(false);
    onOpenChange(false);
  };

  const clearResults = () => {
    setScanResult([]);
    setEditableMedicines([]);
    setShowResults(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pill-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>Scan Prescription</span>
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your prescription to automatically extract medicine information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showResults && !isScanning && (
            <div className="space-y-4">
              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="pill-card cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => fileInputRef.current?.click()}>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-medium mb-1">Upload Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      Select an image from your device
                    </p>
                  </CardContent>
                </Card>

                <Card className="pill-card cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={handleCameraCapture}>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-medium mb-1">Take Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      Use your camera to capture
                    </p>
                  </CardContent>
                </Card>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Tips */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Tips for better scanning
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ensure good lighting</li>
                    <li>• Keep the prescription flat and straight</li>
                    <li>• Make sure all text is visible and clear</li>
                    <li>• Avoid shadows or glare</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Scanning State */}
          {isScanning && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Scan className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-medium mb-2">Scanning prescription...</h3>
              <p className="text-muted-foreground">
                Extracting medicine information from your image
              </p>
            </div>
          )}

          {/* Scan Results */}
          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Detected Medications</h3>
                <Button variant="outline" size="sm" onClick={clearResults}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              {editableMedicines.length === 0 ? (
                <Card className="pill-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No medications detected.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {editableMedicines.map((medicine, index) => (
                    <Card key={index} className="pill-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Medicine {index + 1}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Medicine Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={medicine.name}
                              onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                              placeholder="Enter medicine name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                            <Input
                              id={`dosage-${index}`}
                              value={medicine.dosage}
                              onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                              placeholder="e.g., 500mg"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`type-${index}`}>Type</Label>
                            <Select value={medicine.type} onValueChange={(value) => updateMedicine(index, 'type', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tablet">Tablet</SelectItem>
                                <SelectItem value="capsule">Capsule</SelectItem>
                                <SelectItem value="liquid">Liquid</SelectItem>
                                <SelectItem value="injection">Injection</SelectItem>
                                <SelectItem value="cream">Cream</SelectItem>
                                <SelectItem value="drops">Drops</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`remaining-${index}`}>Pills Remaining</Label>
                            <Input
                              id={`remaining-${index}`}
                              type="number"
                              value={medicine.remaining}
                              onChange={(e) => updateMedicine(index, 'remaining', parseInt(e.target.value) || 0)}
                              placeholder="30"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Schedule Times</Label>
                          <div className="space-y-2">
                            {(medicine.times || []).map((time: string, timeIndex: number) => (
                              <div key={timeIndex} className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={time}
                                  onChange={(e) => updateTimeSlot(index, timeIndex, e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTimeSlot(index, timeIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(index)}
                              className="w-full"
                            >
                              + Add Time Slot
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                          <Input
                            id={`instructions-${index}`}
                            value={medicine.instructions}
                            onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                            placeholder="e.g., Take with food"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={clearResults} className="flex-1">
                  Scan Again
                </Button>
                <Button 
                  onClick={confirmMedicines}
                  className="flex-1 medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={editableMedicines.length === 0}
                >
                  Add All Medications
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OCRScanner;