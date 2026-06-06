import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAcceptAdminInvitation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield, Mail, Lock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AcceptAdminInvitation() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const acceptInvitation = useAcceptAdminInvitation();

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. Please check your email for the correct link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await acceptInvitation.mutateAsync({ token: token!, name, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { email: '', adminVerified: true } });
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to accept invitation';
      setError(errorMessage);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Invitation Link</h2>
            <p className="text-muted-foreground">The invitation link you clicked is invalid or has expired.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-emerald-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mt-4" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Invitation Accepted!</h2>
            <p className="text-green-100">You now have admin access to SNIPFIT.</p>
            <p className="text-green-200 text-sm mt-4">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-purple-500/20 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Invitation</CardTitle>
          <CardDescription className="text-purple-200">
            You've been invited to become a SNIPFIT administrator
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-200">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={acceptInvitation.isPending}
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={acceptInvitation.isPending}
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={acceptInvitation.isPending}
                className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3 text-sm text-purple-200">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <strong>Admin Dashboard Access</strong>
                  <p className="text-xs mt-1">Full access to member management and analytics</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-purple-200">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <strong>Class & Booking Management</strong>
                  <p className="text-xs mt-1">Manage gym schedules and member bookings</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-purple-200">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <strong>Security Code Setup</strong>
                  <p className="text-xs mt-1">You'll set up a unique admin security code</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={acceptInvitation.isPending}
            >
              {acceptInvitation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
