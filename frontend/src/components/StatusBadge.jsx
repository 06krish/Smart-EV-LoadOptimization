import React from 'react';

export const StatusBadge = ({ status, type = 'session' }) => {
  let badgeClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let dotClasses = 'bg-slate-400';

  if (type === 'session') {
    switch (status) {
      case 'CHARGING':
        badgeClasses = 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800 shadow-xs';
        dotClasses = 'bg-teal-500 animate-pulse';
        break;
      case 'WAITING':
        badgeClasses = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800';
        dotClasses = 'bg-amber-500';
        break;
      case 'PAUSED':
        badgeClasses = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800';
        dotClasses = 'bg-indigo-500';
        break;
      case 'COMPLETED':
        badgeClasses = 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-200 border-lime-300 dark:border-lime-800';
        dotClasses = 'bg-lime-600';
        break;
      case 'FAILED':
      case 'CANCELLED':
        badgeClasses = 'bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border-coral-200 dark:border-coral-800';
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
        badgeClasses = 'bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border-coral-200 dark:border-coral-800 font-semibold';
        dotClasses = 'bg-coral-500';
        break;
      case 3:
      case 'High':
      case 'High (3)':
        badgeClasses = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800';
        dotClasses = 'bg-amber-500';
        break;
      case 2:
      case 'Medium':
      case 'Medium (2)':
        badgeClasses = 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800';
        dotClasses = 'bg-teal-500';
        break;
      case 1:
      case 'Low':
      case 'Low (1)':
      default:
        badgeClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
        dotClasses = 'bg-slate-400';
        break;
    }
  } else if (type === 'charger') {
    switch (status) {
      case 'AVAILABLE':
        badgeClasses = 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800 font-medium';
        dotClasses = 'bg-teal-500';
        break;
      case 'CHARGING':
        badgeClasses = 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-200 border-lime-300 dark:border-lime-800 font-medium';
        dotClasses = 'bg-lime-500 animate-pulse';
        break;
      case 'OCCUPIED':
        badgeClasses = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 font-medium';
        dotClasses = 'bg-indigo-500';
        break;
      case 'FAULT':
        badgeClasses = 'bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border-coral-200 dark:border-coral-800 font-semibold';
        dotClasses = 'bg-coral-500 animate-bounce';
        break;
      case 'OFFLINE':
      default:
        badgeClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
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
