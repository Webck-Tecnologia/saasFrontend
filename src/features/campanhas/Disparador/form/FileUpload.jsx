import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Info } from 'lucide-react'
import { cn } from "@/lib/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { fileTypes } from './constants'

export default function FileUpload({ field, label, accept, formData, handleInputChange, isLoading }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  const processFile = (file) => {
    if (isValidFileType(file, accept)) {
      handleInputChange(field, file)
    } else {
      toast({
        title: "Tipo de arquivo inválido",
        description: `Por favor, selecione um arquivo do tipo correto: ${accept}`,
        variant: "destructive",
      })
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    handleInputChange(field, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const isValidFileType = (file, acceptedTypes) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    return acceptedTypes.split(',').some(type => fileExtension === type.trim())
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field}>{label}*</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tipos de arquivo aceitos: {fileTypes[formData.tipo]?.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div 
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center cursor-pointer relative",
          isDragging ? "border-primary bg-primary/10" : "border-gray-300",
          formData[field] ? "bg-green-100" : ""
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={field}
          className="hidden"
          onChange={handleFileUpload}
          accept={accept}
        />
        {formData[field] ? (
          <>
            <p className="text-green-600">Arquivo carregado: {formData[field].name}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p>Arraste e solte o {label.toLowerCase()} aqui, ou clique para selecionar</p>
          </>
        )}
      </div>
    </div>
  )
}
