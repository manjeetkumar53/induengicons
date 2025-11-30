import React from "react";
import {
    Star,
    BadgeCheck,
    Zap,
    Shield,
    CheckCircle,
    Award,
    Code2,
    ChevronRight,
    Building2,
    MessageSquare,
} from "lucide-react";

export default function HeroSection({ setRoute }: { setRoute: (route: string) => void }) {
    return (
        <section id="home" className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40">
                <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
                <div className="text-center">
                    <div className="mx-auto max-w-5xl">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm mb-8 transition-all hover:shadow-md">
                            <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <Star className="h-4 w-4" />
                            <span className="hidden sm:inline">✅ Government & Enterprise Partner</span>
                            <span className="sm:hidden">✅ Trusted Partner</span>
                            <span className="mx-1">•</span>
                            <BadgeCheck className="h-4 w-4" />
                            <span>DPIIT • Udyam</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
                            <span className="block">Engineering Excellence</span>
                            <span className="block mt-2">for</span>
                            <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Tomorrow&apos;s World
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-gray-600 sm:text-xl lg:text-2xl">
                            From cutting-edge <span className="font-semibold text-indigo-600">software solutions</span> to robust{" "}
                            <span className="font-semibold text-orange-600">civil infrastructure</span> — we deliver{" "}
                            <span className="font-bold text-gray-900">tender-ready projects</span> with{" "}
                            <span className="font-bold text-gray-900">guaranteed outcomes</span>.
                        </p>

                        {/* Feature Pills */}
                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-medium text-gray-700 shadow-sm">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                ⚡ 4-8 Week MVP
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-medium text-gray-700 shadow-sm">
                                <Shield className="h-4 w-4 text-green-500" />
                                🔒 OWASP Secure
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-medium text-gray-700 shadow-sm">
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                                ✅ 99% On-Time
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-medium text-gray-700 shadow-sm">
                                <Award className="h-4 w-4 text-purple-500" />
                                🏆 ISO Quality
                            </span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <a
                                href="#/software"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setRoute("software");
                                    window.location.hash = "#/software";
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <Code2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                                <span>💻 Software Solutions</span>
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href="#/civil"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setRoute("civil");
                                    window.location.hash = "#/civil";
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            >
                                <Building2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                                <span>🏗️ Infrastructure Works</span>
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>

                        {/* Secondary CTA */}
                        <div className="mt-6">
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 text-base font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                            >
                                <MessageSquare className="h-4 w-4" />
                                💬 Schedule a free consultation
                                <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats */}
                <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:gap-8">
                    <div className="group text-center transition-transform hover:scale-105">
                        <div className="relative">
                            <div className="text-3xl font-bold text-indigo-600 sm:text-4xl lg:text-5xl">50+</div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                        </div>
                        <div className="mt-2 text-sm font-medium text-gray-600 sm:text-base">Projects Delivered</div>
                    </div>
                    <div className="group text-center transition-transform hover:scale-105">
                        <div className="text-3xl font-bold text-green-600 sm:text-4xl lg:text-5xl">99%</div>
                        <div className="mt-2 text-sm font-medium text-gray-600 sm:text-base">On-Time Delivery</div>
                    </div>
                    <div className="group text-center transition-transform hover:scale-105">
                        <div className="text-3xl font-bold text-purple-600 sm:text-4xl lg:text-5xl">₹25L+</div>
                        <div className="mt-2 text-sm font-medium text-gray-600 sm:text-base">Project Values</div>
                    </div>
                    <div className="group text-center transition-transform hover:scale-105">
                        <div className="text-3xl font-bold text-orange-600 sm:text-4xl lg:text-5xl">4-8</div>
                        <div className="mt-2 text-sm font-medium text-gray-600 sm:text-base">Weeks to MVP</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
