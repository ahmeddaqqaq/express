"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useFormContext } from "react-hook-form";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface AddOnsFieldProps {
  addOns: AddOn[];
}

export function AddOnsField({ addOns }: AddOnsFieldProps) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="addOnsIds"
      render={({ field }) => {
        const selectedAddOns: AddOn[] = (field.value as string[] || [])
          .map((id: string) => addOns.find((addOn: AddOn) => addOn.id === id))
          .filter((addOn): addOn is AddOn => addOn !== undefined);

        const removeAddOn = (addOnId: string) => {
          field.onChange(
            (field.value as string[] || []).filter(
              (value: string) => value !== addOnId
            )
          );
        };

        const toggleAddOn = (addOnId: string) => {
          const currentValues = field.value as string[] || [];
          const isSelected = currentValues.includes(addOnId);
          
          if (isSelected) {
            field.onChange(currentValues.filter((id: string) => id !== addOnId));
          } else {
            field.onChange([...currentValues, addOnId]);
          }
        };

        return (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Add-Ons (Optional)</FormLabel>
              <FormDescription>
                Select additional services for this booking
              </FormDescription>
            </div>
            
            {/* Selected Add-Ons Display */}
            {selectedAddOns.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedAddOns.map((addOn: AddOn) => (
                  <Badge
                    key={addOn.id}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {addOn.name} (${addOn.price})
                    <span
                      className="ml-1 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        removeAddOn(addOn.id);
                      }}
                    >
                      <FiX className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    <span className="text-muted-foreground">
                      {selectedAddOns.length === 0 
                        ? "Select add-ons..." 
                        : `${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? 's' : ''} selected`
                      }
                    </span>
                    <FiChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search add-ons..." className="h-9" />
                  <CommandEmpty>No add-ons found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {addOns.map((addOn: AddOn) => {
                      const isSelected = (field.value as string[] || []).includes(addOn.id);
                      return (
                        <CommandItem
                          key={addOn.id}
                          value={addOn.name}
                          onSelect={() => toggleAddOn(addOn.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{addOn.name} (${addOn.price})</span>
                            <FiCheck
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}