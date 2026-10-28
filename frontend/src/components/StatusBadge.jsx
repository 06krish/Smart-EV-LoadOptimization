import React from 'react';

export const StatusBadge = ({ status, type = 'session' }) => {
  let badgeClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClasses = 'bg-slate-400';

  if (type === 'session') {
    switch (status) {
      case 'CHARGING':
        badgeClasses = 'bg-teal-50 text-teal-800 border-teal-200 shadow-xs';
        dotClasses = 'bg-teal-500 animate-pulse';
        break;
      case 'WAITING':
        badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        dotClasses = 'bg-amber-500';
        break;
      case 'PAUSED':
        badgeClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        dotClasses = 'bg-indigo-500';
        break;
      case 'COMPLETED':
        badgeClasses = 'bg-lime-50 text-lime-800 border-lime-300';
        dotClasses = 'bg-lime-600';
        break;
      case 'FAILED':
      case 'CANCELLED':
        badgeClasses = 'bg-coral-50 text-coral-600 border-coral-200';
        dotClasses = 'bg-coral-500';
        break;
      default:
        break;
    }
  } else if (type === 'priority') {
    switch (status) {
      case 4:
      case 'Critical':
      case 'Critical (4)':
        badgeClasses = 'bg-coral-50 text-coral-600 border-coral-200 font-semibold';
        dotClasses = 'bg-coral-500';
        break;
      case 3:
      case 'High':
      case 'High (3)':
        badgeClasses = 'bg-amber-50 text-amber-800 border-amber-300';
        dotClasses = 'bg-amber-500';
        break;
      case 2:
      case 'Medium':
      case 'Medium (2)':
        badgeClasses = 'bg-teal-50 text-teal-800 border-teal-200';
        dotClasses = 'bg-teal-500';
        break;
      case 1:
      case 'Low':
      case 'Low (1)':
      default:
        badgeClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        dotClasses = 'bg-slate-400';
        break;
    }
  } else if (type === 'charger') {
    switch (status) {
      case 'AVAILABLE':
        badgeClasses = 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
        dotClasses = 'bg-teal-500';
        break;
      case 'CHARGING':
        badgeClasses = 'bg-lime-50 text-lime-800 border-lime-300 font-medium';
        dotClasses = 'bg-lime-500 animate-pulse';
        break;
      case 'OCCUPIED':
        badgeClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-medium';
        dotClasses = 'bg-indigo-500';
        break;
      case 'FAULT':
        badgeClasses = 'bg-coral-50 text-coral-600 border-coral-200 font-semibold';
        dotClasses = 'bg-coral-500 animate-bounce';
        break;
      case 'OFFLINE':
      default:
        badgeClasses = 'bg-slate-100 text-slate-500 border-slate-200';
        dotClasses = 'bg-slate-400';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${badgeClasses}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dotClasses}`}></span>
      <span className="font-medium tracking-tight">{status}</span>
    </span>
  );
};

export default StatusBadge;
