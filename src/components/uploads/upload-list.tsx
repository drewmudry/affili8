"use client";

import { useState } from "react";
import { FileIcon, Video, Image as ImageIcon } from "lucide-react";
import { UploadDetailModal } from "./upload-detail-modal";

export function UploadList({ uploads }: { uploads: any[] }) {
  const [selectedUpload, setSelectedUpload] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (upload: any) => {
    setSelectedUpload(upload);
    setIsModalOpen(true);
  };

  if (uploads.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No uploads found.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {uploads.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="group border rounded-lg overflow-hidden bg-card cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title || item.filename} className="w-full h-full object-cover" />
              ) : item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <FileIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-3">
              <div>
                <h3 className="font-medium truncate">{item.title || item.filename}</h3>
                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-1">
                  {item.type === 'video' && <Video className="h-3 w-3"/>}
                  {item.type === 'image' && <ImageIcon className="h-3 w-3"/>}
                  {item.type === 'demo' && <FileIcon className="h-3 w-3"/>}
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUpload && (
        <UploadDetailModal
          upload={selectedUpload}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
