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
import { SearchSelectPaginated } from "@/app/components/search-select-paginated";
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
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [brandCurrentPage, setBrandCurrentPage] = useState(1);
  const [brandTotalCount, setBrandTotalCount] = useState(0);
  const brandItemsPerPage = 10;
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [modelCurrentPage, setModelCurrentPage] = useState(1);
  const [modelTotalCount, setModelTotalCount] = useState(0);
  const modelItemsPerPage = 10;
  const [models, setModels] = useState<any[]>([]);
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

  const fetchBrands = async () => {
    try {
      const skip = (brandCurrentPage - 1) * brandItemsPerPage;
      const response = await BrandService.brandControllerFindMany({
        search: brandSearchQuery || "",
        skip,
        take: brandItemsPerPage,
      });
      setBrands(response.data);
      setBrandTotalCount(response.rows || response.data.length);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchModels = async (brandId: string) => {
    if (!brandId) {
      setModels([]);
      setModelTotalCount(0);
      return;
    }

    // Use brand models with client-side search and pagination
    const selectedBrand = brands.find(b => b.id === brandId);
    if (selectedBrand?.models) {
      // Filter models based on search query
      const filteredModels = selectedBrand.models.filter(model => 
        !modelSearchQuery || model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
      );

      // Apply pagination
      const skip = (modelCurrentPage - 1) * modelItemsPerPage;
      const paginatedModels = filteredModels.slice(skip, skip + modelItemsPerPage);
      
      setModels(paginatedModels);
      setModelTotalCount(filteredModels.length);
    } else {
      setModels([]);
      setModelTotalCount(0);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [brandSearchQuery, brandCurrentPage]);

  useEffect(() => {
    const selectedBrandId = carForm.watch("brandId");
    if (selectedBrandId) {
      fetchModels(selectedBrandId);
    }
  }, [carForm.watch("brandId"), modelSearchQuery, modelCurrentPage, brands]);

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
                      <SearchSelectPaginated
                        options={brands.map((brand) => ({
                          value: brand.id,
                          label: brand.name,
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          carForm.setValue("modelId", "");
                          setBrandCurrentPage(1);
                          setModelSearchQuery("");
                          setModelCurrentPage(1);
                        }}
                        placeholder="Select brand..."
                        searchPlaceholder="Search brands..."
                        searchQuery={brandSearchQuery}
                        onSearchChange={setBrandSearchQuery}
                        currentPage={brandCurrentPage}
                        totalCount={brandTotalCount}
                        itemsPerPage={brandItemsPerPage}
                        onPageChange={setBrandCurrentPage}
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

                    return (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <SearchSelectPaginated
                          options={models.map((m) => ({
                            value: m.id,
                            label: m.name,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={
                            selectedBrandId
                              ? "Select model..."
                              : "Select a brand first"
                          }
                          searchPlaceholder="Search models..."
                          searchQuery={modelSearchQuery}
                          onSearchChange={setModelSearchQuery}
                          currentPage={modelCurrentPage}
                          totalCount={modelTotalCount}
                          itemsPerPage={modelItemsPerPage}
                          onPageChange={setModelCurrentPage}
                          disabled={!selectedBrandId}
                          emptyMessage={!selectedBrandId ? "Select a brand first" : "No models found."}
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
