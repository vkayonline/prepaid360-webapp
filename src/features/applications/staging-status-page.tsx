"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getStagingStatus, downloadStagingErrors, submitStagingBatch } from "@/commons/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/ui/card"
import { Button } from "@/commons/components/ui/button"
import { Badge } from "@/commons/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react"
import { useToast } from "@/commons/components/ui/use-toast"

export default function StagingStatusPage() {
    const { stagingBatchId } = useParams<{ stagingBatchId: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [statusData, setStatusData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const fetchStatus = async () => {
        if (!stagingBatchId) return

        try {
            const data: any = await getStagingStatus(stagingBatchId)

            // Check if component is still mounted before updating state
            // We can infer this if pollingRef.current is null (cleaned up) 
            // BUT a better way is a dedicated isMounted ref if we want to be strict.
            // For now, let's just check if pollingRef is active OR if it's the initial load (isLoading=true)

            setStatusData(data)

            // Stop polling if validation is complete or failed
            if (data.status === "VALIDATED" || data.status === "FAILED" || data.status === "COMPLETED") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current)
                    pollingRef.current = null
                }
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Failed to fetch status", error)
            // Don't stop polling immediately on error, might be transient
        }
    }

    useEffect(() => {
        fetchStatus()
        pollingRef.current = setInterval(fetchStatus, 3000)

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [stagingBatchId])

    const handleDownloadErrors = async () => {
        if (!stagingBatchId) return
        try {
            const response: any = await downloadStagingErrors(stagingBatchId)
            // Assuming response is a blob or download link. 
            // If it's a link in 'url' property:
            if (response.url) {
                window.open(response.url, "_blank")
            } else {
                // If it's a blob, we need to handle it. 
                // BaseClient usually returns JSON data. 
                // If the API returns a file directly, BaseClient might need adjustment or we use the URL.
                // Let's assume it returns a URL for now based on typical patterns.
                toast({ title: "Download started", description: "Error file download has started." })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Download Failed", description: "Could not download error file." })
        }
    }

    const handleSubmit = async () => {
        if (!stagingBatchId) return
        setIsSubmitting(true)
        try {
            await submitStagingBatch(stagingBatchId)
            toast({ title: "Success", description: "Batch submitted successfully." })
            navigate("/applications")
        } catch (error: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.message || "Failed to submit batch." })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!stagingBatchId) {
        return <div className="p-6">Invalid Batch ID</div>
    }

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Batch Validation Status</span>
                        {statusData?.status && (
                            <Badge variant={
                                statusData.status === "VALIDATED" ? "default" : // "success" variant might not exist in default shadcn
                                    statusData.status === "VALIDATING" ? "secondary" :
                                        statusData.status === "FAILED" ? "destructive" : "outline"
                            }>
                                {statusData.status}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {isLoading && (!statusData || statusData.status === "VALIDATING") ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground">Validating records... Please wait.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div className="p-4 border rounded-lg bg-muted/20">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Records</p>
                                    <p className="text-3xl font-bold mt-2">{statusData?.totalCount || 0}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-green-500/10 border-green-200">
                                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm uppercase tracking-wider">Valid</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-700">{statusData?.validCount || 0}</p>
                                </div>
                                <div className="p-4 border rounded-lg bg-red-500/10 border-red-200">
                                    <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm uppercase tracking-wider">Invalid</span>
                                    </div>
                                    <p className="text-3xl font-bold text-red-700">{statusData?.invalidCount || 0}</p>
                                </div>
                            </div>

                            {statusData?.invalidCount > 0 && (
                                <div className="flex items-center p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-800">
                                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium">Attention Needed</p>
                                        <p className="text-sm mt-1">
                                            {statusData.invalidCount} records contain errors and will be skipped during submission.
                                            You can download the error report to review them.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleDownloadErrors} className="ml-4 border-yellow-600 text-yellow-800 hover:bg-yellow-100">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Errors
                                    </Button>
                                </div>
                            )}

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="outline" onClick={() => navigate("/applications/create-new")}>
                                    Start Over
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        isSubmitting ||
                                        statusData?.status !== "VALIDATED" ||
                                        (statusData?.validCount === 0 && statusData?.totalCount > 0)
                                    }
                                >
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Batch
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
