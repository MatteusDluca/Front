import React, { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Film } from 'lucide-react'

interface ImageUploadProps {
  initialImage?: string
  onImageChange: (file: File | null) => void
  className?: string
}

/**
 * Componente para upload de imagens com design simplificado
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  initialImage,
  onImageChange,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFile(file)
  }

  // Handle file selection from drag & drop
  const handleFile = (file: File | null) => {
    if (file) {
      // Only accept image files
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.')
        return
      }

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Call the callback
      onImageChange(file)
    } else {
      setPreviewUrl(null)
      onImageChange(null)
    }
  }

  // Handle drag & drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0] || null
    handleFile(file)
  }

  // Remove the selected image
  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
        accept="image/*"
      />

      {previewUrl ? (
        // Preview of the selected image
        <div className="relative bg-white rounded-lg overflow-hidden shadow-md mb-4">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-contain p-2"
          />
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            p-6 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            transition-colors duration-200 bg-white
            ${isDragging ? 'border-light-yellow bg-opacity-90' : 'border-gray-300 hover:border-light-yellow'}
            cursor-pointer
          `}
        >
          <div className="mb-4 flex">
            <div className="text-gray-400 mr-2">
              <ImageIcon size={28} />
            </div>
            <div className="text-gray-400">
              <Film size={28} />
            </div>
          </div>
          
          <p className="text-center font-clash text-gray-600 mb-4">
            Arraste as fotos e os vídeos aqui
          </p>
          
          <button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 bg-light-yellow text-white rounded-md light-sweep-button"
          >
            Selecionar do computador
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload