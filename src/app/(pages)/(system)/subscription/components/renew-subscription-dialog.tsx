"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Camera,
  CameraOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { SubscriptionService } from "../../../../../../client";
import { toast } from "sonner";
import jsQR from "jsqr";

interface RenewSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function RenewSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: RenewSubscriptionDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);
      scanningRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            scanForQRCode();
          }).catch(console.error);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Could not access camera. Please check permissions.");
      setIsScanning(false);
      scanningRef.current = false;
    }
  };

  const scanForQRCode = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanForQRCode);
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }

      requestAnimationFrame(scanForQRCode);
    } catch (error) {
      console.error("Error during QR scanning:", error);
      requestAnimationFrame(scanForQRCode);
    }
  };

  const handleQRCodeDetected = async (qrCodeData: string) => {
    try {
      stopScanner();
      setScannedQRCode(qrCodeData);
      
      // Get subscription info for confirmation
      const subInfo = await SubscriptionService.subscriptionControllerGetSubscriptionByQr({
        qrCode: qrCodeData,
      });
      
      setSubscriptionInfo(subInfo);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error("Failed to get subscription info:", error);
      const errorMessage = error?.body?.message || error?.message || "Failed to get subscription information";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleConfirmRenew = async () => {
    if (!scannedQRCode) return;
    
    try {
      setIsRenewing(true);
      setShowConfirmation(false);

      await SubscriptionService.subscriptionControllerRenewSubscription({
        qrCodeId: scannedQRCode,
      });

      setSuccess(true);
      toast.success("Subscription renewed successfully for 30 days!");
      onSuccess?.();
      
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Failed to renew subscription:", error);
      const errorMessage = error?.body?.message || error?.message || "Failed to renew subscription";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCancelRenew = () => {
    setShowConfirmation(false);
    setScannedQRCode(null);
    setSubscriptionInfo(null);
    setError(null);
  };

  const stopScanner = () => {
    scanningRef.current = false;
    setIsScanning(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleDialogClose = () => {
    if (!isRenewing && !showConfirmation) {
      stopScanner();
      setError(null);
      setSuccess(false);
      setScannedQRCode(null);
      setSubscriptionInfo(null);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      setError(null);
      setSuccess(false);
      setShowConfirmation(false);
      setScannedQRCode(null);
      setSubscriptionInfo(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renew Subscription</DialogTitle>
          <DialogDescription>
            Scan the QR code to renew the subscription for 30 days
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-green-700">
                Subscription Renewed Successfully!
              </p>
              <p className="text-sm text-gray-600">
                The subscription has been extended for 30 days.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col h-full space-y-4">
                <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
                  {isScanning ? (
                    <div className="relative h-64 w-full">
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      {isRenewing && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white rounded-lg p-4 flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Renewing subscription...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4 text-gray-500">
                      <Camera className="h-12 w-12" />
                      <p>Click "Start Camera" to scan QR code</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div className="flex justify-center space-x-2">
                  {!isScanning ? (
                    <Button 
                      onClick={startScanner} 
                      className="flex items-center space-x-2"
                      disabled={isRenewing}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Start Camera</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopScanner} 
                      variant="outline"
                      className="flex items-center space-x-2"
                      disabled={isRenewing}
                    >
                      <CameraOff className="h-4 w-4" />
                      <span>Stop Camera</span>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={showConfirmation} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Subscription Renewal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew this subscription for{" "}
              <strong>{subscriptionInfo?.customer?.fullName || 'this customer'}</strong>?
              <br />
              <br />
              This will extend the subscription by 30 days and reset all service counters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRenew} disabled={isRenewing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRenew}
              disabled={isRenewing}
            >
              {isRenewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Renewing...
                </>
              ) : (
                "Renew Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}