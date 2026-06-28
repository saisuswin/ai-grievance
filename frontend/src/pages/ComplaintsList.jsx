import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Calendar, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ComplaintsList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const url = user?.role === 'admin' 
          ? 'http://localhost:5000/api/complaints'
          : `http://localhost:5000/api/complaints?email=${user?.email}`;
        const res = await axios.get(url);
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchComplaints();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status: newStatus });
      setComplaints(prev => prev.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const allDepartments = [...new Set(complaints.map(c => c.department || 'General Support'))];

  const filteredComplaints = complaints.filter(c => {
    const statusMatch = filter === 'All' || c.status === filter;
    const deptMatch = deptFilter === 'All' || (c.department || 'General Support') === deptFilter;
    return statusMatch && deptMatch;
  });

  const groupedComplaints = filteredComplaints.reduce((acc, complaint) => {
    const dept = complaint.department || 'General Support';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(complaint);
    return acc;
  }, {});

  if (loading) return <div className="text-center mt-20 text-gray-400 animate-pulse">Loading Complaints...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">
            {user?.role === 'admin' ? 'Public Grievances' : 'My Complaints'}
          </h1>
          <p className="text-gray-400 mt-2">
            {user?.role === 'admin' ? 'Manage and resolve reported issues.' : 'Track your submitted issues.'}
          </p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." className="w-full glass-input pl-10 py-2.5 text-sm" />
          </div>
          <div className="relative hidden md:block">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="glass-input pl-10 py-2.5 text-sm appearance-none pr-8 cursor-pointer bg-darker border-r-8 border-transparent"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="relative hidden md:block">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select 
              className="glass-input pl-10 py-2.5 text-sm appearance-none pr-8 cursor-pointer bg-darker border-r-8 border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-10 mt-8">
        {Object.keys(groupedComplaints).length === 0 ? (
          <div className="text-center py-20 text-gray-500">No complaints found.</div>
        ) : (
          Object.keys(groupedComplaints).map(dept => (
            <div key={dept} className="space-y-4">
              <div className="flex items-center space-x-3 border-b border-white/10 pb-2">
                <h2 className="text-xl font-bold text-white">{dept}</h2>
                <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full">{groupedComplaints[dept].length}</span>
              </div>
              
              <div className="space-y-2">
                {groupedComplaints[dept].map((complaint, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={complaint._id}
                    className="glass-card p-3 hover:bg-white/5 hover:border-primary/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-lg bg-darker flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10">
                      {complaint.imageUrl ? (
                        <img src={`http://localhost:5000${complaint.imageUrl}`} alt="Issue" className="w-full h-full object-cover" />
                      ) : (
                        <CheckCircle className="text-gray-500" size={20} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white truncate">
                        {complaint.summary || complaint.originalText}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="text-primary font-medium">{complaint.category}</span>
                        <span className="flex items-center gap-1"><MapPin size={10}/> {complaint.location || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                      {user?.role === 'admin' ? (
                        <select 
                          value={complaint.status}
                          onChange={(e) => updateStatus(complaint._id, e.target.value)}
                          className={`text-xs font-medium border border-white/10 rounded px-2 py-1 outline-none ${complaint.status === 'Resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                        >
                          <option value="Pending" className="bg-dark text-white">Pending</option>
                          <option value="In Progress" className="bg-dark text-white">In Progress</option>
                          <option value="Resolved" className="bg-dark text-white">Resolved</option>
                        </select>
                      ) : (
                        <div className={`flex items-center text-xs font-medium ${complaint.status === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}`}>
                          <Clock size={12} className="mr-1" />
                          {complaint.status}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ComplaintsList;
