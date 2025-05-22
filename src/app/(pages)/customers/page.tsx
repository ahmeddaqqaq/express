"use client";

import { useEffect, useState } from "react";
import { FiPhoneCall, FiPlus, FiSearch } from "react-icons/fi";
import {
  BrandResponse,
  BrandService,
  CarService,
  CustomerResponse,
  CustomerService,
  CustomersManyResponse,
} from "../../../../client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaTrash } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SearchSelect } from "@/app/components/search-select";

const customerFormSchema = z.object({
  fName: z.string().min(2, "First name must be at least 2 characters"),
  lName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^[0-9+]+$/, "Invalid phone number format"),
});

const carFormSchema = z.object({
  modelId: z.string().min(1, "Please select a model"),
  brandId: z.string().min(1, "Please select a brand"),
  plateNumber: z.string().min(3, "Please add plate number"),
  year: z.string().min(4, "Please add year"),
});

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCarDialogOpen, setIsCarDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fName: "",
      lName: "",
      mobileNumber: "",
    },
  });

  const carForm = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brandId: "",
      modelId: "",
      plateNumber: "",
      year: "",
    },
  });

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery]);

  async function fetchCustomers() {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const take = itemsPerPage;
      const resp = await CustomerService.customerControllerFindMany({
        search: searchQuery || "",
        skip,
        take,
      });
      setCustomers(resp.data);
      setTotalCustomers(resp.rows);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof customerFormSchema>) {
    try {
      await CustomerService.customerControllerCreate({
        requestBody: {
          fName: values.fName,
          lName: values.lName,
          mobileNumber: values.mobileNumber,
        },
      });

      setIsDialogOpen(false);
      form.reset();
      fetchCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  }

  async function onCarSubmit(values: z.infer<typeof carFormSchema>) {
    try {
      await CarService.carControllerCreate({
        requestBody: {
          brandId: values.brandId,
          modelId: values.modelId,
          plateNumber: values.plateNumber,
          year: values.year,
          customerId: selectedCustomer!.id,
        },
      });

      await fetchCustomers();

      const updatedCustomers = await CustomerService.customerControllerFindMany(
        {}
      );
      const updatedCustomer = updatedCustomers.data.find(
        (c) => c.id === selectedCustomer!.id
      );

      if (updatedCustomer) {
        setSelectedCustomer(updatedCustomer);
      } else {
        console.error("Updated customer not found in the list");
      }

      setIsCarDialogOpen(false);
      carForm.reset();
    } catch (error) {
      console.error("Error creating car:", error);
    }
  }

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await BrandService.brandControllerFindMany({});
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }

    fetchBrands();
  }, []);

  const totalPages = Math.ceil(totalCustomers / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCustomers);

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  function openCustomerDrawer(customer: CustomerResponse) {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  }

  return (
    <div className="p-2">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search customers..."
            className="pl-10 pr-4 py-2 w-64"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="w-5 h-5 text-white" />
              <span className="font-medium text-white">CREATE CUSTOMER</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>
                Fill in the required details to register a new customer
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <Input {...field} placeholder="First Name" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <Input {...field} placeholder="Last Name" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <Input {...field} placeholder="07XXXXXXXX" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Customer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Visits</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => openCustomerDrawer(customer)}
              >
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {customer.fName.charAt(0)}
                        {customer.lName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.fName} {customer.lName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.mobileNumber}</TableCell>
                <TableCell>{customer.count}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <FaTrash className="text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No Customers Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">{customers.length}</span> results
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isLoading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      <Drawer
        open={isDrawerOpen}
        direction="right"
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Customer Details</DrawerTitle>
              <DrawerDescription>
                View and manage customer information
              </DrawerDescription>
            </DrawerHeader>
            {selectedCustomer && (
              <div className="p-4">
                {/* Customer Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-medium">
                      {selectedCustomer.fName.charAt(0)}
                      {selectedCustomer.lName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCustomer.fName} {selectedCustomer.lName}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-500">
                        ID: {selectedCustomer.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Contact Information
                  </h3>
                  <div className="flex items-center space-x-2">
                    <FiPhoneCall className="text-gray-400" />
                    <span className="text-gray-900">
                      {selectedCustomer.mobileNumber}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Total Visits</p>
                    <p className="text-xl font-bold">
                      {selectedCustomer.count}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Registered Cars</p>
                    <p className="text-xl font-bold">
                      {selectedCustomer.cars?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Cars Section */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    Registered Vehicles
                  </h3>

                  {selectedCustomer.cars?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCustomer.cars.map((car) => (
                        <div
                          key={car.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {car.brand.name} {car.model.name}
                              </h4>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="inline-block mr-3">
                                  Year: {car.year}
                                </span>
                                <span>Plate: {car.plateNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center border-2 border-dashed rounded-lg text-gray-500">
                      No vehicles registered
                    </div>
                  )}
                </div>
              </div>
            )}
            <DrawerFooter>
              <Dialog open={isCarDialogOpen} onOpenChange={setIsCarDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FiPlus className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">ADD CAR</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Car</DialogTitle>
                    <DialogDescription>
                      Fill the below fields to add a new car
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...carForm}>
                    <form
                      onSubmit={carForm.handleSubmit(onCarSubmit)}
                      className="space-y-4"
                    >
                      {/* Brand Selection */}
                      <FormField
                        control={carForm.control}
                        name="brandId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <SearchSelect
                              options={brands.map((brand) => ({
                                value: brand.id,
                                label: brand.name,
                              }))}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                carForm.setValue("modelId", "");
                              }}
                              placeholder="Select brand..."
                              searchPlaceholder="Search brands..."
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Model Selection */}
                      <FormField
                        control={carForm.control}
                        name="modelId"
                        render={({ field }) => {
                          const selectedBrandId = carForm.watch("brandId");
                          const models =
                            brands
                              .find((b) => b.id === selectedBrandId)
                              ?.models.map((m) => ({
                                value: m.id,
                                label: m.name,
                              })) || [];

                          return (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <SearchSelect
                                options={models}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={
                                  selectedBrandId
                                    ? "Select model..."
                                    : "Select a brand first"
                                }
                                searchPlaceholder="Search models..."
                              />
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      <div className="flex justify-between">
                        <FormField
                          control={carForm.control}
                          name="plateNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plate Number</FormLabel>
                              <Input {...field} placeholder="Plate Number" />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={carForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year</FormLabel>
                              <Input {...field} placeholder="Year" />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Car</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
