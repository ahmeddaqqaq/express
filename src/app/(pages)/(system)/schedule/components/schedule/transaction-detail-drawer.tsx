import {
  FiClock,
  FiUser,
  FiPhone,
  FiSettings,
  FiUserCheck,
  FiDollarSign,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
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
import { TransactionResponse } from "../../../../../../../client";

interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionResponse | null;
  formatTime: (dateString: string) => string;
}

export function TransactionDetailsDrawer({
  isOpen,
  onOpenChange,
  transaction,
  formatTime,
}: TransactionDetailsDrawerProps) {
  if (!transaction) return null;

  return (
    <Drawer open={isOpen} direction="right" onOpenChange={onOpenChange}>
      <DrawerContent className="h-[100vh]">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader className="border-b shrink-0">
            <DrawerTitle className="text-xl font-bold flex items-center">
              Ticket Details
            </DrawerTitle>
            <DrawerDescription className="flex items-center">
              <FiClock className="mr-1" />
              Completed at {formatTime(transaction.updatedAt)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
            {/* Customer Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Customer Information
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 text-lg font-medium">
                    {transaction.customer.fName.charAt(0)}
                    {transaction.customer.lName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {transaction.customer.fName} {transaction.customer.lName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <FiPhone className="inline mr-1" />
                    {transaction.customer.mobileNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FaCar className="mr-2" />
                Vehicle Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Brand</p>
                  <p className="font-medium">{transaction.car.brand.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="font-medium">{transaction.car.model.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="font-medium">{transaction.car.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plate</p>
                  <p className="font-medium">{transaction.car.plateNumber}</p>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiSettings className="mr-2" />
                Services
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{transaction.service.name}</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {transaction.service.price}
                  </p>
                </div>

                {transaction.addOns?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Add-ons:</p>
                    <div className="space-y-2">
                      {transaction.addOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <p className="text-sm">{addOn.name}</p>
                          <p className="text-sm font-medium">{addOn.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiUserCheck className="mr-2 text-blue-500" />
                Assigned Technician
              </h3>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-medium">
                      TN
                    </span>
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Tech Name</p>
                      <p className="text-sm text-gray-500 mt-1">
                        General Technician
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiDollarSign className="mr-2" />
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-800 font-semibold">Total:</span>
                  <span className="text-green-600 font-bold">
                    {transaction.invoice.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="shrink-0 border-t">
            <div className="flex space-x-2">
              <DrawerClose asChild>
                <Button variant="default" className="flex-1">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
