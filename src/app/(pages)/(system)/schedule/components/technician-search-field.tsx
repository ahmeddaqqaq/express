"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [open, setOpen] = useState(false);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div>
      <FormField
        name="technicianId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Technician</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {field.value && field.value.length > 0
                        ? field.value
                            .map((id: string) => {
                              const tech = technicians.find((t) => t.id === id);
                              return tech
                                ? `${tech.fName} ${tech.lName}`
                                : null;
                            })
                            .filter(Boolean)
                            .join(", ")
                        : "Select technician..."}
                    </span>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search technician..."
                    value={searchQuery}
                    onValueChange={onSearchChange}
                  />
                  <CommandEmpty>No technicians found.</CommandEmpty>
                  <ScrollArea className="h-64">
                    <CommandGroup>
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
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(technician.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {technician.fName} {technician.lName}
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
    </div>
  );
}
