// ===========================================================================
// AI PET DIAGNOSTIC ENGINE
// Rule-based NLP analysis for pet health triage
// ===========================================================================

// ── Expanded Critical Keywords ──────────────────────────────────────────────
export const CRITICAL_KEYWORDS = [
  'blood', 'bleeding', 'bloody', 'hemorrhage', 'hemorrhaging',
  'seizure', 'seizures', 'seizing', 'convulsion', 'convulsing', 'fits', 'fitting',
  'poison', 'poisoned', 'poisoning', 'toxic', 'toxin', 'ate rat poison', 'ate chocolate', 'ate antifreeze',
  'unconscious', 'unresponsive', 'not waking up', 'passed out', 'fainted', 'comatose',
  'collapse', 'collapsed', 'fell over', 'cant stand', "can't stand", 'cannot stand',
  'difficulty breathing', 'gasping', 'choking', 'cant breathe', "can't breathe", 'struggling to breathe',
  'suffocating', 'blue tongue', 'blue gums', 'pale gums', 'white gums', 'gums are pale',
  'swallowed object', 'swallowed something', 'ate foreign object', 'obstruction',
  'broken bone', 'fracture', 'fractured', 'bone sticking out', 'compound fracture',
  'extreme pain', 'howling in pain', 'screaming', 'crying nonstop', 'yelping constantly',
  'hit by car', 'run over', 'fell from', 'high fall', 'trauma', 'severe injury',
  'not breathing', 'stopped breathing', 'no heartbeat', 'heart stopped',
  'swollen abdomen', 'bloated stomach', 'stomach twisted', 'bloat',
  'paralyzed', 'paralysis', 'cant move legs', "can't move", 'dragging legs',
  'eye popping', 'eye bulging', 'prolapsed', 'organ coming out',
  'bitten by snake', 'snake bite', 'spider bite', 'bee sting swelling',
  'burn', 'burned', 'scalded', 'electrocuted', 'electric shock',
  'drowning', 'nearly drowned', 'ingested', 'drank bleach', 'drank chemicals',
  'open wound', 'deep cut', 'laceration', 'gash', 'puncture wound',
  'maggots', 'infested', 'severe infection',
  'dying', 'going to die', 'almost dead', 'barely alive', 'critical condition',
  'non stop vomiting', 'nonstop vomiting', 'vomiting blood', 'blood in stool',
  'blood in urine', 'bloody diarrhea', 'black stool', 'tarry stool',
];

// ── Symptom Knowledge Base ──────────────────────────────────────────────────
interface SymptomPattern {
  keywords: string[];
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  followUp: string;
  careTips: string;
  warningSign: string;
}

