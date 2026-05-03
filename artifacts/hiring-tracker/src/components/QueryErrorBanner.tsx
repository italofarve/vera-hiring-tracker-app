import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function formatQueryError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export function QueryErrorBanner({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Could not load data</AlertTitle>
      <AlertDescription className="mt-1">{message}</AlertDescription>
    </Alert>
  );
}
