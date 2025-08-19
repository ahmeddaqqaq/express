import {
  FiClock,
  FiUser,
  FiPhone,
  FiSettings,
  FiUserCheck,
  FiDollarSign,
  FiImage,
  FiTruck,
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
import { PhaseImagesDisplay } from "../appointments/phase-images-display";

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
            <DrawerDescription className="flex flex-col gap-2">
              <div className="flex items-center">
                <FiClock className="mr-1" />
                Completed at {formatTime(transaction.updatedAt)}
              </div>
              {/* Transaction Status */}
              <div className="flex flex-wrap gap-2">
                {transaction.isPaid && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                    <FiDollarSign className="mr-1 h-3 w-3" />
                    PAID
                  </span>
                )}
                {transaction.isPulled && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center">
                    <FiTruck className="mr-1 h-3 w-3" />
                    PULLED
                  </span>
                )}
              </div>
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
                    {transaction.service.prices?.find(
                      (p) => p.carType === transaction.car.model.carType
                    )?.price ?? "N/A"}
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

            {/* Phase Technician Assignments */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiUserCheck className="mr-2 text-blue-500" />
                Phase Technician Assignments
              </h3>

              <div className="space-y-3">
                {transaction.assignments && transaction.assignments.length > 0 ? (
                  transaction.assignments
                    .filter(assignment => assignment.isActive)
                    .map((assignment) => {
                      const phaseLabels = {
                        scheduled: 'Scheduled',
                        stageOne: 'Phase 1',
                        stageTwo: 'Phase 2',
                        stageThree: 'Phase 3',
                        completed: 'Completed'
                      };
                      
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                {assignment.technician?.fName?.charAt(0)}
                                {assignment.technician?.lName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {assignment.technician?.fName} {assignment.technician?.lName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {phaseLabels[assignment.phase as keyof typeof phaseLabels] || assignment.phase}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {assignment.assignedAt && new Date(assignment.assignedAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-gray-500 text-sm">No technicians assigned</p>
                )}
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

            {/* Phase Images */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <FiImage className="mr-2" />
                Phase Images
              </h3>
              <PhaseImagesDisplay appointment={transaction} />
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
