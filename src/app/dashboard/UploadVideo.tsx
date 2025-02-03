import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface UploadVideoProps {
  onClose: () => void;
  onUpload: (file: File, s3Url: string) => void;
}

export default function UploadVideo({ onClose, onUpload }: UploadVideoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      // Step 1: Request a presigned URL from your API route.
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to get S3 upload URL');
      }
      
      const { uploadUrl, s3Url } = await res.json();

      // Step 2: Upload the file directly to S3 using the presigned URL.
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error('Video upload to S3 failed');
      }

      // Step 3: Call onUpload with the file and the final S3 URL.
      onUpload(selectedFile, s3Url);
      onClose();
    } catch (error) {
      console.error('Error uploading video:', error);
      // Optionally, handle error UI
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-4"
        >
          Select Video
        </Button>
        {selectedFile && (
          <p className="mb-4 text-sm text-gray-600">
            Selected: {selectedFile.name}
          </p>
        )}
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline" disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
