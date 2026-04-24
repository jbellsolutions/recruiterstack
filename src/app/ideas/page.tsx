import Link from "next/link";
import { AUDIT_URL } from "@/lib/funnel-data";

export const dynamic = "force-dynamic";

const useCases = [
  {
    category: "Candidate Pipeline",
    items: [
      {
        title: "AI Resume Screener",
        description: "Upload a batch of resumes, match them against your open reqs — instant ranking by fit score, skills match, and red flags",
        brief: "Build a resume screening tool. Upload resumes (PDF/Word) or paste text. Match against job requirements with AI scoring on: skills match, experience level, industry fit, location, and salary alignment. Ranked results with detailed breakdown per candidate. Flag gaps, job-hopping, or overqualification. Export shortlist to ATS. Bulk processing for 100+ resumes at once.",
      },
      {
        title: "Candidate Sourcing Engine",
        description: "Input a job req, get a list of passive candidates from LinkedIn, job boards, and your own database — with outreach templates ready to send",
        brief: "Build a candidate sourcing tool. Input job title, skills, location, salary range. Searches your internal database and generates boolean search strings for LinkedIn, Indeed, and ZipRecruiter. Ranks matches by relevance. Generates personalized outreach messages for each candidate. Tracks which candidates were contacted and response status. Export to ATS.",
      },
      {
        title: "Interview Scheduler",
        description: "Candidates pick available times, interviewers get calendar invites, reminders go out automatically — no more email tag",
        brief: "Build an interview scheduling tool. Candidates receive a link to pick from available time slots (synced with interviewer calendars). Auto-sends calendar invites, confirmation emails, and reminders (24hr and 1hr before). Supports panel interviews with multiple interviewers. Reschedule/cancel flow. Dashboard showing today's interviews, upcoming, and past. Integration-ready for Google Calendar and Outlook.",
      },
      {
        title: "Talent Pool CRM",
        description: "Every candidate you've ever talked to, organized by skills, availability, and relationship status — so you never lose a warm lead",
        brief: "Build a talent pool management system. Every candidate gets a profile: contact info, skills, experience, notes, last contact date, availability status (active, passive, not looking), and placement history. Tag by industry, role type, and location. Smart reminders to re-engage candidates who haven't been contacted in 90 days. Search and filter across the entire pool. Track candidate journey from sourced to placed.",
      },
    ],
  },
  {
    category: "Client Development",
    items: [
      {
        title: "Client Outreach Sequencer",
        description: "Multi-touch campaigns to hiring managers — personalized emails, LinkedIn messages, and follow-ups on autopilot",
        brief: "Build a client outreach automation tool. Create multi-step sequences: email, LinkedIn message, phone reminder, follow-up. Personalize each touchpoint with company name, industry pain points, and recent hiring activity. Track opens, replies, and meetings booked. A/B test subject lines. Pause sequence when prospect replies. Dashboard showing pipeline by stage. Templates for different industries (healthcare, tech, manufacturing, etc.).",
      },
      {
        title: "Job Order Intake Form",
        description: "Clients fill out exactly what they need — role, skills, salary, timeline, culture fit — and it flows straight into your ATS",
        brief: "Build a client-facing job order intake form. Clean branded form with fields: job title, department, required skills, nice-to-have skills, salary range, start date, contract type (temp/perm/contract), number of openings, hiring manager contact, and culture/team notes. Submissions auto-create a job order in the ATS. Email notification to assigned recruiter. Client portal to track status of their open orders.",
      },
      {
        title: "Hiring Manager Portal",
        description: "Your clients log in and see their open reqs, submitted candidates, interview status, and placement updates — no more status call emails",
        brief: "Build a client-facing portal. Hiring managers log in and see: their open job orders with status, submitted candidates with profiles and fit scores, interview schedule, placement updates, and invoices. They can approve/reject candidates, leave feedback, and request changes. Recruiter dashboard shows all client activity. Reduces status update emails by 80%.",
      },
      {
        title: "Client Revenue Forecaster",
        description: "Predict monthly revenue based on open reqs, fill rates, and average placement fees — spot gaps before they hit",
        brief: "Build a revenue forecasting dashboard. Input: open job orders, average time-to-fill, placement fee percentages, contract bill rates. Calculates: projected monthly revenue, pipeline value by stage, revenue by client, and gap analysis. Visual charts showing projected vs. actual over 6 months. Alerts when pipeline drops below target. Export for board presentations.",
      },
    ],
  },
  {
    category: "Operations & Compliance",
    items: [
      {
        title: "I-9 & Compliance Tracker",
        description: "Every placed candidate's compliance docs in one place — I-9, W-4, background check, drug screen, certifications — with expiration alerts",
        brief: "Build a compliance document tracker. Each placement has a checklist: I-9 verification, W-4, background check status, drug screen status, required certifications, and state-specific forms. Traffic light status (complete, pending, expired). Automated reminders when documents expire or are missing. Audit-ready reports by client, date range, or status. Bulk upload capability. Dashboard showing compliance percentage across all active placements.",
      },
      {
        title: "Timesheet & Payroll Processor",
        description: "Contractors submit hours, supervisors approve, payroll calculates automatically — including OT, per diem, and markups",
        brief: "Build a timesheet management system. Contractors submit hours via web or mobile. Supervisor approval workflow. Auto-calculates: regular hours, overtime, holiday pay, per diem, and travel. Applies client-specific bill rates and markups. Generates payroll export and client invoices. Dashboard showing submitted, pending approval, and processed. Alerts for missing timesheets. Weekly summary reports.",
      },
      {
        title: "Workers' Comp Claims Manager",
        description: "Track incidents, manage claims, monitor costs by client — so you can price your risk correctly and catch patterns early",
        brief: "Build a workers' compensation claims tracker. Log incidents with: employee, client, date, injury type, description, witnesses. Track claim status through the lifecycle (reported, filed, under review, approved, denied, closed). Cost tracking per claim and per client. Safety trend analysis — which clients or job types have the highest incident rates. Document upload for medical records and reports. Exportable reports for insurance renewals.",
      },
      {
        title: "Onboarding Workflow Engine",
        description: "New hire starts Monday? Auto-trigger the full onboarding sequence: docs, equipment, training, introductions — nothing falls through the cracks",
        brief: "Build an onboarding automation system. When a candidate is marked as 'placed', auto-trigger a customizable checklist: send offer letter, collect signed documents, initiate background check, schedule orientation, assign equipment, notify client, set up system access. Track completion by step. Configurable per client and role type. Dashboard showing all active onboardings with status. Email/SMS reminders for incomplete steps.",
      },
    ],
  },
  {
    category: "Analytics & Intelligence",
    items: [
      {
        title: "Recruiter Performance Dashboard",
        description: "See who's crushing it and who needs help — submittals, interviews, placements, revenue, and time-to-fill by recruiter",
        brief: "Build a recruiter KPI dashboard. Per-recruiter metrics: submittals per week, interview-to-submittal ratio, placements this month/quarter/year, revenue generated, average time-to-fill, client satisfaction scores. Leaderboard view. Trend charts showing performance over time. Manager can set targets and track against them. Drill down from team view to individual recruiter to specific placements. Export for reviews.",
      },
      {
        title: "Market Rate Analyzer",
        description: "Input a job title and location, see real-time salary benchmarks, bill rate ranges, and markup recommendations — so you price every deal right",
        brief: "Build a compensation benchmarking tool. Input: job title, location, industry, experience level. Output: salary range (25th/50th/75th percentile), typical bill rates for contract roles, recommended markup percentage, and comparison to your recent placements. Data sourced from BLS, your own placement history, and configurable external feeds. Save searches. Alert when market rates shift significantly for roles you place frequently.",
      },
      {
        title: "Fill Rate & Pipeline Analytics",
        description: "Which clients are easy to fill? Which roles take forever? Where's your pipeline thin? Data-driven answers instead of gut feel",
        brief: "Build a pipeline analytics dashboard. Metrics: fill rate by client, by role type, by recruiter. Average time-to-fill with trend. Pipeline funnel: sourced → screened → submitted → interviewed → offered → placed. Drop-off analysis at each stage. Aging report for reqs open 30/60/90+ days. Client profitability ranking (revenue vs. effort). Configurable date ranges and filters. Automated weekly email digest to leadership.",
      },
      {
        title: "Competitive Intelligence Tracker",
        description: "Track which staffing firms are winning deals in your market, what they're charging, and where you can differentiate",
        brief: "Build a competitive intelligence tool. Track competitor staffing agencies: which clients they serve, job postings they're filling, estimated bill rates, and market positioning. Input data from sales team observations, job board monitoring, and client feedback. SWOT analysis per competitor. Market share estimates by region and specialty. Dashboard with trends over time. Helps sales team position against specific competitors in pitches.",
      },
    ],
  },
  {
    category: "Recruiter Productivity",
    items: [
      {
        title: "Daily Briefing Generator",
        description: "Every morning, each recruiter gets a personalized digest: today's interviews, candidates to follow up with, reqs aging out, and hot leads",
        brief: "Build a daily briefing system. Each morning, auto-generate a personalized email/dashboard for each recruiter: today's scheduled interviews, candidates awaiting feedback (with days waiting), job orders aging past SLA, new job orders assigned, candidates who need re-engagement, and top priority actions. Pulls from ATS, calendar, and email activity. One-click actions to call, email, or update status directly from the briefing.",
      },
      {
        title: "Email & Voicemail Template Library",
        description: "Pre-written templates for every recruiting scenario — candidate outreach, client follow-up, offer negotiation, rejection — with personalization variables",
        brief: "Build a template management system. Categories: candidate outreach, candidate follow-up, client prospecting, job order confirmation, interview prep, offer extension, rejection (kind), reference check request, and re-engagement. Each template has personalization variables (candidate name, job title, company, salary). Usage tracking — which templates get the best response rates. Favorite and share templates across the team. Search and filter by category and scenario.",
      },
      {
        title: "Boolean Search Builder",
        description: "Visual tool to build complex LinkedIn/job board search strings — no more memorizing AND/OR/NOT syntax",
        brief: "Build a visual boolean search string generator. Drag-and-drop interface for building complex search queries. Add required skills (AND), alternative skills (OR), exclusions (NOT), title variations, location radius, and experience filters. Preview the generated string for LinkedIn, Indeed, Monster, and CareerBuilder (each platform has slightly different syntax). Save favorite searches. One-click copy to clipboard. History of past searches with result counts.",
      },
      {
        title: "Placement Profitability Calculator",
        description: "Before you make an offer, see the full P&L — bill rate, pay rate, burden, markup, gross margin, and break-even point",
        brief: "Build a placement economics calculator. Inputs: bill rate, pay rate, estimated hours per week, contract duration, burden rate (taxes, insurance, benefits). Calculates: gross margin percentage, gross profit per hour, weekly/monthly/total gross profit, break-even point, and comparison to your target margins. Scenario modeling — what if the client pushes for a lower bill rate? What if the candidate wants $2 more per hour? Save calculations tied to specific job orders. Historical margin analysis by client and role type.",
      },
    ],
  },
];

export default function IdeasPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/85 p-8 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 mb-3">
          Problem-First Solution Library
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Pick the bottleneck. We&apos;ll map it to a solution.
        </h1>
        <p className="text-sm text-zinc-400 mt-3 max-w-3xl leading-7">
          These are the most common workflows staffing and recruiting agencies ask
          us to fix. Click into any one to open the planning funnel with a starting
          brief, then decide whether you want to solve it with AI or hand it to us
          for an audit.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/plan"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start From Scratch
          </Link>
          <a
            href={AUDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 text-sm font-medium rounded-lg transition-colors"
          >
            Book An Audit
          </a>
        </div>
      </div>

      {useCases.map((category) => (
        <div key={category.category} className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">{category.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.items.map((item) => (
              <IdeaCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IdeaCard({ item }: { item: { title: string; description: string; brief: string } }) {
  return (
    <form action="/plan" method="GET">
      <input type="hidden" name="idea" value={item.title} />
      <input type="hidden" name="brief" value={item.brief} />
      <button
        type="submit"
        className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all group"
      >
        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-zinc-400 mt-2">{item.description}</p>
        <span className="inline-block mt-3 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Open this in the funnel &rarr;
        </span>
      </button>
    </form>
  );
}
