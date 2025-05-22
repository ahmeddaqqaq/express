"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface CarSearchFieldProps {
  customers: Array<{
    id: string;
    cars: Array<{
      id: string;
      brand: { name: string };
      model: { name: string };
    }>;
  }>;
}

export function CarSearchField({ customers }: CarSearchFieldProps) {
  const form = useFormContext();
  const selectedCustomerId = form.watch("customerId");

  const customerCars = selectedCustomerId
    ? customers
        .find((c) => c.id === selectedCustomerId)
        ?.cars.map((car) => ({
          value: car.id,
          label: `${car.brand.name} ${car.model.name}`,
        })) || []
    : [];

  return (
    <div className="w-full">
      <FormField
        control={form.control}
        name="carId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Car</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!selectedCustomerId}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCustomerId
                        ? "Select car..."
                        : "Select a customer first"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {customerCars.map((car) => (
                  <SelectItem key={car.value} value={car.value}>
                    {car.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
