import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AuthForm from "@/components/auth-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "super_admin") {
        setLocation("/super-admin");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, setLocation]);
  
  // Don't render anything while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render the auth page if we're logged in
  if (user) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Login/Registration column */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-4 md:p-8">
        <AuthForm />
      </div>
      
      {/* Hero section */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-primary p-12 text-white">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-6">MySafety for Construction</h1>
          <p className="text-xl mb-8">
            Comprehensive safety management for your construction sites. 
            Track hazards, manage inspections, and ensure compliance, all in one place.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1 mr-4 bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Hazard Reporting</h3>
                <p className="text-white/80">Quickly identify and address safety hazards across all your sites.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1 mr-4 bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Safety Training</h3>
                <p className="text-white/80">Comprehensive training management for all employees.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1 mr-4 bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Inspection Management</h3>
                <p className="text-white/80">Schedule, perform, and track safety inspections with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
