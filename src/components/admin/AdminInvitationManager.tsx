import { useState } from 'react';
import { useInviteAdmin, useAdminInvitations, useCancelAdminInvitation, useResendAdminInvitation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  X,
  UserPlus,
  Calendar,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface Invitation {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminInvitationManager() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const { data: invitations, isLoading: invitationsLoading } = useAdminInvitations();
  const inviteAdmin = useInviteAdmin();
  const cancelInvitation = useCancelAdminInvitation();
  const resendInvitation = useResendAdminInvitation();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await inviteAdmin.mutateAsync(email);
      setEmail('');
    } catch (err: any) {
      // Error is handled by the mutation hook
    }
  };

  const handleCancel = async (id: string) => {
    const invitation = invitations?.find((i: Invitation) => i.id === id);
    if (invitation && window.confirm(`Cancel invitation to ${invitation.email}?`)) {
      try {
        await cancelInvitation.mutateAsync(id);
      } catch (err) {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleResend = async (id: string) => {
    try {
      await resendInvitation.mutateAsync(id);
    } catch (err) {
      // Error is handled by the mutation hook
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isPending = (acceptedAt: string | null, expiresAt: string) => !acceptedAt && !isExpired(expiresAt);
  const isAccepted = (acceptedAt: string | null) => !!acceptedAt;

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Admin Invitations
        </CardTitle>
        <CardDescription>
          Invite new administrators to join your team. Only invited users can become admins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Admin Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="admin@snipfit.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={inviteAdmin.isPending}
                className="bg-background"
              />
            </div>
            <Button 
              type="submit" 
              disabled={inviteAdmin.isPending || !email}
              className="mt-6"
            >
              {inviteAdmin.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Invite
                </>
              )}
            </Button>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Invitations List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Pending Invitations</h3>
          {invitationsLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading invitations...
            </div>
          ) : invitations && invitations.filter(isPending).length > 0 ? (
            invitations.filter(isPending).map((invitation: Invitation) => (
              <div 
                key={invitation.id} 
                className="flex items-center justify-between p-4 bg-background border border-border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium">{invitation.email}</span>
                    {isExpired(invitation.expiresAt) && (
                      <span className="text-xs text-yellow-500 ml-2">(Expired)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires: {format(new Date(invitation.expiresAt), 'MMM d, h:mm a')}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserPlus className="h-3 w-3" />
                      Invited by: {invitation.invitedBy.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResend(invitation.id)}
                    disabled={resendInvitation.isPending || isExpired(invitation.expiresAt)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(invitation.id)}
                    disabled={cancelInvitation.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No pending invitations
            </div>
          )}
        </div>

        {/* Accepted/Expired Invitations */}
        {invitations && (invitations.filter((i: Invitation) => isAccepted(i.acceptedAt) || isExpired(i.expiresAt)).length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Past Invitations</h3>
            <div className="space-y-2">
              {invitations
                .filter((i: Invitation) => isAccepted(i.acceptedAt) || isExpired(i.expiresAt))
                .map((invitation: Invitation) => (
                  <div 
                    key={invitation.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg opacity-60"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {isAccepted(invitation.acceptedAt) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium text-sm">{invitation.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {isAccepted(invitation.acceptedAt) 
                          ? `Accepted on ${invitation.acceptedAt ? format(new Date(invitation.acceptedAt), 'MMM d, h:mm a') : 'N/A'}`
                          : 'Expired invitation'
                        }
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
