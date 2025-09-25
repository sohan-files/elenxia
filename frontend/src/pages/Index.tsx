import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  Pill, 
  Clock, 
  Calendar, 
  Plus, 
  Bell, 
  Users, 
  MapPin, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMedicines } from "@/hooks/useMedicines";
import { useMedicineIntakes } from "@/hooks/useMedicineIntakes";
import { useToast } from "@/components/ui/use-toast";
import AddMedicineDialog from "@/components/AddMedicineDialog";
import NotificationCenter from "@/components/NotificationCenter";
import CaregiverPanel from "@/components/CaregiverPanel";
import PharmacyLocator from "@/components/PharmacyLocator";
import ComplianceDashboard from "@/components/ComplianceDashboard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { medicines, loading: medicinesLoading, addMedicine, deleteMedicine, editMedicine } = useMedicines();
  const { recordIntake, getComplianceStats } = useMedicineIntakes();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [complianceStats, setComplianceStats] = useState({ compliance: 0, totalDoses: 0, takenDoses: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        const stats = await getComplianceStats(7);
        setComplianceStats(stats);
      }
    };
    fetchStats();
  }, [user, getComplianceStats]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleAddMedicine = async (medicineData: any) => {
    try {
      if (editingMedicine) {
        await editMedicine(editingMedicine.id, medicineData);
        setEditingMedicine(null);
        toast({
          title: "Medicine updated successfully",
          description: `${medicineData.name} has been updated.`,
        });
      } else {
        await addMedicine(medicineData);
        toast({
          title: "Medicine added successfully",
          description: `${medicineData.name} has been added to your medication list.`,
        });
      }
      setShowAddDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    try {
      await deleteMedicine(medicineId);
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

  const handleTakeMedicine = async (medicineId: string, medicineName: string) => {
    try {
      await recordIntake(medicineId, 'taken');
      toast({
        title: "Medicine taken!",
        description: `Great job taking your ${medicineName}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error recording intake",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTodaysMedicines = () => {
    return medicines.filter(medicine => 
      medicine.schedules && medicine.schedules.length > 0
    );
  };

  const getUpcomingDoses = () => {
    const upcoming = [];
    const now = new Date();
    const today = now.getDay() || 7; // Convert Sunday (0) to 7

    medicines.forEach(medicine => {
      if (medicine.schedules) {
        medicine.schedules.forEach(schedule => {
          if (schedule.is_active && schedule.days_of_week.includes(today)) {
            const [hours, minutes] = schedule.time_of_day.split(':');
            const scheduleTime = new Date();
            scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (scheduleTime > now) {
              upcoming.push({
                medicine: medicine.name,
                time: schedule.time_of_day,
                scheduleTime
              });
            }
          }
        });
      }
    });

    return upcoming.sort((a, b) => a.scheduleTime.getTime() - b.scheduleTime.getTime()).slice(0, 3);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">PillPall</h1>
                <p className="text-sm text-muted-foreground">Your health companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={user.username} />
                  <AvatarFallback className="bg-primary-light text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="medicines" className="flex items-center space-x-2">
              <Pill className="h-4 w-4" />
              <span>Medicines</span>
            </TabsTrigger>
            <TabsTrigger value="caregivers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Caregivers</span>
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Pharmacies</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Pill className="h-4 w-4 mr-2" />
                    Active Medicines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{medicines.length}</div>
                  <p className="text-xs text-muted-foreground">Currently tracking</p>
                </CardContent>
              </Card>

              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Today's Doses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{getTodaysMedicines().length}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>

              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{complianceStats.compliance}%</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card className="pill-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{getUpcomingDoses().length}</div>
                  <p className="text-xs text-muted-foreground">Next doses</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Medicines */}
            <Card className="pill-card">
              <CardHeader>
                <CardTitle className="text-lg">Today's Medicines</CardTitle>
                <CardDescription>
                  Your scheduled medications for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getTodaysMedicines().length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No medicines scheduled for today</p>
                    <Button 
                      onClick={() => setShowAddDialog(true)}
                      className="mt-4 medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Medicine
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getTodaysMedicines().map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                            <Pill className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{medicine.name}</h4>
                            <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {medicine.schedules?.map((schedule, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {new Date(`2000-01-01T${schedule.time_of_day}`).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleTakeMedicine(medicine.id, medicine.name)}
                            className="medicine-button bg-gradient-to-r from-secondary to-primary hover:opacity-90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Take
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Doses */}
            <Card className="pill-card">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Doses</CardTitle>
                <CardDescription>
                  Your next scheduled medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingDoses().length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No upcoming doses today</p>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingDoses().map((dose, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{dose.medicine}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(`2000-01-01T${dose.time}`).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <NotificationCenter />
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Your Medicines</h2>
                <p className="text-muted-foreground">Manage your medication schedule</p>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            {medicinesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="pill-card">
                    <CardContent className="p-6">
                      <div className="h-32 bg-muted animate-pulse rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <Card className="pill-card">
                <CardContent className="text-center py-12">
                  <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No medicines yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first medicine to start tracking your medication schedule
                  </p>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Medicine
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicines.map((medicine) => (
                  <Card key={medicine.id} className="pill-card hover:shadow-[var(--shadow-pill)] transition-[var(--transition-gentle)]">
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
                        <p className="text-sm font-medium mb-2">Schedule:</p>
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
                        <span className="font-medium">{medicine.remaining_count} pills</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Stock Level</span>
                          <span>{Math.round((medicine.remaining_count / 30) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(medicine.remaining_count / 30) * 100} 
                          className="h-2"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMedicine(medicine);
                            setShowAddDialog(true);
                          }}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="flex-1 text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Caregivers Tab */}
          <TabsContent value="caregivers">
            <CaregiverPanel />
          </TabsContent>

          {/* Pharmacies Tab */}
          <TabsContent value="pharmacies">
            <PharmacyLocator />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Medicine Dialog */}
      <AddMedicineDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddMedicine={handleAddMedicine}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};

export default Index;