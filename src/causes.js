/**
 * The 5 sleep disruption causes from The Longevity Vault's 3AM Decoder framework.
 *
 * Each cause includes:
 * - id: internal identifier
 * - name: display name
 * - summary: 1-sentence description for quick reference
 * - explanation: 2-3 sentence mechanism explanation (what the AI shows the user)
 * - symptoms: key symptom keywords that map to this cause (used by classifier)
 * - whatPeopleNotice: observable signs (from Decoder results pages)
 */

export const causes = {
  autonomic: {
    id: "autonomic",
    name: "Autonomic Nervous System",
    summary:
      "Your autonomic nervous system runs close to the alert threshold, so normal mid-sleep arousals tip into full wakefulness instead of cycling back to sleep.",
    explanation:
      "During lighter sleep stages, everyone has brief arousals between sleep cycles. In the autonomic cause, your nervous system runs close to the sympathetic (alert) threshold — so when a normal arousal happens, your HPA axis activates (CRH → ACTH → cortisol), heart rate rises, and you're wide awake. The racing thoughts at 3am follow from this — your prefrontal cortex activates because your body moved into alert mode. This pattern often tracks with stress periods and has typically been present for years.",
    whatPeopleNotice: [
      "Waking happens at a consistent time, almost like clockwork",
      "Your mind is active from the moment you're awake",
      "You may feel exhausted but wired at bedtime",
      "This pattern has been present for years or tracks with stress periods, not midlife body changes",
    ],
    symptoms: [
      "wired but tired",
      "racing thoughts",
      "mind won't shut off",
      "can't stop thinking",
      "stress",
      "anxiety at night",
      "consistent wake time",
      "clockwork waking",
      "hypervigilant",
      "alert immediately",
      "years",
      "long time",
      "since my 20s",
      "since my 30s",
      "always been a light sleeper",
      "heart racing",
      "fight or flight",
      "cortisol",
      "adrenaline at night",
    ],
  },

  metabolic: {
    id: "metabolic",
    name: "Metabolic / Blood Sugar",
    summary:
      "Overnight blood sugar drops below your body's tolerance threshold, triggering a cortisol and adrenaline response that wakes you up.",
    explanation:
      "Your body maintains blood glucose overnight through hepatic gluconeogenesis — your liver converts stored glycogen into glucose while you sleep. When glycogen stores run low, your body needs cortisol and adrenaline to keep producing glucose. The adrenaline is what wakes you. Eating something can help you fall back asleep because it provides glucose directly, bypassing the stress hormone response. The pattern is often inconsistent because overnight glucose regulation varies night to night depending on what you ate, activity level, and metabolic rate.",
    whatPeopleNotice: [
      "You wake alert, sometimes with a racing heart",
      "Eating something can make it easier to fall back asleep — but you may not feel hungry when you wake",
      "The pattern is inconsistent — some nights fine, some nights not",
      "Energy crashes or a heavy post-meal feeling during the day",
    ],
    symptoms: [
      "eating helps",
      "hungry",
      "blood sugar",
      "racing heart",
      "inconsistent",
      "some nights",
      "not every night",
      "energy crash",
      "post-meal",
      "glucose",
      "sugar",
      "snacking at night",
      "eat before bed",
      "last meal",
      "carbs",
      "insulin",
      "hypoglycemia",
      "shaky",
      "sweaty",
    ],
  },

  inflammatory: {
    id: "inflammatory",
    name: "Inflammatory",
    summary:
      "Elevated inflammatory cytokines (IL-6, TNF-alpha) fragment sleep and activate the HPA axis, while histamine keeps your brain closer to the wake threshold.",
    explanation:
      "Inflammatory cytokines — particularly IL-6 and TNF-alpha — fragment sleep and reduce time in deep sleep stages. These cytokines follow a circadian rhythm peaking in the early morning hours, which is why inflammation-driven disruption tends to be worse in the second half of the night. They also activate the HPA axis, raising cortisol during hours when it should be lowest. Histamine (a primary wake-promoting molecule) increases with inflammatory load, keeping your brain closer to the wake threshold. Common sources include gut issues, food sensitivities, and chronic low-grade inflammation.",
    whatPeopleNotice: [
      "Gut discomfort, bloating, or reflux — whether at night, on waking, or during the day",
      "Joint pain that doesn't have an obvious cause",
      "Brain fog alongside poor sleep — beyond what tiredness explains",
      "Food sensitivities or reactions — certain foods may affect your sleep, energy, or digestion",
    ],
    symptoms: [
      "gut",
      "bloating",
      "reflux",
      "IBS",
      "IBD",
      "Crohn",
      "joint pain",
      "brain fog",
      "food sensitivity",
      "food intolerance",
      "inflammation",
      "inflammatory",
      "allergies",
      "histamine",
      "autoimmune",
      "celiac",
      "gluten",
      "dairy",
      "digestive",
    ],
  },

  hormonal: {
    id: "hormonal",
    name: "Hormonal",
    summary:
      "Shifting hormone levels (testosterone, estrogen, progesterone) reduce deep sleep, destabilize temperature regulation, and weaken the calming GABA system.",
    explanation:
      "Hormones directly affect sleep architecture. In men, declining testosterone reduces slow-wave (deep) sleep — and since testosterone is primarily released during deep sleep, this creates a feedback loop. In women, declining progesterone reduces GABA-A receptor activity (the same calming receptors targeted by sedative medications), while declining estrogen narrows the thermoneutral zone, triggering hot flashes and night sweats that cause arousals. This cause typically develops gradually in your 40s-60s and coincides with other body changes like shifts in energy, body composition, and recovery.",
    whatPeopleNotice: [
      "Sleep deteriorated alongside other body changes — energy, weight distribution, recovery, mood",
      "Needing to urinate more at night than you used to",
      "Lower energy or motivation compared to a few years ago",
      "Hot flashes, night sweats, or temperature instability",
      "Developed gradually — not tied to a specific event",
    ],
    symptoms: [
      "hormone",
      "testosterone",
      "estrogen",
      "progesterone",
      "menopause",
      "perimenopause",
      "hot flash",
      "night sweat",
      "temperature",
      "nocturia",
      "bathroom",
      "urinate",
      "gradual",
      "40s",
      "50s",
      "60s",
      "midlife",
      "body composition",
      "muscle loss",
      "belly fat",
      "motivation",
      "recovery",
      "HRT",
      "TRT",
      "low energy",
      "getting older",
    ],
  },

  circadian: {
    id: "circadian",
    name: "Circadian Alignment",
    summary:
      "Your internal clock (SCN) is misaligned with your intended sleep schedule — you're tired but your body isn't ready to initiate sleep.",
    explanation:
      "Your brain's master clock — the suprachiasmatic nucleus (SCN) — determines when your body is ready to initiate sleep by controlling melatonin release timing. If your intended bedtime falls outside your circadian night window, falling asleep is difficult even when you're tired. Tiredness (accumulated sleep pressure) and sleep readiness (circadian timing) are two different things — you need both. The SCN calibrates primarily from light contrast between day and evening. Indoor lighting (100-300 lux) vs. outdoor daylight (2,000-10,000+ lux) can cause miscalibration if you spend most of your day indoors.",
    whatPeopleNotice: [
      "Difficulty falling asleep at your intended bedtime",
      "Once you do fall asleep, you can stay asleep for a full stretch",
      "You don't feel rested even after a full night — you want to hit snooze",
      "When you sleep on your body's schedule rather than your intended schedule, the sleep itself is fine",
    ],
    symptoms: [
      "falling asleep",
      "can't fall asleep",
      "trouble initiating",
      "onset",
      "stay asleep fine",
      "circadian",
      "rhythm",
      "schedule",
      "melatonin",
      "light",
      "jet lag",
      "shift work",
      "snooze",
      "not rested",
      "night owl",
      "late sleeper",
      "delayed",
      "bedtime",
      "screen time",
      "blue light",
    ],
  },
};

export const causeIds = Object.keys(causes);
