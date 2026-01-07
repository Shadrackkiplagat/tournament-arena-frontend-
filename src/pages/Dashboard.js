import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { TrendingUp, Users, Trophy, Activity } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await dashboardAPI.getDashboard();
      setData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
        Games Management Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Matches', value: data?.stats.totalMatches, icon: Trophy },
          { label: 'Live Matches', value: data?.stats.liveMatches, icon: Activity },
          { label: 'Teams', value: data?.stats.totalTeams, icon: Users },
          { label: 'Players', value: data?.stats.totalPlayers, icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {data?.recentActivity?.map((log) => (
            <div key={log._id} className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-semibold">{log.action}</p>
              <p className="text-sm text-gray-500">{log.admin.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}