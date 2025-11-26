import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { getLeaveTypeConfig } from '@/lib/leaveTypes';
import TeamStrength from '@/components/TeamStrength';

interface LeaveOnDate {
  user_initials: string;
  full_name: string;
  leave_type: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveData, setLeaveData] = useState<Record<string, LeaveOnDate[]>>({});
  const [strengthData, setStrengthData] = useState<Record<string, { available: number; total: number }>>({});

  useEffect(() => {
    fetchMonthLeave();
  }, [currentDate]);

  const fetchMonthLeave = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const { data: leaves } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!leave_requests_user_id_fkey (full_name)
      `)
      .eq('status', 'approved')
      .lte('start_date', format(end, 'yyyy-MM-dd'))
      .gte('end_date', format(start, 'yyyy-MM-dd'));

    // Process leave data by date
    const leaveByDate: Record<string, LeaveOnDate[]> = {};
    const strengthByDate: Record<string, { available: number; total: number }> = {};

    const allDays = eachDayOfInterval({ start, end });
    
    allDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const leavesOnDay = leaves?.filter(
        leave => dateStr >= leave.start_date && dateStr <= leave.end_date
      ) || [];

      leaveByDate[dateStr] = leavesOnDay.map(leave => ({
        user_initials: getInitials(leave.profiles?.full_name || 'User'),
        full_name: leave.profiles?.full_name || 'User',
        leave_type: leave.leave_type
      }));

      strengthByDate[dateStr] = {
        available: 10 - leavesOnDay.length,
        total: 10
      };
    });

    setLeaveData(leaveByDate);
    setStrengthData(strengthByDate);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Layout>
      <div className="space-y-6">
        <Card className="card-entrance">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                📅 Team Calendar
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousMonth} className="btn-joy">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[150px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth} className="btn-joy">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div key={day} className="text-center font-semibold text-sm py-2 text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const leavesOnDay = leaveData[dateStr] || [];
                const strength = strengthData[dateStr] || { available: 10, total: 10 };
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 rounded-lg border transition-all
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                      ${isDayToday ? 'ring-2 ring-primary shadow-md' : ''}
                      hover:shadow-lg hover:scale-105
                    `}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-sm font-medium ${isDayToday ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {isCurrentMonth && (
                        <TeamStrength 
                          available={strength.available}
                          total={strength.total}
                          size="small"
                          showLabel={false}
                        />
                      )}
                    </div>

                    {/* Leave badges */}
                    {isCurrentMonth && leavesOnDay.length > 0 && (
                      <div className="space-y-1">
                        {leavesOnDay.slice(0, 3).map((leave, idx) => {
                          const config = getLeaveTypeConfig(leave.leave_type as any);
                          return (
                            <div
                              key={idx}
                              className="text-xs px-2 py-1 rounded text-center font-medium hover:scale-105 transition-transform cursor-pointer"
                              style={{ backgroundColor: config.color }}
                              title={`${leave.full_name} - ${config.label}`}
                            >
                              {leave.user_initials}
                            </div>
                          );
                        })}
                        {leavesOnDay.length > 3 && (
                          <div className="text-xs text-center text-muted-foreground">
                            +{leavesOnDay.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="card-entrance">
          <CardHeader>
            <CardTitle className="text-lg">🎨 Color Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getLeaveTypeConfig('annual' as any) && [
                'annual', 'half_day_am', 'half_day_pm', 'sick',
                'training', 'maternity', 'paternity'
              ].map(type => {
                const config = getLeaveTypeConfig(type as any);
                return (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendar;