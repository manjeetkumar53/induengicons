"use client";

import React, { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  Code2,
  Database,
  Cloud,
  ShieldCheck,
  FileText,
  Rocket,
  BadgeCheck,
  Hammer,
  HardHat,
  Building2,
  Train,
  LayoutGrid,
  Mail,
  Phone,
  MessageSquare,
  Download,
  ChevronRight,
  Globe,
  Users,
  CalendarCheck,
  Menu,
  X,
  ArrowUp,
  Star,
  Award,
  Target,
  Zap,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

// Lazy load heavy components for better performance
const LazyProjectsSection = lazy(() => Promise.resolve({ default: ProjectsSection }));
const LazyTenderSection = lazy(() => Promise.resolve({ default: TenderSection }));
const LazyAboutSection = lazy(() => Promise.resolve({ default: AboutSection }));
const LazyContactSection = lazy(() => Promise.resolve({ default: ContactSection }));

const BRAND = {
  name: "Induengicons",
  tagline: "Engineering. Software. Outcomes.",
  email: "kanhaiyasingh2102@gmail.com",
  phone: "+91-98765-43210", // Update with your actual phone number
  gstin: "07AABCI1681G1Z0", // Update with your actual GSTIN
  regLine: "DPIIT Startup • Udyam (MSE) Registered",
  locations: "Bihar & Pan-India • Remote/Onsite",
};

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: <Globe className="h-4 w-4" />, description: "Overview & Services" },
  { label: "Software", href: "#/software", icon: <Code2 className="h-4 w-4" />, description: "Web, Mobile & Cloud Solutions" },
  { label: "Civil & Railway", href: "#/civil", icon: <Building2 className="h-4 w-4" />, description: "Infrastructure & Construction" },
  // TODO: Improve navigation for Projects and Tenders sections later
  // { label: "Projects", href: "#projects", icon: <FileText className="h-4 w-4" />, description: "Portfolio & Case Studies" },
  // { label: "Tenders", href: "#tenders", icon: <Download className="h-4 w-4" />, description: "Documentation & Compliance" },
  { label: "About", href: "#about", icon: <Users className="h-4 w-4" />, description: "Company & Team Info" },
  { label: "Contact", href: "#contact", icon: <MessageSquare className="h-4 w-4" />, description: "Get Quote & Support" },
];

const SOFT_SERVICES = [
  {
    icon: <Code2 className="h-5 w-5"/>,
    title: "Custom Web & API Development",
    desc: "Next.js, Node, Django, secure REST and GraphQL APIs, admin portals, dashboards.",
  },
  {
    icon: <Database className="h-5 w-5"/>,
    title: "Data & Analytics",
    desc: "Postgres, Mongo, BigQuery, ETL pipelines, reporting (CSV and PDF), role-based access.",
  },
  {
    icon: <Cloud className="h-5 w-5"/>,
    title: "Cloud & DevOps",
    desc: "AWS, Azure, GCP, Terraform IaC, CI and CD, monitoring, cost optimization, backups and DR.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5"/>,
    title: "Security & Compliance",
    desc: "OWASP ASVS hygiene, audit logs, PII minimization, encryption in transit & at rest.",
  },
  {
    icon: <Rocket className="h-5 w-5"/>,
    title: "MVP in 4 Weeks",
    desc: "Scoping to build 6-8 core screens to tests to deployment to handover and runbooks.",
  },
  {
    icon: <BadgeCheck className="h-5 w-5"/>,
    title: "AMC & Support",
    desc: "Bug fixes, enhancements, SLA-based response, monthly reports, knowledge transfer.",
  },
];

const CIVIL_SERVICES = [
  {
    icon: <Hammer className="h-5 w-5"/>,
    title: "Civil Construction & Repairs",
    desc: "PCC and RCC works, building repairs, public utility assets, site development.",
  },
  {
    icon: <Building2 className="h-5 w-5"/>,
    title: "Public Infrastructure",
    desc: "Roads, culverts, drains, boundary walls, campus works for schools and hospitals.",
  },
  {
    icon: <Train className="h-5 w-5"/>,
    title: "Railway Allied Works",
    desc: "Platform maintenance, minor structures, peripheral civil jobs, signages and fencing.",
  },
  {
    icon: <HardHat className="h-5 w-5"/>,
    title: "Project Management",
    desc: "BoQ, quality checks, safety protocols, schedule control, contractor coordination.",
  },
  {
    icon: <LayoutGrid className="h-5 w-5"/>,
    title: "Turnkey Packages",
    desc: "Materials plus labor execution with documented QA and QC and handover packs.",
  },
  {
    icon: <BadgeCheck className="h-5 w-5"/>,
    title: "Maintenance Contracts",
    desc: "AMC for facilities; inspection logs, preventive maintenance, rapid response.",
  },
];

