import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/commons/components/ui/dialog";
import { Button } from "@/commons/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/commons/components/ui/select";
import { useSessionStore } from "@/commons/store/session";
import { useState } from "react";

export function CorporateSelectionDialog() {
    const { user, setSelectedCorporate } = useSessionStore();
    const [selectedId, setSelectedId] = useState<string>("");

    const handleConfirm = () => {
        if (!selectedId || !user) return;
        const corp = user.corporates.find((c) => c.id.toString() === selectedId);
        if (corp) {
            setSelectedCorporate(corp);
        }
    };

    // Dialog is always "open" when this component is rendered by ProtectedRoute
    // because ProtectedRoute only renders it when selection is needed.
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Select Corporate</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <Select value={selectedId} onValueChange={setSelectedId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a corporate" />
                        </SelectTrigger>
                        <SelectContent>
                            {user?.corporates.map((corp) => (
                                <SelectItem key={corp.id} value={corp.id.toString()}>
                                    {corp.name} ({corp.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleConfirm} disabled={!selectedId} className="w-full">
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
