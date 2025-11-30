import { useState, useEffect } from "react";

export function useHashRoute() {
    // Always initialize to "home" to ensure server/client consistency
    const [route, setRoute] = useState("home");

    useEffect(() => {
        // Set initial route from hash after hydration
        const setInitialRoute = () => {
            const h = window.location.hash;
            if (h.includes("/civil")) {
                setRoute("civil");
            } else if (h.includes("/software")) {
                setRoute("software");
            } else {
                setRoute("home");
            }
        };

        // Set initial route
        setInitialRoute();

        // Listen for hash changes
        const onHash = () => {
            const h = window.location.hash;
            if (h.includes("/civil")) {
                setRoute("civil");
            } else if (h.includes("/software")) {
                setRoute("software");
            } else {
                setRoute("home");
            }
        };

        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    return [route, setRoute] as const;
}
