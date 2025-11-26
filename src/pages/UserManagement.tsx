import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, User, UserCog } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
}

const UserManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReset, setSendingReset] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!hasRole('admin')) {
      toast.error('Access denied: Admin privileges required');
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, hasRole, navigate]);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profileError) throw profileError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(r => r.user_id === profile.id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (email: string, userId: string) => {
    setSendingReset(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { email }
      });

      if (error) throw error;

      toast.success(`Password reset link sent to ${email}! 📧`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset link');
      console.error('Error sending password reset:', error);
    } finally {
      setSendingReset(null);
    }
  };

  const handleRoleChange = async (userId: string, role: string, action: 'add' | 'remove') => {
    setChangingRole(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-change-role', {
        body: { targetUserId: userId, role, action }
      });

      if (error) throw error;

      toast.success(`Role ${role} ${action === 'add' ? 'added' : 'removed'} successfully! ✨`);
      
      // Refresh users list
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} role`);
      console.error('Error changing role:', error);
    } finally {
      setChangingRole(null);
    }
  };

  const getAvailableRoles = (currentRoles: string[]) => {
    const allRoles = ['staff', 'approver', 'admin'];
    return {
      canAdd: allRoles.filter(role => !currentRoles.includes(role)),
      canRemove: currentRoles.filter(role => currentRoles.length > 1) // Can only remove if user has more than 1 role
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and send password reset links
          </p>
        </div>

        <div className="grid gap-4">
          {users.map((userProfile) => (
            <Card key={userProfile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{userProfile.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {userProfile.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {userProfile.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant={role === 'admin' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {role === 'admin' && <Shield className="h-3 w-3" />}
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSendPasswordReset(userProfile.email, userProfile.id)}
                    disabled={sendingReset === userProfile.id}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {sendingReset === userProfile.id ? 'Sending...' : 'Send Password Reset Link'}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={changingRole === userProfile.id || userProfile.id === user?.id}
                      >
                        <UserCog className="h-4 w-4" />
                        Manage Roles
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {(() => {
                        const { canAdd, canRemove } = getAvailableRoles(userProfile.roles);
                        return (
                          <>
                            {canAdd.length > 0 && (
                              <>
                                <DropdownMenuLabel>Add Role</DropdownMenuLabel>
                                {canAdd.map((role) => (
                                  <DropdownMenuItem
                                    key={`add-${role}`}
                                    onClick={() => handleRoleChange(userProfile.id, role, 'add')}
                                    disabled={changingRole === userProfile.id}
                                  >
                                    <span className="text-green-600 mr-2">+</span>
                                    Add {role}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            
                            {canAdd.length > 0 && canRemove.length > 0 && <DropdownMenuSeparator />}
                            
                            {canRemove.length > 0 && (
                              <>
                                <DropdownMenuLabel>Remove Role</DropdownMenuLabel>
                                {canRemove.map((role) => (
                                  <DropdownMenuItem
                                    key={`remove-${role}`}
                                    onClick={() => handleRoleChange(userProfile.id, role, 'remove')}
                                    disabled={changingRole === userProfile.id}
                                  >
                                    <span className="text-red-600 mr-2">−</span>
                                    Remove {role}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            
                            {canAdd.length === 0 && canRemove.length === 0 && (
                              <DropdownMenuItem disabled>
                                No role changes available
                              </DropdownMenuItem>
                            )}
                          </>
                        );
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {userProfile.id === user?.id && (
                    <p className="text-xs text-muted-foreground mt-2 w-full">
                      You cannot change your own roles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;
