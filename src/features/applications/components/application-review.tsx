import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import { Input } from "@/commons/components/ui/input"
import { Label } from "@/commons/components/ui/label"
import { ButtonLoader } from "@/commons/components/ux/button-loader"
import { File as FileIcon } from "lucide-react"
import { CommonFields } from "./common-fields"

interface ApplicationReviewProps {
    reviewData: any
    corporatesData: any[]
    selectedCorp: any
    products: any[]
    selectedProduct: any
    bulkFile: File | null
    isLoading: boolean
    onBack: () => void
    onSubmit: () => void
}

export function ApplicationReview({
    reviewData,
    corporatesData,
    selectedCorp,
    products,
    selectedProduct,
    bulkFile,
    isLoading,
    onBack,
    onSubmit
}: ApplicationReviewProps) {
    const isBulk = !!reviewData?.filePath;

    return (
        <Card>
            <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Review Application</h2>
                <div className="space-y-8">
                    <CommonFields
                        cardType={reviewData.cardType}
                        setCardType={() => { }}
                        embossType={reviewData.embossType}
                        setEmbossType={() => { }}
                        corporates={corporatesData}
                        selectedCorp={selectedCorp}
                        setSelectedCorp={() => { }}
                        products={products}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={() => { }}
                        disabled={true}
                    />
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
                        <Button variant="outline" onClick={onBack} disabled={isLoading}>Back to Edit</Button>
                        <ButtonLoader onClick={onSubmit} isLoading={isLoading} loadingText="Submitting...">Submit Application</ButtonLoader>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
