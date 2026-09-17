"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Send,
  ShieldCheck,
  History,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// --- TYPES ---
type Status = 'Supported' | 'Uncertain' | 'Unsupported';
type Confidence = 'High' | 'Low' | 'None';

interface Evidence {
  id: string;
  type: string;
  text: string;
}

interface Analysis {
  conf: Confidence;
  status: Status;
  expl: string;
  ev: string[];
}

interface AuditLog {
  timestamp: string;
  action: string;
  detail: string;
  actor: string;
}

// --- COMPLIANCE GUARD ---
const ComplianceGuard = {
  formatNumeric: (val: string, unit: string, period: string, evId: string) =>
    `${val} ${unit}, ${period}, ${evId}`,
};

// --- DETECTIVE LOGIC ---
const getAnalysis = (claimId: string, evidence: Evidence[]): Analysis => {
  const analysis: Record<string, Analysis> = {
    planned: {
      conf: "High", status: "Supported", expl: "Target capacity explicitly stated in plan document.", ev: ["PLAN-A"]
    },
    attended: {
      conf: "High", status: "Supported", expl: "Attendance sheet provides unique count of verified participants.", ev: ["SHEET-A"]
    },
    trained: {
      conf: "Low", status: "Uncertain", expl: "CONFLICT DETECTED: Voice note claims 20 people trained, but attendance sheet only shows 12. The numbers do not reconcile.", ev: ["VOICE-A", "SHEET-A"]
    },
    completion: {
      conf: "None", status: "Unsupported", expl: "MISSING EVIDENCE: No completion assessment has been submitted to date.", ev: []
    },
  };

  if (evidence.some(e => e.id === 'SIM-1')) {
    analysis["trained"] = {
      conf: "High", status: "Supported", expl: "CONFLICT RESOLVED: Partner clarified that the '20' was a typo; attendance of 12 is correct.", ev: ["SHEET-A", "SIM-1"]
    };
  }

  return analysis[claimId];
};

