"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "../contexts/UserContext";
import {
  FiUsers,
  FiCalendar,
  FiHome,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiMenu,
  FiGrid,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { FaCarAlt, FaIdCard } from "react-icons/fa";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AuthService } from "../../../client";
import Image from "next/image";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const router = useRouter();
  const { isAdmin, isLoading } = useUser();

  const allNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiHome className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <FiUsers className="h-5 w-5" />,
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: <FiCalendar className="h-5 w-5" />,
    },
    {
      name: "Schedule Table",
      path: "/schedule-table",
      icon: <FiGrid className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <FiSettings className="h-5 w-5" />,
    },
    {
      name: "Daily Reports",
      path: "/daily-reports",
      icon: <FiFileText className="h-5 w-5" />,
      adminOnly: true,
    },
    {
      name: "Vehicles",
      path: "/vehicles",
      icon: <FaCarAlt className="h-5 w-5" />,
    },
    {
      name: "Subscription",
      path: "/subscription",
      icon: <FaIdCard className="h-5 w-5" />,
    },
  ];

  // Filter navigation items - hide admin-only items for supervisors
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await AuthService.authControllerLogout();
    router.push("/login");
    setShowLogoutDialog(false);
  };

  // Show loading spinner while user data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4b3526]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0, width: isSidebarExpanded ? 224 : 80 }}
        transition={{ type: "easeInOut", duration: 0.3 }}
        className="hidden md:flex flex-col bg-gradient-to-b from-[#4b3526] to-[#3a281d] text-white p-4 shadow-xl border-r border-[#4b3526]/50"
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            animate={{ opacity: isSidebarExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {isSidebarExpanded && (
              <Image src="/ahmad.png" alt="Radiant" width={120} height={120} />
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-3 rounded-lg hover:bg-[#4b3526]/50 transition-colors"
          >
            <FiMenu className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link href={item.path} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-[#5a4233] shadow-md"
                    : "hover:bg-[#4b3526]/70"
                } ${!isSidebarExpanded ? "justify-center" : ""}`}
              >
                <div
                  className={`${isSidebarExpanded ? "mr-3" : ""} ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-[#d1c2b8] group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </div>
                <motion.span
                  animate={{ opacity: isSidebarExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium overflow-hidden"
                >
                  {isSidebarExpanded && item.name}
                </motion.span>
                {isActive(item.path) && isSidebarExpanded && (
                  <motion.div
                    layoutId="activeNavItem"
                    className="ml-auto h-2 w-2 rounded-full bg-white"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-[#4b3526]/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutDialog(true)}
            className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-[#4b3526]/50 text-white ${
              !isSidebarExpanded ? "justify-center" : ""
            }`}
          >
            <FiLogOut
              className={`h-5 w-5 ${isSidebarExpanded ? "mr-3" : ""}`}
            />
            <motion.span
              animate={{ opacity: isSidebarExpanded ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium overflow-hidden"
            >
              {isSidebarExpanded && "Log Out"}
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-[#4b3526] hover:bg-[#5a4233]"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#4b3526] shadow-lg z-50">
        <div className="flex justify-around p-2">
          {navItems.slice(0, 4).map((item) => (
            <Link href={item.path} key={item.name}>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full h-12 w-12 ${
                  isActive(item.path)
                    ? "bg-[#5a4233] text-white"
                    : "text-[#d1c2b8] hover:bg-[#4b3526]/50"
                }`}
              >
                {item.icon}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
