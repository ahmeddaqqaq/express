"use client";

import { useState, useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/app/components/search-select";
import {
  BrandResponse,
  BrandService,
  CarService,
  CustomerResponse,
  CustomerService,
} from "../../../../../../client";

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

const carFormSchema = z.object({
  modelId: z.string().min(1, "Please select a model"),
  brandId: z.string().min(1, "Please select a brand"),
  plateNumber: z.string().min(3, "Please add plate number"),
  year: z.string().min(4, "Please add year"),
});

export function CarSearchField({ customers }: CarSearchFieldProps) {
  const form = useFormContext();
  const selectedCustomerId = form.watch("customerId");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResponse | null>(null);

  const carForm = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      brandId: "",
      modelId: "",
      plateNumber: "",
      year: "",
    },
  });

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await BrandService.brandControllerFindMany({});
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      setSelectedCustomer(customer as unknown as CustomerResponse);
    }
  }, [selectedCustomerId, customers]);

  const customerCars = selectedCustomerId
    ? customers
        .find((c) => c.id === selectedCustomerId)
        ?.cars.map((car) => ({
          value: car.id,
          label: `${car.brand.name} ${car.model.name}`,
        })) || []
    : [];

  async function onCarSubmit(values: z.infer<typeof carFormSchema>) {
    if (!selectedCustomer) return;

    try {
      await CarService.carControllerCreate({
        requestBody: {
          brandId: values.brandId,
          modelId: values.modelId,
          plateNumber: values.plateNumber,
          year: values.year,
          customerId: selectedCustomer.id,
        },
      });

      // Refresh the parent form's car list
      const updatedCustomers = await CustomerService.customerControllerFindMany(
        {}
      );
      const updatedCustomer = updatedCustomers.data.find(
        (c) => c.id === selectedCustomer.id
      );

      if (updatedCustomer) {
        // Update the parent form with the new car if needed
        const newCar = updatedCustomer.cars[updatedCustomer.cars.length - 1];
        form.setValue("carId", newCar.id);
      }

      setIsDialogOpen(false);
      carForm.reset();
    } catch (error) {
      console.error("Error creating car:", error);
    }
  }

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
              open={isSelectOpen}
              onOpenChange={setIsSelectOpen}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Car</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Form {...carForm}>
              <form
                onSubmit={carForm.handleSubmit(onCarSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={carForm.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <SearchSelect
                        options={brands.map((brand) => ({
                          value: brand.id,
                          label: brand.name,
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          carForm.setValue("modelId", "");
                        }}
                        placeholder="Select brand..."
                        searchPlaceholder="Search brands..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="modelId"
                  render={({ field }) => {
                    const selectedBrandId = carForm.watch("brandId");
                    const models =
                      brands
                        .find((b) => b.id === selectedBrandId)
                        ?.models.map((m) => ({
                          value: m.id,
                          label: m.name,
                        })) || [];

                    return (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <SearchSelect
                          options={models}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={
                            selectedBrandId
                              ? "Select model..."
                              : "Select a brand first"
                          }
                          searchPlaceholder="Search models..."
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={carForm.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plate Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Plate Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={carForm.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Car</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
