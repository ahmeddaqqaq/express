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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import {
  BrandResponse,
  BrandService,
  CarType,
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
  const [itemsPerPage] = useState(200);

  // Form states
  const [brandForm, setBrandForm] = useState({
    open: false,
    name: "",
  });
  const [modelForm, setModelForm] = useState({
    open: false,
    name: "",
    brandId: "",
    type: "Sedan" as CarType,
  });

  // Edit and delete states
  const [editModel, setEditModel] = useState<{
    open: boolean;
    model: ModelResponse | null;
    name: string;
    type: CarType;
  }>({
    open: false,
    model: null,
    name: "",
    type: "Sedan" as CarType,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    model: ModelResponse | null;
  }>({
    open: false,
    model: null,
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
          type: modelForm.type,
        },
      });
      await fetchData();
      setModelForm({
        open: false,
        name: "",
        brandId: "",
        type: "Sedan" as CarType,
      });
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

  // Edit model functionality
  const handleEditModel = (model: ModelResponse) => {
    setEditModel({
      open: true,
      model: model,
      name: model.name,
      type: (model as any).type || "Sedan",
    });
  };

  const handleUpdateModel = async () => {
    if (!editModel.model || !editModel.name.trim()) return;

    setIsLoading(true);
    try {
      await ModelService.modelControllerUpdate({
        id: editModel.model.id,
        requestBody: {
          name: editModel.name,
          brandId: editModel.model.brandId,
          type: editModel.type,
        },
      });
      await fetchData();
      setEditModel({
        open: false,
        model: null,
        name: "",
        type: "Sedan" as CarType,
      });
    } catch (error) {
      console.error("Error updating model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete model functionality
  const handleDeleteModel = (model: ModelResponse) => {
    setDeleteConfirm({
      open: true,
      model: model,
    });
  };

  const confirmDeleteModel = async () => {
    if (!deleteConfirm.model) return;

    setIsLoading(true);
    try {
      await ModelService.modelControllerDelete({
        id: deleteConfirm.model.id,
      });
      await fetchData();
      setDeleteConfirm({
        open: false,
        model: null,
      });
    } catch (error: any) {
      console.error("Error deleting model:", error);
      if (error.body?.error) {
        alert(error.body.error);
      } else {
        alert("Failed to delete model. It might be in use by existing cars.");
      }
    } finally {
      setIsLoading(false);
    }
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
                <div className="space-y-2">
                  <Label>Car Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={modelForm.type}
                    onChange={(e) =>
                      setModelForm({
                        ...modelForm,
                        type: e.target.value as CarType,
                      })
                    }
                  >
                    <option value="Bike">Bike</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Crossover">Crossover</option>
                    <option value="SUV">SUV</option>
                    <option value="VAN">VAN</option>
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
                      <DropdownMenu key={model.id}>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="outline"
                            className="px-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {model.name} ({(model as any).type || "N/A"})
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleEditModel(model)}
                            className="cursor-pointer"
                          >
                            <FiEdit className="mr-2 h-4 w-4" />
                            Edit Model
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteModel(model)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <FiTrash2 className="mr-2 h-4 w-4" />
                            Delete Model
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                      type: "Sedan" as CarType,
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

      {/* Edit Model Dialog */}
      <Dialog
        open={editModel.open}
        onOpenChange={(open) => setEditModel({ ...editModel, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                value={editModel.name}
                onChange={(e) =>
                  setEditModel({ ...editModel, name: e.target.value })
                }
                placeholder="Model name"
              />
            </div>
            <div className="space-y-2">
              <Label>Car Type</Label>
              <select
                className="w-full p-2 border rounded"
                value={editModel.type}
                onChange={(e) =>
                  setEditModel({
                    ...editModel,
                    type: e.target.value as CarType,
                  })
                }
              >
                <option value="Bike">Bike</option>
                <option value="Sedan">Sedan</option>
                <option value="Crossover">Crossover</option>
                <option value="SUV">SUV</option>
                <option value="VAN">VAN</option>
              </select>
            </div>
            <Button onClick={handleUpdateModel} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Model"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the model "
              {deleteConfirm.model?.name}"? This action cannot be undone. The
              model can only be deleted if it's not being used by any cars.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteModel}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
