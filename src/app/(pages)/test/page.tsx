"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "@/components/ui/use-toast";
import { Loader2, Trash2 } from "lucide-react";

interface Image {
  id: string;
  url: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const API_BASE = "http://localhost:3000/express/images";

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        setImages(data);
      } catch (error) {
        // toast({
        //   variant: "destructive",
        //   title: "Error loading images",
        //   description: error instanceof Error ? error.message : "Unknown error",
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const { image } = await res.json();
      setImages([image, ...images]);
      //   toast({
      //     title: "Upload successful",
      //     description: "Your image has been uploaded",
      //   });
    } catch (error) {
      //   toast({
      //     variant: "destructive",
      //     title: "Upload failed",
      //     description: error instanceof Error ? error.message : "Unknown error",
      //   });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }

      setImages(images.filter((img) => img.id !== id));
      //   toast({
      //     title: "Image deleted",
      //     description: "The image has been removed",
      //   });
    } catch (error) {
      //   toast({
      //     variant: "destructive",
      //     title: "Delete failed",
      //     description: error instanceof Error ? error.message : "Unknown error",
      //   });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Image Gallery</h1>
          <p className="text-muted-foreground">Upload and manage your images</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="max-w-sm"
            />
            {uploading && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-muted-foreground">No images found</p>
              <p className="text-sm text-muted-foreground">
                Upload your first image
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0 relative group">
                    <img
                      src={image.url}
                      alt="Uploaded content"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        disabled={deletingId === image.id}
                      >
                        {deletingId === image.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
