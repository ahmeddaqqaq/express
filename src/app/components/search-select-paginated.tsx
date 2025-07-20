"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { FiCheck } from "react-icons/fi";

import { cn } from "@/lib/utils";
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
import { FormControl } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SearchSelectPaginatedOption {
  value: string;
  label: string;
}

interface SearchSelectPaginatedProps {
  options: SearchSelectPaginatedOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
}

export function SearchSelectPaginated({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  searchQuery,
  onSearchChange,
  currentPage,
  totalCount,
  itemsPerPage,
  onPageChange,
  loading = false,
  emptyMessage = "No results found.",
  disabled = false,
}: SearchSelectPaginatedProps) {
  const [open, setOpen] = React.useState(false);

  const handleSearchChange = (query: string) => {
    onSearchChange(query);
    onPageChange(1); // Reset to first page when searching
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onSearchChange(""); // Clear search when closing
      onPageChange(1); // Reset to first page
    }
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            {selectedOption?.label || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <ScrollArea className="h-64">
            <CommandGroup>
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : (
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <FiCheck
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </ScrollArea>
          
          {/* Pagination Controls */}
          {totalCount > itemsPerPage && (
            <div className="flex items-center justify-between p-2 text-sm text-gray-600 border-t">
              <span>
                Showing{" "}
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalCount)}{" "}
                of {totalCount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * itemsPerPage >= totalCount}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}