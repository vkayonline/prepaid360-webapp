import { Button, ButtonProps } from "@/commons/components/ui/button";
import { Loader2 } from "lucide-react";

interface ButtonLoaderProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
}

export function ButtonLoader({ isLoading, loadingText, children, disabled, ...props }: ButtonLoaderProps) {
    return (
        <Button disabled={disabled || isLoading} {...props} className={`relative ${props.className || ''}`}>
            {/* Invisible original content to preserve width */}
            <span className={isLoading ? "invisible" : ""}>
                {children}
            </span>

            {/* Absolute positioned loader overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingText && <span>{loadingText}</span>}
                </div>
            )}
        </Button>
    );
}
