import React from "react";
import {
    Globe,
    Mail,
    Shield,
    Menu,
    X,
    MessageSquare,
    Phone,
    ChevronRight,
} from "lucide-react";
import { BRAND, NAV_LINKS, BADGES } from "@/data/landing-page";

export function TopBar() {
    return (
        <div className="w-full border-b bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-lg border-white/20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm">
                <div className="flex items-center gap-1 text-gray-700 sm:gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm backdrop-blur-sm">
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                        <span className="hidden sm:inline font-medium">{BRAND.locations}</span>
                        <span className="sm:hidden font-medium">Bihar & Pan-India</span>
                    </div>
                    <span className="mx-1 sm:mx-2 text-gray-400">•</span>
                    <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="hidden sm:inline font-medium text-green-700">{BRAND.regLine}</span>
                        <span className="sm:hidden font-medium text-green-700">DPIIT Startup</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden items-center gap-2 sm:flex">
                        {BADGES.slice(0, 2).map((b) => (
                            <span key={b.label} className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                                {b.icon}
                                <span className="hidden md:inline">{b.label}</span>
                            </span>
                        ))}
                    </div>
                    <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs sm:text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">📧 {BRAND.email}</span>
                        <span className="sm:hidden">📧 Email</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export function Nav({
    route,
    setRoute,
    mobileMenuOpen,
    setMobileMenuOpen
}: {
    route: string;
    setRoute: (r: string) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}) {
    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-xl border-white/20 shadow-lg shadow-black/5">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                    <a
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            setRoute("home");
                            window.location.hash = "#home";
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group flex items-center gap-3 transition-all hover:scale-105"
                    >
                        <div className="relative">
                            <span className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 px-3 py-2 text-sm text-white shadow-lg sm:px-4 sm:text-base font-bold">IE</span>
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-pulse shadow-lg"></div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight sm:text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {BRAND.name}
                            </h1>
                            <p className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">{BRAND.tagline}</p>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden gap-2 lg:flex lg:gap-3">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();

                                    // Handle route-based navigation (Home, Software, Civil)
                                    if (link.href === "#home") {
                                        setRoute("home");
                                        window.location.hash = "#home";
                                        // Smooth scroll to top for home
                                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                    } else if (link.href === "#/software") {
                                        setRoute("software");
                                        window.location.hash = "#/software";
                                        // Smooth scroll to top for software section
                                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                    } else if (link.href === "#/civil") {
                                        setRoute("civil");
                                        window.location.hash = "#/civil";
                                        // Smooth scroll to top for civil section
                                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                    } else {
                                        // Handle section-based navigation (About, Contact)
                                        // First ensure we're on home route to show the sections
                                        if (route !== "home") {
                                            setRoute("home");
                                            window.location.hash = "#home";
                                            // Wait for route change to complete, then scroll to section
                                            setTimeout(() => {
                                                const element = document.querySelector(link.href);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }, 300);
                                        } else {
                                            // Already on home route, just scroll to section
                                            window.location.hash = link.href;
                                            const element = document.querySelector(link.href);
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }
                                    }
                                }}
                                className={`group relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 touch-manipulation select-none ${(route === "home" && link.label === "Home") ||
                                        (route === "software" && link.label === "Software") ||
                                        (route === "civil" && link.label === "Civil & Railway")
                                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md scale-105"
                                        : "text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-sm hover:scale-105 active:scale-100"
                                    }`}
                                title={link.description}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`transition-all duration-300 ${(route === "home" && link.label === "Home") ||
                                            (route === "software" && link.label === "Software") ||
                                            (route === "civil" && link.label === "Civil & Railway")
                                            ? "text-indigo-600 scale-110"
                                            : "text-gray-500 group-hover:text-indigo-600 group-hover:scale-110"
                                        }`}>
                                        {link.icon}
                                    </div>
                                    <span className="transition-all duration-300">{link.label}</span>
                                </div>

                                {/* Active indicator */}
                                {((route === "home" && link.label === "Home") ||
                                    (route === "software" && link.label === "Software") ||
                                    (route === "civil" && link.label === "Civil & Railway")) && (
                                        <div className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                                    )}

                                {/* Smart hover tooltip - positioned above to avoid covering other elements */}
                                <div className="absolute -top-12 left-1/2 z-50 pointer-events-none opacity-0 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1 hidden lg:block">
                                    {link.description}
                                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></div>
                                </div>
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <a
                            href="#contact"
                            className="hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-indigo-300 hover:shadow-xl hover:from-indigo-50 hover:to-purple-50 sm:block"
                        >
                            💼 Request Proposal
                        </a>
                        <a
                            href="/admin/login"
                            className="hidden sm:inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-slate-400 hover:shadow-xl hover:from-slate-700 hover:to-slate-800"
                            title="Admin Portal Login"
                        >
                            <Shield className="h-4 w-4" />
                            Admin
                        </a>
                        <a
                            href={route === "software" ? "#/civil" : route === "civil" ? "#/software" : "#/software"}
                            onClick={(e) => {
                                e.preventDefault();
                                const targetRoute = route === "software" ? "civil" : route === "civil" ? "software" : "software";
                                const targetHash = targetRoute === "civil" ? "#/civil" : "#/software";
                                window.location.hash = targetHash;
                                setRoute(targetRoute);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 sm:gap-3 sm:px-5 sm:py-3"
                        >
                            <div className="rounded-full bg-white/20 p-1">
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                            <span className="hidden sm:inline">
                                {route === "software" ? "🏗️ Go to Civil & Railway" :
                                    route === "civil" ? "💻 Go to Software" :
                                        "🚀 Explore Divisions"}
                            </span>
                            <span className="sm:hidden">
                                {route === "software" ? "🏗️ Civil" :
                                    route === "civil" ? "💻 Software" :
                                        "🚀 Divisions"}
                            </span>
                        </a>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="relative rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 p-3 lg:hidden shadow-lg transition-all duration-300 hover:scale-110 hover:border-indigo-300 hover:shadow-xl active:scale-95"
                            aria-label="Toggle menu"
                        >
                            <div className="relative">
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5 text-indigo-600" />
                                ) : (
                                    <Menu className="h-5 w-5 text-indigo-600" />
                                )}
                                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="flex items-center justify-between border-b bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                            <div className="flex items-center gap-2">
                                <span className="rounded-xl bg-black px-2 py-1 text-sm text-white">IE</span>
                                <h2 className="text-lg font-semibold">{BRAND.name}</h2>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-xl border p-2 hover:bg-gray-50 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex flex-col p-4 space-y-2">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMobileMenuOpen(false);

                                        // Handle route-based navigation (Home, Software, Civil)
                                        if (link.href === "#home") {
                                            setRoute("home");
                                            window.location.hash = "#home";
                                            // Smooth scroll to top for home
                                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                        } else if (link.href === "#/software") {
                                            setRoute("software");
                                            window.location.hash = "#/software";
                                            // Smooth scroll to top for software section
                                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                        } else if (link.href === "#/civil") {
                                            setRoute("civil");
                                            window.location.hash = "#/civil";
                                            // Smooth scroll to top for civil section
                                            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                        } else {
                                            // Handle section-based navigation (About, Contact)
                                            // First ensure we're on home route to show the sections
                                            if (route !== "home") {
                                                setRoute("home");
                                                window.location.hash = "#home";
                                                // Wait for route change to complete, then scroll to section
                                                setTimeout(() => {
                                                    const element = document.querySelector(link.href);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }
                                                }, 300);
                                            } else {
                                                // Already on home route, just scroll to section
                                                window.location.hash = link.href;
                                                const element = document.querySelector(link.href);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }
                                        }
                                    }}
                                    className={`group rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 touch-manipulation select-none ${(route === "home" && link.label === "Home") ||
                                            (route === "software" && link.label === "Software") ||
                                            (route === "civil" && link.label === "Civil & Railway")
                                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-black border border-indigo-200 shadow-sm transform scale-[1.02]"
                                            : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] active:bg-gradient-to-r active:from-indigo-50 active:to-purple-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${(route === "home" && link.label === "Home") ||
                                                (route === "software" && link.label === "Software") ||
                                                (route === "civil" && link.label === "Civil & Railway")
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-110"
                                                : "bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 group-hover:scale-105"
                                            }`}>
                                            {link.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-semibold transition-colors duration-300 ${(route === "home" && link.label === "Home") ||
                                                    (route === "software" && link.label === "Software") ||
                                                    (route === "civil" && link.label === "Civil & Railway")
                                                    ? "text-indigo-700"
                                                    : "group-hover:text-indigo-600"
                                                }`}>
                                                {link.label}
                                            </div>
                                            <div className={`text-xs mt-0.5 transition-colors duration-300 ${(route === "home" && link.label === "Home") ||
                                                    (route === "software" && link.label === "Software") ||
                                                    (route === "civil" && link.label === "Civil & Railway")
                                                    ? "text-indigo-600"
                                                    : "text-gray-500 group-hover:text-indigo-500"
                                                }`}>
                                                {link.description}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </nav>

                        {/* Quick Actions */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="space-y-3">
                                <a
                                    href="#contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-center font-semibold text-white shadow-lg transition-all active:scale-95"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    🚀 Get Free Quote
                                </a>

                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`mailto:${BRAND.email}`}
                                        className="flex items-center justify-center gap-1 rounded-lg bg-white border px-3 py-2 text-sm font-medium text-gray-700 transition-all active:scale-95"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </a>
                                    <a
                                        href={`tel:${BRAND.phone}`}
                                        className="flex items-center justify-center gap-1 rounded-lg bg-white border px-3 py-2 text-sm font-medium text-gray-700 transition-all active:scale-95"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Call
                                    </a>
                                </div>

                                <a
                                    href="/admin/login"
                                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-medium text-white transition-all active:scale-95"
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin Portal
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
