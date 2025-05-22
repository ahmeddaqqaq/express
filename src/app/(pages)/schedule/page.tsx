"use client";

import { useEffect, useState } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiSettings,
  FiUser,
  FiPlus,
  FiPrinter,
  FiDollarSign,
  FiPhone,
  FiUserCheck,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import {
  AddOnsResponse,
  AddOnsService,
  CustomerResponse,
  CustomerService,
  ServiceResponse,
  ServiceService,
  TechnicianResponse,
  TechnicianService,
  TransactionResponse,
  TransactionService,
} from "../../../../client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CustomerSearchField } from "./components/customer-search-field";
import { CarSearchField } from "./components/car-search-field";
import { TechnicianSearchField } from "./components/technician-search-field";
import { ServiceSearchField } from "./components/service-search-field";
import { AddOnsField } from "./components/add-ons-field";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  carId: z.string().min(1, "Car is required"),
  technicianId: z
    .array(z.string())
    .min(1, "At least one technician is required"),
  serviceId: z.string().min(1, "Service is required"),
  addOnsIds: z.array(z.string()).optional(),
});

export default function Schedule() {
  const [scheduled, setScheduled] = useState<TransactionResponse[]>([]);
  const [stageOne, setStageOne] = useState<TransactionResponse[]>([]);
  const [stageTwo, setStageTwo] = useState<TransactionResponse[]>([]);
  const [completed, setCompleted] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const customerItemsPerPage = 5;

  const [technicianSearchQuery, setTechnicianSearchQuery] = useState("");
  const [technicianCurrentPage, setTechnicianCurentPage] = useState(1);
  const [technicianTotalCount, setTechnicianTotalCount] = useState(0);
  const technicianItemsPerPage = 5;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      carId: "",
      technicianId: [],
      serviceId: "",
      addOnsIds: [],
    },
  });

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianResponse[]>([]);
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [addOns, setAddOns] = useState<AddOnsResponse[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchAddOns = async () => {
      const response = await AddOnsService.addOnsControllerFindMany({});
      setAddOns(response.data);
    };
    fetchAddOns();
  }, []);

  async function fetchCustomers() {
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
  }

  async function fetchTechnicians() {
    try {
      const skip = (technicianCurrentPage - 1) * technicianItemsPerPage;
      const resp = await TechnicianService.technicianControllerFindMany({
        search: technicianSearchQuery || "",
        skip,
        take: technicianItemsPerPage,
      });
      console.log(resp);
      setTechnicians(resp.data);
      setTechnicianTotalCount(resp.rows || resp.data.length);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, [customerSearchQuery, customerCurrentPage]);

  useEffect(() => {
    fetchTechnicians();
  }, [technicianSearchQuery, technicianCurrentPage]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const resp =
          (await ServiceService.serviceControllerFindMany()) as unknown as ServiceResponse[];
        setServices(resp);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    }

    fetchCustomers();

    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true);
        const [scheduledRes, stageOneRes, stageTwoRes, completedRes] =
          await Promise.all([
            TransactionService.transactionControllerFindScheduled() as unknown as TransactionResponse[],
            TransactionService.transactionControllerFindStageOne() as unknown as TransactionResponse[],
            TransactionService.transactionControllerFindStageTwo() as unknown as TransactionResponse[],
            TransactionService.transactionControllerFindCompleted() as unknown as TransactionResponse[],
          ]);

        setScheduled(scheduledRes);
        setStageOne(stageOneRes);
        setStageTwo(stageTwoRes);
        setCompleted(completedRes);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setScheduled([]);
        setStageOne([]);
        setStageTwo([]);
        setCompleted([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleStatusChange = async (
    id: string,
    from: "scheduled" | "stageOne" | "stageTwo" | "completed",
    to: "scheduled" | "stageOne" | "stageTwo" | "completed"
  ) => {
    setMovingItemId(id);

    try {
      // Remove from current stage
      if (from === "scheduled") {
        setScheduled(scheduled.filter((item) => item.id !== id));
      } else if (from === "stageOne") {
        setStageOne(stageOne.filter((item) => item.id !== id));
      } else if (from === "stageTwo") {
        setStageTwo(stageTwo.filter((item) => item.id !== id));
      } else if (from === "completed") {
        setCompleted(completed.filter((item) => item.id !== id));
      }

      // Update status in backend
      await TransactionService.transactionControllerUpdate({
        requestBody: {
          id,
          status:
            to === "scheduled"
              ? TransactionResponse.status.SCHEDULED
              : to === "stageOne"
              ? TransactionResponse.status.STAGE_ONE
              : to === "stageTwo"
              ? TransactionResponse.status.STAGE_TWO
              : TransactionResponse.status.COMPLETED,
        },
      });

      // Fetch updated list for the new stage
      const updatedList = (await (to === "scheduled"
        ? TransactionService.transactionControllerFindScheduled()
        : to === "stageOne"
        ? TransactionService.transactionControllerFindStageOne()
        : to === "stageTwo"
        ? TransactionService.transactionControllerFindStageTwo()
        : TransactionService.transactionControllerFindCompleted())) as unknown as TransactionResponse[];

      // Update the new stage state
      if (to === "scheduled") {
        setScheduled(updatedList);
      } else if (to === "stageOne") {
        setStageOne(updatedList);
      } else if (to === "stageTwo") {
        setStageTwo(updatedList);
      } else if (to === "completed") {
        setCompleted(updatedList);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert changes if there's an error
      if (from === "scheduled") {
        setScheduled((prev) => [
          ...prev,
          scheduled.find((item) => item.id === id)!,
        ]);
      } else if (from === "stageOne") {
        setStageOne((prev) => [
          ...prev,
          stageOne.find((item) => item.id === id)!,
        ]);
      } else if (from === "stageTwo") {
        setStageTwo((prev) => [
          ...prev,
          stageTwo.find((item) => item.id === id)!,
        ]);
      } else if (from === "completed") {
        setCompleted((prev) => [
          ...prev,
          completed.find((item) => item.id === id)!,
        ]);
      }
    } finally {
      setMovingItemId(null);
    }
  };

  const createSchedule = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await TransactionService.transactionControllerCreate({
        requestBody: {
          customerId: values.customerId,
          carId: values.carId,
          technicianIds: values.technicianId,
          serviceId: values.serviceId,
          addOnsIds: values.addOnsIds || [],
        },
      });

      const scheduledRes =
        (await TransactionService.transactionControllerFindScheduled()) as unknown as TransactionResponse[];
      setScheduled(scheduledRes);

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  function openDetailsDrawer(transaction: TransactionResponse) {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-gray-800">Bookings</div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="w-5 h-5 text-white" />
              <span className="font-medium text-white">ADD BOOKING</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Booking</DialogTitle>
              <DialogDescription>
                Fill the below fields to add new booking
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(createSchedule)}
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
                <TechnicianSearchField
                  technicians={technicians}
                  searchQuery={technicianSearchQuery}
                  onSearchChange={setTechnicianSearchQuery}
                  currentPage={technicianCurrentPage}
                  totalCount={technicianTotalCount}
                  itemsPerPage={technicianItemsPerPage}
                  onPageChange={setTechnicianCurentPage}
                />
                <AddOnsField addOns={addOns} />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Book"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Scheduled Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FiClock className="mr-2 text-blue-500" />
              Scheduled
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {scheduled.length}
            </span>
          </div>

          <AnimatePresence>
            {scheduled.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: movingItemId === appointment.id ? 0.5 : 1,
                  y: 0,
                  scale: movingItemId === appointment.id ? 0.95 : 1,
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow"
              >
                {/* <h3 className="font-medium text-gray-800">
                  {appointment.service.name}
                </h3> */}
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FiUser className="mr-1" />
                  {appointment.customer.fName} {appointment.customer.lName}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FaCar className="mr-1" />
                  {appointment.car.brand.name} {appointment.car.model.name}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {formatTime(appointment.createdAt)}
                  </span>
                  <span className="text-xs text-gray-500">30 mins</span>
                </div>
                <button
                  className="mt-3 w-full py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                  onClick={() =>
                    handleStatusChange(appointment.id, "scheduled", "stageOne")
                  }
                  disabled={!!movingItemId}
                >
                  {movingItemId === appointment.id ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Start Stage 1"
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stage One Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FiSettings className="mr-2 text-purple-500" />
              Stage One
            </h2>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {stageOne.length}
            </span>
          </div>

          <AnimatePresence>
            {stageOne.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: movingItemId === appointment.id ? 0.5 : 1,
                  y: 0,
                  scale: movingItemId === appointment.id ? 0.95 : 1,
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-purple-500 hover:shadow-md transition-shadow"
              >
                {/* <h3 className="font-medium text-gray-800">
                  {appointment.service.name}
                </h3> */}
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FiUser className="mr-1" />
                  {appointment.customer.fName} {appointment.customer.lName}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FaCar className="mr-1" />
                  {appointment.car.brand.name} {appointment.car.model.name}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-purple-700 mb-2">
                    Started at {formatTime(appointment.updatedAt)}
                  </p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    className="flex-1 py-1 bg-yellow-50 text-yellow-600 text-sm rounded hover:bg-yellow-100 transition-colors"
                    onClick={() =>
                      handleStatusChange(appointment.id, "stageOne", "stageTwo")
                    }
                    disabled={!!movingItemId}
                  >
                    {movingItemId === appointment.id ? (
                      <span className="inline-flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Moving...
                      </span>
                    ) : (
                      "Move to Stage 2"
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stage Two Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FiSettings className="mr-2 text-orange-500" />
              Stage Two
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {stageTwo.length}
            </span>
          </div>

          <AnimatePresence>
            {stageTwo.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: movingItemId === appointment.id ? 0.5 : 1,
                  y: 0,
                  scale: movingItemId === appointment.id ? 0.95 : 1,
                }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-orange-500 hover:shadow-md transition-shadow"
              >
                {/* <h3 className="font-medium text-gray-800">
                  {appointment.service.name}
                </h3> */}
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FiUser className="mr-1" />
                  {appointment.customer.fName} {appointment.customer.lName}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FaCar className="mr-1" />
                  {appointment.car.brand.name} {appointment.car.model.name}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-orange-700 mb-2">
                    Started at {formatTime(appointment.updatedAt)}
                  </p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    className="flex-1 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                    onClick={() =>
                      handleStatusChange(
                        appointment.id,
                        "stageTwo",
                        "completed"
                      )
                    }
                    disabled={!!movingItemId}
                  >
                    {movingItemId === appointment.id ? (
                      <span className="inline-flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Moving...
                      </span>
                    ) : (
                      "Move to Stage 3"
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Completed Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              Completed
            </h2>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {completed.length}
            </span>
          </div>
          <AnimatePresence>
            {completed.map((appointment) => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-green-500 hover:shadow-md transition-shadow"
              >
                <motion.div
                  key="content"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <FiUser className="mr-1" />
                    {appointment.customer.fName} {appointment.customer.lName}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaCar className="mr-1" />
                    {appointment.car.brand.name} {appointment.car.model.name}
                  </div>
                  <span className="text-xs text-gray-500">
                    Completed at {formatTime(appointment.updatedAt)}
                  </span>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => openDetailsDrawer(appointment)}
                      className="flex-1 py-1 bg-gray-50 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Drawer
            open={isDrawerOpen}
            direction="right"
            onOpenChange={setIsDrawerOpen}
          >
            <DrawerContent className="h-[100vh]">
              <div className="mx-auto w-full max-w-md h-full flex flex-col">
                <DrawerHeader className="border-b shrink-0">
                  <DrawerTitle className="text-xl font-bold flex items-center">
                    Booking Details
                  </DrawerTitle>
                  <DrawerDescription className="flex items-center">
                    <FiClock className="mr-1" />
                    Completed at{" "}
                    {selectedTransaction &&
                      formatTime(selectedTransaction.updatedAt)}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                  {/* Customer Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiUser className="mr-2" />
                      Customer Information
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-blue-600 text-lg font-medium">
                          {selectedTransaction?.customer.fName.charAt(0)}
                          {selectedTransaction?.customer.lName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedTransaction?.customer.fName}{" "}
                          {selectedTransaction?.customer.lName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <FiPhone className="inline mr-1" />
                          {selectedTransaction?.customer.mobileNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FaCar className="mr-2" />
                      Vehicle Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Brand</p>
                        <p className="font-medium">
                          {selectedTransaction?.car.brand.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Model</p>
                        <p className="font-medium">
                          {selectedTransaction?.car.model.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="font-medium">
                          {selectedTransaction?.car.year}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Plate</p>
                        <p className="font-medium">
                          {selectedTransaction?.car.plateNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiSettings className="mr-2" />
                      Services
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">
                            {selectedTransaction?.service.name}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          {selectedTransaction?.service.price}
                        </p>
                      </div>

                      {selectedTransaction?.addOns?.length! > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">Add-ons:</p>
                          <div className="space-y-2">
                            {selectedTransaction?.addOns.map((addOn) => (
                              <div
                                key={addOn.id}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <p className="text-sm">{addOn.name}</p>
                                <p className="text-sm font-medium">
                                  {addOn.price}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiUserCheck className="mr-2 text-blue-500" />
                      Assigned Technician
                    </h3>

                    <div className="flex items-center space-x-3">
                      {/* Technician Avatar */}
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <span className="text-blue-600 text-lg font-medium">
                            TN
                          </span>
                        </div>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      </div>

                      {/* Technician Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Tech Name</p>
                            <p className="text-sm text-gray-500 mt-1">
                              General Technician
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <FiDollarSign className="mr-2" />
                      Payment Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-800 font-semibold">
                          Total:
                        </span>
                        <span className="text-green-600 font-bold">
                          {selectedTransaction?.invoice.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <DrawerFooter className="shrink-0 border-t">
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <FiPrinter className="mr-2" />
                      Print Receipt
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="default" className="flex-1">
                        Close
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
