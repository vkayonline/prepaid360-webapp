"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSessionStore } from "@/commons/store/session"
import { listCorporateProducts } from "@/commons/api"
import { validateDraft } from "@/commons/api/modules/draft-api"
import { uploadFile } from "@/commons/api/modules/files-api"
import { handleDownloadSample } from "@/commons/utils/csv-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/ui/card"
import { Label } from "@/commons/components/ui/label"
import { Input } from "@/commons/components/ui/input"
import { Button } from "@/commons/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/commons/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/commons/components/ui/radio-group"
import { ButtonLoader } from "@/commons/components/ux/button-loader"
import { Loader2, UploadCloud, File as FileIcon, X } from "lucide-react"
import { useToast } from "@/commons/components/ui/use-toast"
import { mapApiErrors } from "@/commons/utils/error-utils"
import { FormSkeleton } from "@/commons/components/ux/form-skeleton"

export default function StagingUploadPage() {
    const navigate = useNavigate()
    const { selectedCorporate } = useSessionStore()
    const { toast } = useToast()

    const [products, setProducts] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [cardType, setCardType] = useState("VIRTUAL")
    const [embossType, setEmbossType] = useState("PERSONALIZED")
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("bulk")
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [isInitialLoading, setIsInitialLoading] = useState(false)

    // Bulk State
    const [file, setFile] = useState<File | null>(null)
    const [filePath, setFilePath] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Single State
    const [singleData, setSingleData] = useState({
        kitNumber: "",
        name: "",
        mobile: "",
        email: "",
        amount: "",
        deliverTo: "HOME",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        city: "",
        state: "",
        country: "",
        pincode: ""
    })

    useEffect(() => {
        const fetchProducts = async () => {
            if (selectedCorporate?.id) {
                setIsInitialLoading(true)
                try {
                    const data = await listCorporateProducts(selectedCorporate.id)
                    setProducts(data.filter((p: any) => p.status === 'ACTIVE'))
                } catch (error) {
                    console.error("Failed to fetch products", error)
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch products for the selected corporate."
                    })
                } finally {
                    setIsInitialLoading(false)
                }
            }
        }
        fetchProducts()
    }, [selectedCorporate])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setIsUploading(true)
            setFilePath(null)

            try {
                const response: any = await uploadFile(selectedFile)
                // Handle response which might be string or object with data/fileName
                const path = response?.fileName ?? response?.data ?? response
                setFilePath(path)
            } catch (error) {
                console.error("File upload failed", error)
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "Failed to upload file. Please try again."
                })
                setFile(null)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleData({ ...singleData, [e.target.name]: e.target.value })
    }



    const isFormValid = () => {
        if (!selectedCorporate?.code || !selectedProduct || !cardType || !embossType) return false
        if (isLoading || isUploading) return false

        if (activeTab === "bulk") {
            return !!file && !!filePath
        } else {
            return (
                !!singleData.kitNumber &&
                !!singleData.name &&
                !!singleData.mobile &&
                !!singleData.email &&
                !!singleData.amount &&
                !!singleData.addressLine1 &&
                !!singleData.city &&
                !!singleData.state &&
                !!singleData.pincode
            )
        }
    }

    const handleSubmit = async () => {
        if (!selectedCorporate?.code) {
            toast({ variant: "destructive", title: "Error", description: "No corporate selected." })
            return
        }
        if (!selectedProduct) {
            toast({ variant: "destructive", title: "Error", description: "Please select a product." })
            return
        }

        setIsLoading(true)
        try {
            let payload: any = {
                corporateCode: selectedCorporate.code,
                productCode: products.find(p => p.id.toString() === selectedProduct)?.productCode || "",
                cardType,
                embossType,
            }

            if (activeTab === "bulk") {
                if (!filePath) {
                    toast({ variant: "destructive", title: "Error", description: "File not uploaded yet." })
                    setIsLoading(false)
                    return
                }

                payload = {
                    ...payload,
                    filePath,
                    isBulk: true,
                    isSingle: false
                }
            } else {
                payload = {
                    ...payload,
                    application: singleData,
                    isSingle: true,
                    isBulk: false
                }
            }

            // Step 2: Create Draft & Trigger Validation
            console.log("Calling validateDraft with payload:", payload)
            const response: any = await validateDraft(payload)
            console.log("validateDraft response:", response)
            const draftId = response.draftId || response.stagingBatchId || response.id

            // Step 3: Navigate to Status Page
            navigate(`/applications/staging/${draftId}`)
        } catch (error: any) {
            console.error("Upload failed", error)
            const { fieldErrors, pageError } = mapApiErrors(error)

            if (Object.keys(fieldErrors).length > 0) {
                setFieldErrors(fieldErrors)
                toast({
                    variant: "destructive",
                    title: "Validation Failed",
                    description: "Please check the highlighted fields."
                })
            }

            if (pageError) {
                toast({
                    variant: "destructive",
                    title: pageError.title,
                    description: pageError.description
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isInitialLoading) {
        return <div className="container mx-auto py-6 max-w-4xl"><FormSkeleton /></div>
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Create Applications (New)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Common Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Corporate</Label>
                            <Input value={selectedCorporate?.name || "Loading..."} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger className={fieldErrors.productCode ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.productName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldErrors.productCode && <p className="text-xs text-destructive">{fieldErrors.productCode}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Card Type</Label>
                            <RadioGroup value={cardType} onValueChange={setCardType} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="VIRTUAL" id="virtual" />
                                    <Label htmlFor="virtual">Virtual</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="PHYSICAL" id="physical" disabled />
                                    <Label htmlFor="physical" className="text-muted-foreground">Physical</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label>Emboss Type</Label>
                            <RadioGroup value={embossType} onValueChange={setEmbossType} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="PERSONALIZED" id="perso" />
                                    <Label htmlFor="perso">Perso</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="NON_PERSONALIZED" id="non-perso" disabled />
                                    <Label htmlFor="non-perso" className="text-muted-foreground">Non Perso</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-auto justify-start mb-4">
                            <TabsTrigger value="bulk">Bulk</TabsTrigger>
                            <TabsTrigger value="single">Single</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bulk" className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center relative hover:bg-muted/50 transition-colors">
                                {file ? (
                                    <div className="flex items-center gap-4">
                                        <FileIcon className="h-8 w-8 text-primary" />
                                        <div className="text-left">
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => { setFile(null); setFilePath(null); }}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            Drag and drop your file here, or <span className="text-primary font-medium">click to browse</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">CSV, XLS, XLSX up to 10MB</p>
                                    </>
                                )}
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".csv,.xls,.xlsx"
                                    disabled={!!file}
                                />
                            </div>

                        </TabsContent>

                        <TabsContent value="single" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Kit Number</Label>
                                    <Input name="kitNumber" value={singleData.kitNumber} onChange={handleSingleChange} placeholder="KIT123456" disabled={embossType === "PERSONALIZED"} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input name="name" value={singleData.name} onChange={handleSingleChange} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile</Label>
                                    <Input name="mobile" value={singleData.mobile} onChange={handleSingleChange} placeholder="9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input name="email" value={singleData.email} onChange={handleSingleChange} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input name="amount" value={singleData.amount} onChange={handleSingleChange} placeholder="500" type="number" />
                                </div>
                            </div>

                            {cardType === "PHYSICAL" && (
                                <>
                                    <h3 className="font-medium border-t pt-4 mt-4">Delivery Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Deliver To</Label>
                                            <RadioGroup value={singleData.deliverTo} onValueChange={(v) => setSingleData({ ...singleData, deliverTo: v })} className="flex gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="HOME" id="home" />
                                                    <Label htmlFor="home">Home</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="OFFICE" id="office" />
                                                    <Label htmlFor="office">Office</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Address Line 1</Label>
                                            <Input name="addressLine1" value={singleData.addressLine1} onChange={handleSingleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address Line 2</Label>
                                            <Input name="addressLine2" value={singleData.addressLine2} onChange={handleSingleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input name="city" value={singleData.city} onChange={handleSingleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input name="state" value={singleData.state} onChange={handleSingleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pincode</Label>
                                            <Input name="pincode" value={singleData.pincode} onChange={handleSingleChange} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-between items-center pt-4 border-t">
                        {activeTab === "bulk" ? (
                            <Button variant="link" onClick={handleDownloadSample} className="text-sm text-muted-foreground hover:text-primary px-0">
                                Download Sample CSV
                            </Button>
                        ) : <div></div>}
                        <ButtonLoader onClick={handleSubmit} isLoading={isLoading} loadingText="Processing..." disabled={!isFormValid()}>
                            Upload and Validate
                        </ButtonLoader>
                    </div>
                </CardContent>
            </Card>
        </div >
    )
}
