# Quantifyr

> **AI-powered business analytics and decision support for modern businesses.**

Quantifyr is an intelligent business management and analytics platform designed to help businesses understand their operations, track performance, and make better decisions using data and AI.

The project combines a modern React dashboard with a Node.js backend, local data persistence, authentication, analytics, and Google Gemini-powered intelligence.

---

## 🚧 Project Status

**Active Development**

Quantifyr is currently being developed as an ongoing project.

The application is **not currently hosted publicly**. Development and testing are performed locally, with the source code maintained on GitHub.

> Features, architecture, and database structure are subject to change during development.

---

## 🎯 Vision

Small and growing businesses often have data spread across different systems, making it difficult to understand what is actually happening in the business.

Quantifyr aims to bring important business information into a single platform and turn raw operational data into actionable insights.

### The goal

**Data → Analytics → AI Insights → Better Decisions**

---

## ✨ Core Features

### 📊 Business Dashboard

* Business performance overview
* Key performance indicators
* Revenue and sales tracking
* Operational metrics
* Visual analytics

### 🏪 Store Management

* Manage business/store information
* Track store-level performance
* Monitor operational activity

### 📈 Campaign Analytics

* Create and manage campaigns
* Track campaign performance
* Analyze marketing metrics
* Compare campaign results

### 🛒 Order Management

* Track orders
* Monitor order activity
* Analyze sales performance

### 🔔 Alerts & Monitoring

* Business alerts
* Performance notifications
* Identify areas requiring attention

### 🤖 AI-Powered Insights

Powered by Google's Gemini API.

Quantifyr is designed to use AI to help transform business data into useful insights rather than simply displaying raw numbers.

Potential capabilities include:

* Performance analysis
* Business recommendations
* Trend identification
* Anomaly detection
* Natural-language explanations of business metrics

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **React Router**
* **Tailwind CSS**
* **Lucide React**
* **Recharts**
* **Motion**

### Backend

* **Node.js**
* **Express**
* **TypeScript**

### Database

* **SQLite**
* **better-sqlite3**

### Authentication & Security

* **JWT**
* **bcrypt**

### Artificial Intelligence

* **Google Gemini API**
* `@google/genai`

---

## 🏗️ Architecture

Quantifyr currently follows a full-stack architecture:

```text
┌──────────────────────────────┐
│          React UI            │
│       Vite + TypeScript      │
└──────────────┬───────────────┘
               │
               │ HTTP / API
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│          Node.js             │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐   ┌──────────────┐
│   SQLite    │   │ Gemini API   │
│  Database   │   │  AI Engine   │
└─────────────┘   └──────────────┘
```

The architecture may evolve as the project grows.

---

## 📁 Project Structure

```text
Quantifyr/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── ...
│   └── ...
│
├── server.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
│
├── .env.example
├── .gitignore
├── metadata.json
└── README.md
```

> The project structure is evolving as new features and backend modules are introduced.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* [Node.js](https://nodejs.org/) installed
* npm
* A Google Gemini API key

---

### 1. Clone the repository

```bash
git clone https://github.com/S1D-7077/Quantifyr.git
```

```bash
cd Quantifyr
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Create a local environment file:

```bash
.env.local
```

Add:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your API key to GitHub.**

---

### 4. Start the development server

```bash
npm run dev
```

The application will start locally.

Open the local URL displayed in your terminal.

---

## 🧪 Available Scripts

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the development server    |
| `npm run build`   | Build the frontend              |
| `npm run preview` | Preview the production frontend |
| `npm run lint`    | Run TypeScript checks           |
| `npm run clean`   | Remove the build output         |

---

## 🔐 Environment Variables

Quantifyr uses environment variables for sensitive configuration.

Example:

```env
GEMINI_API_KEY=
```

Keep your actual `.env.local` file out of version control.

---

## 🗄️ Database

Quantifyr currently uses **SQLite** with `better-sqlite3`.

SQLite is being used during the development phase because it provides a simple local database without requiring a separate database server.

As Quantifyr moves toward production, the database architecture may transition to a server-based relational database such as PostgreSQL.

---

## 🧠 AI Integration

Quantifyr integrates Google's Gemini API to provide AI-powered business intelligence.

The long-term objective is for the AI layer to work alongside the application's structured business data rather than acting as a generic chatbot.

Example workflow:

```text
Business Data
      ↓
Data Processing
      ↓
Analytics
      ↓
Gemini
      ↓
AI Interpretation
      ↓
Business Recommendation
```

---

## 🗺️ Roadmap

### Phase 1 — Foundation

* [x] React application
* [x] Vite development environment
* [x] Express backend
* [x] SQLite database
* [x] Authentication foundation
* [x] Dashboard foundation
* [x] Gemini integration

### Phase 2 — Core Product

* [ ] Complete business management
* [ ] Complete store management
* [ ] Complete order management
* [ ] Campaign analytics
* [ ] Advanced dashboard metrics
* [ ] Alert system
* [ ] Improved data validation
* [ ] Backend restructuring

### Phase 3 — Intelligence

* [ ] AI business analyst
* [ ] Automated performance summaries
* [ ] Anomaly detection
* [ ] Trend analysis
* [ ] AI-generated recommendations
* [ ] Natural-language analytics

### Phase 4 — Production Readiness

* [ ] Production database
* [ ] Improved authentication security
* [ ] API documentation
* [ ] Automated testing
* [ ] Error monitoring
* [ ] Performance optimization
* [ ] Production deployment
* [ ] Custom domain

---

## 🔒 Security

Quantifyr is currently a development project.

Before production deployment, additional security work will be required, including:

* Secure secret management
* Authentication hardening
* Authorization checks
* Input validation
* Rate limiting
* API security
* Database security
* Production logging
* Dependency auditing

**Do not use the current development configuration for handling real sensitive business data.**

---

## 📌 Development Philosophy

Quantifyr is being built incrementally.

The priority is:

1. Build the core functionality
2. Validate the product concept
3. Improve the architecture
4. Add AI capabilities
5. Harden security
6. Prepare for production

The project will remain locally developed until the product is ready for deployment.

---

## 🤝 Contributing

Quantifyr is currently a personal development project.

Contribution guidelines may be added when the project reaches a more stable stage.

---

## 📄 License

License information will be added as the project develops.

---

## 👤 Author

**SID**

GitHub: [@S1D-7077](https://github.com/S1D-7077)

---

## ⭐ Quantifyr

**Turn business data into decisions.**


View your app in AI Studio: https://ai.studio/apps/3c7e7005-9604-41d4-9bf1-5ca123ad8f15

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
