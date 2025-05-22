"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicianSearchFieldProps {
  technicians: Array<{
    id: string;
    fName: string;
    lName: string;
  }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TechnicianSearchField({
  technicians,
  searchQuery,
  onSearchChange,
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
}: TechnicianSearchFieldProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [open, setOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
      onPageChange(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div>
      <FormField
        name="technicianId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Technician</FormLabel>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search technicians..."
                  className="pl-10 w-full"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              {/* Multi-select Technician Dropdown */}
              <div className="flex-1">
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between overflow-hidden"
                      >
                        <span className="truncate">
                          {field.value && field.value.length > 0
                            ? field.value
                                .map((id: string) => {
                                  const tech = technicians.find(
                                    (t) => t.id === id
                                  );
                                  return tech
                                    ? `${tech.fName} ${tech.lName}`
                                    : null;
                                })
                                .filter(Boolean)
                                .join(", ")
                            : "Select technicians..."}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command className="w-full">
                        <CommandEmpty>No technicians found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {technicians?.map((technician) => (
                            <CommandItem
                              key={technician.id}
                              value={technician.id}
                              onSelect={() => {
                                const currentValue = field.value || [];
                                const newValue = currentValue.includes(
                                  technician.id
                                )
                                  ? currentValue.filter(
                                      (id: string) => id !== technician.id
                                    )
                                  : [...currentValue, technician.id];
                                field.onChange(newValue);
                              }}
                              className="flex items-center justify-between"
                            >
                              <span className="truncate">
                                {technician.fName} {technician.lName}
                              </span>
                              <Check
                                className={cn(
                                  "ml-2 h-4 w-4 flex-shrink-0",
                                  field.value?.includes(technician.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
              </div>
            </div>
            {/* Display selected badges */}
            {field.value && field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((id: string) => {
                  const tech = technicians.find((t) => t.id === id);
                  if (!tech) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1 max-w-[200px]"
                    >
                      <span className="truncate">
                        {tech.fName} {tech.lName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = field.value.filter(
                            (item: string) => item !== id
                          );
                          field.onChange(newValue);
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-gray-200 flex-shrink-0"
                      >
                        <FiX className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
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
