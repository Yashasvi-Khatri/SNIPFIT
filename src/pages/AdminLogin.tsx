import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVerifyAdminSecurityCode } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertCircle, Loader2, Key } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const { login, isLoading: authLoading } = useAuth();
  const verifySecurityCode = useVerifyAdminSecurityCode();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);

    if (!email || !securityCode) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // First, verify the security code
      const verificationResult = await verifySecurityCode.mutateAsync({ email, securityCode });

      if (verificationResult.success) {
        // If security code is valid, redirect to regular login with admin mode enabled
        // The user will need to enter their password there
        navigate('/login', { 
          state: { 
            adminEmail: email,
            adminVerified: true 
          } 
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Verification failed';
      
      if (errorMessage.includes('locked') || err.response?.status === 423) {
        setIsLocked(true);
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-purple-500/20 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
          <CardDescription className="text-purple-200">
            Enter your admin credentials and security code
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAdminLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <Lock className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-200">
                  Your account has been temporarily locked due to multiple failed attempts. 
                  Please try again later or contact system administrator.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-purple-200">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@snipfit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={verifySecurityCode.isPending || authLoading}
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityCode" className="text-purple-200">Security Code</Label>
              <Input
                id="securityCode"
                type="text"
                placeholder="Enter your 6-digit security code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                required
                disabled={verifySecurityCode.isPending || authLoading}
                maxLength={6}
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-slate-400 font-mono tracking-widest text-center text-lg"
              />
              <p className="text-xs text-purple-300 text-center">
                This is a unique 6-digit code only known to admins
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={verifySecurityCode.isPending || authLoading || isLocked}
            >
              {verifySecurityCode.isPending || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify & Login
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="text-purple-300 hover:text-white hover:bg-purple-500/10"
                onClick={() => navigate('/login')}
              >
                Back to Regular Login
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
