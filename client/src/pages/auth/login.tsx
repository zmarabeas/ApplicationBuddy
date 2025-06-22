import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, Loader2, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function Login() {
  const [_, navigate] = useLocation();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setAuthError(null);
      await login(values.email, values.password);
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Failed to log in");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
      navigate("/");
    } catch (error: any) {
      console.error("Google login error:", error);
      setAuthError(error.message || "Failed to log in with Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-card p-3 rounded-full code-glow">
            <CheckCircle className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground ml-2 tracking-tight">App<span className="neon-text">Buddy</span></span>
          </div>
        </div>
        
        <Card className="border border-border bg-card code-glow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center text-foreground">
              <span className="neon-text">&lt;</span>
              Sign in
              <span className="neon-text">/&gt;</span>
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4 text-sm flex items-start border border-destructive/50">
                <span className="flex-shrink-0 mr-2">⚠️</span>
                <span>{authError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full border-border hover:bg-primary/20 transition-colors"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="name@example.com" 
                              className="pl-10 bg-muted border-border focus:border-primary" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="pl-10 bg-muted border-border focus:border-primary" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold text-primary"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