const HEALTH_SYMPTOMS: SymptomPattern[] = [
  {
    keywords: ['vomit', 'vomiting', 'throwing up', 'puking', 'regurgitat'],
    condition: 'Gastric Irritation / Possible Dietary Indiscretion',
    severity: 'moderate',
    followUp: 'How frequently is the vomiting occurring? Is there any unusual color (yellow bile, foamy, or dark material) in the vomit?',
    careTips: 'Withhold food for 2-4 hours, then offer small amounts of bland food (boiled chicken and rice). Ensure fresh water is available.',
    warningSign: 'If vomiting persists more than 24 hours, contains blood, or your pet becomes lethargic, seek immediate veterinary care.'
  },
  {
    keywords: ['diarrhea', 'loose stool', 'watery stool', 'runny poop', 'soft stool'],
    condition: 'Gastrointestinal Upset / Possible Enteritis',
    severity: 'moderate',
    followUp: 'What is the consistency and color of the stool? Has your pet eaten anything unusual recently, or been around other sick animals?',
    careTips: 'Offer a bland diet and ensure hydration. Monitor stool for any changes in color or presence of mucus.',
    warningSign: 'If diarrhea contains blood, lasts more than 48 hours, or your pet shows signs of dehydration (dry gums, sunken eyes), consult a vet immediately.'
  },
  {
    keywords: ['not eating', 'won\'t eat', 'wont eat', 'appetite', 'refuses food', 'anorexia', 'stopped eating', 'skipping meals', 'no appetite', 'loss of appetite'],
    condition: 'Inappetence / Possible Underlying Illness',
    severity: 'mild',
    followUp: 'How long has your pet been refusing food? Are they still drinking water? Have you noticed any other changes like lethargy or weight loss?',
    careTips: 'Try warming their food slightly to increase aroma. Offer high-value treats to test interest. Ensure a calm feeding environment.',
    warningSign: 'If appetite loss persists beyond 48 hours, or is accompanied by vomiting, lethargy, or weight loss, schedule a vet visit.'
  },
  {
    keywords: ['cough', 'coughing', 'hack', 'hacking', 'gagging', 'retching'],
    condition: 'Respiratory Irritation / Possible Kennel Cough',
    severity: 'moderate',
    followUp: 'Is the cough dry and honking, or wet and productive? Does it worsen at night, during exercise, or when pulling on a leash?',
    careTips: 'Keep your pet in a well-humidified room. Avoid using collars (switch to harness). Limit exercise until coughing resolves.',
    warningSign: 'If coughing produces blood, is accompanied by difficulty breathing, or persists beyond a week, seek veterinary care.'
  },
  {
    keywords: ['scratch', 'scratching', 'itchy', 'itching', 'rash', 'skin', 'red skin', 'hot spots', 'licking paws', 'chewing skin', 'fleas', 'ticks'],
    condition: 'Dermatitis / Possible Allergic Reaction or Parasite Infestation',
    severity: 'mild',
    followUp: 'Where on the body is the itching most concentrated? Have you noticed any hair loss, redness, bumps, or unusual odor from the skin?',
    careTips: 'Check for fleas/ticks. Give an oatmeal bath if skin is irritated. Avoid known allergens. Keep nails trimmed to prevent self-injury.',
    warningSign: 'If there are open sores, spreading redness, swelling of the face/eyes, or difficulty breathing alongside skin issues, see a vet immediately.'
  },
  {
    keywords: ['water', 'drinking', 'thirsty', 'excessive thirst', 'drinking a lot', 'urinating a lot', 'peeing more', 'frequent urination'],
    condition: 'Polydipsia/Polyuria / Possible Metabolic or Kidney Issue',
    severity: 'moderate',
    followUp: 'Approximately how much water is your pet drinking daily? Have you noticed changes in urine color, amount, or frequency? Any recent weight changes?',
    careTips: 'Ensure fresh water is always available. Monitor and note daily water intake. Track urination frequency.',
    warningSign: 'Excessive thirst with weight loss, vomiting, or lethargy could indicate diabetes or kidney disease — consult a vet promptly.'
  },
  {
    keywords: ['eye', 'eyes', 'discharge', 'watery eyes', 'red eye', 'squinting', 'swollen eye', 'cloudy eye'],
    condition: 'Ocular Irritation / Possible Conjunctivitis',
    severity: 'mild',
    followUp: 'Is the discharge clear, yellow, or green? Is your pet squinting, rubbing at the eye, or showing sensitivity to light?',
    careTips: 'Gently clean discharge with a warm, damp cloth. Prevent your pet from rubbing or scratching the eye.',
    warningSign: 'If the eye appears cloudy, severely swollen, or there is green discharge, seek veterinary attention within 24 hours.'
  },
  {
    keywords: ['ear', 'ears', 'ear infection', 'shaking head', 'head tilt', 'smelly ear', 'ear discharge', 'scratching ear'],
    condition: 'Otitis / Possible Ear Infection',
    severity: 'mild',
    followUp: 'Is there any discharge or odor from the ear? Is your pet shaking their head frequently or tilting it to one side?',
    careTips: 'Do not insert anything into the ear canal. Gently clean the outer ear with a vet-approved solution.',
    warningSign: 'If your pet has a persistent head tilt, loss of balance, or the ear is very swollen and painful, see a vet promptly.'
  },
  {
    keywords: ['lump', 'bump', 'mass', 'growth', 'swelling', 'swollen', 'tumor', 'abscess'],
    condition: 'Soft Tissue Mass / Possible Abscess or Neoplasia',
    severity: 'moderate',
    followUp: 'Where is the lump located? Is it growing quickly? Is it hard or soft? Is it painful when touched? Is there any discharge from it?',
    careTips: 'Monitor the size by measuring it weekly. Do not squeeze or attempt to drain it at home.',
    warningSign: 'If the lump grows rapidly, becomes painful, bleeds, or is accompanied by lethargy or weight loss, see a vet immediately.'
  },
  {
    keywords: ['fever', 'hot', 'warm nose', 'shivering', 'temperature', 'overheating'],
    condition: 'Pyrexia / Possible Infection or Inflammatory Response',
    severity: 'moderate',
    followUp: 'Does your pet feel warm to the touch, especially on the ears and paw pads? Are they shivering, panting excessively, or reluctant to move?',
    careTips: 'Keep your pet in a cool, comfortable area. Offer small amounts of water frequently. Do not give human medications.',
    warningSign: 'A temperature above 103°F (39.4°C) is concerning. If accompanied by lethargy, vomiting, or nasal discharge, seek immediate vet care.'
  },
];

