# DataTable Component Usage Guide

## Overview
The `DataTable` component is a reusable, feature-rich table component built with shadcn/ui that provides a consistent design across the entire system.

## Features
- ✅ Search functionality
- ✅ Pagination with page info
- ✅ Row actions dropdown
- ✅ Loading states
- ✅ Empty states
- ✅ Clickable rows
- ✅ Custom cell rendering
- ✅ Header actions
- ✅ Fully typed with TypeScript

## Basic Usage

```tsx
import { DataTable, DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface Customer {
  id: string;
  fName: string;
  lName: string;
  mobileNumber: string;
  isActive: boolean;
  isBlacklisted: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Define columns
  const columns: DataTableColumn<Customer>[] = [
    {
      header: "Name",
      cell: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {row.fName.charAt(0)}
              {row.lName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.fName} {row.lName}
            </div>
            <div className="text-sm text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Mobile",
      accessorKey: "mobileNumber",
    },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Blacklist",
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.isBlacklisted
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.isBlacklisted ? "BLACKLISTED" : "Normal"}
        </span>
      ),
    },
  ];

  // Define actions
  const actions = [
    {
      label: "Edit",
      icon: <FiEdit2 className="h-4 w-4" />,
      onClick: (row: Customer) => {
        console.log("Edit customer", row);
      },
    },
    {
      label: "Delete",
      icon: <FiTrash2 className="h-4 w-4" />,
      onClick: (row: Customer) => {
        console.log("Delete customer", row);
      },
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        actions={actions}
        searchable
        searchPlaceholder="Search customers..."
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalCustomers / itemsPerPage),
          totalItems: totalCustomers,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
        isLoading={isLoading}
        emptyMessage="No customers found"
        onRowClick={(row) => {
          console.log("Row clicked", row);
        }}
        headerActions={
          <Button onClick={() => console.log("Create customer")}>
            <FiPlus className="w-4 h-4 mr-2" />
            Create Customer
          </Button>
        }
        getRowId={(row) => row.id}
      />
    </div>
  );
}
```

## Props

### DataTableColumn<T>
```typescript
{
  header: string;              // Column header text
  accessorKey?: keyof T;       // Key to access data (for simple values)
  cell?: (row: T) => ReactNode; // Custom cell renderer (overrides accessorKey)
  className?: string;           // Additional CSS classes for the column
}
```

### DataTableAction<T>
```typescript
{
  label: string;                         // Action label
  icon?: ReactNode;                      // Optional icon
  onClick: (row: T) => void;            // Click handler
  variant?: "default" | "destructive";   // Visual style (destructive = red)
  show?: (row: T) => boolean;           // Conditional visibility
}
```

### DataTableProps<T>
```typescript
{
  data: T[];                            // Array of data to display
  columns: DataTableColumn<T>[];        // Column definitions
  actions?: DataTableAction<T>[];       // Row actions
  searchable?: boolean;                 // Enable search (default: false)
  searchPlaceholder?: string;           // Search input placeholder
  onSearch?: (query: string) => void;   // Search handler
  pagination?: {                        // Pagination config
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  isLoading?: boolean;                  // Loading state
  emptyMessage?: string;                // Message when no data
  onRowClick?: (row: T) => void;        // Row click handler
  className?: string;                   // Additional CSS classes
  headerActions?: ReactNode;            // Actions to show in header
  getRowId?: (row: T) => string;        // Custom row ID getter
}
```

## Examples

### Simple Table (No Actions)
```tsx
<DataTable
  data={items}
  columns={[
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
  ]}
/>
```

### Table with Search Only
```tsx
<DataTable
  data={items}
  columns={columns}
  searchable
  onSearch={handleSearch}
/>
```

### Table with Pagination Only
```tsx
<DataTable
  data={items}
  columns={columns}
  pagination={{
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: setPage,
  }}
/>
```

### Conditional Actions
```tsx
const actions = [
  {
    label: "Edit",
    icon: <FiEdit2 className="h-4 w-4" />,
    onClick: handleEdit,
  },
  {
    label: "Delete",
    icon: <FiTrash2 className="h-4 w-4" />,
    onClick: handleDelete,
    variant: "destructive",
    show: (row) => row.canDelete, // Only show if canDelete is true
  },
];
```

## Styling

The component uses Tailwind CSS and shadcn/ui design tokens:
- `border` - Table border
- `muted` - Muted text and backgrounds
- `primary` - Primary color for loading spinner
- `destructive` - Red color for destructive actions

All colors automatically adapt to your theme configuration.
