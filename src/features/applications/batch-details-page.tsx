"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/commons/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/commons/components/ui/table";
import { Badge } from "@/commons/components/ui/badge";
import { Button } from "@/commons/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/commons/components/ui/dialog";
import { Textarea } from "@/commons/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/commons/components/ui/skeleton";
import { approveOrRejectBatch, listApplicationsInBatch, getBatchDetails } from "@/commons/api";
import { Show } from "@/commons/components/show";

const statusVariantMap: {
  [key: string]:
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";
} = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "destructive",
};

export default function BatchDetailsPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dialogAction, setDialogAction] = useState<
    "approve" | "reject" | "cancel" | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const location = useLocation();
  const { batchStatus, batchData } = location.state || {};

  useEffect(() => {
    if (!batchId) return;

    const fetchApplications = async (page = 0, size = 10) => {
      setIsLoading(true);
      try {
        const data = await listApplicationsInBatch(
          parseInt(batchId),
          page,
          size
        );
        setApplications(data.content);
        setPagination({
          ...data.pageable,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          numberOfElements: data.numberOfElements,
          first: data.first,
          last: data.last,
          number: data.number,
        });
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [batchId]);

  // Separate effect for batch details to avoid re-fetching applications unnecessarily
  useEffect(() => {
    if (!batchId || batchData) return;

    const fetchBatchData = async () => {
      try {
        const data = await getBatchDetails(parseInt(batchId));
        if (data) {
          // Update location state so it persists for child navigation
          // Note: We can't easily update location.state without navigating, 
          // but we can store it in a local state variable if we were using one.
          // However, since we use `batchData` from `location.state` directly in the render,
          // we need a way to trigger a re-render with the new data.
          // The best way is to use a local state for batchData that initializes from location.state
          setLocalBatchData(data);
        }
      } catch (error) {
        console.error("Failed to fetch batch details:", error);
      }
    }
    fetchBatchData();
  }, [batchId, batchData]);

  const [localBatchData, setLocalBatchData] = useState<any>(batchData || null);

  // Sync localBatchData if location.state changes (though unlikely without navigation)
  useEffect(() => {
    if (batchData) {
      setLocalBatchData(batchData);
    }
  }, [batchData]);

  const openConfirmationDialog = (action: "approve" | "reject" | "cancel") => {
    setDialogAction(action);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setRejectionReason("");
      setCancelReason("");
    }, 200);
  };

  const handleApprove = async () => {
    try {
      await approveOrRejectBatch(
        Number(batchId),
        "APPROVE",
        "All applications approved"
      );
      handleDialogClose();
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      await approveOrRejectBatch(Number(batchId), "REJECT", rejectionReason);
      handleDialogClose();
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Rejection failed");
    }
  };

  const handleCancel = async () => {
    try {
      await approveOrRejectBatch(Number(batchId), "CANCEL", cancelReason);
      handleDialogClose();
      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Cancellation failed");
    }
  };

  const handleRetry = (applicationId: string) => {
    alert(`Retrying application: ${applicationId}`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batch Details: {batchId}</CardTitle>

          {batchStatus === "PENDING_APPROVAL" && (
            <div className="flex gap-2">
              <Show permission="applications.approve">
                <Button
                  onClick={() => openConfirmationDialog("approve")}
                  variant="success"
                  className="w-32"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </Show>

              <Show permission="applications.reject">
                <Button
                  onClick={() => openConfirmationDialog("reject")}
                  variant="destructive"
                  className="w-32"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </Show>

              <Show permission="applications.cancel">
                <Button
                  onClick={() => openConfirmationDialog("cancel")}
                  variant="destructive"
                  className="w-32"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </Show>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason for Failure</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/applications/${batchId}/${app.id}`}
                            state={{ batchData: localBatchData }}
                            className="text-primary hover:underline"
                          >
                            {app.id}
                          </Link>
                        </TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.mobile}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariantMap[app.status] || "default"}
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.failureReason || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          {app.status === "FAILED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(app.id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No applications found for this batch.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>
                  Showing{" "}
                  <strong>
                    {pagination.pageable?.offset + 1}-
                    {(pagination.pageable?.offset || 0) +
                      pagination.numberOfElements}
                  </strong>{" "}
                  of <strong>{pagination.totalElements}</strong> results
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={pagination.first}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>
                    Page {pagination.number + 1} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={pagination.last}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && handleDialogClose()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center">
                <AlertTriangle
                  className={`mr-2 h-6 w-6 ${dialogAction === "approve"
                    ? "text-yellow-500"
                    : "text-red-500"
                    }`}
                />
                {dialogAction === "approve"
                  ? "Confirm Approval"
                  : dialogAction === "reject"
                    ? "Confirm Rejection"
                    : "Confirm Cancellation"}
              </div>
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve"
                ? "Are you sure you want to approve this batch? This action cannot be undone."
                : dialogAction === "reject"
                  ? "Please provide a reason for rejecting this batch. This action cannot be undone."
                  : "Please provide a reason for cancelling this batch. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          {dialogAction === "reject" && (
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          {dialogAction === "cancel" && (
            <div className="py-4">
              <Textarea
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            {dialogAction === "approve" ? (
              <Button onClick={handleApprove} variant="success">
                Yes, Approve
              </Button>
            ) : dialogAction === "reject" ? (
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={!rejectionReason}
              >
                Yes, Reject
              </Button>
            ) : (
              <Button
                onClick={handleCancel}
                variant="destructive"
                disabled={!cancelReason}
              >
                Yes, Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
