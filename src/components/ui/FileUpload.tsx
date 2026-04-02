import { useState, useRef, useCallback } from 'react';
import { Button } from './Button';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  label?: string;
  hint?: string;
  variant?: 'default' | 'avatar' | 'document';
  existingFiles?: UploadedFile[];
  onRemove?: (fileId: string) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export function FileUpload({
  accept = '*/*',
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  onUpload,
  onError,
  label,
  hint,
  variant = 'default',
  existingFiles = [],
  onRemove,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxSize}MB limit`;
    }
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) return fileExt === type.toLowerCase();
        if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', '/'));
        return fileType === type;
      });
      if (!isAccepted) {
        return `File type "${file.type}" is not accepted`;
      }
    }
    return null;
  }, [accept, maxSize]);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    
    if (!multiple && files.length > 1) {
      onError?.('Only one file can be uploaded');
      return;
    }
    
    if (existingFiles.length + files.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }
      validFiles.push(file);
    }

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    clearInterval(interval);
    setProgress(100);

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      onUpload(uploadedFiles);
    }, 200);
  }, [multiple, maxFiles, existingFiles.length, validateFile, onUpload, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (variant === 'avatar') {
    return (
      <div className="flex items-center gap-4">
        <div 
          className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
          onClick={handleClick}
        >
          {existingFiles[0] ? (
            <img src={existingFiles[0].url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={handleClick} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          <p className="text-xs text-neutral-500 mt-1">JPG, PNG. Max {maxSize}MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>}
      
      <div
        className={`
          border-2 border-dashed p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
        
        <svg className="w-10 h-10 mx-auto text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        {uploading ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</p>
            <div className="w-48 mx-auto h-1.5 bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full bg-primary-600 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {hint || `Max ${maxSize}MB${multiple ? `, up to ${maxFiles} files` : ''}`}
            </p>
          </>
        )}
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
              </div>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
