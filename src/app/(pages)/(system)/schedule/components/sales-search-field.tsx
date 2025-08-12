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
import { ScrollArea } from "@/components/ui/scroll-area";
import { SalesResponse } from "../../../../../../client";

interface SalesSearchFieldProps {
  sales: SalesResponse[];
  fieldName: string;
  label?: string;
  placeholder?: string;
}

export function SalesSearchField({
  sales,
  fieldName,
  label = "Sales Person",
  placeholder = "Select sales person...",
}: SalesSearchFieldProps) {
  const [open, setOpen] = useState(false);

  // Filter only active sales persons
  const activeSales = sales.filter(s => s.isActive);

  return (
    <FormField
      name={fieldName}
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
                      ? activeSales.find((salesPerson) => salesPerson.id === field.value)
                          ?.firstName +
                        " " +
                        activeSales.find((salesPerson) => salesPerson.id === field.value)
                          ?.lastName
                      : placeholder}
                  </span>
                  <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput placeholder="Search sales persons..." className="h-9" />
                <CommandEmpty>No sales persons found.</CommandEmpty>
                <ScrollArea className="h-48">
                  <CommandGroup>
                    {/* Add option to clear selection */}
                    <CommandItem
                      value=""
                      onSelect={() => {
                        field.onChange("");
                        setOpen(false);
                      }}
                    >
                      <span className="text-gray-500">No sales person</span>
                      <FiCheck
                        className={cn(
                          "ml-auto h-4 w-4",
                          !field.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                    {activeSales.map((salesPerson) => (
                      <CommandItem
                        key={salesPerson.id}
                        value={salesPerson.id}
                        onSelect={() => {
                          field.onChange(salesPerson.id);
                          setOpen(false);
                        }}
                      >
                        {salesPerson.firstName} {salesPerson.lastName}
                        {salesPerson.mobileNumber && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({salesPerson.mobileNumber})
                          </span>
                        )}
                        <FiCheck
                          className={cn(
                            "ml-auto h-4 w-4",
                            field.value === salesPerson.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}