import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerifyAdminSecurityCode } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const verifySecurityCode = useVerifyAdminSecurityCode();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user was redirected from admin login
  const state = location.state as { adminEmail?: string; adminVerified?: boolean } | null;
  
  if (state?.adminVerified && state.adminEmail) {
    setEmail(state.adminEmail);
    setIsAdminLogin(true); // Automatically enable admin mode
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // For admin login, first verify security code
      if (isAdminLogin) {
        if (!securityCode) {
          setError('Security code is required for admin login');
          return;
        }
        
        try {
          const verificationResult = await verifySecurityCode.mutateAsync({ email, securityCode });
          
          if (verificationResult.success) {
            // Security code verified, proceed with login
            const user = await login(email, password);
            // Redirect to admin dashboard
            navigate('/admin', { replace: true });
          }
        } catch (verifyError: any) {
          const verifyErrorMessage = verifyError.response?.data?.error || 'Security code verification failed';
          setError(verifyErrorMessage);
          return;
        }
      } else {
        // Regular member login
        const user = await login(email, password);
        
        // If user is admin but trying to login without admin mode, redirect to admin login
        if (user?.role === 'ADMIN' && !isAdminLogin) {
          setError('Admin users must use the secure admin login');
          setIsAdminLogin(true);
          return;
        }
        
        navigate(user?.role === 'ADMIN' ? '/admin' : '/member/dashboard', { replace: true });
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminLogin(!isAdminLogin);
    setError('');
    setSecurityCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            {isAdminLogin && (
              <div className="p-2 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isAdminLogin ? 'Admin Login' : 'Welcome back to Snipfit'}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdminLogin 
              ? 'Enter your admin credentials and security code' 
              : 'Enter your credentials to access your account'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={isAdminLogin ? "admin@snipfit.com" : "m@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            {isAdminLogin && (
              <div className="space-y-2">
                <Label htmlFor="securityCode">Admin Security Code</Label>
                <Input
                  id="securityCode"
                  type="text"
                  placeholder="Enter your 6-digit security code"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                  required
                  disabled={isLoading || verifySecurityCode.isPending}
                  maxLength={6}
                  className="font-mono tracking-widest text-center text-lg"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Unique security code only known to administrators
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || verifySecurityCode.isPending}
              variant={isAdminLogin ? "default" : "default"}
            >
              {isLoading || verifySecurityCode.isPending ? 'Verifying...' : isAdminLogin ? 'Admin Sign In' : 'Sign In'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={toggleAdminMode}
            >
              <Shield className="mr-2 h-4 w-4" />
              {isAdminLogin ? 'Switch to Regular Login' : 'Switch to Admin Login'}
            </Button>
            
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
