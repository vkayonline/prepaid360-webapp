// path: /src/app/create-application/CreateApplicationPage.tsx

"use client"

import { createApplication, listCorporateProducts, uploadFile, validateApplication } from "@/commons/api";
import { ApiError } from "@/commons/api/base-client";
import { useSessionStore } from "@/commons/store/session";
import { useEffect, useState } from "react";
import { ApplicationForm } from "./components/application-form";
import { ApplicationReview } from "./components/application-review";
import { ApplicationSuccess } from "./components/application-success";
import { mapApiErrors } from "@/commons/utils/error-utils";
import { FormSkeleton } from "@/commons/components/ux/form-skeleton";
import { useToast } from "@/commons/components/ui/use-toast";

// --- Main Page Component ---

export default function CreateApplicationPage() {
    const { selectedCorporate } = useSessionStore();
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

    const { toast } = useToast();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const [singleFormData, setSingleFormData] = useState<any>(null)
    const [activeTab, setActiveTab] = useState("bulk");

    useEffect(() => {
        if (selectedCorporate) {
            setCorporatesData([selectedCorporate]);
            setSelectedCorp(selectedCorporate);
        }
    }, [selectedCorporate]);

    useEffect(() => {
        const fetchProducts = async () => {
            if (selectedCorp) {
                setIsInitialLoading(true);
                try {
                    const data = await listCorporateProducts(selectedCorp.id);
                    setProducts(data.filter((prod: any) => prod.status === 'ACTIVE') ?? [])
                    setSelectedProduct(null)
                } catch (err) {
                    console.error("Failed to fetch products", err);
                    setProducts([]);
                } finally {
                    setIsInitialLoading(false);
                }
            } else {
                setProducts([])
            }
        }
        fetchProducts();
    }, [selectedCorp])

    const handleValidation = async (payload: any) => {
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            // validateApplication should throw on validation error, otherwise it's fine
            await validateApplication(payload);

            // Validation passed
            setReviewData(payload);
            setView("review");

        } catch (err: any) {
            const { fieldErrors, pageError } = mapApiErrors(err);

            if (Object.keys(fieldErrors).length > 0) {
                setFieldErrors(fieldErrors);
                // Also show a generic toast if there are field errors
                toast({
                    variant: "destructive",
                    title: "Validation Failed",
                    description: "Please check the highlighted fields."
                });
            }

            if (pageError) {
                setError(pageError.description);
                toast({
                    variant: "destructive",
                    title: pageError.title,
                    description: pageError.description
                });
            }
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
            corporateCode: selectedCorp?.code,
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
            corporateCode: selectedCorp?.code,
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
            const { pageError } = mapApiErrors(err);
            const errorMessage = pageError?.description || err?.message || "An unknown error occurred during application creation.";
            setError(errorMessage);
            toast({
                variant: "destructive",
                title: pageError?.title || "Creation Failed",
                description: errorMessage
            });
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
        return <ApplicationSuccess />
    }

    if (view === 'review') {
        return (
            <ApplicationReview
                reviewData={reviewData}
                corporatesData={corporatesData}
                selectedCorp={selectedCorp}
                products={products}
                selectedProduct={selectedProduct}
                bulkFile={bulkFile}
                isLoading={isLoading}
                onBack={() => {
                    if (reviewData) {
                        setCardType(reviewData.cardType);
                        setEmbossType(reviewData.embossType);
                        setSelectedCorp(corporatesData.find(c => c.id === reviewData.corpId) || null);
                        setSelectedProduct(products.find(p => p.id === reviewData.productId) || null);
                    }
                    setView('form')
                }}
                onSubmit={handleCreate}
            />
        )
    }

    return (
        <ApplicationForm
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cardType={cardType}
            setCardType={setCardType}
            embossType={embossType}
            setEmbossType={setEmbossType}
            corporatesData={corporatesData}
            selectedCorp={selectedCorp}
            setSelectedCorp={setSelectedCorp}
            products={products}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            bulkFile={bulkFile}
            setBulkFile={setBulkFile}
            uploadStatus={uploadStatus}
            uploadedFilePath={uploadedFilePath}
            isLoading={isLoading}
            error={error}
            fieldErrors={fieldErrors}
            singleFormData={singleFormData}
            onUploadFile={handleUploadFile}
            onRemoveFile={removeSelectedFile}
            onDownloadSample={handleDownloadSample}
            onBulkSubmit={handleBulkSubmit}
            onSingleSubmit={handleSingleSubmit}
        />
    )
}
