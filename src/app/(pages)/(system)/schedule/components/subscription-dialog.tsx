"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";
import {
  CustomerService,
  SubscriptionService,
  CustomerResponse,
  SubscriptionResponseDto,
  CarResponse,
  PurchaseSubscriptionDto,
  ActivateSubscriptionDto,
} from "../../../../../../client";
import { Html5QrcodeScanner } from "html5-qrcode";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  // Data states
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponseDto[]>(
    []
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarResponse | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionResponseDto | null>(null);

  // Customer search states
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [customerTotalCount, setCustomerTotalCount] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);


  // Flow states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "assign">("select");
  const [customerSubscriptionId, setCustomerSubscriptionId] =
    useState<string>("");

  // QR Scanner states
  const [scanning, setScanning] = useState(false);
  const [scannedQrCode, setScannedQrCode] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Load initial data
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchSubscriptions();
    }
  }, [open]);

  // QR Scanner management
  useEffect(() => {
    if (open && scanning && scannerContainerRef.current && step === "assign") {
      startScanner();
    } else {
      stopScanner();
    }
  }, [open, scanning, step]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const resp = await CustomerService.customerControllerFindMany({
        take: itemsPerPage,
        skip: (customerCurrentPage - 1) * itemsPerPage,
        search: customerSearchQuery || undefined,
      });
      setCustomers(resp.data || []);
      setCustomerTotalCount(resp.rows || 0);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubscriptions() {
    try {
      const resp = await SubscriptionService.subscriptionControllerFindAll();
      setSubscriptions(resp);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to load subscriptions");
    }
  }

  // Fetch customers when search or page changes
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [customerSearchQuery, customerCurrentPage, open]);

  const startScanner = () => {
    if (!scannerContainerRef.current) return;

    scannerContainerRef.current.innerHTML = "";
    setError("");

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "subscription-scanner-container",
        {
          fps: 10,
          qrbox: function (viewfinderWidth, viewfinderHeight) {
            const minEdgePercentage = 0.7;
            const qrboxSize = Math.floor(
              Math.min(viewfinderWidth, viewfinderHeight) * minEdgePercentage
            );
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
          aspectRatio: 1.0,
          supportedScanTypes: [],
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScannedQrCode(decodedText);
          setScanning(false);
          setError("");
        },
        (errorMessage) => {
          if (
            !errorMessage.includes("No MultiFormat Readers") &&
            !errorMessage.includes("QR code parse error")
          ) {
            console.error("QR Scan error:", errorMessage);
          }
        }
      );

      // Apply custom styles
      setTimeout(() => {
        const scannerContainer = document.getElementById(
          "subscription-scanner-container"
        );
        if (scannerContainer) {
          const videoElements = scannerContainer.querySelectorAll("video");
          videoElements.forEach((video) => {
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
          });

          const readerDiv = scannerContainer.querySelector(
            "#html5-qrcode-scanner"
          );
          if (readerDiv) {
            (readerDiv as HTMLElement).style.width = "100%";
          }
        }
      }, 500);
    } catch (error) {
      console.error("Failed to initialize scanner:", error);
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error("Failed to clear scanner", error);
      });
      scannerRef.current = null;
    }
  };

  async function purchaseSubscription() {
    if (!selectedCustomer || !selectedCar || !selectedSubscription) {
      setError("Please select customer, car, and subscription");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const requestBody: PurchaseSubscriptionDto = {
        customerId: selectedCustomer.id,
        carId: selectedCar.id,
        subscriptionId: selectedSubscription.id,
      };

      const resp =
        await SubscriptionService.subscriptionControllerPurchaseSubscription({
          requestBody,
        });

      setCustomerSubscriptionId(resp.id);
      setStep("assign");
    } catch (error: any) {
      console.error("Error purchasing subscription:", error);
      setError(
        error?.body?.message ||
          error?.message ||
          "Failed to purchase subscription"
      );
    } finally {
      setLoading(false);
    }
  }

  async function assignQrCode() {
    if (!scannedQrCode || !customerSubscriptionId) {
      setError("Please scan a QR code first");
      return;
    }

    try {
      setAssignLoading(true);
      setError("");

      const requestBody: ActivateSubscriptionDto = {
        customerSubscriptionId,
        qrCodeId: scannedQrCode,
      };

      await SubscriptionService.subscriptionControllerActivateSubscription({
        requestBody,
      });

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error assigning QR code:", error);
      setError(
        error?.body?.message || error?.message || "Failed to assign QR code"
      );
    } finally {
      setAssignLoading(false);
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer || null);
    setSelectedCar(null); // Reset car selection when customer changes
    setCustomerOpen(false);
  };

  const handleCarSelect = (carId: string) => {
    const car = selectedCustomer?.cars?.find((c) => c.id === carId);
    setSelectedCar(car || null);
  };

  const handleSubscriptionSelect = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId);
    setSelectedSubscription(subscription || null);
  };

  const canProceed = selectedCustomer && selectedCar && selectedSubscription;

  const toggleScanning = () => {
    setScanning(!scanning);
  };

  const handleClose = () => {
    // Reset all states
    setStep("select");
    setSelectedCustomer(null);
    setSelectedCar(null);
    setSelectedSubscription(null);
    setCustomerSearchQuery("");
    setCustomerCurrentPage(1);
    setScannedQrCode("");
    setCustomerSubscriptionId("");
    setError("");
    setSuccess(false);
    setScanning(false);
    onOpenChange(false);
  };

  const customerTotalPages = Math.ceil(customerTotalCount / itemsPerPage);
  const customerStartItem = (customerCurrentPage - 1) * itemsPerPage + 1;
  const customerEndItem = Math.min(
    customerCurrentPage * itemsPerPage,
    customerTotalCount
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Subscription Assigned Successfully
              </>
            ) : (
              "Subscription Management"
            )}
          </DialogTitle>
          <DialogDescription>
            {success
              ? "The subscription has been purchased and QR code assigned successfully."
              : step === "select"
              ? "Select customer, car, and subscription to purchase."
              : "Scan a QR code to assign to the purchased subscription."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex justify-center py-8">
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <p className="text-lg font-medium">Subscription Ready!</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Customer:</strong> {selectedCustomer?.fName || ""}{" "}
                  {selectedCustomer?.lName || ""}
                </p>
                <p>
                  <strong>Vehicle:</strong> {selectedCar?.plateNumber || ""} -{" "}
                  {selectedCar?.brand?.name || ""}{" "}
                  {selectedCar?.model?.name || ""}
                </p>
                <p>
                  <strong>Subscription:</strong>{" "}
                  {selectedSubscription?.name || ""}
                </p>
                <p>
                  <strong>QR Code:</strong>{" "}
                  <span className="font-mono">{scannedQrCode}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <div className="grid grid-cols-2 gap-8">
            {/* Left Side - Selection */}
            <div
              className={`space-y-4 ${step === "assign" ? "opacity-50" : ""}`}
            >
              <h3 className="text-lg font-semibold">
                1. Purchase Subscription
              </h3>

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerOpen}
                      className="w-full justify-between"
                      disabled={step === "assign"}
                    >
                      <span>
                        {selectedCustomer
                          ? `${selectedCustomer.fName || ""} ${
                              selectedCustomer.lName || ""
                            } (${selectedCustomer.mobileNumber || ""})`
                          : "Select customer..."}
                      </span>
                      <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search customers..."
                        className="h-9"
                        value={customerSearchQuery}
                        onValueChange={setCustomerSearchQuery}
                      />
                      <CommandEmpty>No customers found.</CommandEmpty>
                      <ScrollArea className="h-64">
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.id}
                              onSelect={() => handleCustomerSelect(customer.id)}
                              className={
                                customer.isBlacklisted
                                  ? "bg-red-50 border-l-4 border-l-red-500"
                                  : ""
                              }
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {customer.fName || ""}{" "}
                                    {customer.lName || ""} (
                                    {customer.mobileNumber || ""})
                                  </span>
                                  {customer.isBlacklisted && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                      BLACKLISTED
                                    </span>
                                  )}
                                </div>
                                <FiCheck
                                  className={cn(
                                    "h-4 w-4",
                                    selectedCustomer?.id === customer.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                      <div className="flex items-center justify-between p-2 text-sm text-gray-600 border-t">
                        <span>
                          Showing {customerStartItem}-{customerEndItem} of{" "}
                          {customerTotalCount}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={customerCurrentPage === 1}
                            onClick={() =>
                              setCustomerCurrentPage(customerCurrentPage - 1)
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={customerCurrentPage >= customerTotalPages}
                            onClick={() =>
                              setCustomerCurrentPage(customerCurrentPage + 1)
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Car Selection */}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select
                  value={selectedCar?.id || ""}
                  onValueChange={handleCarSelect}
                  disabled={!selectedCustomer || step === "assign"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer?.cars?.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.plateNumber || ""} - {car.brand?.name || ""}{" "}
                        {car.model?.name || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subscription Selection */}
              <div className="space-y-2">
                <Label>Subscription</Label>
                <Select
                  value={selectedSubscription?.id || ""}
                  onValueChange={handleSubscriptionSelect}
                  disabled={step === "assign"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.name || ""}
                        {subscription.description &&
                          ` - ${subscription.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={purchaseSubscription}
                disabled={!canProceed || loading || step === "assign"}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </div>

            {/* Right Side - QR Assignment */}
            <div
              className={`space-y-4 ${step === "select" ? "opacity-50" : ""}`}
            >
              <h3 className="text-lg font-semibold">2. Assign QR Code</h3>

              {step === "assign" && (
                <>
                  {scannedQrCode && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        <strong>QR Code Detected:</strong> {scannedQrCode}
                      </p>
                    </div>
                  )}

                  <div
                    id="subscription-scanner-container"
                    ref={scannerContainerRef}
                    className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    {!scanning ? (
                      <div className="text-gray-500 dark:text-gray-400 text-center">
                        <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          Ready to Scan
                        </p>
                        <p className="text-sm">
                          Click "Start Camera" to scan QR code
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400 text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Initializing camera...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant={scanning ? "destructive" : "default"}
                      onClick={toggleScanning}
                      className="flex-1"
                    >
                      {scanning ? (
                        <>
                          <CameraOff className="h-4 w-4 mr-2" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>

                    {scannedQrCode && (
                      <Button
                        onClick={assignQrCode}
                        disabled={assignLoading}
                        className="flex-1"
                      >
                        {assignLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          "Assign QR Code"
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}

              {step === "select" && (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Complete step 1 to activate QR assignment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
