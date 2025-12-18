"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentState = "pending" | "accepted" | "rejected";

export function CookieBanner() {
    const [consentState, setConsentState] = useState<ConsentState>("pending");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (savedConsent === "accepted" || savedConsent === "rejected") {
            setConsentState(savedConsent as ConsentState);
        } else {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
        setConsentState("accepted");
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
        setConsentState("rejected");
        setIsVisible(false);
    };

    if (!isVisible || consentState !== "pending") {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                            This website uses cookies and similar technologies
                            to improve user experience and collect anonymous
                            usage statistics. For more information, please see
                            our{" "}
                            <a
                                href="/privacy"
                                className="text-foreground underline hover:no-underline"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReject}
                        >
                            Decline
                        </Button>
                        <Button size="sm" onClick={handleAccept}>
                            Accept
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
