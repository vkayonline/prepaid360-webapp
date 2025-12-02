"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/commons/components/ui/card"
import { Button } from "@/commons/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/commons/components/ui/table"
import { Badge } from "@/commons/components/ui/badge"
import { ArrowUpRight, IndianRupee, Clock, PlusCircle } from "lucide-react"
import { listApplicationBatches } from "@/commons/api"
import { Skeleton } from "@/commons/components/ui/skeleton"

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" } = {
  "APPROVED": "success",
  "PENDING": "warning",
  "REJECTED": "destructive",
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ balance: "5,231.89", pendingCount: 0 })
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const pendingData = await listApplicationBatches("PENDING", 0, 1);
        setStats(prev => ({ ...prev, pendingCount: pendingData.totalElements || 0 }))

        const allData = await listApplicationBatches("ALL", 0, 5);
        setRecentApplications(allData.content || [])

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* Top Row: 3 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">₹{stats.balance}</div>}
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.pendingCount}</div>}
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Application</CardTitle>
             <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-center items-center">
             <Button asChild className="w-full">
                <Link to="/applications/create">
                    Create New Application
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Large Card for Recent Applications */}
      <div className="grid grid-cols-1">
         <Card>
            <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : (
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
                    {recentApplications.length > 0 ? (
                    recentApplications.map((app) => (
                        <TableRow key={app.batchId}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/applications/${app.batchId}`}
                            state={{ batchStatus: app.status }}
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
                        No recent applications found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
