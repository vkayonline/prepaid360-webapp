import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import { Input } from "@/commons/components/ui/input"
import { Label } from "@/commons/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/commons/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/ui/tabs"
import { ButtonLoader } from "@/commons/components/ux/button-loader"
import { CommonFields } from "./common-fields"
import { FileUpload } from "./file-upload"

interface ApplicationFormProps {
    activeTab: string
    setActiveTab: (v: string) => void
    cardType: string
    setCardType: (v: string) => void
    embossType: string
    setEmbossType: (v: string) => void
    corporatesData: any[]
    selectedCorp: any
    setSelectedCorp: (c: any) => void
    products: any[]
    selectedProduct: any
    setSelectedProduct: (p: any) => void
    bulkFile: File | null
    setBulkFile: (f: File | null) => void
    uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
    uploadedFilePath: string | null
    isLoading: boolean
    error: string | null
    fieldErrors?: Record<string, string>
    singleFormData: any
    onUploadFile: (file: File) => void
    onRemoveFile: () => void
    onDownloadSample: () => void
    onBulkSubmit: () => void
    onSingleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ApplicationForm({
    activeTab,
    setActiveTab,
    cardType,
    setCardType,
    embossType,
    setEmbossType,
    corporatesData,
    selectedCorp,
    setSelectedCorp,
    products,
    selectedProduct,
    setSelectedProduct,
    bulkFile,
    setBulkFile,
    uploadStatus,
    uploadedFilePath,
    isLoading,
    error,
    fieldErrors = {},
    singleFormData,
    onUploadFile,
    onRemoveFile,
    onDownloadSample,
    onBulkSubmit,
    onSingleSubmit
}: ApplicationFormProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-sm">
                        {error}
                    </div>
                )}
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="bulk">Bulk</TabsTrigger>
                        <TabsTrigger value="single">Single</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bulk">
                        <div className="space-y-8 mt-4">
                            <CommonFields
                                cardType={cardType}
                                setCardType={setCardType}
                                embossType={embossType}
                                setEmbossType={setEmbossType}
                                corporates={corporatesData}
                                selectedCorp={selectedCorp}
                                setSelectedCorp={setSelectedCorp}
                                products={products}
                                selectedProduct={selectedProduct}
                                setSelectedProduct={setSelectedProduct}
                                disabled={uploadStatus === 'uploading'}
                                fieldErrors={fieldErrors}
                            />
                            <div className="space-y-2"><Label>Upload File</Label>
                                <FileUpload
                                    file={bulkFile}
                                    setFile={(f) => {
                                        if (!f) {
                                            onRemoveFile();
                                        } else {
                                            setBulkFile(f);
                                        }
                                    }}
                                    onFileSelect={onUploadFile}
                                    uploadStatus={uploadStatus}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <Button type="button" variant="outline"
                                    onClick={onDownloadSample} disabled={isLoading || uploadStatus === 'uploading'}>Download Sample</Button>
                                <ButtonLoader
                                    type="button"
                                    onClick={onBulkSubmit}
                                    isLoading={isLoading}
                                    loadingText="Validating..."
                                    disabled={
                                        uploadStatus === "uploading" ||
                                        uploadStatus !== "success"
                                    }
                                >
                                    Validate
                                </ButtonLoader>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="single">
                        <form onSubmit={onSingleSubmit} className="space-y-8 mt-4">
                            <CommonFields
                                cardType={cardType}
                                setCardType={setCardType}
                                embossType={embossType}
                                setEmbossType={setEmbossType}
                                corporates={corporatesData}
                                selectedCorp={selectedCorp}
                                setSelectedCorp={setSelectedCorp}
                                products={products}
                                selectedProduct={selectedProduct}
                                setSelectedProduct={setSelectedProduct}
                                fieldErrors={fieldErrors}
                            />
                            <h3 className="text-lg font-medium border-t pt-4">Application Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kitNumber">Kit Number</Label>
                                    <Input id="kitNumber" name="kitNumber" placeholder="KIT123456" disabled={embossType === "PERSONALIZED"} defaultValue={singleFormData?.kitNumber ?? ''} className={fieldErrors.kitNumber ? "border-destructive" : ""} />
                                    {fieldErrors.kitNumber && <p className="text-xs text-destructive">{fieldErrors.kitNumber}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" placeholder="Venkatesh Prasath" defaultValue={singleFormData?.name ?? ''} className={fieldErrors.name ? "border-destructive" : ""} />
                                    {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" name="mobile" placeholder="9876543210" defaultValue={singleFormData?.mobile ?? ''} className={fieldErrors.mobile ? "border-destructive" : ""} />
                                    {fieldErrors.mobile && <p className="text-xs text-destructive">{fieldErrors.mobile}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="venkat@example.com" defaultValue={singleFormData?.email ?? ''} className={fieldErrors.email ? "border-destructive" : ""} />
                                    {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" name="amount" type="number" placeholder="500.00" defaultValue={singleFormData?.amount ?? ''} className={fieldErrors.amount ? "border-destructive" : ""} />
                                    {fieldErrors.amount && <p className="text-xs text-destructive">{fieldErrors.amount}</p>}
                                </div>
                            </div>
                            {cardType === "PHYSICAL" && (
                                <>
                                    <h3 className="text-lg font-medium border-t pt-4">Delivery Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Deliver To</Label>
                                            <RadioGroup name="deliverTo" defaultValue={singleFormData?.deliverTo ?? 'HOME'} className="flex gap-4">
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
                                            <Label htmlFor="addressLine1">Address Line 1</Label>
                                            <Input id="addressLine1" name="addressLine1"
                                                placeholder="No 12, ABC Street" defaultValue={singleFormData?.addressLine1 ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="addressLine2">Address Line 2</Label>
                                            <Input id="addressLine2" name="addressLine2" placeholder="2nd Cross" defaultValue={singleFormData?.addressLine2 ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="addressLine3">Address Line 3</Label>
                                            <Input id="addressLine3" name="addressLine3" placeholder="Near Bus Stand" defaultValue={singleFormData?.addressLine3 ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" placeholder="Chennai" defaultValue={singleFormData?.city ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input id="state" name="state" placeholder="Tamil Nadu" defaultValue={singleFormData?.state ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" name="country" placeholder="India" defaultValue={singleFormData?.country ?? ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pincode</Label>
                                            <Input id="pincode" name="pincode" placeholder="600001" defaultValue={singleFormData?.pincode ?? ''} />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end">
                                <ButtonLoader type="submit" isLoading={isLoading} loadingText="Validating...">Validate</ButtonLoader>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
