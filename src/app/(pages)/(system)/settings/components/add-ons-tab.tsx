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
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import { AddOnsResponse, AddOnsService } from "../../../../../../client";

export default function AddOnsTab() {
  const [addOns, setAddOns] = useState<AddOnsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnsResponse | null>(
    null
  );
  const [newAddOn, setNewAddOn] = useState({
    name: "",
    price: 0,
  });

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    setIsFetching(true);
    try {
      const resp = await AddOnsService.addOnsControllerFindMany({});
      setAddOns(resp.data);
    } catch (error) {
      console.error("Failed to fetch add-ons:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddOn((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const resetForm = () => {
    setNewAddOn({
      name: "",
      price: 0,
    });
    setSelectedAddOn(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Create new add-on
      await AddOnsService.addOnsControllerCreate({
        requestBody: {
          name: newAddOn.name,
          price: newAddOn.price,
        },
      });

      await fetchAddOns();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save add-on:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //   const handleEdit = (addOn: AddOnsResponse) => {
  //     setSelectedAddOn(addOn);
  //     setNewAddOn({
  //       name: addOn.name,
  //       price: addOn.price,
  //     });
  //     setIsDialogOpen(true);
  //   };

  //   const handleDelete = async () => {
  //     if (!selectedAddOn) return;

  //     setIsLoading(true);
  //     try {
  //       await AddOnsService.addOnsControllerDelete({
  //         id: selectedAddOn.id,
  //       });
  //       toast({
  //         title: "Success",
  //         description: "Add-on deleted successfully",
  //       });
  //       await fetchAddOns();
  //       setIsDeleteDialogOpen(false);
  //       setSelectedAddOn(null);
  //     } catch (error) {
  //       console.error("Failed to delete add-on:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to delete add-on",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add-Ons</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <FiPlus className="mr-2" />
              Add Add-On
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAddOn ? "Edit Add-on" : "Add New Add-on"}
              </DialogTitle>
              <DialogDescription>
                {selectedAddOn
                  ? "Update the add-on details"
                  : "Fill in the details to create a new add-on"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAddOn.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newAddOn.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                  ? selectedAddOn
                    ? "Updating..."
                    : "Creating..."
                  : selectedAddOn
                  ? "Update Add-on"
                  : "Create Add-on"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : addOns?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No add-ons found</div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addOns.map((addOn) => (
                <TableRow key={addOn.id}>
                  <TableCell className="font-medium">{addOn.name}</TableCell>
                  <TableCell>${addOn.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => handleEdit(addOn)}
                      >
                        <FiEdit className="text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAddOn(addOn);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAddOn?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              //   onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
