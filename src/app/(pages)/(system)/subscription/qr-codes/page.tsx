"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import QrCodeTable from "../components/qr-code-table";
import GenerateQrDialog from "../components/generate-qr-dialog";

export default function QrCodesPage() {
  const [generateQrDialogOpen, setGenerateQrDialogOpen] = useState(false);
  const [qrCodeRefreshKey, setQrCodeRefreshKey] = useState(0);

  const handleQrCodeGenerated = () => {
    setQrCodeRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">QR Codes</h2>
        <Button
          onClick={() => setGenerateQrDialogOpen(true)}
          className="gap-2"
        >
          <QrCode className="h-4 w-4" />
          Generate QR Codes
        </Button>
      </div>
      <QrCodeTable refreshKey={qrCodeRefreshKey} />

      <GenerateQrDialog
        open={generateQrDialogOpen}
        onOpenChange={setGenerateQrDialogOpen}
        onSuccess={handleQrCodeGenerated}
      />
    </div>
  );
}
