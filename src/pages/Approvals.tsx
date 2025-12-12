import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { getLeaveTypeConfig } from '@/lib/leaveTypes';
import { toast } from 'sonner';
import TeamStrength from '@/components/TeamStrength';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  backup_note: string | null;
  profiles: {
    full_name: string;
    email: string;
  };
}

const Approvals = () => {
  const { user, hasRole } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRole('approver') || hasRole('admin')) {
      fetchPendingRequests();
      subscribeToChanges();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!leave_requests_user_id_fkey (full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (data) setPendingRequests(data as any);
    setLoading(false);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('leave_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApprove = async (requestId: string, requesterName: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Woohoo! Leave approved for ${requesterName}! 🎉`, {
        description: 'They can now enjoy their time off!'
      });
    } catch (error: any) {
      toast.error('Failed to approve request', {
        description: error.message
      });
    }
  };

  const handleReject = async (requestId: string, requesterName: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast('Leave request declined', {
        description: `${requesterName}'s request has been declined. Please reach out to them! 💛`
      });
    } catch (error: any) {
      toast.error('Failed to reject request', {
        description: error.message
      });
    }
  };

  if (!hasRole('approver') && !hasRole('admin')) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle className="text-2xl">✅ Pending Approvals</CardTitle>
            <CardDescription>
              Review and approve leave requests from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg mb-2">No pending requests! 🎉</p>
                <p className="text-sm text-muted-foreground">
                  All caught up! You're doing great! ⚡
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const config = getLeaveTypeConfig(request.leave_type as any);
                  
                  return (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{config.emoji}</span>
                                <span className="font-semibold text-lg">
                                  {request.profiles.full_name}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {request.profiles.email}
                              </p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending Review
                            </Badge>
                          </div>

                          {/* Leave Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Leave Type</p>
                              <p className="font-medium">{config.label}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Duration</p>
                              <p className="font-medium">
                                {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            {request.reason && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground mb-1">Reason</p>
                                <p className="text-sm">{request.reason}</p>
                              </div>
                            )}
                            {request.backup_note && (
                              <div className="md:col-span-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-sm text-muted-foreground mb-1">📋 Backup Arrangement</p>
                                <p className="text-sm font-medium">{request.backup_note}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApprove(request.id, request.profiles.full_name)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white btn-joy"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id, request.profiles.full_name)}
                              variant="outline"
                              className="flex-1 btn-joy"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Approvals;