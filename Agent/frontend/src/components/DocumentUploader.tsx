// import React from 'react';
// import { useDropzone } from 'react-dropzone';
// import { Upload, X, Trash2 } from 'lucide-react';
// import { Button } from './ui/button';

// interface DocumentUploaderProps {
//   onClose: () => void;
//   uploadedFiles: Array<{ id: string; name: string; size: number }>;
//   onFileUpload: (files: File[]) => void;
//   onFileDelete: (fileId: string) => void;
// }

// export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
//   onClose,
//   uploadedFiles,
//   onFileUpload,
//   onFileDelete,
// }) => {
//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop: onFileUpload,
//     accept: {
//       'application/pdf': ['.pdf'],
//       'text/plain': ['.txt'],
//       'application/msword': ['.doc'],
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
//     },
//   });

//   return (
//     <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex">
//         {/* Sidebar with uploaded files */}
//         <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
//           <h3 className="font-semibold mb-4">Uploaded Files</h3>
//           <div className="space-y-2">
//             {uploadedFiles.map((file) => (
//               <div
//                 key={file.id}
//                 className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
//               >
//                 <div className="truncate flex-1">
//                   <p className="text-sm font-medium">{file.name}</p>
//                   <p className="text-xs text-gray-500">
//                     {(file.size / 1024).toFixed(1)} KB
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => onFileDelete(file.id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Upload area */}
//         <div className="flex-1 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-semibold">Upload Documents</h2>
//             <Button variant="ghost" size="icon" onClick={onClose}>
//               <X className="h-6 w-6" />
//             </Button>
//           </div>

//           <div
//             {...getRootProps()}
//             className={`border-2 border-dashed rounded-lg p-8 text-center ${
//               isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//             }`}
//           >
//             <input {...getInputProps()} />
//             <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <p className="text-lg mb-2">
//               {isDragActive
//                 ? 'Drop the files here...'
//                 : 'Drag & drop files here, or click to select files'}
//             </p>
//             <p className="text-sm text-gray-500">
//               Supports PDF, TXT, DOC, DOCX files
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { fetchFiles, uploadFile, deleteFile } from '../services/api';
import { UploadedFile } from '../types/api';

interface DocumentUploaderProps {
  onClose: () => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const files = await fetchFiles();
    setUploadedFiles(files);
  };

  const handleUpload = async (files: File[]) => {
    await uploadFile(files[0]);
    loadFiles();
  };

  const handleDelete = async (fileId: string) => {
    await deleteFile(fileId);
    loadFiles();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="truncate flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Upload Documents</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg mb-2">{isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select files'}</p>
            <p className="text-sm text-gray-500">Supports PDF, TXT, DOC, DOCX</p>
          </div>
        </div>
      </div>
    </div>
  );
};