const ACTIVITY_SYMPTOMS: SymptomPattern[] = [
  {
    keywords: ['lethargic', 'lethargy', 'tired', 'sleeping more', 'no energy', 'lazy', 'sluggish', 'weak', 'weakness', 'resting more'],
    condition: 'General Malaise / Possible Systemic Illness',
    severity: 'moderate',
    followUp: 'How long has this lethargy been ongoing? Is your pet still eating and drinking normally? Have they had any recent illness, surgery, or vaccination?',
    careTips: 'Ensure a comfortable resting area. Monitor food and water intake closely. Keep a log of energy levels throughout the day.',
    warningSign: 'If lethargy lasts more than 48 hours, or is accompanied by vomiting, diarrhea, or pale gums, seek veterinary attention.'
  },
  {
    keywords: ['limp', 'limping', 'favoring', 'lame', 'lameness', 'hobbling', 'not using leg', 'holding paw up'],
    condition: 'Musculoskeletal Strain / Possible Ligament or Joint Injury',
    severity: 'moderate',
    followUp: 'Which leg is affected? Did the limping start suddenly (e.g., after a jump or fall) or has it been gradual? Can your pet bear any weight on it?',
    careTips: 'Restrict exercise and jumping. Provide soft bedding. Apply a cold compress wrapped in a towel for 10 minutes if recently injured.',
    warningSign: 'If the limb appears deformed, is severely swollen, or your pet cannot bear any weight at all, seek immediate veterinary care.'
  },
  {
    keywords: ['restless', 'pacing', 'can\'t settle', 'cant settle', 'agitated', 'won\'t sleep', 'wont sleep', 'up all night'],
    condition: 'Restlessness / Possible Pain, Anxiety, or Cognitive Dysfunction',
    severity: 'mild',
    followUp: 'Is the restlessness worse at night? Does your pet seem to be in pain, or more anxious? Have there been any recent changes in the household?',
    careTips: 'Provide a quiet, dimly-lit space for rest. Maintain a consistent daily routine. Consider calming aids like pheromone diffusers.',
    warningSign: 'If restlessness is accompanied by panting, drooling, a swollen abdomen, or attempts to vomit, this could indicate a medical emergency.'
  },
  {
    keywords: ['stiff', 'stiffness', 'difficulty getting up', 'slow to rise', 'arthritis', 'joint', 'joints'],
    condition: 'Joint Stiffness / Possible Osteoarthritis or Degenerative Joint Disease',
    severity: 'mild',
    followUp: 'Is the stiffness worse in the morning or after rest? Does it improve with gentle movement? How old is your pet, and have they had joint issues before?',
    careTips: 'Provide orthopedic bedding. Keep your pet at a healthy weight. Gentle, short walks can help maintain joint mobility.',
    warningSign: 'If stiffness is accompanied by sudden swelling, heat in the joints, or your pet cries when moving, consult a vet.'
  },
  {
    keywords: ['exercise intolerance', 'gets tired fast', 'stops on walks', 'pants quickly', 'can\'t run', 'heavy breathing during walks'],
    condition: 'Exercise Intolerance / Possible Cardiac or Respiratory Issue',
    severity: 'moderate',
    followUp: 'How quickly does your pet tire compared to before? Do they cough or pant heavily during or after exercise? Have you noticed any blueish tinge to the tongue?',
    careTips: 'Reduce exercise intensity and duration. Avoid exercising in heat. Monitor breathing rate at rest (should be under 30 breaths/min for dogs).',
    warningSign: 'If your pet collapses during exercise, has a persistent cough, or their tongue/gums turn blue, seek emergency veterinary care immediately.'
  },
];

