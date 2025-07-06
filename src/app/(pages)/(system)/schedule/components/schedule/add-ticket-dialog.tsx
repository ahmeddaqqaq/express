"use client";

import { useState, useEffect } from "react";
import { FaDotCircle } from "react-icons/fa";
import { Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddOnsResponse,
  AddOnsService,
  BrandResponse,
  BrandService,
  CustomerResponse,
  CustomerService,
  ServiceResponse,
  ServiceService,
  SupervisorResponse,
  SupervisorService,
  TransactionService,
  CarService,
} from "../../../../../../../client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSearchField } from "../customer-search-field";
import { CarSearchField } from "../car-search-field";
import { ServiceSearchField } from "../service-search-field";
import { SupervisorSearchField } from "../supervisor-search-field";
import { AddOnsField } from "../add-ons-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchSelect } from "@/app/components/search-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  carId: z.string().min(1, "Car is required"),
  serviceId: z.string().min(1, "Service is required"),
  addOnsIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  supervisorId: z.string().min(1, "Supervisor is required"),
  deliveryTime: z.string().optional(),
});

const customerSchema = z.object({
  fName: z.string().min(1, "First name is required"),
  lName: z.string().min(1, "Last name is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
});

const carSchema = z.object({
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  year: z.string().optional(),
  color: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
});

interface AddTicketDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTicketDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddTicketDialogProps) {
  const [activeTab, setActiveTab] = useState("ticket");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isCreatingCar, setIsCreatingCar] = useState(false);

  // Track selected customer and car IDs across tabs
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");

  // Customer state
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const customerItemsPerPage = 10;

  // Supervisor state
  const [supervisors, setSupervisors] = useState<SupervisorResponse[]>([]);
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState("");
  const [supervisorCurrentPage, setSupervisorCurrentPage] = useState(1);
  const [supervisorTotalCount, setSupervisorTotalCount] = useState(0);
  const supervisorItemsPerPage = 5;

  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [brandCurrentPage, setBrandCurrentPage] = useState(1);
  const [brandTotalCount, setBrandTotalCount] = useState(0);
  const brandItemsPerPage = 10;

  // Other data
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [addOns, setAddOns] = useState<AddOnsResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  const [brandOpen, setBrandOpen] = useState(false);

  const [calculation, setCalculation] = useState<{ total: number } | null>(
    null
  );

  const ticketForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      carId: "",
      serviceId: "",
      addOnsIds: [],
      supervisorId: "",
      deliveryTime: "",
    },
  });

  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fName: "",
      lName: "",
      mobileNumber: "",
    },
  });

  const carForm = useForm<z.infer<typeof carSchema>>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brandId: "",
      modelId: "",
      plateNumber: "",
      year: "",
      color: "",
      customerId: "",
    },
  });

  useEffect(() => {
    if (selectedCustomerId) {
      ticketForm.setValue("customerId", selectedCustomerId);
      carForm.setValue("customerId", selectedCustomerId);
    }
  }, [selectedCustomerId, ticketForm, carForm]);

  useEffect(() => {
    if (selectedCarId) {
      ticketForm.setValue("carId", selectedCarId);
    }
  }, [selectedCarId, ticketForm]);

  useEffect(() => {
    const subscription = ticketForm.watch((value, { name }) => {
      if (name === "customerId" && value.customerId !== selectedCustomerId) {
        setSelectedCustomerId(value.customerId || "");
        if (value.customerId !== selectedCustomerId) {
          setSelectedCarId("");
          ticketForm.setValue("carId", "");
        }
      }
      if (name === "carId" && value.carId !== selectedCarId) {
        setSelectedCarId(value.carId || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [ticketForm, selectedCustomerId, selectedCarId]);

  useEffect(() => {
    const subscription = carForm.watch((_value, { name }) => {
      if (name === "brandId") {
        carForm.setValue("modelId", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [carForm]);

  const fetchCustomers = async () => {
    try {
      const skip = (customerCurrentPage - 1) * customerItemsPerPage;
      const resp = await CustomerService.customerControllerFindMany({
        search: customerSearchQuery || "",
        skip,
        take: customerItemsPerPage,
      });
      setCustomers(resp.data);
      setCustomerTotalCount(resp.rows || resp.data.length);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setCustomerTotalCount(0);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const skip = (supervisorCurrentPage - 1) * supervisorItemsPerPage;
      const resp = await SupervisorService.supervisorControllerFindMany({
        search: supervisorSearchQuery || "",
        skip,
        take: supervisorItemsPerPage,
      });
      setSupervisors(resp.data);
      setSupervisorTotalCount(resp.rows || resp.data.length);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const resp =
        (await ServiceService.serviceControllerFindMany()) as unknown as ServiceResponse[];
      setServices(resp);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await AddOnsService.addOnsControllerFindMany({});
      setAddOns(response.data);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const skip = (brandCurrentPage - 1) * brandItemsPerPage;
      const response = await BrandService.brandControllerFindMany({
        search: brandSearchQuery || "",
        skip,
        take: brandItemsPerPage,
      });
      setBrands(response.data);
      setBrandTotalCount(response.rows || response.data.length);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const calculateTotal = async () => {
    try {
      const currentCarId = ticketForm.watch("carId");
      const selectedServiceId = ticketForm.watch("serviceId");
      const selectedAddOns = ticketForm.watch("addOnsIds") || [];

      if (!currentCarId || !selectedServiceId) {
        console.warn("Please select both a car and a service first");
        return;
      }

      const response =
        await TransactionService.transactionControllerCalculateTotal({
          requestBody: {
            serviceId: selectedServiceId,
            carId: currentCarId,
            addOnsIds: selectedAddOns,
          },
        });

      setCalculation(response as unknown as { total: number });
      return response;
    } catch (error) {
      setCalculation(null);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    const currentCarId = ticketForm.watch("carId");
    const currentServiceId = ticketForm.watch("serviceId");

    if (currentCarId && currentServiceId) {
      calculateTotal();
    } else {
      setCalculation(null);
    }
  }, [
    ticketForm.watch("carId"),
    ticketForm.watch("serviceId"),
    ticketForm.watch("addOnsIds"),
  ]);

  useEffect(() => {
    fetchCustomers();
  }, [customerSearchQuery, customerCurrentPage]);

  useEffect(() => {
    fetchSupervisors();
  }, [supervisorSearchQuery, supervisorCurrentPage]);

  useEffect(() => {
    fetchServices();
    fetchAddOns();
    fetchBrands();
  }, [brandSearchQuery, brandCurrentPage]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("ticket");
      setSelectedCustomerId("");
      setSelectedCarId("");
      ticketForm.reset();
      customerForm.reset();
      carForm.reset();
    }
  }, [isOpen, ticketForm, customerForm, carForm]);

  const createSchedule = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await TransactionService.transactionControllerCreate({
        requestBody: {
          customerId: values.customerId,
          carId: values.carId,
          technicianIds: [],
          serviceId: values.serviceId,
          addOnsIds: values.addOnsIds || [],
          note: values.notes ?? "No Notes",
          supervisorId: values.supervisorId,
          deliverTime: values.deliveryTime ?? "",
        },
      });

      onOpenChange(false);
      ticketForm.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createCustomer = async (values: z.infer<typeof customerSchema>) => {
    setIsCreatingCustomer(true);
    try {
      await CustomerService.customerControllerCreate({
        requestBody: values,
      });

      await fetchCustomers();
      setActiveTab("ticket");
      customerForm.reset();

      console.log("Customer created successfully");
    } catch (error) {
      console.error("Error creating customer:", error);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const createCar = async (values: z.infer<typeof carSchema>) => {
    setIsCreatingCar(true);
    try {
      console.log("Creating car with values:", {
        ...values,
        customerId: selectedCustomerId,
      });

      const response = await CarService.carControllerCreate({
        requestBody: {
          brandId: values.brandId,
          modelId: values.modelId,
          plateNumber: values.plateNumber,
          year: values.year || undefined,
          color: values.color || undefined,
          customerId: selectedCustomerId,
        },
      });

      console.log("Car created successfully:", response);

      await fetchCustomers();

      setActiveTab("ticket");
      carForm.reset();

      console.log("Switched back to ticket tab");
    } catch (error) {
      console.error("Error creating car:", error);
      console.error("Error details:", error);
    } finally {
      setIsCreatingCar(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "car" && !selectedCustomerId) {
      console.warn("Please select a customer first before adding a car");
      return;
    }
    setActiveTab(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Ticket</DialogTitle>
          <DialogDescription>
            {activeTab === "ticket"
              ? "Fill the below fields to add new ticket"
              : activeTab === "customer"
              ? "Create a new customer"
              : "Add a new car"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ticket">Ticket</TabsTrigger>
            <TabsTrigger value="customer">New Customer</TabsTrigger>
            <TabsTrigger value="car" disabled={!selectedCustomerId}>
              New Car {selectedCustomerId ? "" : "(Select Customer First)"}
            </TabsTrigger>
          </TabsList>

          {/* Ticket Tab */}
          <TabsContent value="ticket">
            <Form {...ticketForm}>
              <form
                onSubmit={ticketForm.handleSubmit(createSchedule)}
                className="space-y-4"
              >
                <CustomerSearchField
                  customers={customers}
                  searchQuery={customerSearchQuery}
                  onSearchChange={setCustomerSearchQuery}
                  currentPage={customerCurrentPage}
                  totalCount={customerTotalCount}
                  itemsPerPage={customerItemsPerPage}
                  onPageChange={setCustomerCurrentPage}
                />
                <div className="flex w-full gap-4">
                  <CarSearchField customers={customers} />
                  <ServiceSearchField services={services} />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-1/2">
                    <SupervisorSearchField
                      supervisors={supervisors}
                      searchQuery={supervisorSearchQuery}
                      onSearchChange={setSupervisorSearchQuery}
                      currentPage={supervisorCurrentPage}
                      totalCount={supervisorTotalCount}
                      itemsPerPage={supervisorItemsPerPage}
                      onPageChange={setSupervisorCurrentPage}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="deliveryTime"
                      render={({ field }) => (
                        <FormItem className="grid gap-1">
                          <FormLabel className="text-sm font-medium">
                            Delivery Time (Optional)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="time"
                                {...field}
                                className="[&::-webkit-calendar-picker-indicator]:opacity-0 w-full pl-3 pr-10 bg-background"
                              />
                              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions or notes..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <AddOnsField addOns={addOns} />
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <div>Total: </div>
                  <div className="text-md text-green-700">
                    {calculation?.total !== undefined
                      ? `${calculation.total.toFixed(2)} JOD`
                      : "0.00 JOD"}
                  </div>
                </div>

                <DialogFooter className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <FaDotCircle />
                        Creating...
                      </>
                    ) : (
                      "Book"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Customer Tab */}
          <TabsContent value="customer">
            <Form {...customerForm}>
              <form
                onSubmit={customerForm.handleSubmit(createCustomer)}
                className="space-y-4"
              >
                <FormField
                  control={customerForm.control}
                  name="fName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="lName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={customerForm.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="07XXXXXXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("ticket")}
                  >
                    Back to Ticket
                  </Button>
                  <Button type="submit" disabled={isCreatingCustomer}>
                    {isCreatingCustomer ? (
                      <>
                        <FaDotCircle />
                        Creating...
                      </>
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Car Tab */}
          <TabsContent value="car">
            {selectedCustomerId && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Adding car for:{" "}
                  <span className="font-medium text-foreground">
                    {customers.find((c) => c.id === selectedCustomerId)?.fName}{" "}
                    {customers.find((c) => c.id === selectedCustomerId)?.lName}
                  </span>
                </p>
              </div>
            )}
            <Form {...carForm}>
              <form
                onSubmit={carForm.handleSubmit(createCar)}
                className="space-y-4"
              >
                <div className="flex gap-4">
                  <FormField
                    control={carForm.control}
                    name="brandId"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-col flex-1">
                          <FormLabel>Brand</FormLabel>
                          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={brandOpen}
                                  className="justify-between"
                                >
                                  <span>
                                    {field.value
                                      ? brands.find(
                                          (brand) => brand.id === field.value
                                        )?.name
                                      : "Select brand..."}
                                  </span>
                                  <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search brands..."
                                  className="h-9"
                                  value={brandSearchQuery}
                                  onValueChange={(value) => {
                                    setBrandSearchQuery(value);
                                    setBrandCurrentPage(1);
                                  }}
                                />
                                <CommandEmpty>No brands found.</CommandEmpty>
                                <ScrollArea className="h-64">
                                  <CommandGroup>
                                    {brands.map((brand) => (
                                      <CommandItem
                                        key={brand.id}
                                        value={brand.id}
                                        onSelect={async () => {
                                          field.onChange(brand.id);
                                          setBrandOpen(false);

                                          // Update brands state with models
                                        }}
                                      >
                                        {brand.name}
                                        <FiCheck
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            field.value === brand.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                                <div className="flex items-center justify-between p-2 text-sm text-gray-600 border-t">
                                  <span>
                                    Showing{" "}
                                    {(brandCurrentPage - 1) *
                                      brandItemsPerPage +
                                      1}
                                    -
                                    {Math.min(
                                      brandCurrentPage * brandItemsPerPage,
                                      brandTotalCount
                                    )}{" "}
                                    of {brandTotalCount}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={brandCurrentPage === 1}
                                      onClick={() =>
                                        setBrandCurrentPage((p) =>
                                          Math.max(1, p - 1)
                                        )
                                      }
                                    >
                                      Previous
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={
                                        brandCurrentPage * brandItemsPerPage >=
                                        brandTotalCount
                                      }
                                      onClick={() =>
                                        setBrandCurrentPage((p) => p + 1)
                                      }
                                    >
                                      Next
                                    </Button>
                                  </div>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={carForm.control}
                    name="modelId"
                    render={({ field }) => {
                      const selectedBrandId = carForm.watch("brandId");
                      const models =
                        brands.find((b) => b.id === selectedBrandId)?.models ||
                        [];

                      return (
                        <FormItem className="flex-1">
                          <FormLabel>Model</FormLabel>
                          <SearchSelect
                            options={selectedBrandId ? models.map((model) => ({
                              value: model.id,
                              label: model.name,
                            })) : []}
                            value={selectedBrandId ? field.value : ""}
                            onChange={(value) => {
                              if (selectedBrandId) {
                                field.onChange(value);
                              }
                            }}
                            placeholder={
                              selectedBrandId
                                ? "Search models..."
                                : "Select a brand first"
                            }
                            searchPlaceholder="Search models..."
                          />
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={carForm.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Plate Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Plate Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={carForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Year (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={carForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("ticket")}
                  >
                    Back to Ticket
                  </Button>
                  <Button type="submit" disabled={isCreatingCar}>
                    {isCreatingCar ? (
                      <>
                        <FaDotCircle />
                        Creating...
                      </>
                    ) : (
                      "Add Car"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
