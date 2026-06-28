import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/analytics');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];

  if (loading) return <div className="text-center mt-20 text-gray-400 animate-pulse">Loading Intelligence Data...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold neon-text">Intelligence Dashboard</h1>
        <p className="text-gray-400 mt-2">Real-time civic analytics powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Issues', value: data?.total || 0, icon: <Activity className="text-primary" />, color: 'from-blue-500/20' },
          { title: 'Resolution Rate', value: `${data?.resolutionRate || 0}%`, icon: <CheckCircle className="text-green-400" />, color: 'from-green-500/20' },
          { title: 'High Priority', value: data?.priorities?.find(p => p.name === 'High' || p.name === 'Critical')?.value || 0, icon: <AlertTriangle className="text-red-400" />, color: 'from-red-500/20' },
          { title: 'Pending', value: (data?.total || 0) - ((data?.total || 0) * (data?.resolutionRate || 0) / 100).toFixed(0), icon: <Clock className="text-yellow-400" />, color: 'from-yellow-500/20' }
        ].map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className={`glass-card p-6 bg-gradient-to-br ${stat.color} to-transparent border-l-4 border-l-white/20`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">Issues by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.categories || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {(data?.categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {(data?.categories || []).map((entry, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">Department Workload</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.departments || []}>
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis stroke="#666" tick={{ fill: '#999' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
