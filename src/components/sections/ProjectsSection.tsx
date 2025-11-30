import React, { useMemo } from "react";
import { ChevronRight, FileText, CalendarCheck } from "lucide-react";
import { PROJECTS } from "@/data/landing-page";

export default function ProjectsSection({ activeDivision }: { activeDivision: string }) {
    const filtered = useMemo(
        () => PROJECTS.filter((p) => p.division === activeDivision),
        [activeDivision]
    );
    return (
        <section id="projects" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h3 className="text-xl font-bold sm:text-2xl">Representative Projects</h3>
                    <p className="mt-1 text-sm text-gray-600 sm:text-base">
                        A selection of relevant, representative works for the {activeDivision === "software" ? "Software" : "Civil & Railway"} division.
                    </p>
                </div>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-indigo-300 hover:shadow-xl hover:from-indigo-50 hover:to-purple-50 sm:justify-start">
                    Request References <ChevronRight className="h-4 w-4" />
                </a>
            </div>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                    <article key={p.title} className="group rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                        <h4 className="text-base font-semibold group-hover:underline sm:text-lg">{p.title}</h4>
                        <div className="mt-2 flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:text-sm">
                            <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Value: {p.value}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                                <CalendarCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Duration: {p.duration}</span>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 sm:text-base">{p.summary}</p>
                        <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                            <span className="font-medium">Tech/Scope:</span> {p.tech}
                        </p>
                        <ul className="mt-3 list-disc pl-4 text-xs text-gray-700 sm:pl-5 sm:text-sm">
                            {p.outcomes.map((o) => (
                                <li key={o}>{o}</li>
                            ))}
                        </ul>
                        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
                            <a href="#contact" className="group rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700">
                                💬 Discuss Similar
                            </a>
                            <a href="#tenders" className="group rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-white to-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-700 shadow-lg transition-all duration-300 hover:scale-105 hover:border-indigo-300 hover:shadow-xl hover:from-indigo-50 hover:to-purple-50">
                                📋 See Tender Kit
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
