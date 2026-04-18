import { supabase } from '../../config/supabase';

export class DashboardService {
  async get_dashboard_stats(range: string) {
    const now = new Date();
    let startDate = new Date();

    if (range === 'Today' || range === 'Day') startDate.setHours(0, 0, 0, 0);
    else if (range === 'Week') startDate.setDate(now.getDate() - 7);
    else if (range === 'Month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setFullYear(now.getFullYear() - 10);

    const startIso = startDate.toISOString();
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('status')
      .gte('createdAt', startIso);

    const stats = {
      totalVisitors: tickets?.length || 0,
      activeQueues: tickets?.filter(t => t.status === 'Waiting' || t.status === 'Serving').length || 0,
      completed: tickets?.filter(t => t.status === 'Completed').length || 0
    };
    const { data: activities } = await supabase
      .from('ActivityLog')
      .select('*')
      .gte('createdAt', startIso)
      .order('createdAt', { ascending: false });

    return { stats, activities: activities || [] };
  }
}
export const dashboardService = new DashboardService();