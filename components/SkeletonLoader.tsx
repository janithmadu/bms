export const  SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Skeleton for DialogTitle */}
        <div className="h-8 w-1/3 bg-slate-200 rounded" />
        {/* Skeleton for DialogDescription */}
        <div className="flex items-center">
          <div className="h-4 w-4 bg-slate-200 rounded-full mr-2" />
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
        </div>
        {/* Skeleton for Step Pills */}
        <div className="mt-4 px-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
            <div className="h-[2px] flex-1 bg-slate-200" />
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
          </div>
        </div>
        {/* Skeleton for Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4 pb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Skeleton for BoardroomDetails and DateSelector */}
            <div className="md:flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="h-40 w-full bg-slate-200 rounded" />
                <div className="h-10 w-3/4 bg-slate-200 rounded" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-40 w-full bg-slate-200 rounded" />
                <div className="h-10 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
          {/* Skeleton for BookingSummary */}
          <div className="space-y-4">
            <div className="h-64 w-full bg-slate-200 rounded" />
            <div className="h-10 w-1/2 bg-slate-200 rounded" />
            <div className="h-10 w-1/2 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};