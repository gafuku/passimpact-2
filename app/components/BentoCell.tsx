import React from 'react';

interface BentoCellProps {
  children: React.ReactNode;
  className?: string;
}

export const BentoCell: React.FC<BentoCellProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-visible border-r border-b border-border bg-surface p-inset ${className}`}>
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
