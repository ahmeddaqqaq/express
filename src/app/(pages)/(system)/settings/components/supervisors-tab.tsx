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
import { FiPlus, FiUser, FiX, FiTrash } from "react-icons/fi";
import {
  SupervisorService,
  SupervisorResponse,
} from "../../../../../../client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaPerson } from "react-icons/fa6";

export default function SupervisorsTab() {
  const [supervisors, setSupervisors] = useState<SupervisorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<SupervisorResponse | null>(null);
  const [newSupervisor, setNewSupervisor] = useState({
    fName: "",
    lName: "",
  });

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    setIsFetching(true);
    try {
      const resp = await SupervisorService.supervisorControllerFindMany({});
      setSupervisors(resp.data);
    } catch (error) {
      console.error("Failed to fetch supervisors:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupervisor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createSupervisor = async () => {
    if (!newSupervisor.fName.trim() || !newSupervisor.lName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await SupervisorService.supervisorControllerCreate({
        requestBody: {
          firstName: newSupervisor.fName,
          lastName: newSupervisor.lName,
        },
      });

      await fetchSupervisors();
      setNewSupervisor({
        fName: "",
        lName: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create supervisor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function openSupervisorDrawer(supervisor: SupervisorResponse) {
    setSelectedSupervisor(supervisor);
    setIsDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Supervisors</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="mr-2" />
              Add Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supervisor</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new supervisor
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fName">First Name *</Label>
                <Input
                  id="fName"
                  name="fName"
                  value={newSupervisor.fName}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lName">Last Name *</Label>
                <Input
                  id="lName"
                  name="lName"
                  value={newSupervisor.lName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
              </div>
              <Button onClick={createSupervisor} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Supervisor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : supervisors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No supervisors found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisors.map((tech) => (
                <TableRow
                  key={tech.id}
                  onClick={() => openSupervisorDrawer(tech)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    {tech.firstName} {tech.lastName}
                  </TableCell>
                  <TableCell className="text-right">
                    <FiTrash className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
                        Supervisor Details
                      </DrawerTitle>
                      <DrawerDescription>
                        View and manage supervisor information
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
                  {selectedSupervisor && (
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
                                {selectedSupervisor.firstName}{" "}
                                {selectedSupervisor.lastName}
                              </p>
                            </div>
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
