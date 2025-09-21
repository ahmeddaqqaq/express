"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { SubscriptionService, UseServiceDto } from "../../../../../../client";

interface QRSubscriptionData {
  id: string;
  qrCode: string;
  isActive: boolean;
  customer: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  car: {
    id: string;
    brand: { name: string };
    model: { name: string };
    plateNumber: string;
    color: string;
  };
  subscription: {
    id: string;
    name: string;
    description?: string;
    services: Array<{
      serviceId: string;
      serviceName: string;
      usageCount: number;
    }>;
  };
  remainingServices: Array<{
    serviceId: string;
    serviceName: string;
    remainingCount: number;
    totalCount: number;
    usedCount: number;
    lastUsed?: string;
    usageHistory: Array<any>;
  }>;
}
import { Html5QrcodeScanner } from "html5-qrcode";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName: string;
  onConfirm: () => void;
  loading: boolean;
}

function ConfirmationModal({
  open,
  onOpenChange,
  serviceName,
  onConfirm,
  loading,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Service Use</DialogTitle>
          <DialogDescription>
            Are you sure you want to use the service "{serviceName}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Using...
              </>
            ) : (
              "Confirm Use"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ScanQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ScanQrDialog({
  open,
  onOpenChange,
  onSuccess,
}: ScanQrDialogProps) {
  const [scannedCode, setScannedCode] = useState("");
  const [subscriptionData, setSubscriptionData] =
    useState<QRSubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [useServiceLoading, setUseServiceLoading] = useState<string | null>(
    null
  );
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    serviceId: string;
    serviceName: string;
  }>({ open: false, serviceId: "", serviceName: "" });

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up scanner when dialog closes or component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (open && scanning && scannerContainerRef.current) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [open, scanning]);

  const startScanner = () => {
    if (!scannerContainerRef.current) return;

    scannerContainerRef.current.innerHTML = "";
    setError("");

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "scan-qr-container",
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
          setScannedCode(decodedText);
          setScanning(false);
          setError("");
          fetchSubscriptionData(decodedText);
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

      // Apply custom styles to make camera full width
      setTimeout(() => {
        const scannerContainer = document.getElementById("scan-qr-container");
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

  const fetchSubscriptionData = async (qrCode: string) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response =
        await SubscriptionService.subscriptionControllerGetSubscriptionByQr({
          qrCode,
        });

      console.log("QR Scan Response:", response);
      setSubscriptionData(response as QRSubscriptionData);
    } catch (error: any) {
      console.error("Error fetching subscription data:", error);
      const errorMessage =
        error?.body?.message ||
        error?.message ||
        "Failed to fetch subscription data";
      setError(errorMessage);
      setSubscriptionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUseService = (serviceId: string, serviceName: string) => {
    setConfirmationModal({
      open: true,
      serviceId,
      serviceName,
    });
  };

  const confirmUseService = async () => {
    if (!scannedCode || !confirmationModal.serviceId) return;

    try {
      setUseServiceLoading(confirmationModal.serviceId);
      setError("");

      const useServiceData: UseServiceDto = {
        qrCode: scannedCode,
        serviceId: confirmationModal.serviceId,
        usedById: undefined, // Can be set to current user ID if available
        notes: undefined, // Can be set if notes functionality is needed
      };

      await SubscriptionService.subscriptionControllerUseService({
        requestBody: useServiceData,
      });

      setSuccess(
        `Service "${confirmationModal.serviceName}" used successfully!`
      );
      setConfirmationModal({ open: false, serviceId: "", serviceName: "" });

      // Trigger kanban refresh
      if (onSuccess) {
        console.log("Triggering kanban refresh...");
        onSuccess();
      }

      // Refresh subscription data to update remaining uses
      await fetchSubscriptionData(scannedCode);
      
      // Close the dialog after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
        // Reset states when closing
        setSubscriptionData(null);
        setScannedCode("");
        setSuccess("");
        setError("");
      }, 1500);
    } catch (error: any) {
      console.error("Error using service:", error);
      const errorMessage =
        error?.body?.message || error?.message || "Failed to use service";
      setError(errorMessage);
    } finally {
      setUseServiceLoading(null);
    }
  };

  const toggleScanning = () => {
    if (scanning) {
      setScanning(false);
    } else {
      setScanning(true);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setScanning(false);
      setScannedCode("");
      setSubscriptionData(null);
      setError("");
      setSuccess("");
      setUseServiceLoading(null);
      setConfirmationModal({ open: false, serviceId: "", serviceName: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code for Service
            </DialogTitle>
            <DialogDescription>
              Scan a customer's subscription QR code to view and use available
              services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  {success}
                </p>
              </div>
            )}

            {!subscriptionData && (
              <div className="space-y-4">
                <div
                  id="scan-qr-container"
                  ref={scannerContainerRef}
                  className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {!scanning ? (
                    <div className="text-gray-500 dark:text-gray-400 text-center">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready to Scan</p>
                      <p className="text-sm">
                        Click "Start Camera" to begin scanning
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
                    type="button"
                    variant={scanning ? "destructive" : "default"}
                    onClick={toggleScanning}
                    className="flex-1 h-11 gap-2"
                    disabled={loading}
                  >
                    {scanning ? (
                      <>
                        <CameraOff className="h-4 w-4" />
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Position the QR code within the camera frame to scan
                  automatically
                </p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Loading subscription data...
                  </p>
                </div>
              </div>
            )}

            {subscriptionData && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Subscription Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Customer:</strong>{" "}
                        {subscriptionData.customer?.firstName || ""}{" "}
                        {subscriptionData.customer?.lastName || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Car:</strong>{" "}
                        {subscriptionData.car?.brand?.name}{" "}
                        {subscriptionData.car?.model?.name} (
                        {subscriptionData.car?.plateNumber})
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>QR Code:</strong>{" "}
                        {subscriptionData.qrCode || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Status:</strong>{" "}
                        {subscriptionData.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 mt-2">
                    <strong>Subscription:</strong>{" "}
                    {subscriptionData.subscription?.name || ""}
                  </p>
                  {subscriptionData.subscription?.description && (
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                      {subscriptionData.subscription.description}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-3">Available Services</h3>
                  <div className="space-y-2">
                    {subscriptionData.subscription?.services?.length > 0 ? (
                      subscriptionData.subscription.services.map((service) => (
                        <div
                          key={service.serviceId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {service.serviceName || ""}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Total uses: {service.usageCount || 0}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleUseService(
                                service.serviceId,
                                service.serviceName
                              )
                            }
                            disabled={useServiceLoading === service.serviceId}
                          >
                            {useServiceLoading === service.serviceId ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Using...
                              </>
                            ) : (
                              "Use Service"
                            )}
                          </Button>
                        </div>
                      ))
                    ) : subscriptionData.remainingServices?.length > 0 ? (
                      <div className="space-y-2">
                        {subscriptionData.remainingServices.map((service) => (
                          <div
                            key={service.serviceId}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">
                                {service.serviceName || ""}
                              </h4>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                Remaining uses: {service.remainingCount} /{" "}
                                {service.totalCount}
                              </p>
                              {service.lastUsed && (
                                <p className="text-xs text-gray-500">
                                  Last used:{" "}
                                  {new Date(
                                    service.lastUsed
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleUseService(
                                  service.serviceId,
                                  service.serviceName
                                )
                              }
                              disabled={
                                service.remainingCount <= 0 ||
                                useServiceLoading === service.serviceId
                              }
                            >
                              {useServiceLoading === service.serviceId ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Using...
                                </>
                              ) : service.remainingCount <= 0 ? (
                                "No Uses Left"
                              ) : (
                                "Use Service"
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <p>No services available for this subscription</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubscriptionData(null);
                      setScannedCode("");
                      setSuccess("");
                    }}
                    className="flex-1"
                  >
                    Scan Another QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmationModal.open}
        onOpenChange={(open) =>
          setConfirmationModal((prev) => ({ ...prev, open }))
        }
        serviceName={confirmationModal.serviceName}
        onConfirm={confirmUseService}
        loading={useServiceLoading !== null}
      />
    </>
  );
}