// --- COMPONENTS ---
const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    Supported: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Uncertain: "bg-amber-100 text-amber-700 border-amber-200",
    Unsupported: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default function EvidenceDetective() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [programme, setProgramme] = useState({ name: "", period: "" });
  const [step, setStep] = useState("Dashboard");
  const [reportStatus, setReportStatus] = useState("Draft");
  const [approved, setApproved] = useState(false);
  const [auditTrail, setAuditTrail] = useState<AuditLog[]>([]);
  const [vaultOpen, setVaultOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/initial.json');
        const data = await res.json();
        setEvidence(data.evidence);
        setProgramme(data.programme);
        setAuditTrail([{
          timestamp: new Date().toLocaleTimeString(),
          action: "System Init",
          detail: "Evidence vault initialized from initial.json",
          actor: "System"
        }]);
      } catch (e) {
        console.error("Failed to load evidence:", e);
      }
    }
    loadData();
  }, []);

  const logEvent = (action: string, detail: string, actor: string) => {
    setAuditTrail(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      action, detail, actor
    }, ...prev]);
  };

  const handlePartnerResponse = () => {
    const simEvidence = {
      id: "SIM-1",
      type: "partner-clarification",
      text: "Partner confirms that the '20' mentioned in the voice note was a typo referring to the planned target. Only 12 participants actually attended and trained. The final assessment is still being processed."
    };
    setEvidence([...evidence, simEvidence]);
    logEvent("Evidence Ingested", "Partner clarification SIM-1 added", "Partner");
    setStep("Proposal");
  };

  const handleApproval = () => {
    setReportStatus("Approved");
    setApproved(true);
    logEvent("Human Approval", "Reviewer approved the corrected attendance figure", "Human Reviewer");
    setStep("Audit");
  };

  return (
    <div className="min-h-screen flex bg-foundation-base text-foundation-navy font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-foundation-navy text-white flex flex-col border-r border-foundation-navy">
        <div className="p-6 border-b border-white/10">
          <h2 className="serif-title text-xl font-bold tracking-tight">Evidence Detective</h2>
          <p className="text-xs text-white/50 mt-1">Reporting Assistant v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "Dashboard", label: "Claims Dashboard", icon: <Search size={18}/> },
            { id: "Report", label: "Safe Draft Report", icon: <FileText size={18}/> },
            { id: "Outreach", label: "Partner Outreach", icon: <Send size={18}/> },
            { id: "Proposal", label: "Proposal Review", icon: <ShieldCheck size={18}/> },
            { id: "Audit", label: "Final Audit", icon: <History size={18}/> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStep(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                step === item.id ? "bg-foundation-accent text-white shadow-lg" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 text-xs text-white/50 hover:text-white transition-colors"
          >
            Reset Investigation
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b border-foundation-border flex items-center justify-between px-8">
          <div>
            <h1 className="serif-title text-2xl font-bold text-foundation-navy">{step}</h1>
            <p className="text-xs text-foundation-slate">
              Programme: {programme.name} | Period: {programme.period}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-foundation-slate font-bold block">Report Status</span>
            <span className={`text-lg font-bold ${approved ? "text-emerald-600" : "text-rose-600"}`}>
              {reportStatus.toUpperCase()}
            </span>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {step === "Dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: "Total Claims", val: 4, color: "text-foundation-navy" },
                  { label: "Supported", val: 2, color: "text-emerald-600" },
                  { label: "Conflicts", val: 1, color: "text-amber-600" },
                  { label: "Gaps", val: 1, color: "text-rose-600" },
                ].map((m, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-foundation-border shadow-sm">
                    <p className="text-xs font-semibold text-foundation-slate uppercase tracking-wider">{m.label}</p>
                    <p className={`text-3xl font-bold ${m.color}`}>{m.val}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4">
                {[
                  { id: "planned", label: "Capacity Planned" },
                  { id: "attended", label: "Unique Participants Attended" },
                  { id: "trained", label: "Total People Trained" },
                  { id: "completion", label: "Programme Completion" },
                ].map((claim) => {
                  const analysis = getAnalysis(claim.id, evidence);
                  return (
                    <div key={claim.id} className="bg-white p-6 rounded-2xl border border-foundation-border flex items-start gap-6 shadow-sm relative">
                      <div className={`w-1 h-full absolute left-0 top-0 rounded-l-2xl ${
                        analysis.status === 'Supported' ? 'bg-emerald-500' : analysis.status === 'Uncertain' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} style={{ position: 'absolute', left: 0 }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-foundation-navy">{claim.label}</h3>
                          <StatusBadge status={analysis.status} />
                        </div>
                        <p className="text-foundation-slate text-sm mb-4">{analysis.expl}</p>
                        <div className="flex gap-4 text-[11px] font-medium text-foundation-slate uppercase tracking-tight">
                          <span>Confidence: <span className="text-foundation-navy">{analysis.conf}</span></span>
                          <span>Evidence: <span className="text-foundation-navy">{analysis.ev.join(", ") || "None"}</span></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setVaultOpen(!vaultOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-foundation-slate hover:text-foundation-navy transition-colors"
                >
                  {vaultOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  Access Raw Evidence Vault
                </button>
                {vaultOpen && (
                  <div className="mt-4 grid gap-3">
                    {evidence.map((e, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-foundation-border text-sm shadow-sm">
                        <span className="font-bold text-foundation-navy mr-2">[{e.id}]</span>
                        <span className="text-xs bg-foundation-base px-2 py-1 rounded mr-2">{e.type}</span>
                        <span className="text-foundation-slate">{e.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "Report" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-12 rounded-3xl border border-foundation-border shadow-xl relative">
                <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  DRAFT
                </div>
                <h2 className="serif-title text-3xl font-bold mb-8 text-center border-b pb-4">Programme Progress Report</h2>
                <div className="space-y-6">
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Attendance</span>
                    <span className="font-bold text-foundation-navy">{ComplianceGuard.formatNumeric("12", "participants", programme.period, "SHEET-A")}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Completion</span>
                    <span className="text-rose-500 font-medium">Not reported (Missing assessment evidence)</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Outcomes</span>
                    <span className="text-foundation-slate italic">No outcomes inferred from participation alone.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "Outreach" && (
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-foundation-border shadow-sm">
                <Send className="mx-auto text-foundation-accent mb-4" size={32} />
                <h3 className="serif-title text-2xl font-bold mb-4">Partner Clarification</h3>
                <p className="text-foundation-slate mb-6 italic text-lg">
                  "The voice note (VOICE-A) mentions 20 people trained, but attendance records (SHEET-A) only show 12 unique participants. Could you please clarify the final number of participants who actually completed the training and provide the relevant assessments?"
                </p>
                <button
                  onClick={handlePartnerResponse}
                  className="bg-foundation-navy text-white px-8 py-3 rounded-full font-bold hover:bg-foundation-slate transition-all flex items-center gap-2 mx-auto"
                >
                  Simulate Partner Response <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === "Proposal" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-foundation-border shadow-sm">
                  <h4 className="text-xs font-bold text-foundation-slate uppercase tracking-widest mb-4">Current State</h4>
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-lg font-medium border border-rose-100">
                    Trained: 20 (Uncertain/Conflicting)
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-foundation-border shadow-sm">
                  <h4 className="text-xs font-bold text-foundation-slate uppercase tracking-widest mb-4">Proposed State</h4>
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                    Attendance: 12 participants, {programme.period}, SHEET-A & SIM-1
                  </div>
                </div>
              </div>

              <div className="bg-foundation-navy text-white p-8 rounded-3xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-foundation-accent" />
                  <h3 className="serif-title text-xl font-bold">Detective's Reasoning</h3>
                </div>
                <p className="text-white/80 leading-relaxed mb-6">
                  The ambiguity is resolved. The partner clarification (SIM-1) explicitly corrects the voice note's figure. We can now safely report 12 participants.
                </p>
                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-sm font-medium">
                    <span className="text-foundation-accent font-bold">Compliance Check:</span> Completion remains <span className="text-rose-400 underline">Unsupported</span> because SIM-1 confirms assessments are still pending.
                  </p>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button className="px-6 py-2 rounded-lg text-white/60 hover:text-white transition-colors text-sm font-medium">Reject</button>
                  <button
                    onClick={handleApproval}
                    className="bg-foundation-accent text-white px-8 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg"
                  >
                    Approve & Finalize
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "Audit" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-12 rounded-3xl border-2 border-emerald-500 shadow-2xl relative max-w-2xl mx-auto">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                  APPROVED
                </div>
                <h2 className="serif-title text-3xl font-bold mb-8 text-center">Programme Progress Report</h2>
                <div className="space-y-6">
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Attendance</span>
                    <span className="font-bold text-foundation-navy">{ComplianceGuard.formatNumeric("12", "participants", programme.period, "SIM-1")}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Completion</span>
                    <span className="text-foundation-slate font-medium">Not reported (Missing assessment evidence)</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-foundation-border">
                    <span className="text-foundation-slate font-medium">Outcomes</span>
                    <span className="text-foundation-slate italic">No outcomes inferred from participation alone.</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-foundation-border shadow-sm overflow-hidden">
                <div className="bg-foundation-navy p-4 flex items-center gap-2 text-white">
                  <History size={18} />
                  <span className="font-bold text-sm uppercase tracking-widest">Investigation Audit Log</span>
                </div>
                <div className="divide-y divide-foundation-border">
                  {auditTrail.map((log, i) => (
                    <div key={i} className="p-4 flex items-center gap-6 hover:bg-foundation-base transition-colors">
                      <span className="text-xs font-mono text-foundation-slate w-20">{log.timestamp}</span>
                      <span className="text-sm font-bold text-foundation-navy w-32">{log.actor}</span>
                      <span className="text-sm text-foundation-slate flex-1">
                        <span className="font-semibold text-foundation-navy">{log.action}:</span> {log.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
