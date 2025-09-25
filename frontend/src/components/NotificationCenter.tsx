import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Clock, Pill, AlertTriangle, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'pending' | 'sent' | 'read';
  scheduled_for: string;
  created_at: string;
  medicine_id?: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch('/notifications/');
      setNotifications((data || []).map((notif: any) => ({
        ...notif,
        status: notif.status as 'pending' | 'sent' | 'read'
      })) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestNotification = async () => {
    try {
      await apiFetch('/notifications/create_test_notification/', {
        method: 'POST'
      });
      toast({
        title: "Test notification created!",
        description: "Check your notifications list to see the test notification.",
      });
      fetchNotifications(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error creating test notification",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiFetch(`/notifications/${notificationId}/mark_read/`, { method: 'POST' });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const }
            : notif
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating notification",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication_reminder':
        return <Pill className="h-4 w-4" />;
      case 'refill_reminder':
        return <AlertTriangle className="h-4 w-4" />;
      case 'appointment_reminder':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'medication_reminder':
        return 'text-primary';
      case 'refill_reminder':
        return 'text-warning';
      case 'appointment_reminder':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <Card className="pill-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading notifications...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pill-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {notifications.filter(n => n.status !== 'read').length > 0 && (
                <Badge variant="destructive" className="alert-badge">
                  {notifications.filter(n => n.status !== 'read').length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with your medication reminders and health alerts
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={createTestNotification}
            className="ml-4"
          >
            Test Notification
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                You'll receive reminders for your medications here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.status === 'read' 
                    ? 'bg-muted/30 border-border' 
                    : 'bg-card border-primary/20 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        notification.status === 'read' ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm ${
                        notification.status === 'read' ? 'text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.status !== 'read' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge 
                      variant={notification.status === 'read' ? 'outline' : 'default'}
                      className="text-xs"
                    >
                      {notification.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.filter(n => n.status !== 'read').length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                notifications
                  .filter(n => n.status !== 'read')
                  .forEach(n => markAsRead(n.id));
              }}
              className="w-full"
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;