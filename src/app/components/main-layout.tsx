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
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaCarAlt } from "react-icons/fa";
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
  const [isScheduleOpen, setIsScheduleOpen] = useState(
    pathname.startsWith("/schedule")
  );
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
      icon: <FiCalendar className="h-5 w-5" />,
      submenu: [
        {
          name: "Calendar View",
          path: "/schedule",
        },
        {
          name: "Table View",
          path: "/schedule-table",
        },
      ],
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
  ];

  // Filter navigation items - hide admin-only items for supervisors
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const toggleScheduleMenu = () => {
    setIsScheduleOpen(!isScheduleOpen);
  };

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
        animate={{ x: 0 }}
        transition={{ type: "easeInOut", duration: "0.5" }}
        className="hidden md:flex flex-col w-56 bg-gradient-to-b from-[#4b3526] to-[#3a281d] text-white p-4 shadow-xl border-r border-[#4b3526]/50"
      >
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div>
            <Image
              src="/ahmad.png"
              alt="Radiant"
              width={200}
              height={200}
              className="mb-3"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.path ? (
                <Link href={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group ${
                      isActive(item.path)
                        ? "bg-[#5a4233] shadow-md"
                        : "hover:bg-[#4b3526]/70"
                    }`}
                  >
                    <div
                      className={`mr-3 ${
                        isActive(item.path)
                          ? "text-white"
                          : "text-[#d1c2b8] group-hover:text-white"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.path) && (
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
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                      pathname.startsWith("/schedule")
                        ? "bg-[#4b3526]/50"
                        : "hover:bg-[#4b3526]/70"
                    }`}
                    onClick={toggleScheduleMenu}
                  >
                    <div className="mr-3 text-[#d1c2b8] group-hover:text-white">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.name}</span>
                    <div className="ml-auto">
                      {isScheduleOpen ? (
                        <FiChevronDown className="h-4 w-4" />
                      ) : (
                        <FiChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </motion.div>
                  {isScheduleOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-8 space-y-1 overflow-hidden"
                    >
                      {item.submenu?.map((subItem) => (
                        <Link href={subItem.path} key={subItem.path}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center w-full p-2 rounded-lg transition-all duration-200 group`}
                          >
                            <span className="font-medium text-sm">
                              {subItem.name}
                            </span>
                            {isActive(subItem.path) && (
                              <motion.div
                                layoutId="activeSubNavItem"
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
                    </motion.div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-4 border-t border-[#4b3526]/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-[#4b3526]/50 text-white"
          >
            <FiLogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Log Out</span>
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
            <Link
              href={item.path || (item.submenu ? item.submenu[0].path : "#")}
              key={item.name}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full h-12 w-12 ${
                      isActive(item.path!) ||
                      (item.submenu &&
                        item.submenu.some((sub) => isActive(sub.path)))
                        ? "bg-[#5a4233] text-white"
                        : "text-[#d1c2b8] hover:bg-[#4b3526]/50"
                    }`}
                  >
                    {item.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#4b3526] text-white">
                  {item.name}
                </TooltipContent>
              </Tooltip>
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
