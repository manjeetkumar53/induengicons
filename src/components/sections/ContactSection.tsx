import React, { useState } from "react";
import { Mail, Phone, ChevronRight } from "lucide-react";
import { BRAND } from "@/data/landing-page";

export default function ContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            company: formData.get("company") as string,
            projectType: formData.get("division") as string,
            message: `Project: ${formData.get("topic") || "New Project"}\nBudget: ${formData.get("budget") || "Not specified"}\nTimeline: ${formData.get("timeline") || "Not specified"}\n\nBrief:\n${formData.get("brief") || ""}`
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitStatus('success');
                setSubmitMessage('Thank you! Your proposal request has been submitted successfully. We will respond within 1 business day.');
                // Reset form
                (e.target as HTMLFormElement).reset();
            } else {
                setSubmitStatus('error');
                setSubmitMessage(result.error || 'Something went wrong. Please try again or email us directly.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                <div>
                    <h3 className="text-xl font-bold sm:text-2xl">Contact</h3>
                    <p className="mt-2 text-sm text-gray-700 sm:text-base">We respond within 1 business day.</p>
                    <div className="mt-4 space-y-3 text-sm text-gray-700 sm:text-base">
                        <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a className="underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                        </p>
                        <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a className="underline" href={`tel:${BRAND.phone}`}>{BRAND.phone}</a>
                        </p>
                    </div>
                    <p className="mt-6 text-xs text-gray-600 sm:text-sm">
                        <strong>Registered Office:</strong> Bihar, India<br />
                        <strong>Service Areas:</strong> Pan-India (Remote & On-site available)
                    </p>
                    <p className="mt-1 text-xs text-gray-600 sm:text-sm">{BRAND.regLine}</p>
                </div>
                <div className="rounded-2xl border p-4 shadow-sm sm:p-6">
                    <h4 className="text-base font-semibold sm:text-lg">Request a Proposal</h4>
                    <p className="mt-1 text-xs text-gray-600 sm:text-sm">Share a brief scope; we&apos;ll reply with a plan &amp; timeline.</p>

                    {/* Success/Error Messages */}
                    {submitStatus === 'success' && (
                        <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm text-green-700">{submitMessage}</p>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">{submitMessage}</p>
                                    <p className="mt-1 text-xs text-red-600">
                                        You can also email us directly at{' '}
                                        <a href={`mailto:${BRAND.email}`} className="underline hover:no-underline">
                                            {BRAND.email}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                required
                                name="name"
                                placeholder="Your name"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                            <input
                                required
                                name="email"
                                type="email"
                                placeholder="Your email"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                name="phone"
                                placeholder="Phone (optional)"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                            <input
                                name="company"
                                placeholder="Company (optional)"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <select
                                name="division"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            >
                                <option value="software">Software</option>
                                <option value="civil">Civil & Railway</option>
                            </select>
                            <input
                                name="timeline"
                                placeholder="Timeline (e.g., 8–12 weeks)"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <input
                                name="topic"
                                placeholder="Project topic"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                            <input
                                name="budget"
                                placeholder="Budget (₹ or range)"
                                className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                                disabled={isSubmitting}
                            />
                        </div>
                        <textarea
                            name="brief"
                            rows={4}
                            placeholder="Brief scope / requirements"
                            className="rounded-xl border px-3 py-2 text-sm outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 sm:py-3"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-4 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    Submit Request
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
