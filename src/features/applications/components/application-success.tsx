import { Button } from "@/commons/components/ui/button"
import { Card, CardContent } from "@/commons/components/ui/card"
import { CheckCircle } from "lucide-react"
import { Link } from "react-router-dom"

export function ApplicationSuccess() {
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
