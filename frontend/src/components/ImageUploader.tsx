import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImageSelect: (imageData: string, file: File) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  maxSizeMB = 5,
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      return `不支持的文件格式。请上传 ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} 格式的图片。`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `文件大小超过限制。最大允许 ${maxSizeMB}MB，当前文件 ${fileSizeMB.toFixed(2)}MB。`;
    }

    return null;
  };

  const processFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);
      
      // Validate image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          setError('图片尺寸太小。最小尺寸为 100x100 像素。');
          setPreview(null);
          return;
        }
        if (img.width > 4096 || img.height > 4096) {
          setError('图片尺寸太大。最大尺寸为 4096x4096 像素。');
          setPreview(null);
          return;
        }
        onImageSelect(imageData, file);
      };
      img.onerror = () => {
        setError('无法加载图片。请确保文件是有效的图片格式。');
        setPreview(null);
      };
      img.src = imageData;
    };
    reader.onerror = () => {
      setError('读取文件失败。请重试。');
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-4 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!preview ? (
          <div className="text-center cursor-pointer">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">
              拖拽图片到此处或点击上传
            </p>
            <p className="mt-2 text-sm text-gray-500">
              支持 PNG, JPG, WebP 格式，最大 {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">错误</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
