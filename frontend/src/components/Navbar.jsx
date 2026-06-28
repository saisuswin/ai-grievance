import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, List, Activity, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  let links = [];
  if (user?.role === 'admin') {
    links = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'All Complaints', path: '/complaints', icon: <List size={20} /> },
    ];
  } else {
    links = [
      { name: 'My Complaints', path: '/', icon: <List size={20} /> },
      { name: 'New Complaint', path: '/new', icon: <PlusCircle size={20} /> },
    ];
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-darker/70 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity className="text-primary" size={24} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
              GovAI Next
            </span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-2">
                    {link.icon}
                    <span>{link.name}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 border border-white/20 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-white p-2">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
