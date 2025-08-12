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
import { SupervisorResponse } from "../../../../../../client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SupervisorSearchFieldProps {
  supervisors: SupervisorResponse[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function SupervisorSearchField({
  supervisors,
  searchQuery,
  onSearchChange,
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
  label = "Supervisor",
}: SupervisorSearchFieldProps) {
  const [open, setOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div>
      <FormField
        name="supervisorId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
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
                        ? supervisors.find(
                            (supervisor) => supervisor.id === field.value
                          )?.firstName +
                          " " +
                          supervisors.find(
                            (supervisor) => supervisor.id === field.value
                          )?.lastName
                        : `Select ${label.toLowerCase()}...`}
                    </span>
                    <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search supervisors..."
                    className="h-9"
                    value={searchQuery}
                    onValueChange={onSearchChange}
                  />
                  <CommandEmpty>No supervisors found.</CommandEmpty>
                  <ScrollArea className="h-64">
                    <CommandGroup>
                      {supervisors.map((supervisor) => (
                        <CommandItem
                          key={supervisor.id}
                          value={supervisor.id}
                          onSelect={() => {
                            field.onChange(supervisor.id);
                            setOpen(false);
                          }}
                        >
                          {supervisor.firstName} {supervisor.lastName}
                          <FiCheck
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === supervisor.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
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
