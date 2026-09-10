# Quantifyr

### AI-powered business analytics and decision intelligence

Quantifyr is a full-stack business analytics platform designed to help businesses understand their performance, monitor operations, and turn business data into actionable insights.

It combines **business metrics, analytics, automation, and AI** into a single dashboard.

> 🚧 **Quantifyr is currently under active development.**

---

## Overview

Businesses generate large amounts of data across sales, orders, marketing, customers, and operations.

The problem isn't a lack of data.

**The problem is understanding what the data actually means.**

Quantifyr aims to solve this by bringing business data into one platform and using analytics and AI to answer questions such as:

* How is the business performing?
* Which areas are improving or declining?
* What is driving changes in revenue?
* Which campaigns are performing best?
* Where are potential problems appearing?
* What should the business focus on next?

### Core idea

```text
                    BUSINESS DATA
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Orders        Campaigns       Stores
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    ANALYTICS
                         │
                         ▼
                   AI ANALYSIS
                         │
                         ▼
              ACTIONABLE INSIGHTS
```

---

## Features

### 📊 Business Dashboard

Centralized overview of important business metrics and performance indicators.

* Revenue tracking
* Sales performance
* Business KPIs
* Performance trends
* Visual analytics

### 🏪 Store Management

Manage and monitor individual stores and their performance.

### 🛒 Order Management

Track orders and use sales data for business analysis.

### 📣 Campaign Analytics

Monitor marketing campaigns and evaluate their performance using measurable business metrics.

### 🔔 Alerts

Surface important changes and potential issues that require attention.

### 🤖 AI Insights

Quantifyr integrates **Google Gemini** to provide AI-powered analysis of business information.

The goal is not to build another generic chatbot.

Instead, the AI layer is designed to understand the application's business data and provide useful explanations, observations, and recommendations.

---

# Tech Stack

| Layer             | Technology         |
| ----------------- | ------------------ |
| Frontend          | React + TypeScript |
| Build Tool        | Vite               |
| Styling           | Tailwind CSS       |
| Charts            | Recharts           |
| Backend           | Node.js + Express  |
| Database          | SQLite             |
| Database Driver   | better-sqlite3     |
| Authentication    | JWT                |
| Password Security | bcrypt             |
| AI                | Google Gemini API  |

---

# Architecture

Quantifyr currently uses a full-stack architecture:

```text
┌───────────────────────────────┐
│           Frontend            │
│       React + TypeScript      │
│            Vite               │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│           Backend             │
│       Node.js + Express       │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│    SQLite    │  │   Gemini     │
│   Database   │  │     API      │
└──────────────┘  └──────────────┘
```

The architecture is intentionally simple during the development phase and will evolve as Quantifyr moves toward production.

---

# Project Structure

```text
Quantifyr/
│
├── src/                    # React frontend
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── server.ts               # Express backend
├── package.json
├── vite.config.ts
├── tsconfig.json
│
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

> The structure is actively evolving as new features are added.

---

# Getting Started

## Requirements

Make sure you have:

* **Node.js 18+**
* **npm**
* A **Google Gemini API key**

---

## 1. Clone the repository

```bash
git clone https://github.com/S1D-7077/Quantifyr.git
cd Quantifyr
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your API key to GitHub.

---

## 4. Start the development server

```bash
npm run dev
```

The application will start locally.

Open the local URL shown in the terminal.

---

# Development

Quantifyr is currently designed for **local development**.

The current development workflow is:

```text
Code
  ↓
Local Development
  ↓
Test
  ↓
Git Commit
  ↓
GitHub
```

The project is intentionally not publicly hosted while the core product and architecture are still being developed.

---

# Database

Quantifyr currently uses **SQLite** with `better-sqlite3`.

SQLite is useful during development because it:

* Requires no separate database server
* Is simple to set up
* Works well for local development
* Makes experimentation fast

A production deployment will likely require a more scalable database architecture, such as **PostgreSQL**.

---

# AI

Quantifyr uses Google's **Gemini API** for AI functionality.

The planned AI architecture is:

```text
Business Data
      ↓
Data Processing
      ↓
Business Metrics
      ↓
Gemini
      ↓
Contextual Analysis
      ↓
Insights & Recommendations
```

Potential AI capabilities include:

* Business performance analysis
* Natural-language explanations
* Trend detection
* Anomaly identification
* Campaign analysis
* Automated business summaries
* Decision recommendations

The AI functionality is still under development.

---

# Roadmap

## Phase 1 — Foundation

* [x] React frontend
* [x] Vite setup
* [x] Express backend
* [x] SQLite database
* [x] Authentication
* [x] Dashboard foundation
* [x] Gemini integration

## Phase 2 — Product Development

* [ ] Complete dashboard
* [ ] Store management
* [ ] Order management
* [ ] Campaign management
* [ ] Advanced analytics
* [ ] Alerts and notifications
* [ ] Improved API architecture
* [ ] Better data validation

## Phase 3 — AI Intelligence

* [ ] AI business analyst
* [ ] Automated business reports
* [ ] AI-powered recommendations
* [ ] Anomaly detection
* [ ] Trend analysis
* [ ] Natural-language querying
* [ ] Predictive analytics

## Phase 4 — Production

* [ ] PostgreSQL migration
* [ ] Production authentication
* [ ] API documentation
* [ ] Automated testing
* [ ] Security audit
* [ ] Performance optimization
* [ ] Monitoring and logging
* [ ] Production deployment
* [ ] Custom domain

---

# Security

Quantifyr is currently a development project and should **not be considered production-ready**.

Before handling real business data, the application will need additional security work including:

* Secure secret management
* Authentication hardening
* Authorization
* Input validation
* Rate limiting
* API protection
* Database security
* Dependency auditing
* Error handling
* Production logging

### Never commit secrets

Do not commit:

```text
.env
.env.local
API keys
JWT secrets
Database credentials
```

Use `.env.example` to document required environment variables without exposing their values.

---

# Current Status

| Area                  | Status                |
| --------------------- | --------------------- |
| Frontend              | 🟡 Active development |
| Backend               | 🟡 Active development |
| Database              | 🟡 Development        |
| Authentication        | 🟡 Development        |
| Analytics             | 🟡 Development        |
| AI                    | 🟡 Development        |
| Testing               | 🔴 Planned            |
| Production deployment | 🔴 Not started        |

---

# Future Vision

Quantifyr is intended to evolve from a business dashboard into an **AI-powered decision intelligence platform**.

The long-term goal is to move beyond:

> **"Here are your numbers."**

toward:

> **"Here is what changed, why it changed, what it means, and what you should consider doing next."**

---

# Contributing

Quantifyr is currently being developed as a personal project.

Contribution guidelines will be introduced once the project reaches a more stable stage.

---

# License

License information will be added as the project develops.

---

# Author

**SID**

GitHub: **[@S1D-7077](https://github.com/S1D-7077)**

---

<div align="center">

### Quantifyr

**Understand your business. Make better decisions.**

</div>


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
