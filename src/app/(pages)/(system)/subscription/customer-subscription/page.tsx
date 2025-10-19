"use client";

import { useState } from "react";
import CustomerSubscriptionTable from "../components/customer-subscription-table";

export default function CustomerSubscriptionPage() {
  const [customerSubscriptionRefreshKey] = useState(0);

  return (
    <div className="mt-6">
      <CustomerSubscriptionTable
        refreshKey={customerSubscriptionRefreshKey}
      />
    </div>
  );
}
