import React from "react";
import {
    Code2,
    Building2,
    MessageSquare,
    Download,
    ChevronRight,
} from "lucide-react";

function StatsBanner({ division }: { division: "software" | "civil" }) {
    const isSoftware = division === "software";
    const stats = division === "software"
        ? [
            { label: "MVP Delivery", value: "4-8 weeks", icon: "⚡" },
            { label: "Uptime Targets", value: "≥ 99%", icon: "🎯" },
            { label: "Security Checks", value: "OWASP/ASVS", icon: "🔒" },
            { label: "Handover", value: "Code + IaC + Docs", icon: "📋" },
        ]
        : [
            { label: "Work Value Range", value: "₹5L - ₹25L", icon: "💰" },
            { label: "Safety", value: "Zero-LTI target", icon: "🛡️" },
            { label: "QA/QC", value: "IS codes + lab tests", icon: "✅" },
            { label: "Handover", value: "JMC + completion pack", icon: "📋" },
        ];

    return (
        <div className={`mt-12 grid grid-cols-2 gap-4 rounded-3xl border-2 p-6 shadow-xl sm:gap-6 sm:p-8 lg:grid-cols-4 ${isSoftware
                ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200"
                : "bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 border-orange-200"
            }`}>
            {stats.map((s) => (
                <div
                    key={s.label}
                    className={`group text-center transition-all duration-300 hover:scale-110 rounded-2xl p-4 ${isSoftware
                            ? "hover:bg-white/80 hover:shadow-lg"
                            : "hover:bg-white/80 hover:shadow-lg"
                        }`}
                >
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className={`text-xl font-extrabold sm:text-2xl lg:text-3xl ${isSoftware ? "text-indigo-600" : "text-orange-600"
                        }`}>
                        {s.value}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-wide text-gray-600 font-medium sm:text-sm">
                        {s.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function DivisionLanding({
    division,
    title,
    subtitle,
    services,
}: {
    division: "software" | "civil";
    title: string;
    subtitle: string;
    services: { icon: React.ReactNode; title: string; desc: string }[];
}) {
    const isSoftware = division === "software";

    return (
        <section className={`relative overflow-hidden ${isSoftware
                ? "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50"
                : "bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50"
            }`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className={`h-full w-full ${isSoftware
                        ? "bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)]"
                        : "bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1)_0%,transparent_50%)]"
                    }`}></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    <div>
                        {/* Division Badge */}
                        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${isSoftware
                                ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-2 border-indigo-200"
                                : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-2 border-orange-200"
                            }`}>
                            {isSoftware ? (
                                <>
                                    <Code2 className="h-4 w-4" />
                                    💻 Software Division
                                </>
                            ) : (
                                <>
                                    <Building2 className="h-4 w-4" />
                                    🏗️ Civil & Railway Division
                                </>
                            )}
                        </div>

                        {/* Main Title */}
                        <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                            <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isSoftware
                                    ? "from-indigo-600 via-purple-600 to-blue-600"
                                    : "from-orange-600 via-red-600 to-yellow-600"
                                }`}>
                                {title.split(' ').slice(0, 2).join(' ')}
                            </span>
                            <br />
                            <span className="text-gray-900">
                                {title.split(' ').slice(2).join(' ')}
                            </span>
                        </h2>

                        {/* Subtitle */}
                        <p className="mt-6 text-lg text-gray-700 sm:text-xl leading-relaxed">{subtitle}</p>

                        {/* Feature Tags */}
                        <div className="mt-8 flex flex-wrap gap-3 text-sm">
                            {["Tender-ready docs", "Clear milestones", "On-time delivery", "Warranty & AMC"].map((tag) => (
                                <span
                                    key={tag}
                                    className={`rounded-full px-4 py-2 font-medium shadow-sm transition-all hover:scale-105 ${isSoftware
                                            ? "bg-white/80 text-indigo-700 border border-indigo-200"
                                            : "bg-white/80 text-orange-700 border border-orange-200"
                                        }`}
                                >
                                    ✅ {tag}
                                </span>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <a
                                href="#contact"
                                className={`group inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl ${isSoftware
                                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700"
                                        : "bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 hover:from-orange-700 hover:via-red-700 hover:to-yellow-700"
                                    }`}
                            >
                                <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                                💬 Discuss Your Scope
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href="#tenders"
                                className={`group inline-flex items-center justify-center gap-3 rounded-2xl border-2 px-8 py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${isSoftware
                                        ? "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                                        : "border-orange-300 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-400"
                                    }`}
                            >
                                <Download className="h-5 w-5 transition-transform group-hover:scale-110" />
                                📋 See Tender Kit
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div className={`rounded-3xl border-2 p-6 shadow-xl sm:p-8 ${isSoftware
                            ? "bg-white/80 border-indigo-200 backdrop-blur-sm"
                            : "bg-white/80 border-orange-200 backdrop-blur-sm"
                        }`}>
                        <div className="mb-6 text-center">
                            <h3 className={`text-xl font-bold sm:text-2xl ${isSoftware ? "text-indigo-900" : "text-orange-900"
                                }`}>
                                🎯 Core Services
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Professional solutions with international standards
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                            {services.map((s) => (
                                <div
                                    key={s.title}
                                    className={`group rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg sm:p-5 ${isSoftware
                                            ? "border-indigo-100 bg-gradient-to-br from-white to-indigo-50 hover:border-indigo-300"
                                            : "border-orange-100 bg-gradient-to-br from-white to-orange-50 hover:border-orange-300"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`rounded-xl p-2 shadow-lg transition-all group-hover:scale-110 ${isSoftware
                                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                                : "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                                            }`}>
                                            {s.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 sm:text-base group-hover:text-indigo-900">
                                                {s.title}
                                            </h4>
                                            <p className="mt-2 text-xs text-gray-600 sm:text-sm leading-relaxed">
                                                {s.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 rounded-xl bg-gray-50 p-4 text-xs text-gray-500 sm:text-sm">
                            📋 <strong>Note:</strong> Some projects shown on this website are representative demonstrations to protect client confidentiality. Detailed references available on request.
                        </p>
                    </div>
                </div>

                <StatsBanner division={division} />
            </div>
        </section>
    );
}
