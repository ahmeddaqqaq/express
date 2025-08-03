"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  FiUser,
  FiPhoneCall,
  FiPackage,
  FiTool,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiImage,
  FiEye,
} from "react-icons/fi";
import { FaCar, FaIdCard } from "react-icons/fa";
import { GiCarDoor } from "react-icons/gi";
import { IoMdColorPalette } from "react-icons/io";
import {
  TransactionResponse,
  TransactionService,
  CustomerService,
} from "../../../../../../../client";
import { ImageDialog } from "./image-dialog";
import { UploadedFile } from "./types";

interface TransactionDetailDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: TransactionResponse;
}

interface PhaseImage {
  id: string;
  key: string;
  url: string;
  isActive: boolean;
  uploadedAtStage:
    | "scheduled"
    | "stageOne"
    | "stageTwo"
    | "stageThree"
    | "completed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}

type GroupedImages = Record<string, PhaseImage[]>;

export function TransactionDetailDrawer({
  isOpen,
  onOpenChange,
  appointment,
}: TransactionDetailDrawerProps) {
  const [groupedImages, setGroupedImages] = useState<GroupedImages>({});
  const [selectedImages, setSelectedImages] = useState<UploadedFile[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isTogglingBlacklist, setIsTogglingBlacklist] = useState(false);

  const phaseLabels = {
    scheduled: "Scheduled",
    stageOne: "Phase 1",
    stageTwo: "Phase 2",
    stageThree: "Phase 3",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  useEffect(() => {
    if (isOpen && appointment.id) {
      fetchGroupedImages();
    }
  }, [isOpen, appointment.id]);

  const fetchGroupedImages = async () => {
    try {
      setIsLoadingImages(true);
      const response =
        await TransactionService.transactionControllerGetTransactionImagesGrouped({
          id: appointment.id
        });
      setGroupedImages(response as GroupedImages);
    } catch (error) {
      console.error("Error fetching grouped images:", error);
      setGroupedImages({});
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleBlacklistToggle = async () => {
    setIsTogglingBlacklist(true);
    try {
      await CustomerService.customerControllerToggleBlacklist({
        requestBody: {
          id: appointment.customer.id,
        }
      });
      // The drawer doesn't have a refresh callback, so we'll just show a success message
      alert(`Customer ${appointment.customer.isBlacklisted ? 'removed from' : 'added to'} blacklist successfully. Please refresh the page to see the changes.`);
    } catch (error) {
      console.error("Error toggling blacklist:", error);
      alert("Failed to toggle blacklist status. Please try again.");
    } finally {
      setIsTogglingBlacklist(false);
    }
  };

  const openImageDialog = (images: PhaseImage[], startIndex: number) => {
    const uploadedFiles: UploadedFile[] = images.map((image, index) => ({
      id: `${image.id}-${index}`,
      file: new File([], "image.jpg"), // Placeholder file
      preview: image.url,
      progress: 100,
      status: "success" as const,
    }));

    setSelectedImages(uploadedFiles);
    setCurrentImageIndex(startIndex);
    setIsImageDialogOpen(true);
  };

  const getTotalImageCount = () => {
    return Object.values(groupedImages).reduce(
      (total, images) => total + images.length,
      0
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      scheduled: "bg-blue-100 text-blue-800",
      stageOne: "bg-purple-100 text-purple-800",
      stageTwo: "bg-orange-100 text-orange-800",
      stageThree: "bg-green-100 text-green-800",
      completed: "bg-emerald-100 text-emerald-800",
    };

    const statusLabels = {
      scheduled: "Scheduled",
      stageOne: "Phase One",
      stageTwo: "Phase Two",
      stageThree: "Phase Three",
      completed: "Completed",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  return (
    <Drawer open={isOpen} direction="right" onOpenChange={onOpenChange}>
      <DrawerContent className="h-full">
        <div className="mx-auto w-full max-w-md flex flex-col h-full">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Transaction Details</DrawerTitle>
            <DrawerDescription>
              View complete transaction information
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Transaction Header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h2 className="text-lg font-bold">
                  Transaction #{appointment.id}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(appointment.status)}
                  {appointment.isPaid && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                      <FiDollarSign className="mr-1 h-3 w-3" />
                      PAID
                    </span>
                  )}
                </div>
              </div>
              {appointment.OTP && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">OTP</p>
                  <p className="text-lg font-bold">{appointment.OTP}</p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Customer Information
              </h3>
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-lg font-medium">
                    {appointment.customer.fName.charAt(0)}
                    {appointment.customer.lName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {appointment.customer.fName} {appointment.customer.lName}
                    </h4>
                    {appointment.customer.isBlacklisted && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                        BLACKLISTED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiPhoneCall className="mr-1 h-3 w-3" />
                    {appointment.customer.mobileNumber}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${
                      appointment.customer.isBlacklisted
                        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    }`}
                    onClick={handleBlacklistToggle}
                    disabled={isTogglingBlacklist}
                  >
                    {isTogglingBlacklist 
                      ? "..." 
                      : appointment.customer.isBlacklisted 
                        ? "Remove from Blacklist" 
                        : "Add to Blacklist"
                    }
                  </Button>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaCar className="mr-2" />
                Vehicle Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaCar className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {appointment.car.brand.name} {appointment.car.model.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaIdCard className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Plate: {appointment.car.plateNumber}</span>
                </div>
                <div className="flex items-center">
                  <GiCarDoor className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Year: {appointment.car.year}</span>
                </div>
                {appointment.car.color && (
                  <div className="flex items-center">
                    <IoMdColorPalette className="mr-2 h-4 w-4 text-gray-400" />
                    <span>Color: {appointment.car.color}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiTool className="mr-2" />
                Service Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FiTool className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {appointment.service.name}
                  </span>
                </div>
                {appointment.notes && (
                  <div>
                    <div className="flex items-center mb-1">
                      <FiFileText className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Notes:</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add-Ons */}
            {appointment.addOns.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiPackage className="mr-2" />
                  Add-Ons
                </h3>
                <div className="flex flex-wrap gap-2">
                  {appointment.addOns.map((addOn) => (
                    <span
                      key={addOn.id}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {addOn.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Phase Assignments */}
            {appointment.assignments && appointment.assignments.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Phase Assignments
                </h3>
                <div className="space-y-2">
                  {appointment.assignments
                    .filter((assignment) => assignment.isActive)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {assignment.technician?.fName?.charAt(0)}
                          {assignment.technician?.lName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">
                            {assignment.technician?.fName}{" "}
                            {assignment.technician?.lName}
                          </span>
                          <div className="text-xs text-gray-500">
                            {assignment.phase === "stageOne"
                              ? "Phase One"
                              : assignment.phase === "stageTwo"
                              ? "Phase Two"
                              : assignment.phase === "stageThree"
                              ? "Phase Three"
                              : "Unknown Phase"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Supervisor Information */}
            {appointment.createdBy && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Supervisor
                </h3>
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    {appointment.createdBy.firstName?.charAt(0)}
                    {appointment.createdBy.lastName?.charAt(0)}
                  </div>
                  <span className="font-medium">
                    {appointment.createdBy.firstName}{" "}
                    {appointment.createdBy.lastName}
                  </span>
                </div>
              </div>
            )}

            {/* Timeline Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiClock className="mr-2" />
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{formatDate(appointment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{formatDate(appointment.updatedAt)}</span>
                </div>
                {appointment.deliverTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered:</span>
                    <span>{formatDate(appointment.deliverTime)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Phase Images */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiImage className="mr-2" />
                Phase Images ({getTotalImageCount()} total)
              </h3>

              {isLoadingImages ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.keys(phaseLabels).map((phase) => {
                    const images = groupedImages[phase] || [];
                    const phaseLabel =
                      phaseLabels[phase as keyof typeof phaseLabels];

                    return (
                      <div
                        key={phase}
                        className="bg-white rounded-lg p-3 border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            {phaseLabel} ({images.length} images)
                          </h4>
                        </div>

                        {images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {images.slice(0, 6).map((image, index) => (
                              <div
                                key={image.id}
                                className="relative group"
                                onClick={() => openImageDialog(images, index)}
                              >
                                <img
                                  src={image.url}
                                  alt={`${phaseLabel} image ${index + 1}`}
                                  className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center transition-all">
                                  <FiEye className="text-white opacity-0 group-hover:opacity-100 h-4 w-4" />
                                </div>
                              </div>
                            ))}
                            {images.length > 6 && (
                              <div
                                className="w-full h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => openImageDialog(images, 6)}
                              >
                                <span className="text-xs text-gray-600">
                                  +{images.length - 6} more
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic text-center py-2 text-sm">
                            No images for this phase
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>

      <ImageDialog
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        images={selectedImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </Drawer>
  );
}