const BEHAVIOR_SYMPTOMS: SymptomPattern[] = [
  {
    keywords: ['aggressive', 'aggression', 'biting', 'growling', 'snapping', 'attacking', 'lunging', 'snarling'],
    condition: 'Behavioral Aggression / Possible Pain-Induced or Fear-Based Response',
    severity: 'moderate',
    followUp: 'Is the aggression directed at people, other animals, or both? Did something specific trigger it? Has your pet been aggressive before, or is this new behavior?',
    careTips: 'Avoid punishing aggressive behavior as it can worsen it. Give your pet space and remove triggers. Keep children and other pets safe.',
    warningSign: 'Sudden aggression in a normally calm pet could indicate pain or neurological issues — have them examined by a vet.'
  },
  {
    keywords: ['vocal', 'vocalizing', 'barking', 'meowing', 'crying', 'whining', 'whimper', 'howling', 'yowling'],
    condition: 'Excessive Vocalization / Possible Distress, Pain, or Cognitive Decline',
    severity: 'mild',
    followUp: 'When does the vocalization occur most (day vs night)? Does your pet seem to be in pain, confused, or seeking attention? Is this a new behavior?',
    careTips: 'Rule out pain first. If anxiety-related, maintain a consistent routine. Provide mental stimulation with puzzle toys.',
    warningSign: 'If vocalization is constant, accompanied by pacing or disorientation (especially in senior pets), consult a vet for cognitive dysfunction screening.'
  },
  {
    keywords: ['hiding', 'hiding constantly', 'won\'t come out', 'wont come out', 'withdrawn', 'isolating', 'under bed', 'reclusive'],
    condition: 'Social Withdrawal / Possible Illness, Pain, or Severe Stress',
    severity: 'moderate',
    followUp: 'How long has your pet been hiding? Are they still eating and using the litter box/going outside? Have there been any new stressors (new pets, visitors, loud noises)?',
    careTips: 'Provide a safe, quiet space. Don\'t force interaction. Place food and water near their hiding spot. Speak softly around them.',
    warningSign: 'If hiding is combined with not eating, lethargy, or signs of pain, this likely indicates an underlying medical issue requiring vet attention.'
  },
  {
    keywords: ['anxious', 'anxiety', 'scared', 'fearful', 'trembling', 'shaking', 'panting', 'destructive', 'separation'],
    condition: 'Anxiety Disorder / Possible Separation Anxiety or Phobia',
    severity: 'mild',
    followUp: 'Does the anxiety seem to be triggered by specific events (thunderstorms, being left alone, car rides)? Is your pet also destructive or having house-soiling accidents?',
    careTips: 'Create a safe den-like space. Use calming music or white noise. Consider anxiety wraps. Maintain a predictable routine.',
    warningSign: 'If anxiety leads to self-harm (excessive licking causing sores, chewing paws raw), or your pet stops eating entirely, seek professional help.'
  },
  {
    keywords: ['confused', 'disoriented', 'lost', 'staring at wall', 'forgetting', 'wandering', 'not recognizing', 'dementia'],
    condition: 'Cognitive Dysfunction / Possible Age-Related Cognitive Decline',
    severity: 'moderate',
    followUp: 'How old is your pet? Do they seem lost in familiar places, forget trained behaviors, or have reversed sleep-wake cycles? Is this getting progressively worse?',
    careTips: 'Keep the environment consistent — avoid rearranging furniture. Maintain regular schedules for feeding and walks. Night lights can help disoriented pets.',
    warningSign: 'If disorientation is sudden (not gradual), accompanied by head pressing, circling, or seizures, this may indicate a neurological emergency.'
  },
];

// ── Combine all symptoms by category ────────────────────────────────────────
const SYMPTOM_DB: Record<string, SymptomPattern[]> = {
  Health: HEALTH_SYMPTOMS,
  Activity: ACTIVITY_SYMPTOMS,
  Behavior: BEHAVIOR_SYMPTOMS,
};

// ── Check for critical keywords in text ─────────────────────────────────────
export function hasCriticalContent(text: string): { found: boolean; matched: string[] } {
  const lower = text.toLowerCase();
  const matched = CRITICAL_KEYWORDS.filter(kw => lower.includes(kw));
  return { found: matched.length > 0, matched };
}

