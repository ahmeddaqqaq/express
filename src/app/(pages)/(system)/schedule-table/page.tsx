"use client";

import { useEffect, useState } from "react";
import {
  TransactionManyResponse,
  TransactionResponse,
  TransactionService,
} from "../../../../../client";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEllipsisVertical } from "react-icons/fa6";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { ImageDialog } from "../schedule/components/appointments/image-dialog";
import { UploadedFile } from "../schedule/components/appointments/types";

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTransaction, setTotalTransaction] = useState(0);

  // Image dialog state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dialogImages, setDialogImages] = useState<UploadedFile[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery]);

  async function fetchTransactions() {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const take = itemsPerPage;
      const resp = (await TransactionService.transactionControllerFindMany({
        search: searchQuery || "",
        skip,
        take,
      })) as unknown as TransactionManyResponse;

      setTransactions(resp.data);
      setTotalTransaction(resp.rows);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusBadge(status: TransactionResponse.status) {
    const statusMap = {
      scheduled: {
        color: "bg-blue-100 text-blue-800",
        text: "Scheduled",
      },
      stageOne: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Stage 1",
      },
      stageTwo: {
        color: "bg-orange-100 text-orange-800",
        text: "Stage 2",
      },
      stageThree: {
        color: "bg-purple-100 text-purple-800", // Added purple color for Stage 3
        text: "Stage 3",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        text: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        text: "Cancelled",
      },
    };

    const currentStatus = statusMap[status];
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentStatus.color}`}
      >
        {currentStatus.text}
      </span>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function openTransactionDrawer(transaction: TransactionResponse) {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  }

  // Convert ImageResponse to UploadedFile format for dialog
  const convertImagesToUploadedFiles = (images: any[]): UploadedFile[] => {
    return images.map((image) => ({
      id: image.id,
      file: new File([], image.key || "image", { type: "image/jpeg" }),
      preview: image.url,
      progress: 100,
      status: "success" as const,
    }));
  };

  const handleImageClick = (imageIndex: number) => {
    if (selectedTransaction?.images && selectedTransaction.images.length > 0) {
      const uploadedFiles = convertImagesToUploadedFiles(
        selectedTransaction.images
      );
      setDialogImages(uploadedFiles);
      setCurrentImageIndex(imageIndex);
      setIsImageDialogOpen(true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalTransaction / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-2">
      <Drawer
        open={isDrawerOpen}
        direction="right"
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent className="h-screen max-w-2xl">
          {selectedTransaction && (
            <ScrollArea className="h-full p-6">
              <DrawerHeader className="px-0">
                <DrawerTitle>Ticket Details</DrawerTitle>
                <DrawerDescription>
                  Booking ID: {selectedTransaction.id}
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-6">
                {/* Customer Section */}
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p>
                        {selectedTransaction.customer?.fName}{" "}
                        {selectedTransaction.customer?.lName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile</p>
                      <p>
                        {selectedTransaction.customer?.mobileNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Section */}
                <div>
                  <h3 className="font-medium mb-2">Vehicle Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Make & Model</p>
                      <p>
                        {selectedTransaction.car?.brand?.name}{" "}
                        {selectedTransaction.car?.model?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p>{selectedTransaction.car?.year || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Plate</p>
                      <p>{selectedTransaction.car?.plateNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Service Section */}
                <div>
                  <h3 className="font-medium mb-2">Service Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Service</p>
                      <p>{selectedTransaction.service?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Add-ons</p>
                      {selectedTransaction.addOns?.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTransaction.addOns.map((addOn) => (
                            <Badge key={addOn.id} variant="outline">
                              {addOn.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p>No add-ons selected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Dates */}
                <div>
                  <h3 className="font-medium mb-2">Status & Dates</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p>{formatDate(selectedTransaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p>{formatDate(selectedTransaction.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                {selectedTransaction.images?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Images</h3>
                    <div className="flex flex-col gap-4">
                      {selectedTransaction.images.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative cursor-pointer group"
                          onClick={() => handleImageClick(index)}
                        >
                          <img
                            src={image.url}
                            alt={`Transaction image ${image.id}`}
                            className="w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DrawerContent>
      </Drawer>

      <div className="flex justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Booking</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search bookings..."
            className="pl-10 pr-4 py-2 w-64"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Car</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow
                onClick={() => openTransactionDrawer(transaction)}
                key={transaction.id}
                className="hover:bg-gray-50"
              >
                <TableCell className="font-medium hover:underline cursor-pointer">
                  {transaction.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {transaction.customer
                    ? `${transaction.customer.fName} ${transaction.customer.lName}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {transaction.car
                    ? `${transaction.car.brand.name} ${transaction.car.model.name}`
                    : "N/A"}
                </TableCell>
                <TableCell>{transaction.service?.name || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Open menu</span>
                        <FaEllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openTransactionDrawer(transaction)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => console.log("Edit", transaction.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => console.log("Delete", transaction.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No Booking Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">10</span> of{" "}
          <span className="font-medium">{transactions.length}</span> results
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isLoading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Image Dialog */}
      <ImageDialog
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        images={dialogImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
}
