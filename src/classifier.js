/**
 * Sleep cause classifier for the TLV MCP server.
 *
 * Takes free-text symptom descriptions and returns the most likely
 * primary cause from TLV's 5-cause framework.
 *
 * This is a simplified classifier designed for MCP tool use — it does NOT
 * replicate the full Decoder's 15-question weighted scoring engine.
 * Instead, it uses keyword/phrase matching with weighted signals derived
 * from the same domain knowledge the Decoder uses.
 *
 * The full interactive Decoder experience (multi-cause breakdown,
 * visual experience, email capture) remains exclusive to
 * thelongevityvault.com/decoder
 */

import { causes, causeIds } from "./causes.js";

/**
 * Weighted keyword groups — some signals are stronger than others.
 * Weight 3 = pathognomonic (strongly points to one cause)
 * Weight 2 = significant signal
 * Weight 1 = mild signal
 */
const weightedSignals = {
  autonomic: [
    { phrases: ["wired but tired", "wired and tired"], weight: 3 },
    { phrases: ["racing thoughts", "mind won't shut off", "can't stop thinking", "brain won't turn off"], weight: 3 },
    { phrases: ["since my 20s", "since my 30s", "always been", "for years", "long time", "since childhood", "long-standing", "years ago"], weight: 3 },
    { phrases: ["fight or flight", "hypervigilant"], weight: 2 },
    { phrases: ["clockwork", "consistent time", "same time every night", "like clockwork"], weight: 2 },
    { phrases: ["stress", "anxiety", "anxious"], weight: 1 },
    { phrases: ["alert immediately", "wide awake instantly"], weight: 2 },
    { phrases: ["cortisol", "adrenaline"], weight: 1 },
  ],

  metabolic: [
    { phrases: ["eating helps", "eat something", "snack helps", "food helps fall back asleep"], weight: 3 },
    { phrases: ["hungry", "hunger", "blood sugar", "glucose", "hypoglycemia"], weight: 2 },
    { phrases: ["racing heart when waking", "heart pounding", "shaky"], weight: 2 },
    { phrases: ["inconsistent", "some nights", "not every night", "varies"], weight: 1 },
    { phrases: ["energy crash", "post-meal", "afternoon slump"], weight: 1 },
    { phrases: ["last meal", "eat before bed", "late dinner", "early dinner"], weight: 1 },
    { phrases: ["carbs", "sugar", "insulin"], weight: 1 },
  ],

  inflammatory: [
    { phrases: ["ibs", "ibd", "crohn", "colitis", "celiac"], weight: 3 },
    { phrases: ["bloating", "bloated", "reflux", "acid reflux", "gerd"], weight: 2 },
    { phrases: ["gut discomfort", "gut issues", "gut problems", "digestive issues", "stomach problems"], weight: 2 },
    { phrases: ["gut", "digestive", "stomach"], weight: 1 },
    { phrases: ["joint pain", "joint ache", "stiff joints"], weight: 2 },
    { phrases: ["brain fog", "foggy", "cognitive"], weight: 2 },
    { phrases: ["food sensitivity", "food intolerance", "gluten", "dairy", "allergies"], weight: 2 },
    { phrases: ["inflammation", "inflammatory", "autoimmune"], weight: 2 },
    { phrases: ["histamine"], weight: 2 },
  ],

  hormonal: [
    { phrases: ["hot flash", "hot flashes", "night sweat", "night sweats"], weight: 3 },
    { phrases: ["menopause", "perimenopause", "postmenopause"], weight: 3 },
    { phrases: ["testosterone", "low t", "trt"], weight: 3 },
    { phrases: ["estrogen", "progesterone", "hrt", "hormone replacement"], weight: 2 },
    { phrases: ["nocturia", "bathroom at night", "urinate at night", "pee at night", "getting up to pee", "pee more at night"], weight: 2 },
    { phrases: ["gradual", "gradually worse", "got worse over time", "developed over years"], weight: 1 },
    { phrases: ["40s", "50s", "60s", "midlife", "middle age", "getting older", "since 40", "since 50"], weight: 1 },
    { phrases: ["body composition", "belly fat", "muscle loss", "gaining weight", "body changes"], weight: 1 },
    { phrases: ["low energy", "less motivation", "slower recovery", "low motivation", "lower energy"], weight: 1 },
    { phrases: ["temperature", "temperature instability", "runs hot", "runs cold"], weight: 2 },
    { phrases: ["period changes", "period irregular", "menstrual", "cycle changes", "mood changes"], weight: 2 },
    { phrases: ["hot and restless", "wakes hot", "restless"], weight: 2 },
  ],

  circadian: [
    { phrases: ["trouble falling asleep", "can't fall asleep", "difficulty falling asleep", "hard to fall asleep", "falling asleep only", "trouble falling asleep only"], weight: 3 },
    { phrases: ["falling asleep", "fall asleep at bedtime", "falling asleep at"], weight: 2 },
    { phrases: ["stay asleep fine", "once asleep i'm fine", "staying asleep is fine", "no trouble staying asleep"], weight: 3 },
    { phrases: ["night owl", "late sleeper", "delayed"], weight: 2 },
    { phrases: ["snooze", "not rested", "want to sleep more", "don't feel rested"], weight: 1 },
    { phrases: ["shift work", "jet lag", "time zone", "travel"], weight: 2 },
    { phrases: ["screen", "blue light", "phone at night", "screen time"], weight: 1 },
    { phrases: ["schedule", "bedtime", "sleep timing", "intended bedtime"], weight: 1 },
    { phrases: ["melatonin"], weight: 1 },
  ],
};

