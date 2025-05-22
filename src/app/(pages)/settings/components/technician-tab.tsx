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
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { TechnicianService, TechnicianResponse } from "../../../../../client";

export default function TechniciansTab() {
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    fName: "",
    lName: "",
    mobileNumber: "",
    workId: "",
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setIsFetching(true);
    try {
      const resp = await TechnicianService.technicianControllerFindMany({});
      setTechnicians(resp.data);
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
    if (
      !newTechnician.fName.trim() ||
      !newTechnician.lName.trim() ||
      !newTechnician.mobileNumber.trim()
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await TechnicianService.technicianControllerCreate({
        requestBody: {
          fName: newTechnician.fName,
          lName: newTechnician.lName,
          mobileNumber: newTechnician.mobileNumber,
          workId: newTechnician.workId,
        },
      });

      await fetchTechnicians();
      setNewTechnician({
        fName: "",
        lName: "",
        mobileNumber: "",
        workId: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create technician:", error);
    } finally {
      setIsLoading(false);
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
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={newTechnician.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workId">Work ID</Label>
                <Input
                  id="workId"
                  name="workId"
                  value={newTechnician.workId}
                  onChange={handleInputChange}
                  placeholder="Work ID"
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Work ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    {tech.fName} {tech.lName}
                  </TableCell>
                  <TableCell>{tech.mobileNumber}</TableCell>
                  <TableCell>{"-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FiTrash2 className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
