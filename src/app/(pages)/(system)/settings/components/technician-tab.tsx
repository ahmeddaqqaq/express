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
} from "react-icons/fi";
import {
  TechnicianService,
  TechnicianResponse,
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
  const [newTechnician, setNewTechnician] = useState({
    fName: "",
    lName: "",
  });

  useEffect(() => {
    fetchTechnicians();
  }, [currentPage]);

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
    } catch (error) {
      console.error("Failed to start shift:", error);
    }
  };

  const endBreak = async (id: string) => {
    try {
      await TechnicianService.technicianControllerEndBreak({
        id,
      });
      await fetchTechnicians();
    } catch (error) {
      console.error("Failed to start shift:", error);
    }
  };

  function openTechnicianDrawer(technician: TechnicianResponse) {
    setSelectedTechnician(technician);
    setIsDrawerOpen(true);
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
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FiClock className="h-4 w-4" />
                            Time Tracking
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
                                {selectedTechnician.totalShiftTime}
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
                                {selectedTechnician.totalBreakTime}
                              </span>
                            </div>
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
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  );
}