// Representative/dummy portfolio for website display
const PROJECTS = [
  // SOFTWARE
  {
    division: "software",
    title: "Municipal Citizen Grievance Portal",
    value: "₹12,00,000",
    duration: "10 weeks",
    summary:
      "Web + API + Admin for tracking citizen requests; role-based access, SMS/email alerts, CSV/PDF exports.",
    tech: "Next.js, Node/Express, Postgres, Terraform, GitHub Actions",
    outcomes: [
      "First response SLA under 24h",
      ">95% uptime with basic monitoring",
      "Handover with runbooks & training",
    ],
  },
  {
    division: "software",
    title: "Material Flow Orchestrator (Pilot)",
    value: "₹18,50,000",
    duration: "12 weeks",
    summary:
      "Offline-first mobile + admin for material pickups, reconciliation, and route planning.",
    tech: "React Native (Expo), Node API, MongoDB, WatermelonDB, CI/CD",
    outcomes: [
      "30% reduction in coordination time",
      "Digital proof-of-pickup with photos",
      "Automated reconciliation report",
    ],
  },
  {
    division: "software",
    title: "Departmental Asset Registry & AMC Tracker",
    value: "₹9,80,000",
    duration: "8 weeks",
    summary:
      "Central registry with QR tagging, AMC reminders, vendor SLAs and audit logs.",
    tech: "Django REST Framework, Next.js, Postgres, Redis",
    outcomes: [
      "Unified view of assets across 12 locations",
      "AMC renewal alerts & escalations",
      "CSV/PDF compliance packs for audits",
    ],
  },
  // CIVIL / RAILWAY
  {
    division: "civil",
    title: "PCC Road & Drain Repair (Ward Level)",
    value: "₹22,40,000",
    duration: "14 weeks",
    summary:
      "Strengthening of local PCC road stretches with side drains; traffic & safety management included.",
    tech: "M20 PCC, bar bending schedule, cube testing, DPR & bar charts",
    outcomes: [
      "On-time delivery before monsoon",
      "Quality logs & test reports submitted",
      "Community access disruptions minimized",
    ],
  },
  {
    division: "civil",
    title: "School Building Repair & Painting",
    value: "₹11,60,000",
    duration: "7 weeks",
    summary:
      "Masonry repairs, plastering, internal/external painting, sanitary fixture replacement.",
    tech: "Primer + acrylic emulsion, PPC cement plaster, IS code-compliant materials",
    outcomes: [
      "Completed within academic break",
      "Handover snag-list cleared",
      "Maintenance SOP provided",
    ],
  },
  {
    division: "civil",
    title: "Railway Platform Misc. Works",
    value: "₹19,90,000",
    duration: "9 weeks",
    summary:
      "Peripheral civil improvements: platform patching, signages, fencing, drainage repairs.",
    tech: "Schedule of Rates (SoR) compliance, QA/QC logs, safety toolbox talks",
    outcomes: [
      "Zero safety incidents",
      "Daily progress & joint measurement",
      "Final documentation pack submitted",
    ],
  },
];

const BADGES = [
  { label: "DPIIT Startup", icon: <BadgeCheck className="h-4 w-4"/> },
  { label: "Udyam (MSE)", icon: <BadgeCheck className="h-4 w-4"/> },
  { label: "GST Registered", icon: <BadgeCheck className="h-4 w-4"/> },
];

