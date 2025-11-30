import React from "react";
import { MessageSquare, ChevronRight, Mail, Phone } from "lucide-react";
import { BRAND } from "@/data/landing-page";

export default function StickyCta() {
    return (
        <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-xl sm:px-4 sm:py-3">
                <a
                    href="#contact"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:px-5 sm:text-base"
                >
                    <MessageSquare className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="hidden sm:inline">💬 Get Quote</span>
                    <span className="sm:hidden">Quote</span>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
                </a>

                <a
                    href={`mailto:${BRAND.email}`}
                    className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 sm:inline-flex sm:px-4 sm:py-3"
                >
                    <Mail className="h-4 w-4" />
                    <span className="hidden lg:inline">📧 Email</span>
                </a>

                <a
                    href={`tel:${BRAND.phone}`}
                    className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 sm:inline-flex sm:px-4 sm:py-3"
                >
                    <Phone className="h-4 w-4" />
                    <span className="hidden lg:inline">📞 Call</span>
                </a>
            </div>
        </div>
    );
}