// ── Analyze user text and find matching symptoms ────────────────────────────
export function analyzeUserText(text: string, category: string): {
  matchedSymptoms: SymptomPattern[];
  severity: 'mild' | 'moderate' | 'severe';
  detectedKeywords: string[];
} {
  const lower = text.toLowerCase();
  const symptoms = SYMPTOM_DB[category] || HEALTH_SYMPTOMS;
  const matched: SymptomPattern[] = [];
  const detectedKeywords: string[] = [];

  for (const symptom of symptoms) {
    for (const kw of symptom.keywords) {
      if (lower.includes(kw)) {
        if (!matched.find(m => m.condition === symptom.condition)) {
          matched.push(symptom);
        }
        detectedKeywords.push(kw);
        break;
      }
    }
  }

  // Determine overall severity
  let severity: 'mild' | 'moderate' | 'severe' = 'mild';
  if (matched.some(s => s.severity === 'severe')) severity = 'severe';
  else if (matched.some(s => s.severity === 'moderate')) severity = 'moderate';

  // Escalate if multiple symptoms detected
  if (matched.length >= 3 && severity === 'moderate') severity = 'severe';

  return { matchedSymptoms: matched, severity, detectedKeywords };
}

// ── Generate smart follow-up based on what user typed ───────────────────────
export function generateSmartFollowUp(
  category: string,
  step: string,
  userText: string,
  petName: string
): string {
  const analysis = analyzeUserText(userText, category);

  if (analysis.matchedSymptoms.length > 0) {
    const primary = analysis.matchedSymptoms[0];
    if (primary) {
      const ack = `I understand — based on what you've described, ${petName} may be experiencing signs of **${primary.condition}**.`;
      
      if (step === 'QUESTION_1') {
        return `${ack}\n\n${primary.followUp}`;
      }
      if (step === 'QUESTION_2') {
        return `Thank you for those details. ${primary.followUp}\n\nTo complete the assessment, could you also tell me: has this happened before, and is ${petName} currently on any medication or supplements?`;
      }
      if (step === 'QUESTION_3') {
        return `That's very helpful information. One last question: have there been any changes in ${petName}'s environment, diet, or routine recently that might be related? Any contact with other animals that were sick?`;
      }
    }
  }

  // Fallback contextual responses when no specific symptom is matched
  const fallbacks: Record<string, Record<string, string>> = {
    Health: {
      QUESTION_1: `Thank you for sharing that about ${petName}. To help assess the situation better:\n\nIs ${petName} showing any signs of distress? For example, are they in visible pain, breathing heavily, or unusually weak or lethargic?`,
      QUESTION_2: `I appreciate those details. Now, how long has this been going on? Is it constant or does it come and go? And approximately how many times has it occurred?`,
      QUESTION_3: `Thank you. One more thing — has ${petName} had any recent changes in diet, environment, or exposure to anything unusual? Are they currently on any medication?`,
    },
    Activity: {
      QUESTION_1: `Thank you for telling me about ${petName}'s activity changes. Is ${petName} showing any physical distress? For example, are they crying when touched, refusing to stand, guarding a specific body part, or breathing rapidly?`,
      QUESTION_2: `Got it. How long has this change been happening? Did it start suddenly (like after a jump, fall, or play session) or has it been gradually getting worse?`,
      QUESTION_3: `That helps a lot. Has ${petName} experienced anything similar before? Any recent injuries, new exercise routines, or changes in their environment?`,
    },
    Behavior: {
      QUESTION_1: `I understand your concern about ${petName}'s behavior. Has there been anything that seems to trigger this change? For instance, have there been new pets, people, or environmental changes (new home, loud construction, fireworks)?`,
      QUESTION_2: `Thank you. When did you first notice this change? Is it happening constantly, or only at specific times (e.g., night, when alone, during meals)?`,
      QUESTION_3: `That's very helpful. Is ${petName} still eating, drinking, and using the bathroom normally? Any other changes you've noticed — even small things that seem unrelated?`,
    },
  };

  const catFallback = fallbacks[category] || fallbacks.Health;
  return (catFallback && catFallback[step]) || `Thank you. Could you provide a bit more detail about what you're observing with ${petName}?`;
}

