import React, { useCallback } from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FaceUploaderProps {
  onFileSelect: (file: File) => void;
  isValidating: boolean;
}

export function FaceUploader({ onFileSelect, isValidating }: FaceUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxFiles: 1,
    disabled: isValidating
  } as any);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-200 ease-in-out group",
          isDragActive 
            ? "border-giphy-blue bg-giphy-blue/10" 
            : "border-white/20 hover:border-giphy-purple bg-giphy-card",
          isValidating && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-colors",
            isDragActive ? "bg-giphy-blue text-black" : "bg-black text-giphy-purple group-hover:text-white group-hover:bg-giphy-gradient-from"
          )}>
            {isValidating ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
              {isValidating ? "Scanning..." : "Upload Selfie"}
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              {isDragActive ? "DROP IT LIKE IT'S HOT!" : "Drag & drop or click"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
