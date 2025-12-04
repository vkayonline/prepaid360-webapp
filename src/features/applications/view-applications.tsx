"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/commons/components/ui/button"
import { Card, CardContent, CardHeader } from "@/commons/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/commons/components/ui/table"
import { Badge } from "@/commons/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/commons/components/ui/select"
import { ApplicationsTabs } from "./components/applications-tabs"
import { DraftsList } from "./components/drafts-list"
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Skeleton } from "@/commons/components/ui/skeleton"
import { listApplicationBatches } from "@/commons/api"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  "APPROVED": "default",
  "PENDING_APPROVAL": "secondary",
  "ISSUANCE_IN_PROGRESS": "outline",
  "PARTIALLY_ISSUED": "outline",
  "ISSUED": "default",
  "ISSUANCE_FAILED": "destructive",
  "REJECTED": "destructive",
  "CANCELED": "destructive",
  "PENDING": "secondary",
};



function ApplicationsTable({ applications, isLoading, pagination }: { applications: any[], isLoading: boolean, pagination: any }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Total Records</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app) => (
              <TableRow key={app.batchId}>
                <TableCell className="font-medium">
                  <Link
                    to={`/applications/${app.batchId}`}
                    state={{ batchStatus: app.status, batchData: app }}
                    className="text-primary hover:underline"
                  >
                    {app.batchId}
                  </Link>
                </TableCell>
                <TableCell>{app.productName}</TableCell>
                <TableCell>{app.totalRecords}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[app.status] || "default"}>
                    {app.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No applications found for this status.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>
          Showing <strong>{pagination.pageable?.offset + 1}-{(pagination.pageable?.offset || 0) + pagination.numberOfElements}</strong> of <strong>{pagination.totalElements}</strong> results
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.first}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Page {pagination.number + 1} of {pagination.totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.last}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default function ViewApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"submitted" | "drafts">("submitted")
  const [filter, setFilter] = useState("ALL")
  const [applications, setApplications] = useState([])
  const [pagination, setPagination] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async (status: string, page = 0, size = 10) => {
      setIsLoading(true)
      try {
        // Pass undefined for "ALL" to fetch all statuses
        const statusParam = status === "ALL" ? undefined : status;
        const data: any = await listApplicationBatches(statusParam, page, size);
        setApplications(data.content)
        setPagination({
          ...data.pageable,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          numberOfElements: data.numberOfElements,
          first: data.first,
          last: data.last,
          number: data.number,
        })
      } catch (error) {
        console.error("Failed to fetch applications:", error)
        setApplications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications(filter)
  }, [filter])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Manage your drafts and submitted applications.</p>
        </div>
        <Button asChild>
          <Link to="/applications/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Application
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <ApplicationsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === "submitted" && (
            <div className="flex justify-end">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Applications</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ISSUED">Issued</SelectItem>
                  <SelectItem value="ISSUANCE_FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "submitted" && (
            <ApplicationsTable applications={applications} isLoading={isLoading} pagination={pagination} />
          )}

          {activeTab === "drafts" && <DraftsList />}
        </CardContent>
      </Card>
    </div>
  )
}
