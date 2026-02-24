import { useState } from "react";
import { useFetchJob } from "@/hooks/use-jobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobFetcherProps {
    onFetched: (data: { jobTitle: string; companyName: string; requirements: string; description: string }) => void;
}

export function JobFetcher({ onFetched }: JobFetcherProps) {
    const [url, setUrl] = useState("");
    const fetchMutation = useFetchJob();
    const { toast } = useToast();

    const handleFetch = async () => {
        if (!url || !url.startsWith("http")) {
            toast({ title: "Please enter a valid URL", variant: "destructive" });
            return;
        }

        try {
            const data = await fetchMutation.mutateAsync({ url });
            onFetched(data);
            toast({ title: "Job details extracted!" });
            setUrl("");
        } catch (e) {
            toast({ title: "Failed to extract job details", variant: "destructive" });
        }
    };

    return (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">AI URL Extraction</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Paste a job posting URL to automatically fill in the requirements.</p>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="https://linkedin.com/jobs/view/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-9 h-10 bg-background/50"
                    />
                </div>
                <Button
                    variant="secondary"
                    onClick={handleFetch}
                    disabled={fetchMutation.isPending}
                    className="h-10 px-4 whitespace-nowrap"
                >
                    {fetchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract"}
                </Button>
            </div>
        </div>
    );
}
