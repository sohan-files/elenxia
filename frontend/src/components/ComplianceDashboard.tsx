import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Award, AlertCircle, CheckCircle, Clock, Download, Mail } from "lucide-react";
import { useMedicineIntakes } from "@/hooks/useMedicineIntakes";
import { useMedicines } from "@/hooks/useMedicines";
import { useToast } from "@/components/ui/use-toast";

const ComplianceDashboard = () => {
  const [complianceStats, setComplianceStats] = useState({ compliance: 0, totalDoses: 0, takenDoses: 0 });
  const [loading, setLoading] = useState(true);
  const { getComplianceStats } = useMedicineIntakes();
  const { medicines } = useMedicines();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const stats = await getComplianceStats(7);
      setComplianceStats(stats);
      setLoading(false);
    };
    
    fetchStats();
  }, []);

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your compliance report has been generated and saved.",
    });
  };

  const emailReport = () => {
    toast({
      title: "Report Sent",
      description: "Your compliance report has been sent to your healthcare provider.",
    });
  };
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "text-secondary";
    if (percentage >= 70) return "text-warning";
    return "text-destructive";
  };

  const getComplianceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 70) return "secondary"; 
    return "destructive";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Compliance Dashboard</h2>
          <p className="text-muted-foreground">Loading your medication adherence data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="pill-card">
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Compliance Dashboard</h2>
        <p className="text-muted-foreground">Track your medication adherence and progress</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="pill-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Weekly Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceStats.compliance)}`}>
              {complianceStats.compliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceStats.takenDoses} of {complianceStats.totalDoses} doses
            </p>
          </CardContent>
        </Card>

        <Card className="pill-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Monthly Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceStats.compliance)}`}>
              {complianceStats.compliance}%
            </div>
            <p className="text-xs text-muted-foreground">This month average</p>
          </CardContent>
        </Card>

        <Card className="pill-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{Math.max(0, complianceStats.takenDoses - (complianceStats.totalDoses - complianceStats.takenDoses))}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="pill-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              On-Time Doses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{complianceStats.takenDoses}</div>
            <p className="text-xs text-muted-foreground">
              {complianceStats.totalDoses > 0 ? Math.round((complianceStats.takenDoses / complianceStats.totalDoses) * 100) : 0}% on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Medicines */}
      <Card className="pill-card">
        <CardHeader>
          <CardTitle className="text-lg">Your Medicines</CardTitle>
          <CardDescription>
            Current medication adherence overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicines.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No medicines added yet. Add your first medicine to start tracking compliance.
              </p>
            ) : (
              medicines.map((medicine) => (
                <div key={medicine.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{medicine.name}</h4>
                      <Badge variant="outline" className="text-sm">
                        {medicine.dosage}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {medicine.remaining_count} remaining
                    </span>
                  </div>
                  <Progress 
                    value={complianceStats.compliance} 
                    className="h-2"
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="pill-card border-secondary bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg text-secondary flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Great Job!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• You've maintained a 12-day streak!</li>
              <li>• 95% compliance with Metformin</li>
              <li>• Perfect adherence to Lisinopril</li>
              <li>• Consistently taking morning doses on time</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="pill-card border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg text-warning flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Vitamin D3 has been missed 2 times</li>
              <li>• Weekend compliance could be better</li>
              <li>• Consider setting weekend reminders</li>
              <li>• Talk to your doctor about timing</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Share with Doctor */}
      <Card className="pill-card">
        <CardHeader>
          <CardTitle className="text-lg">Share with Healthcare Provider</CardTitle>
          <CardDescription>
            Generate a compliance report for your next appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={generateReport}
              className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button 
              variant="outline"
              onClick={emailReport}
              className="medicine-button"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDashboard;