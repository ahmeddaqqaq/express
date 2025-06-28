"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiCalendar,
  FiHome,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
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

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiHome className="h-5 w-5" />,
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
      name: "Vehicles",
      path: "/vehicles",
      icon: <FaCarAlt className="h-5 w-5" />,
    },
  ];

  const toggleScheduleMenu = () => {
    setIsScheduleOpen(!isScheduleOpen);
  };

  const handleLogout = async () => {
    await AuthService.authControllerLogout();
    router.push("/login");
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "easeInOut", duration: "0.5" }}
        className="hidden md:flex flex-col w-56 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white p-4 shadow-xl border-r border-indigo-700/50"
      >
        {/* Logo/Brand */}
        <div className="p-4 mb-6 flex items-center space-x-3">
          <div>
            <h1 className="text-2xl font-bold font-poppins">Express</h1>
            <p className="text-indigo-200 text-sm">Operation Dashboard</p>
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
                        ? "bg-indigo-600 shadow-md"
                        : "hover:bg-indigo-700/70"
                    }`}
                  >
                    <div
                      className={`mr-3 ${
                        isActive(item.path)
                          ? "text-white"
                          : "text-indigo-300 group-hover:text-white"
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
                        ? "bg-indigo-700/50"
                        : "hover:bg-indigo-700/70"
                    }`}
                    onClick={toggleScheduleMenu}
                  >
                    <div className="mr-3 text-indigo-300 group-hover:text-white">
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
        <div className="mt-auto pt-4 border-t border-indigo-700/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center w-full p-3 rounded-lg transition-all duration-200 hover:bg-indigo-700/50 text-white"
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
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-indigo-800 shadow-lg z-50">
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
                        ? "bg-indigo-600 text-white"
                        : "text-indigo-200 hover:bg-indigo-700/50"
                    }`}
                  >
                    {item.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-indigo-700 text-white">
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
          className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-6rem)]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
