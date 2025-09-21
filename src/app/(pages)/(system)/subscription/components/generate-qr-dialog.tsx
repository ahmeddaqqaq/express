"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, QrCode } from "lucide-react";
import { SubscriptionService } from "../../../../../../client";

interface GenerateQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function GenerateQrDialog({
  open,
  onOpenChange,
  onSuccess,
}: GenerateQrDialogProps) {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (count < 1 || count > 100) {
      setError("Count must be between 1 and 100");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await SubscriptionService.subscriptionControllerGenerateQrCodes({
        count: count,
      });

      setSuccess(`Successfully generated ${count} QR code${count > 1 ? 's' : ''}`);
      
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setCount(1);
        setSuccess("");
        setError("");
      }, 1500);
    } catch (error: any) {
      console.error("Error generating QR codes:", error);
      const errorMessage =
        error?.body?.message || 
        error?.message || 
        "Failed to generate QR codes";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!loading) {
      onOpenChange(open);
      if (!open) {
        setCount(1);
        setError("");
        setSuccess("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generate QR Codes
          </DialogTitle>
          <DialogDescription>
            Generate new QR codes for subscription activation. Each QR code can be assigned to a customer subscription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of QR Codes</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              placeholder="Enter number of QR codes to generate"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a number between 1 and 100
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate {count > 1 ? `${count} QR Codes` : 'QR Code'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}