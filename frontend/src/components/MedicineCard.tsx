import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pill, Settings, Trash2, Clock } from "lucide-react";
import { Medicine } from "@/hooks/useMedicines";

interface MedicineCardProps {
  medicine: Medicine;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  onTake?: (id: string, name: string) => void;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ 
  medicine, 
  onEdit, 
  onDelete, 
  onTake 
}) => {
  const stockPercentage = Math.round((medicine.remaining_count / 30) * 100);
  const isLowStock = medicine.remaining_count <= medicine.refill_threshold;

  return (
    <Card className="pill-card hover:shadow-[var(--shadow-pill)] transition-[var(--transition-gentle)]">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{medicine.name}</CardTitle>
              <CardDescription>{medicine.dosage}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {medicine.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Schedule Times */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Schedule:
          </p>
          <div className="flex flex-wrap gap-1">
            {medicine.schedules && medicine.schedules.length > 0 ? (
              medicine.schedules.map((schedule, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {new Date(`2000-01-01T${schedule.time_of_day}`).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No schedule set</span>
            )}
          </div>
        </div>

        {/* Remaining Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Remaining:</span>
          <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
            {medicine.remaining_count} pills
            {isLowStock && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Low Stock
              </Badge>
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Stock Level</span>
            <span>{stockPercentage}%</span>
          </div>
          <Progress 
            value={stockPercentage} 
            className={`h-2 ${isLowStock ? 'bg-destructive/20' : ''}`}
          />
        </div>

        {/* Instructions */}
        {medicine.instructions && (
          <div className="text-sm">
            <p className="font-medium mb-1">Instructions:</p>
            <p className="text-muted-foreground">{medicine.instructions}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {onTake && (
            <Button
              size="sm"
              onClick={() => onTake(medicine.id, medicine.name)}
              className="flex-1 medicine-button bg-gradient-to-r from-secondary to-primary hover:opacity-90"
            >
              Take Now
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="accessibility-focus"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(medicine.id)}
              className="text-destructive hover:text-destructive accessibility-focus"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;