import React from "react";
import {
  Code2,
  Database,
  Cloud,
  ShieldCheck,
  Rocket,
  BadgeCheck,
  Hammer,
  Building2,
  Train,
  HardHat,
  LayoutGrid,
  Globe,
  Users,
  MessageSquare,
  Download,
  FileText
} from "lucide-react";

export const BRAND = {
  name: "Induengicons",
  tagline: "Engineering. Software. Outcomes.",
  email: "kanhaiyasingh2102@gmail.com",
  phone: "+91-98765-43210", // Update with your actual phone number
  gstin: "07AABCI1681G1Z0", // Update with your actual GSTIN
  regLine: "DPIIT Startup • Udyam (MSE) Registered",
  locations: "Bihar & Pan-India • Remote/Onsite",
};

export interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home", icon: <Globe className="h-4 w-4" />, description: "Overview & Services" },
  { label: "Software", href: "#/software", icon: <Code2 className="h-4 w-4" />, description: "Web, Mobile & Cloud Solutions" },
  { label: "Civil & Railway", href: "#/civil", icon: <Building2 className="h-4 w-4" />, description: "Infrastructure & Construction" },
  // TODO: Improve navigation for Projects and Tenders sections later
  // { label: "Projects", href: "#projects", icon: <FileText className="h-4 w-4" />, description: "Portfolio & Case Studies" },
  // { label: "Tenders", href: "#tenders", icon: <Download className="h-4 w-4" />, description: "Documentation & Compliance" },
  { label: "About", href: "#about", icon: <Users className="h-4 w-4" />, description: "Company & Team Info" },
  { label: "Contact", href: "#contact", icon: <MessageSquare className="h-4 w-4" />, description: "Get Quote & Support" },
];

export const SOFT_SERVICES = [
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

export const CIVIL_SERVICES = [
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

export const PROJECTS = [
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

export const BADGES = [
  { label: "DPIIT Startup", icon: <BadgeCheck className="h-4 w-4"/> },
  { label: "Udyam (MSE)", icon: <BadgeCheck className="h-4 w-4"/> },
  { label: "GST Registered", icon: <BadgeCheck className="h-4 w-4"/> },
];
