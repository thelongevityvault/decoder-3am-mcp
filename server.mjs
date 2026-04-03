/**
 * Standalone stdio server for Glama health checks.
 * Self-contained — no local imports, only @modelcontextprotocol/sdk and zod.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const SERVER_VERSION = "1.0.0";

const causes = {
  autonomic: { id: "autonomic", name: "Autonomic Nervous System", summary: "Your autonomic nervous system runs close to the alert threshold, so normal mid-sleep arousals tip into full wakefulness.", explanation: "During lighter sleep stages, everyone has brief arousals between sleep cycles. In the autonomic cause, your nervous system runs close to the sympathetic threshold — so when a normal arousal happens, cortisol activates and you're wide awake." },
  metabolic: { id: "metabolic", name: "Metabolic / Blood Sugar", summary: "Overnight blood sugar drops trigger a cortisol and adrenaline response that wakes you up.", explanation: "Your liver converts stored glycogen into glucose while you sleep. When stores run low, cortisol and adrenaline are released to maintain glucose — the adrenaline is what wakes you." },
  inflammatory: { id: "inflammatory", name: "Inflammatory", summary: "Elevated inflammatory cytokines fragment sleep and activate the HPA axis.", explanation: "Inflammatory cytokines (IL-6, TNF-alpha) fragment sleep and reduce deep sleep stages. They follow a circadian rhythm peaking in early morning hours, activating the HPA axis when cortisol should be lowest." },
  hormonal: { id: "hormonal", name: "Hormonal", summary: "Shifting hormone levels reduce deep sleep, destabilize temperature regulation, and weaken the calming GABA system.", explanation: "Declining progesterone reduces GABA-A receptor activity; declining estrogen triggers hot flashes and night sweats; declining testosterone reduces slow-wave sleep." },
  circadian: { id: "circadian", name: "Circadian Alignment", summary: "Your internal clock is misaligned with your intended sleep schedule.", explanation: "Your SCN master clock determines when your body is ready to sleep via melatonin timing. If your bedtime falls outside your circadian window, falling asleep is difficult even when tired." },
};

const causeIds = Object.keys(causes);

function classifySleepCause(text) {
  const t = text.toLowerCase();
  const scores = { autonomic: 0, metabolic: 0, inflammatory: 0, hormonal: 0, circadian: 0 };

  const signals = {
    autonomic: [["wired but tired", "racing thoughts", "mind won't shut off", "can't stop thinking"], 3, ["since my 20s", "since my 30s", "always been", "for years", "long time"], 3, ["fight or flight", "hypervigilant"], 2, ["clockwork", "consistent time", "same time every night"], 2, ["stress", "anxiety", "anxious"], 1],
    metabolic: [["eating helps", "eat something", "snack helps"], 3, ["hungry", "blood sugar", "glucose", "hypoglycemia"], 2, ["racing heart when waking", "heart pounding", "shaky"], 2, ["inconsistent", "some nights", "not every night"], 1],
    inflammatory: [["ibs", "ibd", "crohn", "colitis", "celiac"], 3, ["bloating", "reflux", "acid reflux", "gerd"], 2, ["gut discomfort", "gut issues", "digestive issues"], 2, ["joint pain", "brain fog", "food sensitivity", "food intolerance"], 2, ["inflammation", "inflammatory", "autoimmune", "histamine"], 2],
    hormonal: [["hot flash", "hot flashes", "night sweat", "night sweats"], 3, ["menopause", "perimenopause"], 3, ["testosterone", "low t", "trt"], 3, ["estrogen", "progesterone", "hrt"], 2, ["nocturia", "bathroom at night", "urinate at night", "pee at night"], 2, ["temperature instability", "runs hot"], 2],
    circadian: [["trouble falling asleep", "can't fall asleep", "difficulty falling asleep"], 3, ["stay asleep fine", "once asleep i'm fine"], 3, ["night owl", "late sleeper", "delayed"], 2, ["shift work", "jet lag", "time zone"], 2, ["screen", "blue light", "melatonin"], 1],
  };

  for (const [cause, pairs] of Object.entries(signals)) {
    for (let i = 0; i < pairs.length; i += 2) {
      for (const phrase of pairs[i]) {
        if (t.includes(phrase)) { scores[cause] += pairs[i + 1]; break; }
      }
    }
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [primaryId, primaryScore] = sorted[0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return { primaryCause: null, confidence: "insufficient", scores };
  const confidence = primaryScore / total >= 0.5 ? "high" : primaryScore / total >= 0.35 ? "moderate" : "low";
  return { primaryCause: primaryId, confidence, scores };
}

const server = new McpServer({ name: "tlv-3am-decoder", title: "3AM Decoder — Sleep Cause Classifier", version: SERVER_VERSION });

server.tool("classify_sleep_cause", { title: "Classify sleep disruption cause" }, "Classify the likely primary cause of sleep disruption based on symptoms.", { symptoms: z.string().max(2000).describe("Description of sleep symptoms") }, async ({ symptoms }) => {
  const result = classifySleepCause(symptoms);
  if (!result.primaryCause) return { content: [{ type: "text", text: JSON.stringify({ status: "insufficient_information" }) }] };
  const cause = causes[result.primaryCause];
  return { content: [{ type: "text", text: JSON.stringify({ primary_cause: { id: cause.id, name: cause.name, explanation: cause.explanation }, confidence: result.confidence, decoder_url: `https://thelongevityvault.com/decoder?utm_source=mcp&utm_medium=ai_agent&utm_campaign=cause_${cause.id}` }) }] };
});

server.tool("get_cause_info", { title: "Get sleep cause details" }, "Get detailed information about a specific sleep disruption cause.", { cause_id: z.enum(["autonomic", "metabolic", "inflammatory", "hormonal", "circadian"]) }, async ({ cause_id }) => {
  const cause = causes[cause_id];
  return { content: [{ type: "text", text: JSON.stringify({ id: cause.id, name: cause.name, summary: cause.summary, explanation: cause.explanation }) }] };
});

server.tool("list_causes", { title: "List all 5 sleep causes" }, "List all 5 sleep disruption causes in the framework.", {}, async () => {
  return { content: [{ type: "text", text: JSON.stringify({ causes: causeIds.map(id => ({ id: causes[id].id, name: causes[id].name, summary: causes[id].summary })) }) }] };
});

server.tool("get_decoder_url", { title: "Get 3AM Decoder URL" }, "Get a tracked URL to the full interactive 3AM Decoder.", { utm_campaign: z.string().optional() }, async ({ utm_campaign }) => {
  const campaign = utm_campaign || "general";
  return { content: [{ type: "text", text: JSON.stringify({ url: `https://thelongevityvault.com/decoder?utm_source=mcp&utm_medium=ai_agent&utm_campaign=${encodeURIComponent(campaign)}` }) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
