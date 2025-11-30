// path: /src/app/create-application/CreateApplicationPage.tsx

"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle, File as FileIcon, UploadCloud, X } from "lucide-react"
import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import { Input } from "@/commons/components/ui/input"
import { Label } from "@/commons/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/commons/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/commons/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/ui/tabs";
import { createApplication, listCorporates, uploadFile, validateApplication } from "@/commons/api";

// NOTE: This file was cleaned and fixed to ensure upload only happens once and to
// prevent validating while upload is in progress. Parent upload handler performs
// the single-upload and manages UI state.

// --- Reusable Components ---

function CommonFields({
                          cardType,
                          setCardType,
                          embossType,
                          setEmbossType,
                          corporates,
                          selectedCorp,
                          setSelectedCorp,
                          products,
                          selectedProduct,
                          setSelectedProduct,
                          disabled = false
                      }: {
    cardType: string;
    setCardType: (v: string) => void;
    embossType: string;
    setEmbossType: (v: string) => void;
    corporates: any[];
    selectedCorp: any;
    setSelectedCorp: (c: any) => void;
    products: any[];
    selectedProduct: any;
    setSelectedProduct: (p: any) => void;
    disabled?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Corporate</Label>
                <Select onValueChange={(value) => setSelectedCorp(corporates.find(c => c.id.toString() === value))}
                        defaultValue={selectedCorp?.id?.toString()} disabled={disabled}>
                    <SelectTrigger><SelectValue placeholder="Select a corporate" /></SelectTrigger>
                    <SelectContent>{corporates.map((corp) => <SelectItem key={corp.id}
                                                                         value={corp.id.toString()}>{corp.corporateName}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Product</Label>
                <Select onValueChange={(value) => setSelectedProduct(products.find(p => p.id.toString() === value))}
                        defaultValue={selectedProduct?.id?.toString()} disabled={disabled || !selectedCorp}>
                    <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                    <SelectContent>{products.map((prod) => <SelectItem key={prod.id}
                                                                       value={prod.id.toString()}>{prod.productName}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Card Type</Label>
                <RadioGroup name="cardType" value={cardType} onValueChange={setCardType} className="flex gap-4" disabled={disabled}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="VIRTUAL" id="virtual" />
                        <Label htmlFor="virtual">Virtual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PHYSICAL" id="physical" />
                        <Label htmlFor="physical">Physical</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="space-y-2">
                <Label>Emboss Type</Label>
                <RadioGroup name="embossType" value={embossType} onValueChange={setEmbossType} className="flex gap-4" disabled={disabled}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PERSONALIZED" id="perso" />
                        <Label htmlFor="perso">Perso</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NON_PERSONALIZED" id="non-perso" />
                        <Label htmlFor="non-perso">Non Perso</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}

function FileUpload({
                        file,
                        setFile,
                        onFileSelect,
                        uploadStatus,
                        disabled = false
                    }: {
    file: File | null,
    setFile: (file: File | null) => void,
    onFileSelect: (file: File) => void,
    uploadStatus: 'idle' | 'uploading' | 'success' | 'error',
    disabled?: boolean
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            // update local file UI immediately, then call parent's upload handler
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    };

    const handleReset = () => {
        // clear the file from parent
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

// --- Main Page Component ---

export default function CreateApplicationPage() {
    const [view, setView] = useState<'form' | 'review' | 'submitted'>('form')
    const [reviewData, setReviewData] = useState<any>(null)

    const [cardType, setCardType] = useState("VIRTUAL")
    const [embossType, setEmbossType] = useState("PERSONALIZED")
    const [corporatesData, setCorporatesData] = useState<any[]>([])
    const [selectedCorp, setSelectedCorp] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [bulkFile, setBulkFile] = useState<File | null>(null)
    const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [singleFormData, setSingleFormData] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("bulk");

    useEffect(() => {
        const fetchCorporates = async () => {
            try {
                const data = await listCorporates();
                setCorporatesData(data.filter((corp: any) => corp.status === 'ACTIVE'))
            } catch (err) {
                setError("Failed to fetch corporates. Please try again later.");
            }
        }
        fetchCorporates()
    }, [])

    useEffect(() => {
        if (selectedCorp) {
            setProducts(selectedCorp.products?.filter((prod: any) => prod.status === 'ACTIVE') ?? [])
            setSelectedProduct(null)
        } else {
            setProducts([])
        }
    }, [selectedCorp])

    const handleValidation = async (payload: any) => {
        setIsLoading(true);
        setError(null);

        try {
            // validateApplication should throw on validation error, otherwise it's fine
            await validateApplication(payload);

            // Validation passed
            setReviewData(payload);
            setView("review");

        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Validation failed. Please check your details.";

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        setSingleFormData(data) // Save form data for review

        const payload = {
            corporateCode: selectedCorp?.corporateCode,
            productCode: selectedProduct?.productCode,
            cardType: cardType,
            embossType: embossType,
            application: {
                kitNumber: data.kitNumber,
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                amount: Number(data.amount),
                deliverTo: data.deliverTo,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                addressLine3: data.addressLine3,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
            },
            filePath: null,
        }
        await handleValidation(payload)
    }

    // Parent-level upload handler: called by FileUpload via onFileSelect
    const handleUploadFile = async (file: File) => {
        // set file object for UI
        setBulkFile(file)
        setUploadedFilePath(null);
        setUploadStatus("uploading");
        setError(null);

        try {
            // call API
            const res = await uploadFile(file);
            // backend returns file name in `data` or {fileName}
            // support both shapes
            const fileName = res?.fileName ?? res?.data ?? res;
            // sometimes backend returns an object with data property containing filename
            setUploadedFilePath(fileName);
            setUploadStatus("success");
        } catch (err: any) {
            setUploadStatus("error");
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "An error occurred while uploading."
            );
        }
    };

    const removeSelectedFile = () => {
        setBulkFile(null);
        setUploadedFilePath(null);
        setUploadStatus("idle");
        setError(null);
    };

    const handleBulkSubmit = async () => {
        // Guard: ensure upload has completed successfully
        if (uploadStatus !== "success" || !uploadedFilePath) {
            setError("Please wait until the file upload completes.");
            return;
        }

        const payload = {
            corporateCode: selectedCorp?.corporateCode,
            productCode: selectedProduct?.productCode,
            cardType,
            embossType,
            application: null,
            filePath: uploadedFilePath,
        };

        await handleValidation(payload);
    };

    const handleCreate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await createApplication(reviewData);
            setView('submitted')
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "An unknown error occurred during application creation.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const escapeCsv = (value: any) => {
        if (value == null) return "";
        const stringValue = String(value);

        if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const handleDownloadSample = () => {
        const headers = ["kitNumber", "name", "mobile", "email", "amount", "deliverTo", "addressLine1", "addressLine2", "addressLine3", "city", "state", "country", "pincode"];
        const sampleData = ["KIT123456", "Venkatesh Prasath", "9876543210", "venkat@example.com", "500.00", "HOME", "No 12, ABC Street", "2nd Cross", "Near Bus Stand", "Chennai", "Tamil Nadu", "India", "600001"];

        const escapedData = sampleData.map(escapeCsv);
        const csvContent = [headers.join(","), escapedData.join(",")].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");

        if (link.href) URL.revokeObjectURL(link.href);
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.setAttribute("download", "bulk_application.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Render Logic ---

    if (view === 'submitted') {
        return (
            <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-96">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-semibold">Submission Successful</h2>
                    <p className="text-muted-foreground mt-2">Your application has been submitted and is being processed.</p>
                    <Button asChild className="mt-6">
                        <Link to="/applications">View Application History</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (view === 'review') {
        const isBulk = !!reviewData?.filePath;
        return (
            <Card>
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4">Review Application</h2>
                    <div className="space-y-8">
                        <CommonFields cardType={reviewData.cardType} setCardType={() => { }} embossType={reviewData.embossType} setEmbossType={() => { }} corporates={corporatesData} selectedCorp={selectedCorp} setSelectedCorp={() => { }} products={products} selectedProduct={selectedProduct} setSelectedProduct={() => { }} disabled={true} />
                        {isBulk ? (
                            <div className="space-y-2">
                                <Label>Uploaded File</Label>
                                <div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{bulkFile?.name ?? reviewData.filePath}</span>
                                                <span className="text-xs text-green-600">Upload complete</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium border-t pt-4">Application Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2"><Label>Kit Number</Label><Input value={reviewData.application?.kitNumber ?? ''} disabled /></div>
                                    <div className="space-y-2"><Label>Name</Label><Input value={reviewData.application?.name ?? ''} disabled /></div>
                                    <div className="space-y-2"><Label>Mobile</Label><Input value={reviewData.application?.mobile ?? ''} disabled /></div>
                                    <div className="space-y-2"><Label>Email</Label><Input value={reviewData.application?.email ?? ''} disabled /></div>
                                    <div className="space-y-2"><Label>Amount</Label><Input value={reviewData.application?.amount ?? ''} disabled /></div>
                                </div>
                                {reviewData.cardType === "PHYSICAL" && (
                                    <>
                                        <h3 className="text-lg font-medium border-t pt-4">Delivery Address</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2"><Label>Deliver To</Label><Input value={reviewData.application?.deliverTo ?? ''} disabled /></div>
                                            <div className="space-y-2 md:col-span-2"><Label>Address Line 1</Label><Input value={reviewData.application?.addressLine1 ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>Address Line 2</Label><Input value={reviewData.application?.addressLine2 ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>Address Line 3</Label><Input value={reviewData.application?.addressLine3 ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>City</Label><Input value={reviewData.application?.city ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>State</Label><Input value={reviewData.application?.state ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>Country</Label><Input value={reviewData.application?.country ?? ''} disabled /></div>
                                            <div className="space-y-2"><Label>Pincode</Label><Input value={reviewData.application?.pincode ?? ''} disabled /></div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        <div className="flex justify-end gap-4 mt-8">
                            <Button variant="outline" onClick={() => {
                                if (reviewData) {
                                    setCardType(reviewData.cardType);
                                    setEmbossType(reviewData.embossType);
                                    setSelectedCorp(corporatesData.find(c => c.id === reviewData.corpId) || null);
                                    setSelectedProduct(products.find(p => p.id === reviewData.productId) || null);
                                }
                                setView('form')
                            }} disabled={isLoading}>Back to Edit</Button>
                            <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Application"}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6">
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-sm">
                        {error}
                    </div>
                )}
                <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v)}>
                    <TabsList>
                        <TabsTrigger value="bulk">Bulk</TabsTrigger>
                        <TabsTrigger value="single">Single</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bulk">
                        <div className="space-y-8 mt-4">
                            <CommonFields cardType={cardType} setCardType={setCardType} embossType={embossType}
                                          setEmbossType={setEmbossType} corporates={corporatesData}
                                          selectedCorp={selectedCorp} setSelectedCorp={setSelectedCorp}
                                          products={products} selectedProduct={selectedProduct}
                                          setSelectedProduct={setSelectedProduct} disabled={uploadStatus === 'uploading'} />
                            <div className="space-y-2"><Label>Upload File</Label>
                                <FileUpload
                                    file={bulkFile}
                                    setFile={(f) => {
                                        // allow clearing the file from the FileUpload reset button
                                        if (!f) {
                                            removeSelectedFile();
                                        } else {
                                            setBulkFile(f);
                                        }
                                    }}
                                    onFileSelect={handleUploadFile}   // parent handler does the upload exactly once
                                    uploadStatus={uploadStatus}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <Button type="button" variant="outline"
                                        onClick={handleDownloadSample} disabled={isLoading || uploadStatus === 'uploading'}>Download Sample</Button>
                                <Button type="button" onClick={handleBulkSubmit} disabled={
                                    isLoading ||
                                    uploadStatus === "uploading" || // prevent validation mid-upload
                                    uploadStatus !== "success"      // ensure upload finished successfully
                                }>{isLoading ? "Validating..." : "Validate"}</Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="single">
                        <form onSubmit={handleSingleSubmit} className="space-y-8 mt-4">
                            <CommonFields cardType={cardType} setCardType={setCardType} embossType={embossType}
                                          setEmbossType={setEmbossType} corporates={corporatesData}
                                          selectedCorp={selectedCorp} setSelectedCorp={setSelectedCorp}
                                          products={products} selectedProduct={selectedProduct}
                                          setSelectedProduct={setSelectedProduct} />
                            <h3 className="text-lg font-medium border-t pt-4">Application Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kitNumber">Kit Number</Label>
                                    <Input id="kitNumber" name="kitNumber" placeholder="KIT123456" disabled={embossType === "PERSONALIZED"} defaultValue={singleFormData?.kitNumber ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" placeholder="Venkatesh Prasath" defaultValue={singleFormData?.name ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input id="mobile" name="mobile" placeholder="9876543210" defaultValue={singleFormData?.mobile ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="venkat@example.com" defaultValue={singleFormData?.email ?? ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" name="amount" type="number" placeholder="500.00" defaultValue={singleFormData?.amount ?? ''} />
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
                                <Button type="submit" disabled={isLoading}>{isLoading ? "Validating..." : "Validate"}</Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
