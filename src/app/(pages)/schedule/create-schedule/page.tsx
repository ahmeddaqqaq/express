// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   TransactionService,
//   CustomerService,
//   CustomerResponse,
// } from "../../../../../client";
// import { FiUser, FiCalendar, FiArrowLeft, FiSave } from "react-icons/fi";
// import { FaCar } from "react-icons/fa";
// import Link from "next/link";
// import { useNotification } from "@/app/providers/notification/hook";

// export default function CreateSchedule() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     customerId: "",
//     carId: "",
//     scheduledDate: "",
//     // scheduledTime: "",
//   });
//   const [customers, setCustomers] = useState<CustomerResponse[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   // Get the selected customer's cars
//   const selectedCustomer = customers.find((c) => c.id === formData.customerId);
//   const customerCars = selectedCustomer?.cars || [];

//   const { showNotification } = useNotification();

//   // Fetch customers on mount
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         setIsLoading(true);
//         const customersRes =
//           (await CustomerService.customerControllerFindMany()) as unknown as CustomerResponse[];
//         setCustomers(customersRes);
//       } catch (err) {
//         setError("Failed to load customers. Please try again.");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//       // Reset car when customer changes
//       ...(name === "customerId" && { carId: "" }),
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");

//     try {
//       await TransactionService.transactionControllerCreate({
//         requestBody: {
//           customerId: formData.customerId,
//           carId: formData.carId,
//         },
//       });

//       router.push("/schedule");
//     } catch (err) {
//       setError("Failed to create schedule. Please try again.");
//       console.error(err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center">
//           <Link
//             href="/schedule"
//             className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
//           >
//             <FiArrowLeft className="text-gray-600" size={20} />
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-800">
//             Create New Schedule
//           </h1>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
//           {error}
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <form onSubmit={handleSubmit}>
//           <div className="p-6 space-y-6">
//             {/* Customer Selection */}
//             <div>
//               <label
//                 htmlFor="customerId"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Customer <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiUser className="text-gray-400" />
//                 </div>
//                 <select
//                   id="customerId"
//                   name="customerId"
//                   value={formData.customerId}
//                   onChange={handleChange}
//                   required
//                   className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
//                 >
//                   <option value="">Select a customer</option>
//                   {customers.map((customer) => (
//                     <option key={customer.id} value={customer.id}>
//                       {customer.fName} {customer.lName} ({customer.mobileNumber}
//                       )
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Car Selection */}
//             <div>
//               <label
//                 htmlFor="carId"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Car <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaCar className="text-gray-400" />
//                 </div>
//                 <select
//                   id="carId"
//                   name="carId"
//                   value={formData.carId}
//                   onChange={handleChange}
//                   required
//                   disabled={!formData.customerId || customerCars.length === 0}
//                   className={`pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 ${
//                     !formData.customerId || customerCars.length === 0
//                       ? "bg-gray-50"
//                       : ""
//                   }`}
//                 >
//                   <option value="">
//                     {!formData.customerId
//                       ? "Select a customer first"
//                       : customerCars.length === 0
//                       ? "No cars available for this customer"
//                       : "Select a car"}
//                   </option>
//                   {customerCars.map((car: any) => (
//                     <option key={car.id} value={car.id}>
//                       {car.brand?.name} {car.model?.name} (
//                       {car.plateNumber || "No plate"})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Date and Time Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label
//                   htmlFor="scheduledDate"
//                   className="block text-sm font-medium text-gray-700 mb-2"
//                 >
//                   Date
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiCalendar className="text-gray-400" />
//                   </div>
//                   <input
//                     type="date"
//                     id="scheduledDate"
//                     name="scheduledDate"
//                     value={formData.scheduledDate}
//                     onChange={handleChange}
//                     min={new Date().toISOString().split("T")[0]}
//                     className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
//                   />
//                 </div>
//               </div>

//               {/* <div>
//                 <label
//                   htmlFor="scheduledTime"
//                   className="block text-sm font-medium text-gray-700 mb-2"
//                 >
//                   Time
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FiCalendar className="text-gray-400" />
//                   </div>
//                   <input
//                     type="time"
//                     id="scheduledTime"
//                     name="scheduledTime"
//                     value={formData.scheduledTime}
//                     onChange={handleChange}
//                     className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
//                   />
//                 </div>
//               </div> */}
//             </div>
//           </div>

//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
//             {/* <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium ${
//                 isSubmitting
//                   ? "bg-indigo-400 cursor-not-allowed"
//                   : "bg-indigo-600 hover:bg-indigo-700"
//               } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
//             >
//               <FiSave className="mr-2" />
//               {isSubmitting ? "Creating..." : "Create Schedule"}
//             </button> */}
//             <button
//               onClick={() =>
//                 showNotification({
//                   id: "1",
//                   status: "success",
//                   title: "Hello",
//                 })
//               }
//             >
//               <FiSave className="mr-2" />
//               hello
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
