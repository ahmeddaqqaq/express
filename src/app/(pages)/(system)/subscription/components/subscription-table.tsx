"use client";

import { useEffect, useState } from "react";
import {
  SubscriptionResponseDto,
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
import { FiMoreHorizontal } from "react-icons/fi";
import AssignSubscriptionDialog from "./assign-subscription-dialog";

interface SubscriptionTableProps {
  refreshKey?: number;
  onCustomerSubscriptionUpdate?: () => void;
}

export default function SubscriptionTable({ refreshKey, onCustomerSubscriptionUpdate }: SubscriptionTableProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponseDto[]>(
    []
  );

  async function fetchSubscriptions() {
    try {
      const response =
        await SubscriptionService.subscriptionControllerFindAll();
      setSubscriptions(response);
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, [refreshKey]);

  return (
    <div>
      <AssignSubscriptionDialog 
        subscriptions={subscriptions} 
        onSuccess={() => {
          fetchSubscriptions();
          onCustomerSubscriptionUpdate?.();
        }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.description || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sub.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(sub.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <FiMoreHorizontal />
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
