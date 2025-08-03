"use client";

import { useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CustomerResponse } from "../../../../../../client";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [open, setOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div>
      <FormField
        name="customerId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Customer</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span>
                      {field.value
                        ? customers.find(
                            (customer) => customer.id === field.value
                          )?.fName +
                          " " +
                          customers.find(
                            (customer) => customer.id === field.value
                          )?.lName +
                          " (" +
                          customers.find(
                            (customer) => customer.id === field.value
                          )?.mobileNumber +
                          ")"
                        : "Select customer..."}
                    </span>
                    <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search customers..."
                    className="h-9"
                    value={searchQuery}
                    onValueChange={onSearchChange}
                  />
                  <CommandEmpty>No customers found.</CommandEmpty>
                  <ScrollArea className="h-64">
                    <CommandGroup>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.id}
                          onSelect={() => {
                            field.onChange(customer.id);
                            setOpen(false);
                          }}
                          className={customer.isBlacklisted ? "bg-red-50 border-l-4 border-l-red-500" : ""}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span>
                                {customer.fName} {customer.lName} ({customer.mobileNumber})
                              </span>
                              {customer.isBlacklisted && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                  BLACKLISTED
                                </span>
                              )}
                            </div>
                            <FiCheck
                              className={cn(
                                "h-4 w-4",
                                field.value === customer.id
                                  ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                  {/* Pagination controls */}
                  <div className="flex items-center justify-between p-2 text-sm text-gray-600 border-t">
                    <span>
                      Showing {startItem}-{endItem} of {totalCount}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
