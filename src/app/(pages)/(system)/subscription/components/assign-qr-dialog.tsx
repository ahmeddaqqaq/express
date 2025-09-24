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
import jsQR from "jsqr";

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
    setFormData((prev) => ({ ...prev, customerSubscriptionId }));
  }, [customerSubscriptionId]);

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
        setFormData((prev) => ({ ...prev, qrCodeId: code.data }));
        setScanning(false);
        setError("");
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
