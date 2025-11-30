import React from "react";
import { BRAND } from "@/data/landing-page";

export default function AboutSection() {
    return (
        <section id="about" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-70"></div>

            <div className="relative">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        About {BRAND.name}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        A multi-disciplinary firm executing both software engineering and civil works with a focus on
                        clarity, quality, and timely delivery.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Company Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">I</span>
                                </div>
                                Our Mission
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {BRAND.name} bridges the gap between technology and infrastructure. For software, we provide
                                end-to-end builds (web, API, mobile), cloud & DevOps, and maintenance. For civil & railway,
                                we deliver small-to-mid value works with documented QA/QC and safety protocols.
                            </p>
                        </div>

                        {/* Why Work With Us Cards */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white text-lg">💻</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Software Excellence</h4>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Tender-ready documents & compliance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Code + IaC + runbooks handover</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Security hygiene (OWASP)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Fast MVP timelines (4–8 weeks)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 border border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white text-lg">🏗️</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Civil Expertise</h4>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>On-time, safety-first execution</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>IS code-compliant QA/QC</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Transparent measurements</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Neat documentation packs</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Models & Certifications */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">🤝</span>
                                </div>
                                Engagement Models
                            </h4>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    { name: "Fixed-scope", desc: "Clear deliverables with defined timelines", color: "from-blue-500 to-cyan-500" },
                                    { name: "Time & Material", desc: "Flexible hourly engagement model", color: "from-purple-500 to-pink-500" },
                                    { name: "AMC/Support", desc: "Ongoing maintenance and support", color: "from-green-500 to-emerald-500" },
                                    { name: "Joint Venture", desc: "Partnership for larger projects", color: "from-orange-500 to-yellow-500" }
                                ].map((model) => (
                                    <div key={model.name} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-6 h-6 bg-gradient-to-r ${model.color} rounded-lg`}></div>
                                            <span className="font-semibold text-gray-900 text-sm">{model.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{model.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 border border-indigo-200 shadow-lg">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">🏆</span>
                                </div>
                                Certifications & Registrations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {["DPIIT Startup", "Udyam (MSE)", `GSTIN: ${BRAND.gstin}`].map((cert) => (
                                    <span key={cert} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-700 border border-indigo-200">
                                        {cert}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-3">
                                Officially recognized and registered to deliver professional services across India.
                            </p>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <h4 className="text-lg font-bold mb-2">Ready to Start Your Project?</h4>
                            <p className="text-indigo-100 text-sm mb-4">
                                Let&apos;s discuss how we can help bring your software or infrastructure vision to life.
                            </p>
                            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                                Get In Touch
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
