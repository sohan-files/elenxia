import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Mail, Lock, User, Phone } from "lucide-react";
import { apiFetch, setAccessToken } from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ 
    email: "", 
    password: "", 
    fullName: "", 
    phoneNumber: "" 
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("pp_token");
    if (token) {
      setAccessToken(token);
      navigate("/");
    }
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!signUpData.email || !signUpData.password || !signUpData.fullName) {
        throw new Error("Please fill in all required fields");
      }

      if (signUpData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const response = await apiFetch('/auth/signup/', {
        method: 'POST',
        body: JSON.stringify({
          email: signUpData.email.trim().toLowerCase(),
          password: signUpData.password,
          full_name: signUpData.fullName.trim(),
          phone_number: signUpData.phoneNumber.trim()
        }),
      });

      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });

      // Clear signup form and switch to signin tab
      setSignUpData({ email: "", password: "", fullName: "", phoneNumber: "" });
      // Auto-fill signin form
      setSignInData({ email: signUpData.email, password: signUpData.password });
      
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!signInData.email || !signInData.password) {
        throw new Error("Please enter both email and password");
      }

      const tokens = await apiFetch('/auth/token/', {
        method: 'POST',
        body: JSON.stringify({ 
          username: signInData.email.trim().toLowerCase(), 
          password: signInData.password 
        }),
      });

      if (!tokens.access) {
        throw new Error("Invalid response from server");
      }

      setAccessToken(tokens.access);
      sessionStorage.setItem("pp_token", tokens.access);

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">PillPall</h1>
              <p className="text-muted-foreground">Your health companion</p>
            </div>
          </div>
        </div>

        <Card className="pill-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Welcome to PillPall</span>
            </CardTitle>
            <CardDescription>
              Manage your medications with confidence and care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full medicine-button bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={signUpData.phoneNumber}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        className="pl-10"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full medicine-button bg-gradient-to-r from-secondary to-primary hover:opacity-90"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Secure authentication with JWT tokens</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;