/**
 * Age-based scoring adjustments — mirrors the Decoder's engine.ts logic.
 * Applied after keyword scoring to account for biological priors.
 *
 * KEY DESIGN DECISION: Age boosting is CONDITIONAL on hormonal signals.
 * In the full Decoder, the 15-question flow ensures hormonal questions are
 * always asked — so age boosting works because hormonal evidence is always
 * gathered. In free-text MCP input, someone might only mention "I'm 65 and
 * I have gut problems" — age boosting alone shouldn't override the inflammatory
 * signal. We only apply the full age boost when explicit hormonal symptoms
 * are mentioned. A reduced boost is applied otherwise (age is still a prior,
 * but a weaker one without corroborating symptoms).
 */
function applyAgeBoosting(scores, text) {
  const lowerText = text.toLowerCase();

  // Detect age signals
  let ageGroup = null;
  if (/\b(6[5-9]|7\d|8\d|9\d)\b/.test(lowerText) || /\b65\+?\b/.test(lowerText) || /\bover 65\b/.test(lowerText)) {
    ageGroup = "65+";
  } else if (/\b(5[5-9]|6[0-4])\b/.test(lowerText) || /\bover 55\b/.test(lowerText) || /\blate 50s\b/.test(lowerText) || /\bearly 60s\b/.test(lowerText)) {
    ageGroup = "55-64";
  } else if (/\b(4[5-9]|5[0-4])\b/.test(lowerText) || /\bover 45\b/.test(lowerText) || /\blate 40s\b/.test(lowerText) || /\bearly 50s\b/.test(lowerText)) {
    ageGroup = "45-54";
  } else if (/\b(3[5-9]|4[0-4])\b/.test(lowerText) || /\bover 35\b/.test(lowerText) || /\blate 30s\b/.test(lowerText) || /\bearly 40s\b/.test(lowerText)) {
    ageGroup = "35-44";
  } else if (/\bmidlife\b/.test(lowerText) || /\bmiddle.age\b/.test(lowerText)) {
    ageGroup = "45-54";
  }

  // Check if hormonal symptoms are explicitly mentioned (beyond just age)
  const hasHormonalSymptoms = scores.hormonal > 0;

  // Apply age-based hormonal boosting — CONDITIONAL on symptom evidence
  if (hasHormonalSymptoms) {
    // Full boost when hormonal symptoms are present (matches Decoder behavior)
    if (ageGroup === "65+") {
      scores.hormonal += 2;
      scores.circadian += 1;
    } else if (ageGroup === "55-64") {
      scores.hormonal += 2;
    } else if (ageGroup === "45-54") {
      scores.hormonal += 1;
    }
  } else {
    // Reduced boost when only age mentioned, no hormonal symptoms
    // Still gives a mild hormonal prior for older adults (it's biologically real)
    if (ageGroup === "65+") {
      scores.hormonal += 1;
      scores.circadian += 1;
    } else if (ageGroup === "55-64") {
      scores.hormonal += 1;
    }
    // No boost for 45-54 without hormonal symptoms
  }

  // Detect gender signals for additional hormonal boosting
  const isFemale = /\b(woman|female|she|her|menopause|perimenopause|period|estrogen|progesterone)\b/.test(lowerText);
  const isMale = /\b(man|male|he|his|testosterone|trt|prostate)\b/.test(lowerText);

  if (hasHormonalSymptoms) {
    if (isFemale && (ageGroup === "45-54" || ageGroup === "55-64" || ageGroup === "65+")) {
      scores.hormonal += 1;
    }
    if (isMale && ageGroup === "65+") {
      scores.hormonal += 1;
    }
  }
}

