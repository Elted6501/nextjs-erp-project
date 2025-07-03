'use client';
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { usePermissions } from "./hooks/usePermissions";

// Force dynamic rendering to prevent static generation issues with Supabase
export const dynamic = 'force-dynamic';

// List of all main modules with their metadata and required permissions
const modules = [
   {
       name: "Finance Module",
       href: "/finance",
       permission: "finance.view",
       description: "Manage accounting, budgets, and financial reporting with advanced analytics and real-time insights.",
       icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
   },
   {
       name: "Human Resources",
       href: "/human-resources",
       permission: "hr.view",
       description: "Streamline recruitment, payroll, performance management, and employee development processes.",
       icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
   },
   {
       name: "Sales Module",
       href: "/sales",
       permission: "sales.view",
       description: "Boost revenue with CRM tools, pipeline management, and comprehensive sales analytics.",
       icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
   },
   {
       name: "Inventory Module",
       href: "/inventory",
       permission: "inventory.view",
       description: "Track stock levels, automate reordering, and optimize warehouse operations efficiently.",
       icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
   },
   {
       name: "Maintenance Module",
       href: "/maintenance",
       permission: "maintenance.view",
       description: "Ensure optimal asset performance with preventive maintenance scheduling and tracking.",
       icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
   }
];

export default function Home() {
   // Get permission helper and loading state from custom hook
   const { hasPermission, isLoading } = usePermissions();

   // Show loading spinner while permissions are loading
   if (isLoading) {
       return (
           <div className="flex justify-center items-center h-screen bg-black">
               <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-red-500"></div>
           </div>
       );
   }

  return (
    <div className="flex flex-col min-h-screen min-w-screen bg-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-red-600/20 to-red-700/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-500/15 to-red-600/8 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-r from-red-800/10 to-red-500/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Main navigation bar */}
      <Navbar />
      
      <div className="flex flex-col items-center justify-center px-4 pt-32 pb-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6 leading-tight">
            Enterprise Resource
            <span className="block">Planning System</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Streamline your business operations with our comprehensive ERP solution
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Module Cards Grid */}
        <div className="flex flex-wrap justify-center gap-6 w-full max-w-8xl mx-auto">
          {modules
            .filter(module => hasPermission(module.permission) || hasPermission('system.admin'))
            .map(module => (
              <Link
                key={module.name}
                href={module.href}
                className="w-[300px] group relative p-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-red-300/50 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-700/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-800 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {module.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors duration-300">
                    {module.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {module.description}
                  </p>
                </div>
              </Link>
            ))}
        </div>
              
        {/* Call to Action (optional) */}

      </div>

      {/* Animation for fade-in-up effect */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}