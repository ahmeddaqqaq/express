"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

interface AddOnsFieldProps {
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export function AddOnsField({ addOns }: AddOnsFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="addOnsIds"
      render={({ field }) => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Add-Ons (Optional)</FormLabel>
            <FormDescription>
              Select additional services for this booking
            </FormDescription>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {addOns.map((addOn) => (
              <FormField
                key={addOn.id}
                control={form.control}
                name="addOnsIds"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={addOn.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(addOn.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([
                                  ...(field.value || []),
                                  addOn.id,
                                ])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: any) => value !== addOn.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {addOn.name} (${addOn.price})
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
