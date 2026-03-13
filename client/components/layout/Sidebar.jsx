import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BrainCircuit, 
  Timer, 
  BookOpen, 
  Settings,
  MessageSquare,
  PenTool
} from 'lucide-react';

const Sidebar = ({ className }) => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Task Planner', icon: CheckSquare, path: '/tasks' },
    { name: 'Brain Dump', icon: BrainCircuit, path: '/brain-dump' },
    { name: 'Focus Timer', icon: Timer, path: '/focus' },
    { name: 'Reading Mode', icon: BookOpen, path: '/reading' },
    { name: 'Writing Lab', icon: PenTool, path: '/writing' },
    { name: 'AI Companion', icon: MessageSquare, path: '/chat' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`w-64 h-[calc(100vh-64px)] overflow-y-auto border-r dark:border-slate-800 bg-background sticky top-16 ${className}`}>
      <div className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Weekly XP</p>
          <p className="text-xl font-bold mb-3">1,240 XP</p>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/4"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
