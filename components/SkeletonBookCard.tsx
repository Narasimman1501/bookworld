import React from 'react';

const SkeletonBookCard: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-md">
      <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-slate-700"></div>
        <div className="p-4">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonBookCard;