/**
 * Classify sleep disruption cause from free-text symptoms.
 *
 * @param {string} symptomsText - Free-text description of sleep symptoms
 * @returns {{ primaryCause: string, confidence: string, scores: Record<string, number> }}
 */
export function classifySleepCause(symptomsText) {
  const lowerText = symptomsText.toLowerCase();

  // Initialize scores
  const scores = {};
  for (const id of causeIds) {
    scores[id] = 0;
  }

  // Score each cause based on weighted keyword matching
  for (const [causeId, signals] of Object.entries(weightedSignals)) {
    for (const signal of signals) {
      for (const phrase of signal.phrases) {
        if (lowerText.includes(phrase.toLowerCase())) {
          scores[causeId] += signal.weight;
          break; // Only count each signal group once per cause
        }
      }
    }
  }

  // Apply age-based adjustments
  applyAgeBoosting(scores, symptomsText);

  // Circadian dominance rule: if "falling asleep" is the stated problem
  // and NOT staying asleep, this mirrors the Decoder's behavior where
  // "falling asleep only" gives circadian +3 AND skips all stay-asleep
  // questions (which is where hormonal/metabolic/inflammatory accumulate
  // most of their points). In free text, hormonal keywords may still be
  // present alongside the circadian signal — we need to simulate the
  // Decoder's skip behavior by boosting circadian and reducing the others.
  const isFallingAsleepPrimary = /\b(falling asleep|fall asleep|can't fall asleep|trouble falling asleep)\b/.test(lowerText)
    && !/\b(staying asleep|stay asleep|middle of the night|wak(e|ing) up at|3am|2am|4am)\b/.test(lowerText);
  if (isFallingAsleepPrimary && scores.circadian > 0) {
    scores.circadian += 3;
    // Discount wake-related cause scores (Decoder skips these questions)
    scores.autonomic = Math.round(scores.autonomic * 0.5);
    scores.metabolic = Math.round(scores.metabolic * 0.5);
    scores.inflammatory = Math.round(scores.inflammatory * 0.5);
    scores.hormonal = Math.round(scores.hormonal * 0.7);
  }

  // Find primary cause
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  let [primaryId, primaryScore] = sorted[0];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Tie-breaking (mirrors engine.ts)
  const tiedForFirst = sorted.filter(([, s]) => s === primaryScore);
  if (tiedForFirst.length > 1) {
    const tiedIds = new Set(tiedForFirst.map(([k]) => k));
    // Circadian wins ties when falling asleep is the issue
    if (isFallingAsleepPrimary && tiedIds.has("circadian")) {
      primaryId = "circadian";
      primaryScore = scores.circadian;
    }
    // Inflammatory wins ties over autonomic (matches engine.ts priority)
    else if (tiedIds.has("inflammatory")) {
      primaryId = "inflammatory";
      primaryScore = scores.inflammatory;
    }
  }

  // Determine confidence level
  let confidence;
  if (totalScore === 0) {
    confidence = "insufficient";
  } else if (primaryScore / totalScore >= 0.5) {
    confidence = "high";
  } else if (primaryScore / totalScore >= 0.35) {
    confidence = "moderate";
  } else {
    confidence = "low";
  }

  return {
    primaryCause: totalScore === 0 ? null : primaryId,
    confidence,
    scores,
  };
}