// ── Generate final diagnosis ────────────────────────────────────────────────
export function generateDiagnosis(
  category: string,
  answers: { q1: string; q2: string; q3: string; q4: string },
  petName: string
): {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  analysis: string;
  careTips: string;
  warningSign: string;
  monitorHours: number;
} {
  const combined = `${answers.q1} ${answers.q2} ${answers.q3} ${answers.q4}`;
  const fullAnalysis = analyzeUserText(combined, category);

  if (fullAnalysis.matchedSymptoms.length > 0) {
    const primary = fullAnalysis.matchedSymptoms[0];
    if (primary) {
      const additional = fullAnalysis.matchedSymptoms.slice(1);

      let condition = primary.condition;
      if (additional.length > 0) {
        condition += ` with concurrent ${additional.map(s => {
          if (!s || !s.condition) return '';
          const parts = s.condition.split('/');
          const firstPart = parts[0];
          return firstPart ? firstPart.trim().toLowerCase() : '';
        }).filter(Boolean).join(' and ')}`;
      }

      let monitorHours = 24;
      if (fullAnalysis.severity === 'moderate') monitorHours = 8;
      else if (fullAnalysis.severity === 'mild') monitorHours = 12;
      if (category === 'Health') monitorHours = Math.min(monitorHours, 6);
      if (category === 'Activity') monitorHours = Math.min(monitorHours, 8);

      const severityLabel = fullAnalysis.severity === 'mild' ? 'LOW' : fullAnalysis.severity === 'moderate' ? 'MODERATE' : 'HIGH';

      return {
        condition,
        severity: fullAnalysis.severity,
        analysis: `Based on the symptoms described across our assessment, ${petName} shows signs consistent with **${condition}**.\n\n**Severity Level:** ${severityLabel}\n**Detected indicators:** ${fullAnalysis.detectedKeywords.join(', ')}\n${additional.length > 0 ? `**Additional concerns:** ${additional.map(s => s && s.condition).filter(Boolean).join('; ')}` : ''}`,
        careTips: primary.careTips + (additional.length > 0 ? `\n\nAdditionally: ${additional.map(s => s && s.careTips).filter(Boolean).join(' ')}` : ''),
        warningSign: primary.warningSign,
        monitorHours,
      };
    }
  }

  // Fallback generic diagnosis
  const fallbackDiag: Record<string, { condition: string; care: string; warning: string; hours: number }> = {
    Health: {
      condition: 'Minor Health Concern — Observation Recommended',
      care: 'Monitor food and water intake. Provide a calm environment and bland diet. Track any changes in symptoms.',
      warning: 'If symptoms persist beyond 48 hours, worsen suddenly, or new symptoms appear, please consult a veterinarian.',
      hours: 6
    },
    Activity: {
      condition: 'Mild Activity Irregularity — Rest and Observation Recommended',
      care: 'Limit strenuous activity. Provide comfortable resting areas. Monitor mobility and comfort levels.',
      warning: 'If your pet shows signs of pain, swelling, or inability to bear weight, seek veterinary attention.',
      hours: 8
    },
    Behavior: {
      condition: 'Behavioral Variation — Environmental Stress Likely',
      care: 'Maintain routine consistency. Provide enrichment and quiet spaces. Minimize stressors.',
      warning: 'If behavioral changes persist beyond a week or worsen, consult a veterinarian to rule out pain or illness.',
      hours: 24
    }
  };

  const fb = (fallbackDiag[category] || fallbackDiag.Health) as { condition: string; care: string; warning: string; hours: number };
  return {
    condition: fb.condition,
    severity: 'mild',
    analysis: `While the specific symptoms described don't match a particular pattern in our database, we recommend monitoring ${petName} closely. Any persistent or worsening changes should be evaluated by a veterinarian.`,
    careTips: fb.care,
    warningSign: fb.warning,
    monitorHours: fb.hours,
  };
}

// ── Generate critical escalation diagnosis ──────────────────────────────────
export function generateCriticalDiagnosis(
  category: string,
  allText: string,
  matchedCritical: string[],
  petName: string
): { condition: string; analysis: string } {
  const criticalStr = matchedCritical.join(', ');
  
  const analysis = analyzeUserText(allText, category);
  let specificCondition = 'Potentially Life-Threatening Emergency';

  if (analysis.matchedSymptoms.length > 0) {
    specificCondition = analysis.matchedSymptoms
      .filter(s => s.severity !== 'mild')
      .map(s => s.condition)
      .join(' / ') || specificCondition;
  }

  // Specific critical conditions based on keywords
  if (matchedCritical.some(k => ['seizure', 'seizures', 'convulsion', 'convulsing', 'fits'].includes(k))) {
    specificCondition = 'Acute Seizure Activity / Possible Neurological Emergency';
  } else if (matchedCritical.some(k => ['poison', 'poisoned', 'toxic', 'toxin'].includes(k))) {
    specificCondition = 'Suspected Toxin Exposure / Poisoning Emergency';
  } else if (matchedCritical.some(k => ['blood', 'bleeding', 'bloody', 'hemorrhage'].includes(k))) {
    specificCondition = 'Active Hemorrhage / Severe Trauma';
  } else if (matchedCritical.some(k => ['unconscious', 'unresponsive', 'collapsed', 'collapse'].includes(k))) {
    specificCondition = 'Loss of Consciousness / Cardiovascular Emergency';
  } else if (matchedCritical.some(k => ['difficulty breathing', 'gasping', 'choking', 'cant breathe', "can't breathe"].includes(k))) {
    specificCondition = 'Acute Respiratory Distress / Airway Emergency';
  } else if (matchedCritical.some(k => ['broken bone', 'fracture', 'fractured'].includes(k))) {
    specificCondition = 'Suspected Fracture / Orthopedic Emergency';
  }

  return {
    condition: specificCondition,
    analysis: `🚨 **CRITICAL ALERT** — Based on the symptoms described (${criticalStr}), our system has identified this as a potentially serious condition: **${specificCondition}**.\n\nThis case requires immediate veterinary oversight. Our senior veterinarian has been automatically alerted and will take over this conversation to provide direct guidance.`
  };
}

