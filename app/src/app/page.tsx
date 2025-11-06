'use client';

import { useMemo, useState } from "react";
import {
  Bot,
  Building2,
  FileSpreadsheet,
  Loader2,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

type AgentMessage = {
  role: "agent" | "user";
  content: string;
  timestamp: number;
};

type CampaignIdea = {
  channel: string;
  objective: string;
  primaryOffer: string;
  sequence: string[];
  metrics: string[];
};

type AgentPlan = {
  strategySummary: string;
  icpSnapshot: {
    title: string;
    bullets: string[];
  };
  campaignIdeas: CampaignIdea[];
  messaging: {
    email: { subject: string; body: string }[];
    social: string[];
    ads: string[];
  };
  followUpCadence: string[];
  automationSuggestions: string[];
  dataSignals: string[];
  nextSteps: string[];
};

const defaultMessages: AgentMessage[] = [
  {
    role: "agent",
    content:
      "Hey there! I’m your AI growth partner. Drop in your business details and I’ll spin up a lead-gen engine tailored to your goals.",
    timestamp: Date.now(),
  },
];

const tonePresets = [
  "Consultative",
  "Bold",
  "Friendly",
  "Data-driven",
  "Premium",
  "Playful",
];

export default function Home() {
  const [form, setForm] = useState({
    businessName: "",
    offering: "",
    audience: "",
    tone: tonePresets[0],
    goals: "",
    differentiators: "",
    budget: "",
  });

  const [messages, setMessages] = useState<AgentMessage[]>(defaultMessages);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [status, setStatus] = useState<"idle" | "thinking" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return (
      !form.businessName.trim() ||
      !form.offering.trim() ||
      !form.audience.trim() ||
      status === "thinking"
    );
  }, [form, status]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setStatus("thinking");
    setError(null);

    const userMessage: AgentMessage = {
      role: "user",
      content: `Business: ${form.businessName}\nOffering: ${form.offering}\nAudience: ${form.audience}\nGoals: ${form.goals || "N/A"}`,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          history: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "The agent had trouble generating a plan.");
      }

      const payload = await response.json();
      const agentPlan: AgentPlan = payload.plan ?? payload;

      setPlan(agentPlan);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Done! I mapped out a channel mix, lead magnets, touchpoints, and next steps tuned to your input.",
          timestamp: Date.now(),
        },
      ]);
      setStatus("ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-500/40 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[320px] bg-cyan-500/40 blur-[180px]" />
        <div className="absolute right-0 top-0 h-[280px] w-[280px] bg-emerald-500/30 blur-[140px]" />
      </div>
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-24 pt-12 lg:flex-row">
        <section className="w-full max-w-xl rounded-3xl border border-white/5 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-purple-200">
              <Sparkles className="h-3.5 w-3.5" /> Lead Engine
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
              Build a conversion-ready lead generation engine in minutes
            </h1>
            <p className="text-sm text-slate-300">
              Feed in your offer and ICP. The autonomous agent orchestrates campaigns, outreach cadences, and assets, ready to deploy across channels.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-200" htmlFor="businessName">
                Business name
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Building2 className="h-4 w-4 text-purple-200" />
                <input
                  id="businessName"
                  name="businessName"
                  placeholder="Acme SaaS"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
                  value={form.businessName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, businessName: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-200" htmlFor="offering">
                Product or offer
              </label>
              <textarea
                id="offering"
                name="offering"
                placeholder="Describe your service, pricing model, and the transformation you deliver."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                value={form.offering}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, offering: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-200" htmlFor="audience">
                Ideal customer profile
              </label>
              <textarea
                id="audience"
                name="audience"
                placeholder="Who are you targeting? Industries, roles, company size, pain points."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                value={form.audience}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, audience: event.target.value }))
                }
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-200">Tone & voice</span>
                <div className="flex flex-wrap gap-2">
                  {tonePresets.map((preset) => {
                    const isActive = form.tone === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, tone: preset }))}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40"
                            : "bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-200" htmlFor="budget">
                  Monthly budget (optional)
                </label>
                <input
                  id="budget"
                  name="budget"
                  placeholder="$5k - $15k"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                  value={form.budget}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, budget: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-200" htmlFor="goals">
                  Primary growth goals
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  placeholder="Example: 150 MQLs/mo, shorten sales cycle, expand into fintech."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                  value={form.goals}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, goals: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-200" htmlFor="differentiators">
                  Differentiators
                </label>
                <textarea
                  id="differentiators"
                  name="differentiators"
                  placeholder="Proprietary data, unique onboarding, guarantees, case studies."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400/60 focus:outline-none"
                  value={form.differentiators}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, differentiators: event.target.value }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-purple-400 to-cyan-400 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-xl shadow-purple-500/30 transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitDisabled}
            >
              {status === "thinking" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
              {status === "thinking" ? "Calibrating" : "Generate lead machine"}
            </button>

            {error && (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="flex-1 space-y-6 pb-6">
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/30 p-2">
                  <Bot className="h-5 w-5 text-purple-100" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Agent activity</p>
                  <p className="text-xs text-slate-400">
                    {status === "thinking"
                      ? "Crafting a cross-channel playbook"
                      : status === "ready"
                        ? "Plan generated"
                        : "Waiting for your inputs"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Target className="h-4 w-4" />
                Demand Gen Engine
              </div>
            </header>
            <div className="mt-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.timestamp + message.role}
                  className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    message.role === "agent"
                      ? "bg-white/5 text-slate-200"
                      : "bg-purple-500/20 text-purple-50"
                  }`}
                >
                  {message.role === "agent" ? (
                    <Bot className="mt-0.5 h-4 w-4" />
                  ) : (
                    <Sparkles className="mt-0.5 h-4 w-4" />
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
              ))}
              {status === "thinking" && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Synthesizing ICP insights, channels, and copy…
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <FileSpreadsheet className="h-5 w-5 text-cyan-200" />
              <div>
                <h2 className="text-lg font-semibold text-white">Lead generation blueprint</h2>
                <p className="text-xs text-slate-400">
                  Campaign mix, messaging, and automation recommendations.
                </p>
              </div>
            </div>

            {plan ? (
              <div className="mt-6 space-y-6">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Strategy snapshot
                  </h3>
                  <p className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    {plan.strategySummary}
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    ICP focus
                  </h3>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm">
                    <p className="mb-2 font-medium text-white">{plan.icpSnapshot.title}</p>
                    <ul className="space-y-1 text-slate-300">
                      {plan.icpSnapshot.bullets.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-purple-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Channel playbooks
                  </h3>
                  <div className="space-y-4">
                    {plan.campaignIdeas.map((campaign, index) => (
                      <div
                        key={`${campaign.channel}-${index}`}
                        className="rounded-2xl border border-white/5 bg-white/5 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-white">
                            {campaign.channel}
                          </span>
                          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-100">
                            {campaign.objective}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-300">
                          Offer focus: {campaign.primaryOffer}
                        </p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Sequence
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-slate-300">
                              {campaign.sequence.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex gap-2">
                                  <span className="text-purple-300">{stepIndex + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Metrics to watch
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-slate-300">
                              {campaign.metrics.map((metric, metricIndex) => (
                                <li key={metricIndex} className="flex gap-2">
                                  <span className="text-cyan-300">•</span>
                                  <span>{metric}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Messaging vault
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </p>
                      <ul className="mt-3 space-y-3 text-sm text-slate-200">
                        {plan.messaging.email.map((email, index) => (
                          <li key={index} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                            <p className="text-xs font-medium text-purple-200">
                              {email.subject}
                            </p>
                            <p className="mt-2 text-xs text-slate-300 whitespace-pre-line">
                              {email.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Social hooks
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                          {plan.messaging.social.map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-cyan-300">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Ad headlines
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                          {plan.messaging.ads.map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-emerald-300">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Follow-up rhythm
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {plan.followUpCadence.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-purple-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Automation & tooling
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {plan.automationSuggestions.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-cyan-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Data signals
                  </h3>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    <ul className="space-y-2">
                      {plan.dataSignals.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-emerald-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Next steps
                  </h3>
                  <ol className="space-y-2 text-sm text-slate-200">
                    {plan.nextSteps.map((item, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-xs font-semibold text-purple-100">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-400">
                <p className="font-medium text-slate-200">No playbook yet.</p>
                <p className="mt-2">
                  Share your offer and goals to generate a multi-channel lead engine complete with messaging, metrics, and automation ideas.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
