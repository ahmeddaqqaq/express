"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { ServicePriceDto, ServiceService } from "../../../../../../client";

enum carType {
  Bike = "Bike",
  Sedan = "Sedan",
  Crossover = "Crossover",
  SUV = "SUV",
  VAN = "VAN",
}

interface Service {
  id: string;
  name: string;
  prices: {
    carType: string;
    price: number;
  }[];
}

export default function ServicesTab() {
  const carTypes = Object.values(carType);

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    prices: carTypes.map((type) => ({ carType: type, price: 0 })),
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsFetching(true);
    try {
      const resp = await ServiceService.serviceControllerFindMany();
      if (Array.isArray(resp)) {
        setServices(
          resp.map((service) => ({
            id: service.id,
            name: service.name,
            prices: service.prices ?? [],
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewService((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePriceChange = (index: number, value: number) => {
    const updatedPrices = [...newService.prices];
    updatedPrices[index].price = value;
    setNewService((prev) => ({ ...prev, prices: updatedPrices }));
  };

  const createService = async () => {
    if (!newService.name.trim()) return;

    const validPrices = newService.prices.filter((p) => p.price > 0);
    if (validPrices.length === 0) return;

    setIsLoading(true);
    try {
      await ServiceService.serviceControllerCreate({
        requestBody: {
          name: newService.name,
          prices: newService.prices as unknown as ServicePriceDto[],
        },
      });

      await fetchServices();
      setNewService({
        name: "",
        prices: carTypes.map((type) => ({ carType: type, price: 0 })),
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Services</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new service
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newService.name}
                  onChange={handleNameChange}
                  placeholder="Service name"
                />
              </div>

              {newService.prices.map((item, index) => (
                <div className="space-y-2" key={item.carType}>
                  <Label htmlFor={`price-${item.carType}`}>
                    {item.carType} Price *
                  </Label>
                  <Input
                    id={`price-${item.carType}`}
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handlePriceChange(index, Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                    placeholder={`Price for ${item.carType}`}
                  />
                </div>
              ))}

              <Button onClick={createService} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No services found</div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                {carTypes.map((type) => (
                  <TableHead key={type}>{type} Price</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  {carTypes.map((type) => {
                    const found = service.prices.find(
                      (p) => p.carType === type
                    );
                    return (
                      <TableCell key={type}>
                        {found ? `$${found.price.toFixed(2)}` : "-"}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FiTrash2 className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
