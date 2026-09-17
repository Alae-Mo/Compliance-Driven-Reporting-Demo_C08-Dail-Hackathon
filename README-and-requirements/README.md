# Evidence Detective 🕵️

A high-fidelity, compliance-driven reporting assistant designed for Programme Reporting Officers. This tool transforms raw, often contradictory evidence into verified, evidence-backed reports while strictly adhering to ground-truth compliance rules.

## 🌟 The Product Concept
Instead of a simple report generator, this is an **Evidence Detective**. It treats every claim as a hypothesis that must be verified. It identifies gaps, flags contradictions, and guides the user through a professional investigation process.

## 🛠️ Core Features
- **Claims Dashboard**: Extracts claims from raw evidence and assigns a confidence level (High/Low/None).
- **Conflict Detection**: Automatically flags contradictions between sources (e.g., Voice Notes vs. Attendance Sheets).
- **Safe Draft Report**: Generates a report that exclusively includes "High Confidence" facts, preventing the reporting of unverified information.
- **Partner Outreach**: Drafts targeted clarification questions to resolve specific uncertainties.
- **Human-in-the-Loop**: Requires a human reviewer to approve proposed changes before the report status moves from `Draft` to `Approved`.
- **Investigation Audit Log**: Maintains a chronological record of every event, actor, and action for full transparency.

## 📐 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Custom "Foundation" luxury palette)
- **Icons**: Lucide React
- **State**: React Hooks

## 🚧 What's Still Missing (Future Scope)
- **Dynamic LLM Integration**: Currently uses a deterministic mapping for the hackathon case. Next step is to connect the `PartnerAgent` to a live Gemini API for real-time claim extraction.
- **Backend Database**: Evidence is currently stored in session state. A production version would use a database (e.g., Supabase/PostgreSQL).
- **Multi-case Support**: Currently optimized for Case C08. Scaling to handle multiple diverse cases.
- **Real-time Notifications**: Integration with email/Slack for partner outreach.

## 🚀 Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open browser: `http://localhost:3000`
