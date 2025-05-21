import { 
  PlusCircle, 
  ClipboardCheck, 
  FileText,
  Users,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Report New Hazard",
      icon: PlusCircle,
      path: "/hazards/new",
      highlighted: true
    },
    {
      title: "Start Inspection",
      icon: ClipboardCheck,
      path: "/inspections/new",
      highlighted: false
    },
    {
      title: "Create Permit",
      icon: FileText,
      path: "/permits/new",
      highlighted: false
    },
    {
      title: "Add User",
      icon: Users,
      path: "/users/new",
      highlighted: false
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold">Quick Actions</h2>
      </div>
      <div className="p-4 space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.path}>
            <a className={`flex items-center justify-between p-3 rounded-md hover:bg-opacity-80 transition-colors duration-200 ${
              action.highlighted 
                ? "bg-blue-50 text-primary hover:bg-blue-100" 
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}>
              <div className="flex items-center">
                <action.icon className="text-xl mr-3" />
                <span className="font-medium">{action.title}</span>
              </div>
              <ChevronRight />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
