"use client";

import { ServerCrash } from "lucide-react";

export default function ServiceDownPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
      <ServerCrash className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold">It's not you, it's us.</h1>
      <p className="text-xl mt-4 text-muted-foreground">
        We're experiencing some technical difficulties and our team is working hard to get things back up and running.
      </p>
      <p className="mt-2 text-muted-foreground">
        Please try again in a few moments.
      </p>
    </div>
  );
}
