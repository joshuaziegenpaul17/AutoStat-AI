
# AutoStat AI – Automated Analytics & Forecasting

**AutoStat AI** is a professional-grade data analytics platform designed to bridge the gap between raw datasets and executive decision-making. By combining standard statistical profiling with advanced AI-powered narrative synthesis, it provides a streamlined workflow for modern data exploration and reporting.

---

## 🚀 Features

- **Automated Data Ingestion**: Secure client-side processing of CSV and Excel (XLSX/XLS) formats.
- **Statistical Profiling**: Instant calculation of descriptive statistics (Mean, Median, Std Dev, Skewness, Kurtosis).
- **Interactive Visualizations**: High-fidelity charts including histograms, correlation heatmaps, treemaps, and density plots.
- **Predictive Forecasting**: Temporal trend modeling to identify trajectories and sequential patterns.
- **AI Executive Analysis**: McKinsey-style strategic summaries and actionable recommendations powered by Groq (Llama 3.3).
- **Data Quality Audit**: Automated health checks and anomaly detection for structural integrity.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **UI Components**: ShadCN UI (Radix UI)
- **Charts**: Recharts
- **AI Engine**: Groq (Llama 3.3 70B)
- **Data Parsing**: XLSX & Custom CSV Parser

---

## ⚙️ Installation

To run AutoStat AI locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/joshuaziegenpaul17/AutoStat-AI.git
   cd autostat-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## ⚖️ Legal & Privacy

AutoStat AI is designed as a professional demonstration platform. Data processed in the workspace is handled temporarily within the browser session and is not used for model training. For full details, see our [Privacy Policy](http://localhost:9002/privacy).

---

## 🏆 Project Status

- **Version**: 2.5.0 (Stable)
- **Audit**: Production Ready
- **Author**: Joshua Ziegen Paul

---

*AutoStat AI – Transform Raw Data into Strategic Intelligence.*
