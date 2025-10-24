import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeamStrength from '@/components/TeamStrength';
import { leaveTypes, getLeaveTypeConfig } from '@/lib/leaveTypes';
import { format, isToday, isTomorrow, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [todayStrength, setTodayStrength] = useState({ available: 11, total: 11 });
  const [tomorrowStrength, setTomorrowStrength] = useState({ available: 11, total: 11 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLeaveRequests();
      fetchTeamStrength();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    setProfile(data);
  };

  const fetchLeaveRequests = async () => {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setLeaveRequests(data);
  };

  const fetchTeamStrength = async () => {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's leave
    const { data: todayLeave } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'approved')
      .lte('start_date', format(today, 'yyyy-MM-dd'))
      .gte('end_date', format(today, 'yyyy-MM-dd'));

    // Fetch tomorrow's leave
    const { data: tomorrowLeave } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'approved')
      .lte('start_date', format(tomorrow, 'yyyy-MM-dd'))
      .gte('end_date', format(tomorrow, 'yyyy-MM-dd'));

    setTodayStrength({ available: 11 - (todayLeave?.length || 0), total: 11 });
    setTomorrowStrength({ available: 11 - (tomorrowLeave?.length || 0), total: 11 });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card-entrance">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                👋 Welcome back, {profile?.full_name || 'there'}!
              </CardTitle>
              <CardDescription className="text-base">
                Here's what's happening with your leave today
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Team Strength Today */}
          <Card className="card-entrance">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>💪 Today's Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <TeamStrength 
                  available={todayStrength.available} 
                  total={todayStrength.total}
                  size="large"
                />
                <p className="text-sm text-muted-foreground text-center">
                  {todayStrength.total - todayStrength.available} {todayStrength.total - todayStrength.available === 1 ? 'person' : 'people'} on leave today
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tomorrow's Strength */}
          <Card className="card-entrance">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📅 Tomorrow's Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <TeamStrength 
                  available={tomorrowStrength.available} 
                  total={tomorrowStrength.total}
                  size="large"
                />
                <p className="text-sm text-muted-foreground text-center">
                  {tomorrowStrength.total - tomorrowStrength.available} {tomorrowStrength.total - tomorrowStrength.available === 1 ? 'person' : 'people'} away tomorrow
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-entrance">
            <CardHeader>
              <CardTitle>🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => navigate('/apply')}
                className="w-full p-3 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-transform"
              >
                Request Leave
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="w-full p-3 rounded-lg bg-secondary text-secondary-foreground hover:scale-105 transition-transform"
              >
                View Calendar
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leave Requests */}
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle>📋 Your Recent Leave Requests</CardTitle>
            <CardDescription>Latest 5 requests</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg mb-2">No leave requests yet! 🚀</p>
                <p className="text-sm">You're on a roll! Take a break when you need one! 😊</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((request) => {
                  const config = getLeaveTypeConfig(request.leave_type as any);
                  return (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{config.emoji}</span>
                            <span className="font-medium">{config.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.start_date), 'MMM dd, yyyy')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Types Legend */}
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle>🎨 Leave Types</CardTitle>
            <CardDescription>Our colorful leave categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {leaveTypes.map((type) => (
                <div
                  key={type.value}
                  className="p-3 rounded-lg text-center hover:scale-105 transition-transform"
                  style={{ backgroundColor: type.color }}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium text-gray-800">{type.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;