function useHashRoute() {
  // Always initialize to "home" to ensure server/client consistency
  const [route, setRoute] = useState("home");
  
  useEffect(() => {
    // Set initial route from hash after hydration
    const setInitialRoute = () => {
      const h = window.location.hash;
      if (h.includes("/civil")) {
        setRoute("civil");
      } else if (h.includes("/software")) {
        setRoute("software");
      } else {
        setRoute("home");
      }
    };
    
    // Set initial route
    setInitialRoute();
    
    // Listen for hash changes
    const onHash = () => {
      const h = window.location.hash;
      if (h.includes("/civil")) {
        setRoute("civil");
      } else if (h.includes("/software")) {
        setRoute("software");
      } else {
        setRoute("home");
      }
    };
    
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  
  return [route, setRoute] as const;
}

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
        <HomeSection setRoute={setRoute} />
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

function TopBar() {
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

function Nav({ 
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
                className={`group relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 touch-manipulation select-none ${
                  (route === "home" && link.label === "Home") ||
                  (route === "software" && link.label === "Software") ||
                  (route === "civil" && link.label === "Civil & Railway") 
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md scale-105" 
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-sm hover:scale-105 active:scale-100"
                }`}
                title={link.description}
              >
                <div className="flex items-center gap-2">
                  <div className={`transition-all duration-300 ${
                    (route === "home" && link.label === "Home") ||
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
                  className={`group rounded-xl px-4 py-3 text-left font-medium transition-all duration-300 touch-manipulation select-none ${
                    (route === "home" && link.label === "Home") ||
                    (route === "software" && link.label === "Software") ||
                    (route === "civil" && link.label === "Civil & Railway")
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-black border border-indigo-200 shadow-sm transform scale-[1.02]" 
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] active:bg-gradient-to-r active:from-indigo-50 active:to-purple-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      (route === "home" && link.label === "Home") ||
                      (route === "software" && link.label === "Software") ||
                      (route === "civil" && link.label === "Civil & Railway")
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-110" 
                        : "bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 group-hover:scale-105"
                    }`}>
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold transition-colors duration-300 ${
                        (route === "home" && link.label === "Home") ||
                        (route === "software" && link.label === "Software") ||
                        (route === "civil" && link.label === "Civil & Railway")
                          ? "text-indigo-700" 
                          : "group-hover:text-indigo-600"
                      }`}>
                        {link.label}
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors duration-300 ${
                        (route === "home" && link.label === "Home") ||
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

function HomeSection({ setRoute }: { setRoute: (route: string) => void }) {
  return (
    <>
      {/* Hero Section */}
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

      {/* Value Propositions */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 mb-4">
              <Target className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              International Standards,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Local Expertise
              </span>
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 sm:text-xl">
              We bring together software engineering and civil construction expertise with 
              world-class standards that meet the needs of government, enterprise, and individual clients.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">Tender-Ready Documentation</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Complete compliance packs, technical specifications, and commercial terms ready for government and enterprise tenders with DPIIT startup benefits.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-indigo-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Government Compliant
                </div>
              </div>
            </div>
            
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">Lightning Fast Delivery</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  From concept to production in 4-8 weeks with agile methodology, daily standups, and transparent progress tracking that keeps all stakeholders informed.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Agile Methodology
                </div>
              </div>
            </div>
            
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">Enterprise Security</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  OWASP security standards, comprehensive audit trails, data encryption, and full compliance with IS codes and international regulations.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-purple-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  OWASP Certified
                </div>
              </div>
            </div>
            
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">Quality Excellence</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Comprehensive QA/QC processes, automated testing, code reviews, and documentation for both software and civil engineering projects.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-orange-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ISO Standards
                </div>
              </div>
            </div>
            
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-4 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">Future-Ready Solutions</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Built for growth with microservices architecture, cloud-native deployment, AI-ready infrastructure, and maintenance-friendly designs.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Cloud Native
                </div>
              </div>
            </div>
            
            <div className="group relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-50 to-green-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 p-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900 sm:text-2xl">24/7 Support Excellence</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  From initial consultation to post-deployment support, we provide comprehensive service with dedicated project managers and technical teams.
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-teal-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Always Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Overview */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 text-sm font-medium text-indigo-700 mb-4">
              <Users className="h-4 w-4" />
              Our Expertise
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Two Specialized{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Divisions
              </span>
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 sm:text-xl">
              Comprehensive solutions for modern challenges - from digital transformation 
              to infrastructure development, we excel in both domains.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Software Division */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 opacity-10 transition-opacity group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border-2 border-indigo-200 bg-white p-8 shadow-lg transition-all duration-500 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-2 sm:p-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 shadow-lg">
                    <Code2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    Available Now
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Software Division</h3>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  Full-stack development, cloud infrastructure, AI/ML solutions, and secure systems 
                  designed for government, enterprise, and startup clients with international quality standards.
                </p>
                
                <div className="mt-8 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Core Services:</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                      </div>
                      Web & Mobile Apps
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                      </div>
                      Cloud & DevOps
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                      </div>
                      AI/ML Integration
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                      </div>
                      Cybersecurity
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#/software"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute("software");
                      window.location.hash = "#/software";
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Explore Software Services
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 px-6 py-3 text-base font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    Get Quote
                    <MessageSquare className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Civil Division */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-600 to-red-600 opacity-10 transition-opacity group-hover:opacity-20"></div>
              <div className="relative rounded-3xl border-2 border-orange-200 bg-white p-8 shadow-lg transition-all duration-500 hover:border-orange-300 hover:shadow-2xl hover:-translate-y-2 sm:p-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 p-4 shadow-lg">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    Available Now
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">Civil & Railway Division</h3>
                <p className="mt-4 text-gray-600 text-lg leading-relaxed">
                  Infrastructure development, construction projects, and railway allied works 
                  with international quality standards, safety protocols, and environmental compliance.
                </p>
                
                <div className="mt-8 space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Core Services:</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-orange-100 p-1">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      Civil Construction
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-orange-100 p-1">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      Public Infrastructure
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-orange-100 p-1">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      Railway Projects
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="flex-shrink-0 rounded-full bg-orange-100 p-1">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      Project Management
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#/civil"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute("civil");
                      window.location.hash = "#/civil";
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-base font-semibold text-white transition-all hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Explore Civil Services
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-orange-200 px-6 py-3 text-base font-semibold text-orange-700 transition-all hover:border-orange-300 hover:bg-orange-50"
                  >
                    Get Quote
                    <MessageSquare className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-16 sm:py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm mb-6">
              <Rocket className="h-4 w-4" />
              Ready to Get Started?
            </div>
            
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Transform Your Vision Into{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Reality
              </span>
            </h2>
            
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-300 sm:text-xl">
              Get professional documentation, international quality standards, and guaranteed delivery 
              for your next government, enterprise, or personal project. Let&apos;s build something amazing together.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <MessageSquare className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Start Your Project</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#tenders"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <Download className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Download Tender Kit</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-80">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <BadgeCheck className="h-5 w-5 text-green-400" />
                <span>DPIIT Registered</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Shield className="h-5 w-5 text-blue-400" />
                <span>ISO Quality Standards</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Clock className="h-5 w-5 text-purple-400" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Award className="h-5 w-5 text-yellow-400" />
                <span>99% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DivisionLanding({
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
    <section className={`relative overflow-hidden ${
      isSoftware 
        ? "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50" 
        : "bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50"
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={`h-full w-full ${
          isSoftware
            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)]"
            : "bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1)_0%,transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1)_0%,transparent_50%)]"
        }`}></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            {/* Division Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
              isSoftware
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
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                isSoftware
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
                  className={`rounded-full px-4 py-2 font-medium shadow-sm transition-all hover:scale-105 ${
                    isSoftware
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
                className={`group inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl ${
                  isSoftware
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
                className={`group inline-flex items-center justify-center gap-3 rounded-2xl border-2 px-8 py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isSoftware
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
          <div className={`rounded-3xl border-2 p-6 shadow-xl sm:p-8 ${
            isSoftware
              ? "bg-white/80 border-indigo-200 backdrop-blur-sm"
              : "bg-white/80 border-orange-200 backdrop-blur-sm"
          }`}>
            <div className="mb-6 text-center">
              <h3 className={`text-xl font-bold sm:text-2xl ${
                isSoftware ? "text-indigo-900" : "text-orange-900"
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
                  className={`group rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg sm:p-5 ${
                    isSoftware
                      ? "border-indigo-100 bg-gradient-to-br from-white to-indigo-50 hover:border-indigo-300"
                      : "border-orange-100 bg-gradient-to-br from-white to-orange-50 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 shadow-lg transition-all group-hover:scale-110 ${
                      isSoftware
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
    <div className={`mt-12 grid grid-cols-2 gap-4 rounded-3xl border-2 p-6 shadow-xl sm:gap-6 sm:p-8 lg:grid-cols-4 ${
      isSoftware
        ? "bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200"
        : "bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 border-orange-200"
    }`}>
      {stats.map((s) => (
        <div
          key={s.label}
          className={`group text-center transition-all duration-300 hover:scale-110 rounded-2xl p-4 ${
            isSoftware
              ? "hover:bg-white/80 hover:shadow-lg"
              : "hover:bg-white/80 hover:shadow-lg"
          }`}
        >
          <div className="text-2xl mb-2">{s.icon}</div>
          <div className={`text-xl font-extrabold sm:text-2xl lg:text-3xl ${
            isSoftware ? "text-indigo-600" : "text-orange-600"
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

function ProjectsSection({ activeDivision }: { activeDivision: string }) {
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

function TenderSection({ activeDivision }: { activeDivision: string }) {
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

function AboutSection() {
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

function ContactSection() {
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
              <Mail className="h-4 w-4"/> 
              <a className="underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4"/> 
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
                  <Mail className="h-4 w-4 transition-transform group-hover:scale-110"/> 
                  � Submit Request
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

function Footer() {
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

function StickyCta() {
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
