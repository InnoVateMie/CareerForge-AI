import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";

interface ExportPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ExportPaymentModal({ isOpen, onClose, onSuccess }: ExportPaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMockPayment = () => {
        setIsProcessing(true);
        // Simulate a Stripe Checkout processing delay
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess(); // Grants premium access
            onClose();
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <DialogHeader className="pt-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold font-display text-center">Unlock Premium Export</DialogTitle>
                    <DialogDescription className="text-center pt-2 text-md">
                        Your professional resume is ready! 🚀 Unlock high-quality, ATS-optimized PDF exports to land your dream job.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" /> Lifetime Export Pass
                            </span>
                            <span className="font-black text-xl">$4.99</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-2 relative z-10">
                            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Unlimited PDF Downloads</li>
                            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> High-Resolution Graphics</li>
                            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> ATS Metadata Optimization</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center w-full">
                    <Button
                        onClick={handleMockPayment}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-md shadow-lg shadow-primary/25 transition-all active:scale-95"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing Securely...</>
                        ) : (
                            "Upgrade & Download Now"
                        )}
                    </Button>
                </DialogFooter>
                <div className="text-center text-xs text-muted-foreground/60 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure Payment via Stripe
                </div>
            </DialogContent>
        </Dialog>
    );
}
