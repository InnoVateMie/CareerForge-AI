import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExportPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function StripeCheckoutForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                const res = await apiRequest("POST", "/api/payments/stripe/verify", { paymentIntentId: paymentIntent.id });
                if (res.ok) {
                    toast({ title: "Success!", description: "Download Unlocked!" });
                    onSuccess();
                } else {
                    toast({ title: "Verification Failed", description: "Payment succeeded but verification failed.", variant: "destructive" });
                }
            } catch (err: any) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
            }
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-white rounded-md shadow-sm border border-border">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>
            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-md shadow-lg shadow-primary/25 transition-all"
                disabled={!stripe || isProcessing}
            >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : "Pay $4.99 with Card"}
            </Button>
        </form>
    );
}

export function ExportPaymentModal({ isOpen, onClose, onSuccess }: ExportPaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isInitializingStripe, setIsInitializingStripe] = useState(false);
    const { toast } = useToast();

    // Fetch Stripe Intent
    useEffect(() => {
        if (isOpen && !clientSecret && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
            setIsInitializingStripe(true);
            apiRequest("POST", "/api/payments/stripe/create-intent", {})
                .then(res => res.json())
                .then(data => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch stripe intent", err);
                })
                .finally(() => setIsInitializingStripe(false));
        }
    }, [isOpen, clientSecret]);

    // Setup PayPal configuration
    const paypalOptions = {
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test", // Uses "test" if missing
        currency: "USD",
        intent: "capture",
    };

    const handlePayPalCreateOrder = async () => {
        try {
            const res = await apiRequest("POST", "/api/payments/paypal/create-order", {});
            const data = await res.json();
            return data.orderID;
        } catch (err: any) {
            toast({ title: "PayPal Error", description: "Could not initialize PayPal.", variant: "destructive" });
            throw err;
        }
    };

    const handlePayPalApprove = async (data: any) => {
        try {
            const res = await apiRequest("POST", "/api/payments/paypal/capture-order", { orderID: data.orderID });
            if (res.ok) {
                toast({ title: "Success!", description: "Download Unlocked via PayPal!" });
                onSuccess();
            } else {
                toast({ title: "Capture Failed", description: "Payment capture failed on server.", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <DialogHeader className="pt-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 border border-primary/20 shadow-inner">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold font-display text-center">Unlock Premium Export</DialogTitle>
                    <DialogDescription className="text-center pt-2 text-md">
                        Your professional resume is ready! 🚀 Unlock high-quality, ATS-optimized PDF exports to land your dream job.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4 relative z-10">
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" /> Lifetime Export Pass
                            </span>
                            <span className="font-black text-xl">$4.99</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-2 relative z-10">
                            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Unlimited PDF Downloads</li>
                            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> High-Resolution & ATS Optimized</li>
                        </ul>
                    </div>

                    {/* PAYMENT OPTIONS */}
                    <div className="space-y-6 pt-2">
                        {/* Stripe Elements */}
                        <div className="border border-border/50 rounded-lg p-4 bg-muted/10">
                            <h3 className="text-sm font-semibold mb-3">Pay with Credit Card</h3>
                            {isInitializingStripe ? (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
                            ) : clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                    <StripeCheckoutForm onSuccess={onSuccess} />
                                </Elements>
                            ) : (
                                <div className="text-sm text-red-500 opacity-80 text-center py-2">
                                    Stripe is currently unavailable. Please verify API keys.
                                </div>
                            )}
                        </div>

                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                            <div className="relative bg-background px-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">or pay with</div>
                        </div>

                        {/* PayPal Buttons */}
                        <div className="border border-border/50 rounded-lg p-4 bg-muted/10 flex justify-center">
                            <div className="w-full relative z-10">
                                <PayPalScriptProvider options={paypalOptions}>
                                    <PayPalButtons
                                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                                        createOrder={handlePayPalCreateOrder}
                                        onApprove={handlePayPalApprove}
                                        onError={() => toast({ title: "PayPal Error", description: "Payment window was closed or failed.", variant: "destructive" })}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-muted-foreground/60 flex items-center justify-center gap-1 mt-2">
                    <ShieldCheck className="w-3 h-3" /> Secure 256-bit SSL transaction
                </div>
            </DialogContent>
        </Dialog>
    );
}
