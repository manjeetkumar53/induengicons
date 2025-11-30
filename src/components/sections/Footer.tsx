import React from "react";
import { Shield } from "lucide-react";
import { BRAND } from "@/data/landing-page";

export default function Footer() {
    return (
        <footer className="border-t">
            <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-gray-600 sm:px-6 sm:py-10 sm:text-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-xl bg-black px-2 py-1 text-xs text-white sm:text-sm">IE</span>
                            <span className="text-sm font-semibold sm:text-base">{BRAND.name}</span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm">{BRAND.tagline}</p>
                        <p className="mt-1 text-xs sm:text-sm">{BRAND.regLine}</p>
                        <p className="mt-1 text-xs sm:text-sm">GSTIN: {BRAND.gstin}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-6">
                        <a className="hover:underline" href="#/software">Software Division</a>
                        <a className="hover:underline" href="#/civil">Civil & Railway Division</a>
                        <a className="hover:underline" href="#tenders">Tender Kit</a>
                        <a className="hover:underline" href="#contact">Contact</a>
                        <a
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 text-white text-xs font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-200 hover:shadow-md"
                            href="/admin/login"
                            title="Admin Portal Login"
                        >
                            <Shield className="h-3 w-3" />
                            Admin Portal
                        </a>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500 sm:mt-6">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
            </div>
        </footer>
    );
}
