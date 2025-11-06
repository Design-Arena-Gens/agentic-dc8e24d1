import { NextResponse } from "next/server";
import OpenAI from "openai";

type AgentInputs = {
  businessName: string;
  offering: string;
  audience: string;
  tone?: string;
  goals?: string;
  differentiators?: string;
  budget?: string;
  history?: { role: string; content: string }[];
};

type AgentPlan = {
  strategySummary: string;
  icpSnapshot: {
    title: string;
    bullets: string[];
  };
  campaignIdeas: {
    channel: string;
    objective: string;
    primaryOffer: string;
    sequence: string[];
    metrics: string[];
  }[];
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

const jsonSchema = {
  name: "lead_generation_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "strategySummary",
      "icpSnapshot",
      "campaignIdeas",
      "messaging",
      "followUpCadence",
      "automationSuggestions",
      "dataSignals",
      "nextSteps",
    ],
    properties: {
      strategySummary: { type: "string" },
      icpSnapshot: {
        type: "object",
        required: ["title", "bullets"],
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
          },
        },
      },
      campaignIdeas: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          required: ["channel", "objective", "primaryOffer", "sequence", "metrics"],
          additionalProperties: false,
          properties: {
            channel: { type: "string" },
            objective: { type: "string" },
            primaryOffer: { type: "string" },
            sequence: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
            },
            metrics: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
            },
          },
        },
      },
      messaging: {
        type: "object",
        required: ["email", "social", "ads"],
        additionalProperties: false,
        properties: {
          email: {
            type: "array",
            minItems: 2,
            items: {
              type: "object",
              required: ["subject", "body"],
              additionalProperties: false,
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
              },
            },
          },
          social: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
          },
          ads: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
          },
        },
      },
      followUpCadence: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
      },
      automationSuggestions: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
      },
      dataSignals: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
      },
    },
  },
  strict: true,
} as const;

const parseList = (value?: string, fallback?: string[]): string[] => {
  if (!value) {
    return fallback ?? [];
  }

  const items = value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0 && fallback) {
    return fallback;
  }

  return items.length > 0 ? items : fallback ?? [];
};

const buildFallbackPlan = (inputs: AgentInputs): AgentPlan => {
  const {
    businessName,
    offering,
    audience,
    tone,
    goals,
    differentiators,
    budget,
  } = inputs;

  const brand = businessName || "Your brand";
  const offer = offering || "your offer";
  const primaryAudience = audience || "target buyers";
  const goalList = parseList(goals, ["Grow pipeline", "Increase demos", "Shorten sales cycles"]);
  const diffList = parseList(differentiators, [
    "Faster onboarding than competitors",
    "Documented ROI within 60 days",
    "Dedicated success manager",
  ]);

  return {
    strategySummary: `${brand} should focus on the ${primaryAudience} segment with ${offer}, leaning into ${diffList.join(", ")} and executing a ${tone ?? "consultative"} voice across outbound, paid, and lifecycle touchpoints. Budget guidance: ${budget ? budget : "allocate spend across high-impact channels based on CAC targets"}.`,
    icpSnapshot: {
      title: primaryAudience,
      bullets: [
        `${primaryAudience} experiencing ${goalList[0]?.toLowerCase() ?? "growth pressure"}.`,
        `Decision-makers prioritizing solutions that deliver ${diffList[0]?.toLowerCase() ?? "tangible ROI"}.`,
        `Buying triggers include teams evaluating ${offer.toLowerCase()} alternatives or showing intent signals (hiring, tech stack updates).`,
      ],
    },
    campaignIdeas: [
      {
        channel: "Outbound multi-touch",
        objective: "Book qualified meetings",
        primaryOffer: `Personalized walkthrough of how ${brand} accelerates results for ${primaryAudience}.`,
        sequence: [
          "Day 0: Triggered LinkedIn view + soft intro DM tying to mutual context.",
          "Day 1: Email with problem-first hook and proof point tied to key metric.",
          "Day 3: Phone call / voice drop referencing recent industry change.",
          "Day 5: Case-study email with micro CTA (15-min agenda).",
        ],
        metrics: ["Open rate", "Positive reply rate", "SQO conversion", "Pipeline value booked"],
      },
      {
        channel: "Paid demand (LinkedIn + retargeting)",
        objective: "Capture in-market demand",
        primaryOffer: `Lead magnet showcasing ${diffList[1] ?? "operational wins"} using ${offer}.`,
        sequence: [
          "Sponsored thought-leadership carousel driving to ungated insight.",
          "Retarget with lead gen form offering ROI worksheet or benchmark tool.",
          "30-day nurtures via retargeting video featuring customer testimonial.",
        ],
        metrics: ["Lead quality score", "Cost per MQL", "View-through conversions", "Demo requests"],
      },
      {
        channel: "Lifecycle + marketing automation",
        objective: "Nurture and accelerate deals",
        primaryOffer: `Automated nurture that educates buying committee on ${offer}.`,
        sequence: [
          "Welcome email with promise + quick win resource.",
          "Day 3: Use-case drip aligned to role-based pain points.",
          "Day 7: Customer proof email with quantifiable outcomes.",
          "Day 10: Live session invite or interactive ROI calculator CTA.",
        ],
        metrics: ["Email engagement depth", "Speed to second touch", "Meeting acceptance", "Expansion opportunities"],
      },
    ],
    messaging: {
      email: [
        {
          subject: `${brand} | ${parseList(goals)[0] ?? "New revenue"} in the next 90 days`,
          body: `Hi {{first_name}},\n\nI noticed ${primaryAudience} teams are navigating ${goalList[0]?.toLowerCase() ?? "aggressive growth targets"}. ${brand} removes the ${diffList[0]?.toLowerCase() ?? "manual work"} by delivering ${offer.toLowerCase()}.\n\nClients typically see ${diffList[1]?.toLowerCase() ?? "faster adoption"} within 30 days. Up for comparing playbooks next week?\n\n– ${brand} team`,
        },
        {
          subject: `Quick win: ${offer} benchmark for ${primaryAudience}`,
          body: `Hey {{first_name}},\n\nSharing a short benchmark that maps where ${primaryAudience} usually hit friction and how teams solved it. It's pulled from recent ${brand} rollouts.\n\nHappy to walk you through the numbers and flag fast wins if useful.`,
        },
      ],
      social: [
        `Hook: “${primaryAudience} spend ${goalList[0]?.toLowerCase() ?? "hours"} fighting X? Here's how ${brand} trims it to minutes.”`,
        `Problem spotlight reel featuring ${diffList[0]?.toLowerCase() ?? "key differentiator"}.`,
        `Customer quote snippet highlighting measurable wins after adopting ${offer}.`,
      ],
      ads: [
        `${goalList[0] ?? "Hit revenue targets"} without burning SDR hours — ${brand}.`,
        `Prove ROI on ${offer} in 30 days with ${brand}'s ${diffList[0]?.toLowerCase() ?? "playbook"}.`,
        `${primaryAudience}: ready-made system to ${goalList[1]?.toLowerCase() ?? "scale pipeline"}.`,
      ],
    },
    followUpCadence: [
      "Use 5-touch cadence within 10 days blending email, call, and LinkedIn.",
      "Reconnect day 14 with value-share (toolkit, benchmark, invite).",
      "Drop into nurture track with monthly live workshop CTA if still cold.",
    ],
    automationSuggestions: [
      "Use Clay or Apollo to enrich accounts with hiring, tech stack, and trigger events.",
      "Sync accepted hand-raisers to CRM automatically with lead scoring rules.",
      "Trigger Slack alerts for high-intent actions (pricing page visits, calculator downloads).",
    ],
    dataSignals: [
      "Net-new funding, hiring for related roles, or tooling migrations.",
      "Tech stack fit (e.g., HubSpot/Salesforce connected apps).",
      "Engagement with industry reports, webinars, or comparison pages.",
    ],
    nextSteps: [
      "Finalize ICP attributes and intent signals inside your CRM/CDP.",
      "Load lead magnet and nurture emails into automation platform.",
      "Launch outbound sequence with 20 pilot accounts and monitor replies.",
      "Review results weekly and iterate messaging based on objections.",
    ],
  };
};

