"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import SubscriptionTable from "./components/subscription-table";
import CreateSubscriptionDialog from "./components/create-subscription-dialog";
import RenewSubscriptionDialog from "./components/renew-subscription-dialog";

export default function SubscriptionPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [subscriptionRefreshKey, setSubscriptionRefreshKey] = useState(0);
  const [, setCustomerSubscriptionRefreshKey] = useState(0);

  const handleSubscriptionCreated = () => {
    setSubscriptionRefreshKey((prev) => prev + 1);
  };

  const handleCustomerSubscriptionUpdate = () => {
    setCustomerSubscriptionRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setRenewDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Renew Subscription
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Subscription
          </Button>
        </div>
      </div>
      <SubscriptionTable
        refreshKey={subscriptionRefreshKey}
        onCustomerSubscriptionUpdate={handleCustomerSubscriptionUpdate}
      />

      <CreateSubscriptionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSubscriptionCreated}
      />

      <RenewSubscriptionDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        onSuccess={handleCustomerSubscriptionUpdate}
      />
    </div>
  );
}
