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
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import {
  ModelResponse,
  ModelService,
  BrandResponse,
  BrandService,
} from "../../../../../../client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ModelsTab() {
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelResponse | null>(
    null
  );
  const [newModel, setNewModel] = useState({
    name: "",
    brandId: "",
  });

  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const resp = await BrandService.brandControllerFindMany({});
      setBrands(resp as unknown as BrandResponse[]);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const fetchModels = async () => {
    setIsFetching(true);
    try {
      const resp = await ModelService.modelControllerFindMany();
      setModels(resp as unknown as ModelResponse[]);
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewModel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setNewModel({
      name: "",
      brandId: "",
    });
    setSelectedModel(null);
  };

  const handleSubmit = async () => {
    if (!newModel.name.trim() || !newModel.brandId) {
      return;
    }

    setIsLoading(true);
    try {
      // Create new model
      await ModelService.modelControllerCreate({
        requestBody: {
          name: newModel.name,
          brandId: newModel.brandId,
        },
      });
      await fetchModels();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (model: ModelResponse) => {
    setSelectedModel(model);
    setNewModel({
      name: model.name,
      brandId: model.brandId,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Car Models</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <FiPlus className="mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedModel ? "Edit Model" : "Add New Model"}
              </DialogTitle>
              <DialogDescription>
                {selectedModel
                  ? "Update the model details"
                  : "Enter the model details"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newModel.name}
                  onChange={handleInputChange}
                  placeholder="Model name"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand *</Label>
                <Select
                  value={newModel.brandId}
                  onValueChange={(value) =>
                    setNewModel((prev) => ({ ...prev, brandId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                  ? selectedModel
                    ? "Updating..."
                    : "Creating..."
                  : selectedModel
                  ? "Update Model"
                  : "Create Model"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No models found</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    {brands.find((b) => b.id === model.brandId)?.name ||
                      "Unknown"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(model)}
                      >
                        <FiEdit className="text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 className="text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModel?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
