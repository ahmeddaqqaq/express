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
} from "lucide-react";
import { SubscriptionService, ActivateSubscriptionDto } from "../../../../../../client";
import { Html5QrcodeScanner } from "html5-qrcode";

interface AssignQrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerSubscriptionId: string;
  onSuccess?: () => void;
}

export default function AssignQrCodeDialog({
  open,
  onOpenChange,
  customerSubscriptionId,
  onSuccess,
}: AssignQrCodeDialogProps) {
  const [formData, setFormData] = useState<ActivateSubscriptionDto>({
    customerSubscriptionId,
    qrCodeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
    setFormData((prev) => ({ ...prev, customerSubscriptionId }));
  }, [customerSubscriptionId]);

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
        "scanner-container",
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
          setFormData((prev) => ({ ...prev, qrCodeId: decodedText }));
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

      // Apply custom styles to make camera full width
      setTimeout(() => {
        const scannerContainer = document.getElementById("scanner-container");
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

  const handleAssign = async () => {
    if (!formData.qrCodeId.trim()) {
      setError("Please scan a QR Code to activate the subscription");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await SubscriptionService.subscriptionControllerActivateSubscription({
        requestBody: formData,
      });

      setSuccess(true);
      onSuccess?.(); // Refresh the table
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      console.error("Error assigning QR code:", error);
      const errorMessage =
        error?.body?.message || error?.message || "Failed to activate subscription";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setScanning(false);
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
      setFormData((prev) => ({ ...prev, qrCodeId: "" }));
      setError("");
      setSuccess(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Subscription Activated Successfully
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Activate Subscription
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {success
              ? "The subscription has been successfully activated with the QR code."
              : "Scan an available QR code to activate this purchased subscription."}
          </DialogDescription>
        </DialogHeader>

        {!success && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {formData.qrCodeId && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>QR Code Detected:</strong> {formData.qrCodeId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div
                id="scanner-container"
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

                {formData.qrCodeId && (
                  <Button
                    onClick={handleAssign}
                    disabled={loading}
                    className="flex-1 h-11"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Activate Subscription"
                    )}
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Position the QR code within the camera frame to scan
                automatically
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex justify-center py-8">
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <p className="text-lg font-medium">Activation Complete</p>
              <p className="text-sm text-muted-foreground">
                QR Code ID:{" "}
                <span className="font-mono">{formData.qrCodeId}</span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
