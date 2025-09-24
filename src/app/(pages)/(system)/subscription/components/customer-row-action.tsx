"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
// import { RotateCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import AssignQrCodeDialog from "./assign-qr-dialog";
// import { SubscriptionService, RenewSubscriptionDto } from "../../../../../../client";
// import { toast } from "sonner";

interface CustomerRowActionsProps {
  subscription: any;
  onSuccess?: () => void;
}

export function CustomerRowActions({ subscription, onSuccess }: CustomerRowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [isRenewing, setIsRenewing] = useState(false);
  // const [showRenewConfirmation, setShowRenewConfirmation] = useState(false);

  // const handleRenewSubscription = async () => {
  //   try {
  //     setIsRenewing(true);
  //     
  //     const renewData: RenewSubscriptionDto = {
  //       customerSubscriptionId: subscription.id,
  //     };

  //     await SubscriptionService.subscriptionControllerRenewSubscription({
  //       requestBody: renewData,
  //     });

  //     toast.success("Subscription renewed successfully for 30 days!");
  //     onSuccess?.(); // Refresh the table
  //     setShowRenewConfirmation(false); // Close confirmation dialog after success
  //   } catch (error: any) {
  //     console.error("Failed to renew subscription:", error);
  //     const errorMessage = error?.body?.message || error?.message || "Failed to renew subscription";
  //     toast.error(errorMessage);
  //   } finally {
  //     setIsRenewing(false);
  //   }
  // };

  // const handleCancelRenew = (open: boolean) => {
  //   if (!open && !isRenewing) {
  //     setShowRenewConfirmation(false);
  //   }
  // };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            Assign QR Code
          </DropdownMenuItem>
          {/* <DropdownMenuItem 
            onClick={() => setShowRenewConfirmation(true)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Renew Subscription
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignQrCodeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customerSubscriptionId={subscription.id}
        onSuccess={onSuccess}
      />

      {/* <AlertDialog open={showRenewConfirmation} onOpenChange={handleCancelRenew}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew this subscription for{" "}
              <strong>{subscription.customer?.fullName}</strong>? 
              <br />
              <br />
              This will extend the subscription by 30 days and reset all service counters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRenewing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRenewSubscription}
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
      </AlertDialog> */}
    </>
  );
}
