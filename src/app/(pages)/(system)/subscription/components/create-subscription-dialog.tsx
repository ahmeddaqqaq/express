"use client";

import { useEffect, useState } from "react";
import {
  ServiceResponse,
  ServiceService,
  SubscriptionService,
  CreateSubscriptionDto,
  SubscriptionServiceDto,
  SubscriptionPriceDto,
} from "../../../../../../client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateSubscriptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSubscriptionDialogProps) {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [availableServices, setAvailableServices] = useState<ServiceResponse[]>(
    []
  );

  // Form data matching exact DTO structure
  const [formData, setFormData] = useState<CreateSubscriptionDto>({
    name: "",
    description: undefined,
    endDate: undefined,
    maxUsesPerService: undefined,
    services: [],
    prices: [],
  });

  // Fetch available services
  const fetchServices = async () => {
    try {
      const response = await ServiceService.serviceControllerFindMany();
      setAvailableServices(response as unknown as ServiceResponse[]);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services. Please try again.");
    }
  };

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  // Reset form when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: undefined,
        endDate: undefined,
        maxUsesPerService: undefined,
        services: [],
        prices: [],
      });
      setError("");
      setSuccess(false);
    }
    onOpenChange(isOpen);
  };

  // Handle basic field changes
  const handleFieldChange = (
    field: keyof CreateSubscriptionDto,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // Service management
  const toggleService = (service: ServiceResponse, isSelected: boolean) => {
    if (isSelected) {
      const newService: SubscriptionServiceDto = {
        serviceId: service.id,
        usageCount: 1,
      };
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newService],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s.serviceId !== service.id),
      }));
    }
  };

  const updateServiceUsage = (serviceId: string, usageCount: number) => {
    if (usageCount < 1) return;
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.serviceId === serviceId ? { ...s, usageCount } : s
      ),
    }));
  };

  // Price management
  const updatePrice = (
    carType: SubscriptionPriceDto.carType,
    price: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.some((p) => p.carType === carType)
        ? prev.prices.map((p) => (p.carType === carType ? { ...p, price } : p))
        : [...prev.prices, { carType, price, posServiceId: 0 }],
    }));
  };

  const updatePosServiceId = (
    carType: SubscriptionPriceDto.carType,
    posServiceId: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.some((p) => p.carType === carType)
        ? prev.prices.map((p) =>
            p.carType === carType ? { ...p, posServiceId } : p
          )
        : [...prev.prices, { carType, price: 0, posServiceId }],
    }));
  };

  const getPriceForCarType = (
    carType: SubscriptionPriceDto.carType
  ): number => {
    const price = formData.prices.find((p) => p.carType === carType);
    return price?.price ?? 0;
  };

  const getPosServiceIdForCarType = (
    carType: SubscriptionPriceDto.carType
  ): number => {
    const price = formData.prices.find((p) => p.carType === carType);
    return price?.posServiceId ?? 0;
  };

  // Validation
  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Subscription name is required";
    }

    if (formData.services.length === 0) {
      return "At least one service must be selected";
    }

    if (formData.prices.length === 0) {
      return "At least one price must be specified";
    }

    // Validate service usage counts
    const invalidService = formData.services.find((s) => s.usageCount < 1);
    if (invalidService) {
      return "All services must have usage count of at least 1";
    }

    // Validate prices
    const invalidPrice = formData.prices.find((p) => p.price < 0);
    if (invalidPrice) {
      return "All prices must be non-negative";
    }

    // Check if at least one price is set (> 0)
    const hasValidPrice = formData.prices.some((p) => p.price > 0);
    if (!hasValidPrice) {
      return "At least one car type must have a price greater than 0";
    }

    // Validate posServiceId for prices > 0
    const invalidPosServiceId = formData.prices.find(
      (p) => p.price > 0 && (!p.posServiceId || p.posServiceId <= 0)
    );
    if (invalidPosServiceId) {
      return "POS Service ID is required for all car types with prices greater than 0";
    }

    return null;
  };

  // Submit handler
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare data exactly as per DTO - only include prices > 0
      const requestData: CreateSubscriptionDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        endDate: formData.endDate || undefined,
        maxUsesPerService: formData.maxUsesPerService || undefined,
        services: formData.services.map((s) => ({
          serviceId: s.serviceId,
          usageCount: s.usageCount,
        })),
        prices: formData.prices
          .filter((p) => p.price > 0)
          .map((p) => ({
            carType: p.carType,
            price: Number(p.price),
            posServiceId: Number(p.posServiceId),
          })),
      };

      await SubscriptionService.subscriptionControllerCreate({
        requestBody: requestData,
      });

      setSuccess(true);
      setTimeout(() => {
        handleOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (error: any) {
      console.error("Create subscription failed:", error);

      let errorMessage = "Failed to create subscription";
      if (error?.body?.message) {
        errorMessage = error.body.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-5xl max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-xl">
            {success ? "Subscription Created!" : "Create New Subscription"}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-base text-muted-foreground">
                "{formData.name}" created successfully
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {error && (
              <div className="flex-shrink-0 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm mb-4">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
              {/* Basic Info */}
              <div className="col-span-4 space-y-3">
                <h3 className="text-base font-medium">Basic Information</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Subscription Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Premium Car Wash"
                      value={formData.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this subscription includes..."
                      value={formData.description ?? ""}
                      onChange={(e) =>
                        handleFieldChange(
                          "description",
                          e.target.value || undefined
                        )
                      }
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="col-span-4 flex flex-col min-h-0">
                <h3 className="text-base font-medium mb-3">
                  Services Included *
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {availableServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Loading...
                    </p>
                  ) : (
                    availableServices.map((service) => {
                      const isSelected = formData.services.some(
                        (s) => s.serviceId === service.id
                      );
                      const selectedService = formData.services.find(
                        (s) => s.serviceId === service.id
                      );

                      return (
                        <div
                          key={service.id}
                          className="flex items-center gap-3 text-sm p-2 border rounded"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              toggleService(service, checked as boolean)
                            }
                            className="h-4 w-4"
                          />
                          <span className="flex-1">{service.name}</span>
                          {isSelected && (
                            <div className="flex items-center gap-1">
                              <Label className="text-xs">Usage:</Label>
                              <Input
                                type="text"
                                className="w-12 h-7 text-sm text-center"
                                value={selectedService?.usageCount ?? 1}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const parsed = parseInt(value, 10);
                                  if (!isNaN(parsed) && parsed > 0) {
                                    updateServiceUsage(service.id, parsed);
                                  } else if (value === "") {
                                    updateServiceUsage(service.id, 1);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="col-span-4">
                <h3 className="text-base font-medium mb-3">Pricing *</h3>
                <div className="space-y-2">
                  {Object.values(SubscriptionPriceDto.carType).map(
                    (carType) => (
                      <div
                        key={carType}
                        className="flex items-center gap-2 text-sm p-2 border rounded"
                      >
                        <Label className="w-24 font-medium text-sm">
                          {carType}
                        </Label>
                        <Input
                          type="text"
                          placeholder="Price"
                          value={getPriceForCarType(carType) || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              updatePrice(carType, 0);
                            } else {
                              const parsed = parseFloat(value);
                              if (!isNaN(parsed) && parsed >= 0) {
                                updatePrice(carType, parsed);
                              }
                            }
                          }}
                          className="h-7 text-sm flex-1"
                        />
                        <Input
                          type="text"
                          placeholder="POS ID"
                          value={getPosServiceIdForCarType(carType) || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              updatePosServiceId(carType, 0);
                            } else {
                              const parsed = parseInt(value);
                              if (!isNaN(parsed) && parsed >= 0) {
                                updatePosServiceId(carType, parsed);
                              }
                            }
                          }}
                          className="h-7 text-sm flex-1"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          {!success && (
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.name.trim() ||
                formData.services.length === 0 ||
                !formData.prices.some((p) => p.price > 0)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subscription"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
