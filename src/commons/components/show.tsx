import { ReactNode } from "react";
import { useSession } from "@/commons/context/session-context";

interface ShowProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Show({ permission, children, fallback = null }: ShowProps) {
  const { hasPermission } = useSession();

  const checkPermissions = () => {
    if (Array.isArray(permission)) {
      return permission.some(p => hasPermission(p));
    }
    return hasPermission(permission);
  };

  if (checkPermissions()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
