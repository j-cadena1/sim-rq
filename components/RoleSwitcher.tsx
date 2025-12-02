import React from 'react';
import { useSimFlow } from '../context/SimFlowContext';
import { UserRole } from '../types';
import { Shield, User, Briefcase, Wrench } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchUser } = useSimFlow();

  const roles = [
    { label: 'User', value: UserRole.USER, icon: User },
    { label: 'Manager', value: UserRole.MANAGER, icon: Briefcase },
    { label: 'Engineer', value: UserRole.ENGINEER, icon: Wrench },
    { label: 'Admin', value: UserRole.ADMIN, icon: Shield },
  ];

  return (
    <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider px-2">Simulate Role:</span>
      {roles.map((r) => (
        <button
          key={r.value}
          onClick={() => switchUser(r.value)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-all ${
            currentUser.role === r.value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <r.icon size={14} />
          <span>{r.label}</span>
        </button>
      ))}
    </div>
  );
};