"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { listDrafts } from "@/commons/api/modules/draft-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/commons/components/ui/table"
import { Badge } from "@/commons/components/ui/badge"
import { Button } from "@/commons/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Skeleton } from "@/commons/components/ui/skeleton"

export function DraftsList() {
    const [drafts, setDrafts] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchDrafts = async (page = 0, size = 10) => {
        setIsLoading(true)
        try {
            const data: any = await listDrafts(page, size)
            setDrafts(data.content || [])
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
            console.error("Failed to fetch drafts:", error)
            setDrafts([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDrafts()
    }, [])

    return (
        <>
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
                                <TableHead>Draft ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Records</TableHead>
                                <TableHead>Valid</TableHead>
                                <TableHead>Invalid</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drafts.length > 0 ? (
                                drafts.map((draft) => (
                                    <TableRow key={draft.draftId}>
                                        <TableCell className="font-medium">{draft.draftId}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                draft.status === "VALIDATED" ? "default" :
                                                    draft.status === "FAILED" ? "destructive" : "secondary"
                                            }>
                                                {draft.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{draft.totalCount}</TableCell>
                                        <TableCell className="text-green-600">{draft.validCount}</TableCell>
                                        <TableCell className="text-red-600">{draft.invalidCount}</TableCell>
                                        <TableCell>{new Date(draft.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild size="sm" variant="outline">
                                                <Link to={`/applications/staging/${draft.draftId}`}>
                                                    <Play className="mr-2 h-3 w-3" />
                                                    Resume
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No drafts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <span>
                                Showing <strong>{pagination.pageable?.offset + 1}-{(pagination.pageable?.offset || 0) + pagination.numberOfElements}</strong> of <strong>{pagination.totalElements}</strong> results
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={pagination.first}
                                    onClick={() => fetchDrafts(pagination.number - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span>Page {pagination.number + 1} of {pagination.totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={pagination.last}
                                    onClick={() => fetchDrafts(pagination.number + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    )
}
