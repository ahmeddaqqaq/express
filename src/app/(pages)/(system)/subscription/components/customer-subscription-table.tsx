"use client";

import { useEffect, useState } from "react";
import {
  AllCustomerSubscriptionsResponseDto,
  SubscriptionService,
} from "../../../../../../client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QRCodeSVG } from "qrcode.react";
import { CustomerRowActions } from "./customer-row-action";

interface CustomerSubscriptionTableProps {
  refreshKey?: number;
}

export default function CustomerSubscriptionTable({
  refreshKey,
}: CustomerSubscriptionTableProps) {
  const [customerSubscriptions, setCustomerSubscriptions] = useState<
    AllCustomerSubscriptionsResponseDto[]
  >([]);

  async function fetchCustomerSubscriptions() {
    try {
      const response =
        await SubscriptionService.subscriptionControllerGetAllCustomerSubscriptions();
      setCustomerSubscriptions(response);
    } catch (error) {
      console.error("Failed to fetch customer subscriptions", error);
    }
  }

  useEffect(() => {
    fetchCustomerSubscriptions();
  }, [refreshKey]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Subscriptions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>String</TableHead> */}
            <TableHead>QRCode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {customerSubscriptions.length > 0 ? (
            customerSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.customer.fullName}</TableCell>
                {/* <TableCell>{sub.qrCode || "-"}</TableCell> */}
                <TableCell>
                  {sub.qrCode ? <QRCodeSVG value={sub.id} size={100} /> : "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sub.status ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <CustomerRowActions
                    subscription={sub}
                    onSuccess={fetchCustomerSubscriptions}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
