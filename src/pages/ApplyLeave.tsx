import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { leaveTypes, LeaveType } from '@/lib/leaveTypes';
import TeamStrength from '@/components/TeamStrength';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BlockPeriod {
  start_date: string;
  end_date: string;
  reason: string;
}

const ApplyLeave = () => {
  const { user, hasRole } = useAuth();
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockPeriods, setBlockPeriods] = useState<BlockPeriod[]>([]);
  const [capacityWarning, setCapacityWarning] = useState(false);
  const [dateStrengths, setDateStrengths] = useState<Record<string, { available: number; total: number }>>({});

  useEffect(() => {
    fetchBlockPeriods();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      checkCapacity();
      checkBlockPeriods();
    }
  }, [startDate, endDate]);

  const fetchBlockPeriods = async () => {
    const { data } = await supabase
      .from('block_periods')
      .select('*')
      .gte('end_date', format(new Date(), 'yyyy-MM-dd'));
    
    if (data) setBlockPeriods(data);
  };

  const checkBlockPeriods = () => {
    if (!startDate || !endDate) return;

    const selectedDates = eachDayOfInterval({ start: startDate, end: endDate });
    
    for (const date of selectedDates) {
      const dateStr = format(date, 'yyyy-MM-dd');
      for (const block of blockPeriods) {
        if (dateStr >= block.start_date && dateStr <= block.end_date) {
          toast.error(`Oops! ${format(date, 'MMM dd')} is blocked: ${block.reason} 🌈`, {
            description: 'Please pick another fabulous date!'
          });
          return;
        }
      }
    }
  };

  const checkCapacity = async () => {
    if (!startDate || !endDate) return;

    const selectedDates = eachDayOfInterval({ start: startDate, end: endDate });
    let hasHighCapacity = false;
    const strengths: Record<string, { available: number; total: number }> = {};

    for (const date of selectedDates) {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'approved')
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);

      const onLeave = data?.length || 0;
      strengths[dateStr] = { available: 11 - onLeave, total: 11 };

      if (onLeave >= 2) {
        hasHighCapacity = true;
      }
    }

    setDateStrengths(strengths);
    setCapacityWarning(hasHighCapacity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !leaveType) {
      toast.error('Please fill in all fields! 💫');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-approve only if user is an approver (not admin)
      const isApprover = hasRole('approver');
      const requestStatus = isApprover ? 'approved' : 'pending';

      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          user_id: user.id,
          leave_type: leaveType,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason,
          status: requestStatus,
          approved_by: isApprover ? user.id : null,
          reviewed_at: isApprover ? new Date().toISOString() : null
        }]);

      if (error) throw error;

      toast.success(isApprover ? 'Leave approved automatically! 🎉' : 'Leave request sent! 🎉', {
        description: isApprover ? 'Your leave has been approved!' : 'Your approver will review it soon!'
      });

      // Reset form
      setLeaveType('');
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setCapacityWarning(false);
    } catch (error: any) {
      toast.error('Failed to submit request', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockPeriods.some(
      block => dateStr >= block.start_date && dateStr <= block.end_date
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle className="text-2xl">🌴 Apply for Leave</CardTitle>
            <CardDescription>
              Request your well-deserved time off! We've got your back! 💫
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <span>{type.emoji}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
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
                        disabled={isDateBlocked}
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
                        disabled={(date) => isDateBlocked(date) || (startDate ? date < startDate : false)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Capacity Warning */}
              {capacityWarning && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Just so you know! 🌟 There are already 2+ team members on leave for some of these days. 
                    You might want to check with the team first! 💛
                  </AlertDescription>
                </Alert>
              )}

              {/* Show strength for selected dates */}
              {startDate && endDate && Object.keys(dateStrengths).length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Team Strength During Your Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(dateStrengths).map(([date, strength]) => (
                        <div key={date} className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1">
                            {format(new Date(date), 'MMM dd')}
                          </span>
                          <TeamStrength 
                            available={strength.available} 
                            total={strength.total}
                            size="small"
                            showLabel={false}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Add any additional details..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full btn-joy" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request 🚀'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ApplyLeave;