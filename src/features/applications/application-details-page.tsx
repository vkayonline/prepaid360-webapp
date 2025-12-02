"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/ui/card"
import { Input } from "@/commons/components/ui/input"
import { Label } from "@/commons/components/ui/label"
import { Skeleton } from "@/commons/components/ui/skeleton"
import { getApplicationDetails, getBatchDetails } from "@/commons/api"
import { useSessionStore } from "@/commons/store/session"

export default function ApplicationDetailsPage() {
  const { batchId, applicationId } = useParams<{ batchId: string, applicationId: string }>()
  const [applicationData, setApplicationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const selectedCorporate = useSessionStore((state) => state.selectedCorporate);

  useEffect(() => {
    if (!applicationId) return;

    const fetchApplicationDetails = async () => {
      setIsLoading(true)
      try {
        const data = await getApplicationDetails(parseInt(applicationId));
        if (data !== null && data !== undefined) {
          setApplicationData(data)
        } else {
          console.error("Application not found");
        }
      } catch (error) {
        console.error("Failed to fetch application details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicationDetails()
  }, [applicationId])

  const location = useLocation();
  const { batchData } = location.state || {};
  const [localBatchData, setLocalBatchData] = useState<any>(batchData || null);

  useEffect(() => {
    if (batchData) {
      setLocalBatchData(batchData);
      return;
    }

    if (batchId && !localBatchData) {
      const fetchBatchData = async () => {
        try {
          const data = await getBatchDetails(parseInt(batchId));
          if (data) {
            setLocalBatchData(data);
          }
        } catch (error) {
          console.error("Failed to fetch batch details:", error);
        }
      }
      fetchBatchData();
    }
  }, [batchId, batchData, localBatchData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!applicationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested application with ID "{applicationId}" could not be found.</p>
        </CardContent>
      </Card>
    )
  }

  // For display purposes, we can reconstruct a similar structure to what the form expects
  const data = {
    ...applicationData,
    application: applicationData, // The details are at the top level in the response
    corpId: localBatchData?.corporateCode || localBatchData?.corporateName || selectedCorporate?.code || 'N/A',
    productName: localBatchData?.productName || 'N/A',
    cardType: localBatchData?.cardType || 'N/A',
    embossType: localBatchData?.embossType || 'N/A'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Details: {applicationId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Corporate</Label>
            <Input value={data.corpId || 'N/A'} disabled />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Input value={data.productName || 'N/A'} disabled />
          </div>
          <div className="space-y-2">
            <Label>Card Type</Label>
            <Input value={data.cardType || 'N/A'} disabled />
          </div>
          <div className="space-y-2">
            <Label>Emboss Type</Label>
            <Input value={data.embossType || 'N/A'} disabled />
          </div>
        </div>

        {/* Application Details */}
        <h3 className="text-lg font-medium border-t pt-4">Application Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Kit Number</Label>
            <Input value={data.application.kitNumber || 'N/A'} disabled />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={data.application.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={data.application.mobile} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={data.application.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input value={data.application.amount} disabled />
          </div>
        </div>

        {/* Address Details */}
        {data.cardType === "PHYSICAL" && (
          <>
            <h3 className="text-lg font-medium border-t pt-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Deliver To</Label>
                <Input value={data.application.deliverTo || 'N/A'} disabled />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 1</Label>
                <Input value={data.application.addressLine1 || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input value={data.application.addressLine2 || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Address Line 3</Label>
                <Input value={data.application.addressLine3 || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={data.application.city || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={data.application.state || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={data.application.country || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={data.application.pincode || 'N/A'} disabled />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
