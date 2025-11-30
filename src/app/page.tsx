"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { ArrowUp } from "lucide-react";

// Data
import { SOFT_SERVICES, CIVIL_SERVICES } from "@/data/landing-page";

// Hooks
import { useHashRoute } from "@/hooks/useHashRoute";

// Components
import { TopBar, Nav } from "@/components/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import DivisionLanding from "@/components/sections/DivisionLanding";
import Footer from "@/components/sections/Footer";
import StickyCta from "@/components/sections/StickyCta";

// Lazy load heavy components for better performance
const LazyProjectsSection = lazy(() => import("@/components/sections/ProjectsSection"));
const LazyTenderSection = lazy(() => import("@/components/sections/TenderSection"));
const LazyAboutSection = lazy(() => import("@/components/sections/AboutSection"));
const LazyContactSection = lazy(() => import("@/components/sections/ContactSection"));

export default function InduengiconsSite() {
  const [route, setRoute] = useHashRoute();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isSoftware = route === "software";
  const isHome = route === "home";

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [route]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <TopBar />
      <Nav
        route={route}
        setRoute={setRoute}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {isHome ? (
        <HeroSection setRoute={setRoute} />
      ) : isSoftware ? (
        <DivisionLanding
          key="software"
          division="software"
          title="Software Engineering for Government & Enterprise"
          subtitle="We design, build, and maintain secure web, API, and mobile systems — ready for tenders and production."
          services={SOFT_SERVICES}
        />
      ) : (
        <DivisionLanding
          key="civil"
          division="civil"
          title="Civil, Construction & Railway Works"
          subtitle="On-time, quality-driven execution for public infrastructure and allied works."
          services={CIVIL_SERVICES}
        />
      )}

      {!isHome && (
        <Suspense fallback={
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <LazyProjectsSection activeDivision={route} />
          <LazyTenderSection activeDivision={route} />
        </Suspense>
      )}

      <Suspense fallback={
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      }>
        <LazyAboutSection />
        <LazyContactSection />
      </Suspense>

      <Footer />

      <StickyCta />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 left-4 z-50 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:bottom-6 sm:left-6 sm:p-4"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  );
}
