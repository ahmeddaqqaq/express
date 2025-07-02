"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

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

  return (
    <FormField
      control={form.control}
      name="addOnsIds"
      render={({ field }) => {
        const selectedAddOnsIds = (field.value as string[]) || [];

        const toggleAddOn = (addOnId: string) => {
          const currentValues = (field.value as string[]) || [];
          const isSelected = currentValues.includes(addOnId);

          if (isSelected) {
            field.onChange(
              currentValues.filter((id: string) => id !== addOnId)
            );
          } else {
            field.onChange([...currentValues, addOnId]);
          }
        };

        return (
          <FormItem>
            <FormLabel className="text-base">Add-Ons (Optional)</FormLabel>
            <FormDescription>
              Select additional services for this booking
            </FormDescription>
            
            <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-3">
              {addOns.map((addOn: AddOn) => {
                const isSelected = selectedAddOnsIds.includes(addOn.id);
                return (
                  <div key={addOn.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                    <Checkbox
                      id={addOn.id}
                      checked={isSelected}
                      onCheckedChange={() => toggleAddOn(addOn.id)}
                    />
                    <label
                      htmlFor={addOn.id}
                      className="flex-1 text-sm font-medium leading-none cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span>{addOn.name}</span>
                        <span className="text-green-600 font-semibold">${addOn.price}</span>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
            
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
