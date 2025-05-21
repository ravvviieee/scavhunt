import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface ImageUploadFormProps {
  locationId: number;
  answer: string;
  onSuccess: () => void;
}

export function ImageUploadForm({ locationId, answer, onSuccess }: ImageUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create a preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an answer",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("locationId", locationId.toString());
      formData.append("answer", answer);

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      toast({
        title: "Success",
        description: "Your answer has been submitted with the image!",
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload a Photo of the Location</Label>
        <Input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="cursor-pointer"
          disabled={isUploading}
        />
        <p className="text-sm text-neutral-500">
          Take a photo of the location or something related to prove your answer.
        </p>
      </div>

      {previewUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain rounded"
            />
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Submit with Photo"}
      </Button>
    </form>
  );
}