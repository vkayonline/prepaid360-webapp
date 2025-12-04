"use client"

import { Tabs, TabsList, TabsTrigger } from "@/commons/components/ui/tabs"

interface ApplicationsTabsProps {
    activeTab: "drafts" | "submitted"
    onTabChange: (tab: "drafts" | "submitted") => void
}

export function ApplicationsTabs({ activeTab, onTabChange }: ApplicationsTabsProps) {
    return (
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "drafts" | "submitted")} className="w-full">
            <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="submitted">
                    SUBMITTED
                </TabsTrigger>
                <TabsTrigger value="drafts">
                    DRAFTS
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
