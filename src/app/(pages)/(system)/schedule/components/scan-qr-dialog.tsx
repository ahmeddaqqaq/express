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
import jsQR from "jsqr";

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up camera when dialog closes or component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (scanning && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [scanning]);

  const startCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setError("");

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      await new Promise((resolve) => {
        videoRef.current!.onloadedmetadata = resolve;
      });
      
      await videoRef.current.play();
      
      // Start QR code detection
      scanForQRCode();
    } catch (error: any) {
      console.error("Failed to start camera:", error);
      
      if (error.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access in your browser.");
        setScanning(false);
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError("No camera found. Please ensure your device has a camera.");
        setScanning(false);
      } else if (error.name === 'NotReadableError') {
        setError("Camera is being used by another application. Please close other camera apps and try again.");
        setScanning(false);
      } else if (error.name === 'OverconstrainedError') {
        setError("Camera constraints not supported. Trying with basic settings...");
        // Try again with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = basicStream;
          videoRef.current.srcObject = basicStream;
          await videoRef.current.play();
          scanForQRCode();
          return;
        } catch (retryError) {
          setError("Camera not supported on this device.");
          setScanning(false);
        }
      } else {
        setError(`Camera error: ${error.message || error.toString()}`);
        setScanning(false);
      }
    }
  };

  const scanForQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Check if we should continue scanning
    if (!scanning) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      // Continue trying until video is ready
      animationRef.current = requestAnimationFrame(scanForQRCode);
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setScannedCode(code.data);
        setScanning(false);
        setError("");
        fetchSubscriptionData(code.data);
        return;
      }
    } catch (error) {
      console.log("QR scan frame error:", error);
      // Don't stop scanning on frame errors, just continue
    }

    // Continue scanning only if still in scanning mode
    if (scanning) {
      animationRef.current = requestAnimationFrame(scanForQRCode);
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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

          <div className="space-y-6 flex-1 flex flex-col min-h-0">
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
                <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
                  {scanning ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready to Scan</p>
                      <p className="text-sm">
                        Click "Start Camera" to begin scanning
                      </p>
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
