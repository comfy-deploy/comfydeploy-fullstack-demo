"use client";

import { LoaderCircle, LoaderIcon } from "lucide-react";
import * as React from "react";

export function LoadingIcon({ className }: React.ComponentProps<"div">) {
	return <LoaderCircle size={16} className={`animate-spin ${className || ''}`} />;
}
