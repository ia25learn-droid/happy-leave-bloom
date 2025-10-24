import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface BlockPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
}

const BlockPeriods = () => {
  const { user, hasRole } = useAuth();
  const [blockPeriods, setBlockPeriods] = useState<BlockPeriod[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasRole('admin') || hasRole('approver')) {
      fetchBlockPeriods();
    }
  }, [user]);

  const fetchBlockPeriods = async () => {
    const { data } = await supabase
      .from('block_periods')
      .select('*')
      .gte('end_date', format(new Date(), 'yyyy-MM-dd'))
      .order('start_date', { ascending: true });

    if (data) setBlockPeriods(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all fields! 💫');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('block_periods')
        .insert({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Block period created! 🛡️', {
        description: 'Team members will be notified about this restriction.'
      });

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      
      fetchBlockPeriods();
    } catch (error: any) {
      toast.error('Failed to create block period', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('block_periods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Block period removed! ✨');
      fetchBlockPeriods();
    } catch (error: any) {
      toast.error('Failed to delete block period', {
        description: error.message
      });
    }
  };

  if (!hasRole('admin') && !hasRole('approver')) {
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
        {/* Create Block Period */}
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Create Block Period</span>
            </CardTitle>
            <CardDescription>
              Set dates when leave requests cannot be submitted (e.g., busy seasons, important events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate ? date < startDate : false}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., End of year closing, Major product launch, Company event"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-joy" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Creating...' : 'Create Block Period 🛡️'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Block Periods */}
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle>Active Block Periods</CardTitle>
            <CardDescription>Current and upcoming blocked periods</CardDescription>
          </CardHeader>
          <CardContent>
            {blockPeriods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-lg mb-2">No block periods set! 🌈</p>
                <p className="text-sm">Create one above when you need to protect specific dates.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockPeriods.map((period) => (
                  <Card key={period.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {format(new Date(period.start_date), 'MMM dd, yyyy')} - {format(new Date(period.end_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{period.reason}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(period.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BlockPeriods;
