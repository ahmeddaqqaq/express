"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BrandService,
  CustomerService,
  CarService,
  CustomerResponse,
  BrandResponse,
} from "../../../../../client";
import { FiUser, FiPlus, FiArrowLeft, FiChevronDown } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import Link from "next/link";

export default function AddCar() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerId: "",
    brandId: "",
    modelId: "",
  });
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedBrand = brands.find((b) => b.id === formData.brandId);
  const brandModels = selectedBrand?.models || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [customersRes, brandsRes] = await Promise.all([
          CustomerService.customerControllerFindMany() as unknown as CustomerResponse[],
          BrandService.brandControllerFindMany() as unknown as BrandResponse[],
        ]);

        setCustomers(customersRes);
        setBrands(brandsRes);
      } catch (err) {
        setError("Failed to load initial data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "brandId" && { modelId: "" }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await CarService.carControllerCreate({
        requestBody: {
          customerId: formData.customerId,
          brandId: formData.brandId,
          modelId: formData.modelId,
        },
      });

      router.push("/customers");
    } catch (err) {
      setError("Failed to create car. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/customers"
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FiArrowLeft className="text-gray-600" size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Add New Car</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Customer Selection */}
            <div>
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 appearance-none"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fName} {customer.lName} ({customer.mobileNumber}
                      )
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Brand Selection */}
            <div>
              <label
                htmlFor="brandId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCar className="text-gray-400" />
                </div>
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 appearance-none"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label
                htmlFor="modelId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Model <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCar className="text-gray-400" />
                </div>
                <select
                  id="modelId"
                  name="modelId"
                  value={formData.modelId}
                  onChange={handleChange}
                  required
                  disabled={!formData.brandId}
                  className={`pl-10 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 appearance-none ${
                    !formData.brandId ? "bg-gray-50 text-gray-400" : ""
                  }`}
                >
                  <option value="">
                    {formData.brandId
                      ? "Select a model"
                      : "First select a brand"}
                  </option>
                  {brandModels.map((model: any) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FiChevronDown className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Add Car
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
