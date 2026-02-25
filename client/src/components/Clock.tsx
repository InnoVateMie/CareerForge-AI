import { useState, useEffect } from "react";

export function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        // Format: Wednesday 5 July 2026 | 5:40AM WAT
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;

        // Timezone logic: WAT (West Africa Time, UTC+1) vs GMT (UTC+0)
        const offset = date.getTimezoneOffset(); // in minutes. UTC+1 is -60.
        let tzLabel = "GMT";
        if (offset <= -60) {
            tzLabel = "WAT";
        }

        return `${dayName} ${dayNum} ${monthName} ${year} | ${hours}:${minutes}${ampm} ${tzLabel}`;
    };

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-1.5 rounded-full border border-border/50">
            <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-primary" />
            {formatTime(time)}
        </div>
    );
}
