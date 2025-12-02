"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/commons/components/ui/table"
import { Badge } from "@/commons/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/commons/components/ui/tabs"
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { Skeleton } from "@/commons/components/ui/skeleton"
import { listApplicationBatches } from "@/commons/api"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" } = {
  "APPROVED": "success",
  "PENDING_APPROVAL": "warning",
  "ISSUANCE_IN_PROGRESS": "outline",
  "PARTIALLY_ISSUED": "outline",
  "ISSUED": "success",
  "ISSUANCE_FAILED": "destructive",
  "REJECTED": "destructive",
  "CANCELED": "destructive",
  "PENDING": "warning",
};

const statusFilterMap: { [key: string]: string } = {
  PENDING: "PENDING_APPROVAL",
  APPROVED: "APPROVED,ISSUANCE_IN_PROGRESS,PARTIALLY_ISSUED,ISSUED,ISSUANCE_FAILED",
  REJECTED: "REJECTED,CANCELED",
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
  const [activeTab, setActiveTab] = useState("PENDING")
  const [applications, setApplications] = useState([])
  const [pagination, setPagination] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async (status: string, page = 0, size = 10) => {
      setIsLoading(true)
      try {
        const data = await listApplicationBatches(status, page, size);
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

    const statusQuery = statusFilterMap[activeTab];
    fetchApplications(statusQuery)
  }, [activeTab])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application History</h1>
          <p className="text-muted-foreground">Track and manage all submitted applications.</p>
        </div>
        <Button asChild>
          <Link to="/applications/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Application
          </Link>
        </Button>
      </div>

      {/* Tabs for Statuses */}
      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="PENDING">
          <Card>
            <CardContent className="pt-6">
              <ApplicationsTable applications={applications} isLoading={isLoading} pagination={pagination} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="APPROVED">
          <Card>
            <CardContent className="pt-6">
              <ApplicationsTable applications={applications} isLoading={isLoading} pagination={pagination} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="REJECTED">
          <Card>
            <CardContent className="pt-6">
              <ApplicationsTable applications={applications} isLoading={isLoading} pagination={pagination} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
