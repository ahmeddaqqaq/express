"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechniciansTab from "./components/technician-tab";
import ServicesTab from "./components/services-tab";
import AddOnsTab from "./components/add-ons-tab";
import SupervisorsTab from "./components/supervisors-tab";
import { SalesTab } from "./components/sales-tab";

export default function AdminSettings() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Settings</h1>

      <Tabs defaultValue="technicians" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="addOns">Add-Ons</TabsTrigger>
          <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="technicians" className="mt-6">
          <TechniciansTab />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="addOns" className="mt-6">
          <AddOnsTab />
        </TabsContent>
        <TabsContent value="supervisors" className="mt-6">
          <SupervisorsTab />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