const createContextPrompt = (inputs: AgentInputs): string => {
  const lines = [
    `Business: ${inputs.businessName}`,
    `Offering: ${inputs.offering}`,
    `Audience: ${inputs.audience}`,
  ];

  if (inputs.goals) lines.push(`Goals: ${inputs.goals}`);
  if (inputs.differentiators) lines.push(`Differentiators: ${inputs.differentiators}`);
  if (inputs.budget) lines.push(`Budget guidance: ${inputs.budget}`);
  if (inputs.tone) lines.push(`Preferred tone: ${inputs.tone}`);

  return lines.join("\n");
};

const findJsonText = (result: unknown) => {
  const response = result as {
    output?: { content?: { type: string; text?: string; json?: unknown }[] }[];
    output_text?: string;
  };

  for (const item of response.output ?? []) {
    for (const block of item.content ?? []) {
      if ((block.type === "output_text" || block.type === "text") && block.text) {
        return block.text;
      }
      if (block.type === "json" && block.json) {
        try {
          return JSON.stringify(block.json);
        } catch {
          continue;
        }
      }
    }
  }

  return response.output_text;
};

export async function POST(request: Request) {
  let payload: AgentInputs;

  try {
    payload = (await request.json()) as AgentInputs;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { businessName, offering, audience } = payload;

  if (!businessName || !offering || !audience) {
    return NextResponse.json(
      { error: "businessName, offering, and audience are required." },
      { status: 400 },
    );
  }

  const planFromLLM = async (): Promise<AgentPlan> => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const schemaText = JSON.stringify(jsonSchema.schema, null, 2);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are an elite B2B and B2C demand generation strategist. Always respond with valid JSON that matches this schema (no markdown, no prose outside JSON):\n${schemaText}`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Use the following context to craft a lead-generation blueprint. Respond with JSON that matches the provided schema.\n\n${createContextPrompt(payload)}\n\nConversation memory: ${
                payload.history?.map((item) => `${item.role}: ${item.content}`).join(" | ") || "N/A"
              }`,
            },
          ],
        },
      ],
    });

    const jsonText = findJsonText(response);

    if (!jsonText) {
      throw new Error("Unable to extract JSON response from model.");
    }

    const parsed = JSON.parse(jsonText) as AgentPlan;
    return parsed;
  };

  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ plan: buildFallbackPlan(payload), source: "fallback" });
    }

    const plan = await planFromLLM();

    return NextResponse.json({ plan, source: "openai" });
  } catch (error) {
    console.error("Agent generation failed", error);
    return NextResponse.json({ plan: buildFallbackPlan(payload), source: "fallback" });
  }
}
