"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import AssignQrCodeDialog from "./assign-qr-dialog";

interface CustomerRowActionsProps {
  subscription: any;
  onSuccess?: () => void;
}

export function CustomerRowActions({ subscription, onSuccess }: CustomerRowActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          {/* Add more actions here later */}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignQrCodeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customerSubscriptionId={subscription.id}
        onSuccess={onSuccess}
      />
    </>
  );
}
