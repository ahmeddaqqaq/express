"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiPlus, FiSearch } from "react-icons/fi";
import {
  BrandResponse,
  BrandService,
  ModelResponse,
  ModelService,
} from "../../../../../client";
import { Badge } from "@/components/ui/badge";

export default function VehiclesPage() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Form states
  const [brandForm, setBrandForm] = useState({
    open: false,
    name: "",
  });
  const [modelForm, setModelForm] = useState({
    open: false,
    name: "",
    brandId: "",
  });

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  async function fetchData() {
    setIsFetching(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const take = itemsPerPage;
      const brandsRes = await BrandService.brandControllerFindMany({
        search: searchQuery || "",
        skip,
        take,
      });
      const modelsRes = await ModelService.modelControllerFindMany();
      setBrands(brandsRes.data);
      setModels(modelsRes as unknown as ModelResponse[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsFetching(false);
    }
  }

  // Brand creation
  const handleBrandSubmit = async () => {
    if (!brandForm.name.trim()) return;

    setIsLoading(true);
    try {
      await BrandService.brandControllerCreate({
        requestBody: { name: brandForm.name },
      });
      await fetchData();
      setBrandForm({ open: false, name: "" });
    } catch (error) {
      console.error("Error creating brand:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Model creation
  const handleModelSubmit = async () => {
    if (!modelForm.name.trim() || !modelForm.brandId) return;

    setIsLoading(true);
    try {
      await ModelService.modelControllerCreate({
        requestBody: {
          name: modelForm.name,
          brandId: modelForm.brandId,
        },
      });
      await fetchData();
      setModelForm({ open: false, name: "", brandId: "" });
    } catch (error) {
      console.error("Error creating model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search brands..."
            className="pl-10 pr-4 py-2 w-64"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex gap-2">
          <Dialog
            open={brandForm.open}
            onOpenChange={(open) => setBrandForm({ ...brandForm, open })}
          >
            <DialogTrigger asChild>
              <Button>
                <FiPlus className="mr-2" /> Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Brand</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, name: e.target.value })
                    }
                    placeholder="Brand name"
                  />
                </div>
                <Button onClick={handleBrandSubmit} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={modelForm.open}
            onOpenChange={(open) => setModelForm({ ...modelForm, open })}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <FiPlus className="mr-2" /> Add Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Model</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input
                    value={modelForm.name}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, name: e.target.value })
                    }
                    placeholder="Model name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={modelForm.brandId}
                    onChange={(e) =>
                      setModelForm({ ...modelForm, brandId: e.target.value })
                    }
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleModelSubmit} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Model"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>{brand.name}</CardTitle>
                <CardDescription>
                  {models.filter((m) => m.brandId === brand.id).length} models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {models
                    .filter((model) => model.brandId === brand.id)
                    .map((model) => (
                      <Badge
                        key={model.id}
                        variant="outline"
                        className="px-3 py-1"
                      >
                        {model.name}
                      </Badge>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setModelForm({
                      open: true,
                      name: "",
                      brandId: brand.id,
                    })
                  }
                >
                  <FiPlus className="mr-1" /> Add Model
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
