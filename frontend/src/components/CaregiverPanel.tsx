import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Phone, Mail, Plus, Bell, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";
import { useCaregivers } from "@/hooks/useCaregivers";

const mockAlerts = [
  {
    id: 1,
    type: "missed_dose",
    message: "Metformin 2:00 PM dose missed",
    time: "3:15 PM",
    status: "sent"
  },
  {
    id: 2,
    type: "low_stock",
    message: "Lisinopril running low (5 pills remaining)",
    time: "10:30 AM",
    status: "pending"
  },
  {
    id: 3,
    type: "dose_taken",
    message: "Morning medications completed",
    time: "8:45 AM",
    status: "sent"
  }
];

const CaregiverPanel = () => {
  const { caregivers, loading, addCaregiver, toggleNotifications } = useCaregivers();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    relationship: "",
    phone_number: "",
    email: ""
  });

  const handleAddCaregiver = async () => {
    if (!newCaregiver.name.trim()) return;
    
    await addCaregiver(newCaregiver);
    setNewCaregiver({ name: "", relationship: "", phone_number: "", email: "" });
    setShowAddDialog(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "missed_dose":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "low_stock":
        return <Bell className="h-4 w-4 text-warning" />;
      case "dose_taken":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Caregiver Network</h2>
            <p className="text-muted-foreground">Loading your support team...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Caregiver Network</h2>
          <p className="text-muted-foreground">Manage your support team and notifications</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Caregiver
            </Button>
          </DialogTrigger>
          <DialogContent className="pill-card">
            <DialogHeader>
              <DialogTitle>Add New Caregiver</DialogTitle>
              <DialogDescription>
                Add a family member, friend, or healthcare provider to your support network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newCaregiver.name}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, name: e.target.value }))}
                  className="accessibility-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship/Role</Label>
                <Select 
                  value={newCaregiver.relationship}
                  onValueChange={(value) => setNewCaregiver({ ...newCaregiver, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={newCaregiver.phone_number}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="accessibility-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver(prev => ({ ...prev, email: e.target.value }))}
                  className="accessibility-focus"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddCaregiver}
                className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={!newCaregiver.name.trim()}
              >
                Add Caregiver
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Caregivers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {caregivers.map((caregiver) => (
          <Card key={caregiver.id} className="pill-card">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" alt={caregiver.name} />
                  <AvatarFallback className="bg-primary-light text-primary">
                    {caregiver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{caregiver.name}</CardTitle>
                  <CardDescription className="text-base">
                    {caregiver.relationship || "Family Member"}
                  </CardDescription>
                </div>
                <Badge 
                  variant={caregiver.notifications_enabled ? "default" : "outline"}
                  className={`alert-badge ${caregiver.notifications_enabled ? 'bg-secondary text-secondary-foreground' : ''}`}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  {caregiver.notifications_enabled ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {caregiver.phone_number && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{caregiver.phone_number}</span>
                  </div>
                )}
                {caregiver.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{caregiver.email}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Notifications</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleNotifications(caregiver.id, !caregiver.notifications_enabled)}
                  className="accessibility-focus"
                >
                  {caregiver.notifications_enabled ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {caregivers.length === 0 && (
        <Card className="pill-card">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No caregivers yet</h3>
            <p className="text-muted-foreground mb-4">
              Add family members, friends, or healthcare providers to your support network
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Caregiver
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card className="pill-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Recent Alerts</span>
          </CardTitle>
          <CardDescription>
            Notifications sent to your caregivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <Badge 
                  variant={alert.status === 'sent' ? 'default' : 'secondary'}
                  className="alert-badge"
                >
                  {alert.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaregiverPanel;