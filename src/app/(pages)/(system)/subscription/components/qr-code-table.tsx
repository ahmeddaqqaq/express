"use client";

import { useEffect, useState } from "react";
import {
  SubscriptionService,
} from "../../../../../../client";

interface QRCodeData {
  id: string;
  isActive: boolean;
  createdAt: string;
}

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, DownloadCloud } from "lucide-react";
import QRCode from 'qrcode';
import JSZip from 'jszip';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QrCodeTableProps {
  refreshKey?: number;
}

export default function QrCodeTable({ refreshKey }: QrCodeTableProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [downloadingBulk, setDownloadingBulk] = useState(false);

  async function fetchQrCodes() {
    try {
      const response =
        await SubscriptionService.subscriptionControllerGetAllQrCodes();
      setQrCodes(response);
    } catch (error) {
      console.error("Failed to fetch subscriptions", error);
    }
  }

  useEffect(() => {
    fetchQrCodes();
  }, [refreshKey]);

  const downloadQRCode = (qrCodeId: string) => {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    
    // Create QR code using QRCode library
    QRCode.toCanvas(canvas, qrCodeId, { 
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
        return;
      }
      
      // Download the canvas as image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-code-${qrCodeId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    });
  };

  const downloadAllQRCodes = async () => {
    if (qrCodes.length === 0) return;
    
    setDownloadingBulk(true);
    
    try {
      const zip = new JSZip();
      
      // Generate all QR codes as images
      const promises = qrCodes.map(async (qrCode) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        
        return new Promise<void>((resolve) => {
          QRCode.toCanvas(canvas, qrCode.id, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }, (error) => {
            if (!error) {
              canvas.toBlob((blob) => {
                if (blob) {
                  zip.file(`qr-code-${qrCode.id}.png`, blob);
                }
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      });
      
      await Promise.all(promises);
      
      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR codes:', error);
    } finally {
      setDownloadingBulk(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">QR Codes</h2>
        {qrCodes.length > 0 && (
          <Button
            onClick={downloadAllQRCodes}
            disabled={downloadingBulk}
            className="gap-2"
            variant="outline"
          >
            {downloadingBulk ? (
              <>
                <DownloadCloud className="h-4 w-4 animate-pulse" />
                Downloading...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4" />
                Download All ({qrCodes.length})
              </>
            )}
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>QR Code</TableHead>
            {/* <TableHead>String</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qrCodes.length > 0 ? (
            qrCodes.map((qrCode) => (
              <TableRow key={qrCode.id}>
                <TableCell>
                  <QRCodeSVG value={qrCode.id} size={100} />
                </TableCell>
                {/* <TableCell>{qrCode.id}</TableCell> */}
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      qrCode.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {qrCode.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(qrCode.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQRCode(qrCode.id)}
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No QR found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
