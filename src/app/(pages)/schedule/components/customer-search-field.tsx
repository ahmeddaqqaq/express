"use client";

import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerResponse } from "../../../../../client";

interface CustomerSearchFieldProps {
  customers: CustomerResponse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function CustomerSearchField({
  customers,
  searchQuery,
  onSearchChange,
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: CustomerSearchFieldProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
      onPageChange(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div>
      <FormField
        name="customerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-10"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              {/* Customer Select */}
              <div className="flex-1">
                <FormControl>
                  <select
                    {...field}
                    className="w-full p-2 border rounded-md h-[40px]"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fName} {customer.lName} (
                        {customer.mobileNumber})
                      </option>
                    ))}
                  </select>
                </FormControl>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <span>
          Showing {startItem}-{endItem} of {totalCount}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
