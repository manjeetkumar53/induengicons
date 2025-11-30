import React from "react";
import { Download, FileText, ChevronRight } from "lucide-react";
import { BRAND } from "@/data/landing-page";

export default function TenderSection({ activeDivision }: { activeDivision: string }) {
    const isSoftware = activeDivision === "software";
    return (
        <section id="tenders" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            <div className="rounded-2xl border p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-xl font-bold sm:text-2xl">Tender Readiness Kit</h3>
                        <p className="mt-1 text-sm text-gray-600 sm:text-base">
                            We are registered under DPIIT Startup & Udyam (MSE). Buyers may apply relaxations on prior experience/turnover as per their ATC. We provide complete documentation with each bid.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <a href="#contact" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-3 font-bold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700">
                            <Download className="h-4 w-4 transition-transform group-hover:scale-110" /> 📥 Request Documents
                        </a>
                        <a href="#contact" className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 px-6 py-3 font-bold text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-indigo-300 hover:shadow-xl hover:from-indigo-50 hover:to-purple-50">
                            <FileText className="h-4 w-4 transition-transform group-hover:scale-110" /> 🎯 Ask a Demo
                        </a>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-3">
                    <ul className="rounded-xl border p-4 text-sm">
                        <li className="mb-2 font-semibold">Company & Compliance</li>
                        <li>Partnership Deed, PAN, GSTIN: {BRAND.gstin}</li>
                        <li>DPIIT Startup, Udyam (MSE)</li>
                        <li>Bank details & cancelled cheque</li>
                        <li>Authorized Signatory</li>
                        <li>DSC (Class-III) for CPP/eProc</li>
                    </ul>
                    <ul className="rounded-xl border p-4 text-sm">
                        <li className="mb-2 font-semibold">Technical Pack</li>
                        {isSoftware ? (
                            <>
                                <li>Solution approach & architecture</li>
                                <li>Security (OWASP), audit logs</li>
                                <li>CI/CD & Infra-as-Code (Terraform)</li>
                                <li>Test plan, UAT checklist</li>
                                <li>Deployment & runbooks</li>
                            </>
                        ) : (
                            <>
                                <li>BoQ & methodology</li>
                                <li>Quality plan (QA/QC, IS codes)</li>
                                <li>Safety SOP & toolbox talks</li>
                                <li>Bar charts / schedule</li>
                                <li>Measurement & billing flow</li>
                            </>
                        )}
                    </ul>
                    <ul className="rounded-xl border p-4 text-sm">
                        <li className="mb-2 font-semibold">Commercials & SLA</li>
                        <li>Milestones & payment schedule</li>
                        <li>Warranty/Defect liability</li>
                        <li>Scope change control</li>
                        <li>Acceptance criteria</li>
                        <li>Support model / AMC</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