export function detectQuestion(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower.endsWith('?')) return true;

  const questionStarters = [
    'why', 'how', 'what', 'can i', 'should i', 'is it', 'are they',
    'does he', 'does she', 'does it', 'do dogs', 'do cats', 'is there',
    'what if', 'could it', 'will he', 'will she', 'can you'
  ];

  return questionStarters.some(starter => lower.startsWith(starter) || lower.includes(' ' + starter + ' ') || lower.includes('\n' + starter + ' '));
}

export function getSmartQuestionAnswer(text: string, petName: string): string | null {
  const lower = text.toLowerCase();

  // 1. Human meds
  if (
    lower.includes('paracetamol') ||
    lower.includes('biogesic') ||
    lower.includes('ibuprofen') ||
    lower.includes('aspirin') ||
    lower.includes('tylenol') ||
    lower.includes('advil') ||
    lower.includes('pain killer') ||
    lower.includes('human medicine') ||
    lower.includes('human medication')
  ) {
    return `⚠️ **CRITICAL SAFETY INFO**: Never give human pain relievers like Paracetamol (Biogesic), Ibuprofen, Tylenol, or Advil to your pet. They are highly toxic and can cause severe liver damage, kidney failure, or internal bleeding, especially in cats and dogs. Always consult a veterinarian before administering any medication.`;
  }

  // 2. Toxic foods
  if (
    lower.includes('chocolate') ||
    lower.includes('grapes') ||
    lower.includes('raisins') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('avocado') ||
    lower.includes('xylitol') ||
    lower.includes('caffeine') ||
    lower.includes('coffee') ||
    lower.includes('alcohol') ||
    lower.includes('macadamia')
  ) {
    return `🍫 **TOXICITY ALERT**: Foods like chocolate, grapes, raisins, onions, garlic, macadamia nuts, and anything containing Xylitol (artificial sweetener) are highly toxic to pets. If your pet has ingested any of these, please contact the clinic immediately.`;
  }

  // 3. Dehydration
  if (
    lower.includes('dehydrated') ||
    lower.includes('dehydration') ||
    lower.includes('lack of water') ||
    lower.includes('dry mouth') ||
    lower.includes('skin pinch') ||
    lower.includes('gums dry')
  ) {
    return `💧 **Dehydration Check**: You can check if ${petName} is dehydrated by:\n1. Gently pinching the skin on the back of their neck or shoulders. If it doesn't snap back quickly, they are dehydrated.\n2. Checking their gums — they should be wet and pink, not dry or tacky.\n3. Checking for sunken or dry eyes.`;
  }

  // 4. Vomiting diet
  if (
    (lower.includes('vomit') || lower.includes('throwing up') || lower.includes('puke')) &&
    (lower.includes('feed') || lower.includes('food') || lower.includes('eat') || lower.includes('diet'))
  ) {
    return `🍚 **Feeding a Vomiting Pet**: If ${petName} is actively vomiting, withhold food for 2-4 hours to let their stomach rest. After that, offer small portions of a bland diet (like boiled, skinless chicken breast and white rice, without any seasonings, salt, or oils). Ensure fresh water is available in small quantities.`;
  }

  // 5. Diarrhea diet
  if (
    (lower.includes('diarrhea') || lower.includes('loose stool')) &&
    (lower.includes('feed') || lower.includes('food') || lower.includes('eat') || lower.includes('diet'))
  ) {
    return `🍲 **Feeding for Diarrhea**: Offer ${petName} a bland diet consisting of 2 parts white rice and 1 part boiled skinless chicken breast (no oil, no salt). You can also add a spoonful of plain canned pumpkin (not pie mix) to help firm up their stool. Keep them well hydrated.`;
  }

  // 6. Normal temperature
  if (
    lower.includes('normal temperature') ||
    lower.includes('fever range') ||
    lower.includes('pet temp') ||
    lower.includes('normal fever') ||
    lower.includes('dog temp') ||
    lower.includes('cat temp') ||
    lower.includes('fever temp')
  ) {
    return `🌡️ **Normal Body Temperature**: A normal body temperature for dogs and cats is between 101.0°F and 102.5°F (38.3°C to 39.2°C). A temperature above 103°F (39.4°C) or below 99°F (37.2°C) is abnormal and warrants veterinary attention.`;
  }

  // 7. Ear cleaning
  if (
    lower.includes('clean ear') ||
    lower.includes('ear cleaning') ||
    lower.includes('cotton bud') ||
    lower.includes('cotton swab') ||
    lower.includes('q-tip') ||
    lower.includes('q tip')
  ) {
    return `👂 **Ear Cleaning Guide**: Never use Q-tips or cotton buds inside ${petName}'s ear canal, as this can push debris deeper and rupture the eardrum. Instead, use a vet-approved ear cleaning solution: fill the ear canal, massage the base of the ear for 30 seconds, and let your pet shake their head. Wipe away loose debris from the outer ear with a cotton ball.`;
  }

  // 8. Inducing vomiting
  if (
    lower.includes('induce vomit') ||
    lower.includes('make him vomit') ||
    lower.includes('force vomit') ||
    lower.includes('make her vomit') ||
    lower.includes('make them vomit')
  ) {
    return `⚠️ **DO NOT INDUCE VOMITING** at home without direct instruction from a veterinarian. If ${petName} swallowed a corrosive chemical, battery, or sharp object, inducing vomiting can cause severe damage or tearing to the esophagus as it comes back up.`;
  }

  // 9. Wound care
  if (
    lower.includes('clean wound') ||
    lower.includes('wound care') ||
    lower.includes('bleeding wound') ||
    lower.includes('cut care') ||
    lower.includes('clean cut')
  ) {
    return `🩹 **First Aid for Wounds**: 1. If there is bleeding, apply gentle, direct pressure with a clean cloth. 2. Clean minor cuts with saline solution or warm water. Avoid rubbing alcohol or hydrogen peroxide as they damage healthy tissue and delay healing. 3. Prevent ${petName} from licking the wound.`;
  }

  // 10. general question starters
  if (lower.includes('limp') || lower.includes('hobbling') || lower.includes('favoring leg')) {
    return `🐾 **About Limping**: Limping in pets is usually caused by physical sprains/strains, joint inflammation (like arthritis), or a foreign object (like a thorn or cut) in their paw pad. Let's continue our triage to pinpoint the severity.`;
  }
  if (lower.includes('scratch') || lower.includes('itchy') || lower.includes('biting skin') || lower.includes('flea')) {
    return `🦠 **About Scratching/Itching**: Excessive scratching, biting, or licking is most commonly caused by flea/tick infestations, skin allergies (food or environmental), or contact dermatitis. Checking their skin for redness or flea dirt is highly recommended.`;
  }
  if (lower.includes('lethargic') || lower.includes('tired') || lower.includes('lazy') || lower.includes('weak')) {
    return `💤 **About Lethargy**: Lethargy is a non-specific sign that ${petName} is fighting off an illness, experiencing pain, running a fever, or feeling dehydrated. We will evaluate this further.`;
  }
  if (lower.includes('not eating') || lower.includes('won\'t eat') || lower.includes('wont eat') || lower.includes('refuses food')) {
    return `🍲 **About Loss of Appetite**: Refusing food can stem from stress, dental pain, digestive issues, or fever. Check if ${petName} is still drinking water, as staying hydrated is critical.`;
  }

  // General fallback for other questions
  if (detectQuestion(text)) {
    return `💡 **Triage Assistant Note**: That's a good question. While I'm gathering information for our preliminary health assessment, let's complete the remaining questions so I can give you the most accurate care tips and severity rating.`;
  }

  return null;
}
