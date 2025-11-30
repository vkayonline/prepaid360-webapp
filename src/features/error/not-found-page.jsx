import { FileX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center p-4">
      <FileX className="h-28 w-28 text-destructive mb-6" />
      <h1 className="text-9xl font-bold">404</h1>
      <p className="text-2xl mt-4">Page Not Found</p>
      <p className="mt-2 text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
