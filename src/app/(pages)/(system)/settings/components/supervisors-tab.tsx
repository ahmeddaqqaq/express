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
import { FiPlus, FiUser, FiX, FiTrash2 } from "react-icons/fi";
import {
  AuthService,
  UserInfoResponse,
  SignupDto,
} from "../../../../../../client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FaPerson } from "react-icons/fa6";

export default function SupervisorsTab() {
  const [supervisors, setSupervisors] = useState<UserInfoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<UserInfoResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] =
    useState<UserInfoResponse | null>(null);
  const [newSupervisor, setNewSupervisor] = useState({
    fName: "",
    lName: "",
    mobileNumber: "",
    password: "",
  });

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    setIsFetching(true);
    try {
      const resp = await AuthService.authControllerGetSupervisors() as UserInfoResponse[];
      setSupervisors(resp);
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
    if (!newSupervisor.fName.trim() || !newSupervisor.lName.trim() || 
        !newSupervisor.mobileNumber.trim() || !newSupervisor.password.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.authControllerSignup({
        requestBody: {
          name: `${newSupervisor.fName} ${newSupervisor.lName}`,
          mobileNumber: newSupervisor.mobileNumber,
          password: newSupervisor.password,
          role: SignupDto.role.SUPERVISOR,
        },
      });

      await fetchSupervisors();
      setNewSupervisor({
        fName: "",
        lName: "",
        mobileNumber: "",
        password: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create supervisor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function openSupervisorDrawer(supervisor: UserInfoResponse) {
    setSelectedSupervisor(supervisor);
    setIsDrawerOpen(true);
  }

  const deleteSupervisor = async (supervisor: UserInfoResponse) => {
    setSupervisorToDelete(supervisor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!supervisorToDelete) return;

    try {
      // TODO: Delete supervisor endpoint not available
      console.error('Delete supervisor endpoint not available');
      // await SupervisorService.supervisorControllerDelete({
      //   id: supervisorToDelete.userId,
      // });
      await fetchSupervisors();
      setDeleteDialogOpen(false);
      setSupervisorToDelete(null);
    } catch (error) {
      console.error("Failed to delete supervisor:", error);
    }
  };

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
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={newSupervisor.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="07XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newSupervisor.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
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
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supervisors.map((tech) => (
                <TableRow
                  key={tech.userId}
                  onClick={() => openSupervisorDrawer(tech)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    {tech.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSupervisor(tech);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
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
                                {selectedSupervisor.name}
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

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Supervisor</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {supervisorToDelete?.name}? This action cannot be undone.
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
