"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FiPlus,
  FiMoreVertical,
  FiClock,
  FiPause,
  FiPlay,
  FiUser,
  FiActivity,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import {
  TechnicianService,
  TechnicianResponse,
  AuditLogService,
  AuditLogResponse,
} from "../../../../../../client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaClock } from "react-icons/fa";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaPerson } from "react-icons/fa6";

export default function TechniciansTab() {
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<TechnicianResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] =
    useState<TechnicianResponse | null>(null);
  const [newTechnician, setNewTechnician] = useState({
    fName: "",
    lName: "",
  });
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogTotalCount, setAuditLogTotalCount] = useState(0);
  const auditLogItemsPerPage = 10;
  
  // Time tracking state
  const [dailyWorkingHours, setDailyWorkingHours] = useState<{[key: string]: any}>({});
  const [timeTrackingLoading, setTimeTrackingLoading] = useState(false);

  // Helper function to format time duration
  const formatDuration = (timeString: string | undefined) => {
    if (!timeString || timeString === '0' || timeString === '00:00:00') {
      return '0h 0m';
    }
    
    // Handle different time formats
    if (timeString.includes(':')) {
      // Format: HH:MM:SS or HH:MM
      const parts = timeString.split(':');
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      return `${hours}h ${minutes}m`;
    }
    
    // Handle other formats or just return as is
    return timeString;
  };

  // Helper function to format dates safely
  const formatDate = (log: AuditLogResponse) => {
    // Try different possible timestamp fields
    const timestamp = log.timeStamp || (log as any).timestamp || (log as any).createdAt || (log as any).updatedAt;
    
    if (!timestamp) {
      console.warn('No timestamp found in log:', log);
      return 'No Date';
    }
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp);
        return 'Invalid Date';
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Date formatting error:', error, 'Date string:', timestamp);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [currentPage]);

  useEffect(() => {
    if (showAuditLogs) {
      fetchAuditLogs();
    }
  }, [showAuditLogs, auditLogPage]);

  // Auto-refresh technician data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTechnicians();
      if (selectedTechnician?.id) {
        refreshTimeTracking(selectedTechnician.id);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedTechnician?.id]);

  const fetchTechnicians = async () => {
    setIsFetching(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const take = itemsPerPage;
      const resp = await TechnicianService.technicianControllerFindMany({
        skip,
        take,
      });
      setTechnicians(resp.data);
      setTotalTechnicians(resp.rows);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTechnician((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createTechnician = async () => {
    if (!newTechnician.fName.trim() || !newTechnician.lName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await TechnicianService.technicianControllerCreate({
        requestBody: {
          fName: newTechnician.fName,
          lName: newTechnician.lName,
        },
      });

      await fetchTechnicians();
      setNewTechnician({
        fName: "",
        lName: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create technician:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startShift = async (id: string) => {
    try {
      await TechnicianService.technicianControllerStartShift({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to start shift:", error);
    }
  };

  const endShift = async (id: string) => {
    try {
      await TechnicianService.technicianControllerEndShift({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to end shift:", error);
    }
  };

  const startBreak = async (id: string) => {
    try {
      await TechnicianService.technicianControllerStartBreak({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to start break:", error);
    }
  };

  const endBreak = async (id: string) => {
    try {
      await TechnicianService.technicianControllerEndBreak({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to end break:", error);
    }
  };

  const startOvertime = async (id: string) => {
    try {
      await TechnicianService.technicianControllerStartOvertime({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to start overtime:", error);
    }
  };

  const endOvertime = async (id: string) => {
    try {
      await TechnicianService.technicianControllerEndOvertime({
        id,
      });
      await fetchTechnicians();
      refreshAuditLogs();
      if (selectedTechnician?.id === id) {
        await refreshTimeTracking(id);
      }
    } catch (error) {
      console.error("Failed to end overtime:", error);
    }
  };

  // Fetch audit logs from database
  const fetchAuditLogs = async () => {
    setAuditLogsLoading(true);
    try {
      const skip = (auditLogPage - 1) * auditLogItemsPerPage;
      const response = await AuditLogService.auditLogControllerFindMany({
        skip,
        take: auditLogItemsPerPage,
        search: "", // No search filter for now
      });
      setAuditLogs(response.data);
      setAuditLogTotalCount(response.rows);
      console.log('Fetched audit logs from database:', response.data);
      
      // Debug: Log the first audit log to see all fields
      if (response.data.length > 0) {
        console.log('First audit log full object:', response.data[0]);
        console.log('Available fields:', Object.keys(response.data[0]));
        console.log('timeStamp field:', response.data[0].timeStamp, typeof response.data[0].timeStamp);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setAuditLogs([]);
      setAuditLogTotalCount(0);
      
      // If no audit logs exist, let's create a test entry to verify the system works
      console.log('No audit logs found. The backend might not be automatically creating audit logs.');
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // Fetch daily working hours for a technician
  const fetchDailyWorkingHours = async (technicianId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await TechnicianService.technicianControllerGetDailyWorkingHours({
        id: technicianId,
        date: today,
      });
      
      setDailyWorkingHours(prev => ({
        ...prev,
        [technicianId]: response
      }));
      
      console.log(`Daily working hours for technician ${technicianId}:`, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch daily working hours:', error);
      return null;
    }
  };

  // Refresh audit logs after actions
  const refreshAuditLogs = () => {
    if (showAuditLogs) {
      fetchAuditLogs();
    }
  };
  
  // Refresh time tracking for selected technician
  const refreshTimeTracking = async (technicianId: string) => {
    setTimeTrackingLoading(true);
    try {
      await fetchTechnicians(); // Refresh technician data
      await fetchDailyWorkingHours(technicianId); // Fetch detailed daily hours
    } catch (error) {
      console.error('Failed to refresh time tracking:', error);
    } finally {
      setTimeTrackingLoading(false);
    }
  };

  const deleteTechnician = async (technician: TechnicianResponse) => {
    setTechnicianToDelete(technician);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!technicianToDelete) return;

    try {
      await TechnicianService.technicianControllerDelete({
        id: technicianToDelete.id,
      });
      await fetchTechnicians();
      setDeleteDialogOpen(false);
      setTechnicianToDelete(null);
    } catch (error) {
      console.error("Failed to delete technician:", error);
    }
  };

  function openTechnicianDrawer(technician: TechnicianResponse) {
    setSelectedTechnician(technician);
    setIsDrawerOpen(true);
    // Fetch daily working hours when drawer opens
    fetchDailyWorkingHours(technician.id);
  }

  const totalPages = Math.ceil(totalTechnicians / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "on shift":
        return "default";
      case "on break":
        return "secondary";
      case "off shift":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Technicians</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowAuditLogs(!showAuditLogs);
              if (!showAuditLogs) {
                setAuditLogPage(1); // Reset to first page when showing
              }
            }}
            disabled={auditLogsLoading}
          >
            {auditLogsLoading ? "Loading..." : (showAuditLogs ? "Hide" : "Show")} Audit Logs
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="mr-2" />
              Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new technician
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fName">First Name *</Label>
                <Input
                  id="fName"
                  name="fName"
                  value={newTechnician.fName}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lName">Last Name *</Label>
                <Input
                  id="lName"
                  name="lName"
                  value={newTechnician.lName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
              </div>
              <Button onClick={createTechnician} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Technician"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Audit Logs Table */}
      {showAuditLogs && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiActivity className="h-5 w-5" />
              Activity Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto" />
                <p className="mt-2 text-gray-500">Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audit logs found. Actions will appear here after technician activities.
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Technician</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.technician.fName} {log.technician.lName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(log)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination for audit logs */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {auditLogTotalCount === 0
                        ? 0
                        : (auditLogPage - 1) * auditLogItemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(auditLogPage * auditLogItemsPerPage, auditLogTotalCount)}
                    </span>{" "}
                    of <span className="font-medium">{auditLogTotalCount}</span> audit logs
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditLogPage === 1 || auditLogsLoading}
                      onClick={() => setAuditLogPage(auditLogPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditLogPage >= Math.ceil(auditLogTotalCount / auditLogItemsPerPage) || auditLogsLoading}
                      onClick={() => setAuditLogPage(auditLogPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No technicians found
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow
                  key={tech.id}
                  onClick={() => openTechnicianDrawer(tech)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    {tech.fName} {tech.lName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(tech.lastAction || "N/A")}
                    >
                      {tech.lastAction ?? "Undefined"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <FiMoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              startShift(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FiClock className="h-4 w-4" />
                            <span>Start Shift</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              endShift(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FaClock className="h-4 w-4" />
                            <span>End Shift</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              startBreak(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FiPlay className="h-4 w-4" />
                            <span>Start Break</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              endBreak(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FiPause className="h-4 w-4" />
                            <span>End Break</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              startOvertime(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FiActivity className="h-4 w-4" />
                            <span>Start Overtime</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              endOvertime(tech.id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <FiActivity className="h-4 w-4" />
                            <span>End Overtime</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTechnician(tech);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {totalTechnicians === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalTechnicians)}
              </span>{" "}
              of <span className="font-medium">{totalTechnicians}</span> results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isFetching}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isFetching}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          <Drawer
            open={isDrawerOpen}
            direction="right"
            onOpenChange={setIsDrawerOpen}
          >
            <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[400px] rounded-none">
              <div className="flex flex-col h-full">
                {/* Header */}
                <DrawerHeader className="flex-shrink-0 border-b bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <DrawerTitle className="text-xl font-semibold flex items-center gap-2">
                        <FiUser className="h-5 w-5" />
                        Technician Details
                      </DrawerTitle>
                      <DrawerDescription>
                        View and manage technician information
                      </DrawerDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDrawerOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <FiX className="h-4 w-4" />
                    </Button>
                  </div>
                </DrawerHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedTechnician && (
                    <div className="space-y-6">
                      {/* Basic Info Card */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FiUser className="h-4 w-4" />
                            Basic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FaPerson className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-medium text-gray-500">
                                Name
                              </Label>
                              <p className="text-sm font-medium">
                                {selectedTechnician.fName}{" "}
                                {selectedTechnician.lName}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Status Card */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FiActivity className="h-4 w-4" />
                            Current Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getStatusBadgeVariant(
                                selectedTechnician.lastAction || "N/A"
                              )}
                              className="text-sm"
                            >
                              {selectedTechnician.lastAction || "Undefined"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Time Tracking Card */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FiClock className="h-4 w-4" />
                              Time Tracking
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshTimeTracking(selectedTechnician.id)}
                              disabled={timeTrackingLoading}
                              className="h-8 w-8 p-0"
                            >
                              {timeTrackingLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900" />
                              ) : (
                                <FiActivity className="h-4 w-4" />
                              )}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium">
                                  Total Shift Time
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-blue-700">
                                {formatDuration(dailyWorkingHours[selectedTechnician.id]?.shiftTime || selectedTechnician.totalShiftTime)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                                <span className="text-sm font-medium">
                                  Total Break Time
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-orange-700">
                                {formatDuration(dailyWorkingHours[selectedTechnician.id]?.breakTime || selectedTechnician.totalBreakTime)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium">
                                  Total Overtime
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-purple-700">
                                {formatDuration(dailyWorkingHours[selectedTechnician.id]?.overtimeTime || selectedTechnician.totalOvertimeTime)}
                              </span>
                            </div>
                            
                            {/* Daily Working Hours Details */}
                            {dailyWorkingHours[selectedTechnician.id] && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Today's Details</h4>
                                <div className="text-xs text-gray-600">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(dailyWorkingHours[selectedTechnician.id], null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Actions Card */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">
                            Quick Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                startShift(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FiClock className="h-4 w-4" />
                              Start Shift
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                endShift(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FaClock className="h-4 w-4" />
                              End Shift
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                startBreak(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FiPlay className="h-4 w-4" />
                              Start Break
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                endBreak(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FiPause className="h-4 w-4" />
                              End Break
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                startOvertime(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FiActivity className="h-4 w-4" />
                              Start Overtime
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                endOvertime(selectedTechnician.id);
                                setIsDrawerOpen(false);
                              }}
                              className="flex items-center gap-2"
                            >
                              <FiActivity className="h-4 w-4" />
                              End Overtime
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Technician</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {technicianToDelete?.fName}{" "}
                  {technicianToDelete?.lName}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
