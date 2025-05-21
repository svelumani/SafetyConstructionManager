import { 
  CheckCircle, 
  GraduationCap, 
  AlertTriangle,
  ClipboardCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatUTCToLocal } from "@/lib/utils";

interface ActivityEvent {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  userId: number;
  userName: string;
  createdAt: string;
}

export default function RecentActivity() {
  const { data, isLoading } = useQuery<ActivityEvent[]>({
    queryKey: ['/api/system-logs', { limit: 5 }],
  });

  // Create activity types with icons and styles
  const getActivityType = (activity: ActivityEvent) => {
    const types = {
      hazard_resolved: {
        icon: CheckCircle,
        bgColor: "bg-primary-100",
        textColor: "text-primary",
        title: "Hazard Resolved",
        description: (activity: ActivityEvent) => 
          `${activity.userName || "A user"} resolved the ${activity.details?.hazardType || "hazard"} at ${activity.details?.location || "a location"}.`
      },
      training_record_created: {
        icon: GraduationCap,
        bgColor: "bg-green-100",
        textColor: "text-success",
        title: "Training Completed",
        description: (activity: ActivityEvent) => 
          `${activity.userName || "A user"} completed "${activity.details?.courseName || "a training course"}".`
      },
      hazard_created: {
        icon: AlertTriangle,
        bgColor: "bg-amber-100",
        textColor: "text-warning",
        title: "New Hazard Reported",
        description: (activity: ActivityEvent) => 
          `${activity.userName || "A user"} reported a ${activity.details?.hazardType || "hazard"} at ${activity.details?.location || "a location"}.`
      },
      inspection_completed: {
        icon: ClipboardCheck,
        bgColor: "bg-blue-100",
        textColor: "text-primary",
        title: "Inspection Completed",
        description: (activity: ActivityEvent) => 
          `${activity.userName || "A user"} completed the ${activity.details?.inspectionType || "weekly"} inspection at ${activity.details?.location || "a site"}.`
      }
    };

    // Default activity type
    const defaultType = {
      icon: CheckCircle,
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      title: "Activity",
      description: () => `${activity.userName || "A user"} performed an action: ${activity.action.replace(/_/g, ' ')}`
    };

    const key = activity.action as keyof typeof types;
    return types[key] || defaultType;
  };

  // If loading or no data, show placeholder
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sample activities if no data from API
  const activities = data || [
    {
      id: 1,
      action: "hazard_resolved",
      entityType: "hazard",
      entityId: "1",
      details: { hazardType: "electrical", location: "Building A" },
      userId: 1,
      userName: "Mike Johnson",
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      action: "training_record_created",
      entityType: "training",
      entityId: "3",
      details: { courseName: "Fall Protection" },
      userId: 2,
      userName: "Sarah Wilson",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      action: "hazard_created",
      entityType: "hazard",
      entityId: "5",
      details: { hazardType: "scaffolding issue", location: "North Tower" },
      userId: 3,
      userName: "David Miller",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      action: "inspection_completed",
      entityType: "inspection",
      entityId: "2",
      details: { inspectionType: "weekly", location: "Building C" },
      userId: 4,
      userName: "Robert Chen", 
      createdAt: new Date(Date.now() - 18000000).toISOString()
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Recent Activity</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const type = getActivityType(activity);
            const IconComponent = type.icon;
            const isLast = index === activities.length - 1;
            
            return (
              <div key={activity.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-8 h-8 rounded-full ${type.bgColor} ${type.textColor} flex items-center justify-center`}>
                    <IconComponent size={16} />
                  </div>
                  {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                </div>
                <div>
                  <div className="font-medium">{type.title}</div>
                  <div className="text-sm text-gray-600">{type.description(activity)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatUTCToLocal(activity.createdAt, 'relative')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
