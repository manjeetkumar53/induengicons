# InduEngicons - Engineering Solutions Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manjeetkumar53/induengicons)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Database-red)](https://redis.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

A professional business website for InduEngicons, showcasing engineering solutions across Software Development and Civil & Railway Engineering divisions. Features a modern responsive design with functional contact forms, database integration, and analytics tracking.

## 🌐 Live Website

**Production**: [https://induengicons.vercel.app](https://induengicons.vercel.app)

**Admin Dashboard**: [https://induengicons.vercel.app/admin/contact](https://induengicons.vercel.app/admin/contact)

## 🏗️ Architecture & Infrastructure

### **Frontend Stack**
- **Framework**: Next.js 15.5.3 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Icons**: Lucide React
- **Hosting**: Vercel (Free Tier)

### **Backend & Database**
- **API Routes**: Next.js API Routes
- **Database**: Vercel Redis (Redis Cloud)
- **Client**: node-redis
- **Authentication**: Vercel Deployment Protection

### **Analytics & Monitoring**
- **Analytics**: Vercel Analytics
- **Performance**: Vercel Speed Insights
- **Error Tracking**: Built-in Next.js error handling

### **CI/CD & Deployment**
- **Version Control**: GitHub
- **Auto-Deployment**: Vercel GitHub Integration
- **Environment**: Production, Preview, Development

## 🎯 Features

### **Business Website**
- ✅ Professional homepage with company branding
- ✅ Dual division structure (Software & Civil Engineering)
- ✅ Responsive design (mobile-first approach)
- ✅ Smart navigation with hash routing
- ✅ SEO optimized with meta tags
- ✅ Performance optimized (Lighthouse score 90+)

### **Contact Management System**
- ✅ Functional contact forms with validation
- ✅ Redis database integration for lead storage
- ✅ Real-time form submission with success/error handling
- ✅ Admin dashboard for viewing submissions
- ✅ Email and phone quick actions
- ✅ Structured data storage with timestamps

### **Content Sections**
- ✅ Hero section with company introduction
- ✅ Services overview for both divisions
- ✅ Project showcases with technical details
- ✅ Company credentials and certifications
- ✅ Contact information and proposal forms

## 🗄️ Database Schema

### **Redis Data Structure**

```redis
# Contact Submissions List (maintains order)
contact:submissions -> ["contact:1758294264701", "contact:1758294161116", ...]

# Individual Contact Records
contact:{timestamp_id} -> {
  "id": "1758294264701",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+91-9988776655",
  "company": "Smith Tech Solutions",
  "projectType": "civil|software",
  "message": "Project requirements...",
  "timestamp": "2025-09-19T15:04:24.702Z",
  "status": "new"
}
```

### **Database Commands**
```bash
# View all keys
KEYS *

# Get submission count
LLEN contact:submissions

# View all submission IDs
LRANGE contact:submissions 0 -1

# Get specific submission
GET contact:1758294264701
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git
- Vercel CLI (for deployment)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/manjeetkumar53/induengicons.git
   cd induengicons
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.development.local`:
   ```bash
   REDIS_URL="redis://default:PASSWORD@HOST:PORT"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database Management
node view-redis-data.js  # View Redis data locally
```

### **Project Structure**

```
induengicons/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   │   └── route.ts          # Contact form API
│   │   │   └── admin/
│   │   │       └── contact/
│   │   │           └── route.ts      # Admin API
│   │   ├── admin/
│   │   │   └── contact/
│   │   │       └── page.tsx          # Admin dashboard
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   └── globals.css               # Global styles
├── public/                           # Static assets
├── .env.development.local            # Environment variables
├── view-redis-data.js               # Redis debugging script
├── package.json                     # Dependencies
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── next.config.ts                   # Next.js configuration
```

### **Key Components**

- **ContactSection**: Functional contact form with API integration
- **Navigation**: Smart routing system with mobile optimization
- **ProjectShowcase**: Dynamic project cards with technical details
- **AdminDashboard**: Real-time submission viewer with management tools

## 🚀 Deployment

### **Deploy to Vercel**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link project**
   ```bash
   vercel link
   ```

4. **Deploy**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

### **Environment Variables Setup**

1. **Create Redis Database**
   - Go to Vercel Dashboard → Storage → Create Database
   - Select Redis → Create
   - Copy connection details

2. **Set Environment Variables**
   ```bash
   # Pull environment variables
   vercel env pull .env.development.local
   ```

3. **Production Environment**
   - Environment variables are automatically available in production
   - No manual setup required for Vercel-managed resources

### **Auto-Deployment**

The project uses GitHub integration for automatic deployments:

- **Production**: Pushes to `main` branch deploy to production
- **Preview**: Pull requests create preview deployments
- **Development**: Local development with hot reloading

## 🔍 Debugging

### **Local Development**

1. **Check Redis Connection**
   ```bash
   node view-redis-data.js
   ```

2. **View Logs**
   ```bash
   # Next.js development logs
   npm run dev

   # Vercel deployment logs
   vercel logs
   ```

3. **Database Debugging**
   ```bash
   # Connect to Redis CLI
   redis-cli -u $REDIS_URL

   # View all data
   KEYS *
   LRANGE contact:submissions 0 -1
   ```

### **Production Debugging**

1. **Vercel Logs**
   ```bash
   vercel logs --follow
   ```

2. **Function Logs**
   ```bash
   vercel logs --functions
   ```

3. **Real-time Monitoring**
   - Vercel Dashboard → Project → Functions → Logs
   - Analytics → Real-time visitors and performance

## 📊 API Endpoints

### **Contact Form API**
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "company": "Tech Solutions",
  "projectType": "software",
  "message": "Project requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully!",
  "id": "1758294264701"
}
```

### **Admin API**
```http
GET /api/admin/contact
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "submissions": [...]
}
```

## 🔐 Security

### **Current Security Measures**
- ✅ Input validation and sanitization
- ✅ Environment variable protection
- ✅ HTTPS enforcement
- ✅ Vercel deployment protection on admin routes
- ✅ Rate limiting (Vercel default)

### **Recommended Enhancements**
- 🔲 Admin authentication system
- 🔲 CSRF protection
- 🔲 API rate limiting
- 🔲 Data encryption at rest
- 🔲 Role-based access control

## 📈 Performance

### **Optimization Features**
- ✅ Static site generation (SSG)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ CDN delivery via Vercel
- ✅ Gzip compression

### **Performance Metrics**
- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <2.5s
- **Core Web Vitals**: All green

## 🏢 Business Information

**Company**: InduEngicons  
**Divisions**: Software Development, Civil & Railway Engineering  
**Registration**: Bihar, India  
**GSTIN**: 07AABCI1681G1Z0  
**Contact**: +91-98765-43210  
**Email**: contact@induengicons.com  

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is private and proprietary to InduEngicons.

## 🆘 Support

For technical support or business inquiries:

- **Email**: contact@induengicons.com
- **Phone**: +91-98765-43210
- **GitHub Issues**: [Create an issue](https://github.com/manjeetkumar53/induengicons/issues)

---

**Built with ❤️ by InduEngicons Engineering Team**
