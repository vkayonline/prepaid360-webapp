import { Button } from "@/commons/components/ui/button"
import { Input } from "@/commons/components/ui/input"
import { File as FileIcon, UploadCloud, X } from "lucide-react"
import React from "react"

interface FileUploadProps {
    file: File | null
    setFile: (file: File | null) => void
    onFileSelect: (file: File) => void
    uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
    disabled?: boolean
}

export function FileUpload({
    file,
    setFile,
    onFileSelect,
    uploadStatus,
    disabled = false
}: FileUploadProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    };

    const handleReset = () => {
        setFile(null);
    }

    if (file) {
        return (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="font-medium">{file.name}</span>
                        {uploadStatus === 'uploading' && <span className="text-xs text-muted-foreground">Uploading...</span>}
                        {uploadStatus === 'success' && <span className="text-xs text-green-600">Upload complete</span>}
                        {uploadStatus === 'error' && <span className="text-xs text-destructive">Upload failed</span>}
                    </div>
                </div>
                {!disabled &&
                    <Button variant="ghost" size="icon" onClick={handleReset} disabled={uploadStatus === 'uploading'}>
                        <X className="h-4 w-4" />
                    </Button>
                }
            </div>
        )
    }
    return (
        <div
            className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg ${disabled ? 'bg-muted/50' : 'cursor-pointer transition-colors hover:border-primary'}`}>
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground"><span
                className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground">CSV, XLS, or XLSX up to 10MB</p>
            <Input id="bulkFile" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange} disabled={disabled}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
        </div>
    )
}
