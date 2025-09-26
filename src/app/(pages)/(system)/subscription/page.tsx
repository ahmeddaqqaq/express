"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, RotateCcw } from "lucide-react";
import SubscriptionTable from "./components/subscription-table";
import QrCodeTable from "./components/qr-code-table";
import CustomerSubscriptionTable from "./components/customer-subscription-table";
import CreateSubscriptionDialog from "./components/create-subscription-dialog";
import GenerateQrDialog from "./components/generate-qr-dialog";
import RenewSubscriptionDialog from "./components/renew-subscription-dialog";

export default function SubscriptionPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateQrDialogOpen, setGenerateQrDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [subscriptionRefreshKey, setSubscriptionRefreshKey] = useState(0);
  const [customerSubscriptionRefreshKey, setCustomerSubscriptionRefreshKey] = useState(0);
  const [qrCodeRefreshKey, setQrCodeRefreshKey] = useState(0);

  const handleSubscriptionCreated = () => {
    setSubscriptionRefreshKey(prev => prev + 1);
  };

  const handleCustomerSubscriptionUpdate = () => {
    setCustomerSubscriptionRefreshKey(prev => prev + 1);
  };

  const handleQrCodeGenerated = () => {
    setQrCodeRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans, QR codes, and customer subscriptions
          </p>
        </div>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="qr-codes">QR Codes</TabsTrigger>
          <TabsTrigger value="customer-sub">Customer Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
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
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Subscription
                </Button>
              </div>
            </div>
            <SubscriptionTable 
              refreshKey={subscriptionRefreshKey}
              onCustomerSubscriptionUpdate={handleCustomerSubscriptionUpdate}
            />
          </div>
        </TabsContent>

        <TabsContent value="qr-codes">
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">QR Codes</h2>
              <Button
                onClick={() => setGenerateQrDialogOpen(true)}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Codes
              </Button>
            </div>
            <QrCodeTable refreshKey={qrCodeRefreshKey} />
          </div>
        </TabsContent>

        <TabsContent value="customer-sub">
          <div className="mt-6">
            <CustomerSubscriptionTable refreshKey={customerSubscriptionRefreshKey} />
          </div>
        </TabsContent>
      </Tabs>

      <CreateSubscriptionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSubscriptionCreated}
      />

      <GenerateQrDialog
        open={generateQrDialogOpen}
        onOpenChange={setGenerateQrDialogOpen}
        onSuccess={handleQrCodeGenerated}
      />

      <RenewSubscriptionDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        onSuccess={handleCustomerSubscriptionUpdate}
      />
    </div>
  );
}
