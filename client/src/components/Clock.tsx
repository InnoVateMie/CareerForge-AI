import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";

export function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-1.5 rounded-full border border-border/50">
            <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-primary" />
            {formatDateTime(time)}
        </div>
    );
}
