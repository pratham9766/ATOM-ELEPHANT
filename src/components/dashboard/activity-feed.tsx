import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/dashboard";

const dotTone = {
  info: "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.8)]",
  success: "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.8)]",
  warning: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,.8)]"
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Card className="row-span-2 min-h-[620px] overflow-hidden">
      <CardHeader className="border-b border-white/[0.08]">
        <CardTitle>System Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="h-[548px] overflow-y-auto p-4">
        <div className="relative space-y-6 pl-5">
          <div className="absolute bottom-0 left-[6px] top-1 w-px bg-slate-600/70" />
          {activities.map((activity) => (
            <div key={activity.id} className="relative">
              <span className={cn("absolute -left-[22px] top-1 h-3 w-3 rounded-full", dotTone[activity.tone])} />
              <div className="text-sm font-semibold text-white">{activity.title}</div>
              <p className="mt-1 text-sm leading-5 text-slate-300">{activity.detail}</p>
              <div className="mt-2 text-xs text-slate-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
