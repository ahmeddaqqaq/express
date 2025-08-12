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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiEdit, FiTrash2, FiUserPlus } from "react-icons/fi";
import { getErrorMessage } from "@/lib/error-handler";
import { SalesService, SalesResponse } from "../../../../../../client";

const salesSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z.string().optional(),
  isActive: z.boolean(),
});

type SalesFormData = z.infer<typeof salesSchema>;


export function SalesTab() {
  const [sales, setSales] = useState<SalesResponse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      isActive: true,
    },
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const response = await SalesService.salesControllerFindMany({
        skip: 0,
        take: 100,
      });
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSales(null);
    form.reset({
      firstName: "",
      lastName: "",
      mobileNumber: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (salesPerson: SalesResponse) => {
    setEditingSales(salesPerson);
    form.reset({
      firstName: salesPerson.firstName,
      lastName: salesPerson.lastName,
      mobileNumber: salesPerson.mobileNumber || "",
      isActive: salesPerson.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SalesFormData) => {
    try {
      setIsSubmitting(true);
      
      // Clean the data - remove empty mobile number
      const cleanData = {
        ...data,
        mobileNumber: data.mobileNumber?.trim() || undefined,
      };

      // Remove undefined values
      const requestData = Object.fromEntries(
        Object.entries(cleanData).filter(([_, value]) => value !== undefined)
      );
      
      if (editingSales) {
        // Update existing sales person
        await SalesService.salesControllerUpdate({
          requestBody: {
            id: editingSales.id,
            ...requestData,
          },
        });
      } else {
        // Create new sales person
        await SalesService.salesControllerCreate({
          requestBody: requestData,
        });
      }

      setIsDialogOpen(false);
      await fetchSales();
    } catch (error) {
      console.error("Error saving sales person:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await SalesService.salesControllerDelete({ id });
      await fetchSales();
    } catch (error) {
      console.error("Error deleting sales person:", error);
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Sales Management</h3>
          <p className="text-sm text-gray-600">
            Manage sales team members and their information
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <FiUserPlus className="h-4 w-4" />
          Add Sales Person
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No sales persons found. Click "Add Sales Person" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((salesPerson) => (
                  <TableRow key={salesPerson.id}>
                    <TableCell className="font-medium">
                      {salesPerson.firstName} {salesPerson.lastName}
                    </TableCell>
                    <TableCell>{salesPerson.mobileNumber || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          salesPerson.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {salesPerson.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(salesPerson.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(salesPerson)}
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              salesPerson.id,
                              `${salesPerson.firstName} ${salesPerson.lastName}`
                            )
                          }
                        >
                          <FiTrash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSales ? "Edit Sales Person" : "Add Sales Person"}
            </DialogTitle>
            <DialogDescription>
              {editingSales
                ? "Update the sales person information below."
                : "Enter the new sales person information below."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="07XXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-gray-600">
                        Enable or disable this sales person
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editingSales
                    ? "Update"
                    : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}