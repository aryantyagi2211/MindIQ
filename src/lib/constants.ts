// Full fields for higher education (UG, PG, Masters, PhD)
export const FIELDS = {
  Technology: ["AI/ML", "Software", "Cybersecurity", "Robotics", "Data Science"],
  Engineering: ["Civil", "Mechanical", "Electrical", "Chemical", "Aerospace"],
  Science: ["Physics", "Biology", "Chemistry", "Neuroscience", "Astronomy"],
  Business: ["Finance", "Marketing", "Entrepreneurship", "Economics", "Management"],
  Arts: ["Design", "Music", "Writing", "Film", "Architecture"],
  Medicine: ["General", "Surgery", "Psychiatry", "Research", "Pharmacology"],
  Law: ["Criminal", "Corporate", "International", "Human Rights"],
  Education: ["Teaching", "Psychology", "Sociology", "Philosophy"],
} as const;

// STEAM fields for school-level students
export const SCHOOL_FIELDS = {
  Science: ["Physics", "Biology", "Chemistry", "Environmental Science", "Earth Science"],
  Technology: ["Coding", "Web Development", "App Development", "Digital Literacy", "Robotics"],
  Engineering: ["Basic Engineering", "Design Thinking", "Problem Solving", "Mechanics", "Electronics"],
  Arts: ["Visual Arts", "Music", "Creative Writing", "Drama", "Digital Art"],
  Mathematics: ["Algebra", "Geometry", "Statistics", "Calculus", "Logic & Reasoning"],
} as const;

export const QUALIFICATIONS = [
  "Secondary School",
  "High School",
  "Graduation",
  "Masters",
] as const;

export type Qualification = typeof QUALIFICATIONS[number];

export const QUALIFICATION_FIELDS: Record<Qualification, string[]> = {
  "Secondary School": [
    "Mathematics",
    "English / Language Arts",
    "General Science",
    "Social Studies",
    "Computer Basics / ICT",
    "Physical Education",
    "Art / Creative Studies",
  ],
  "High School": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Economics",
    "Accountancy",
    "Business Studies",
    "History",
    "Political Science",
    "Computer Science / ICT",
  ],
  "Graduation": [
    "B.Tech (Computer Science Engineering)",
    "BCA (Bachelor of Computer Applications)",
    "B.Sc (Mathematics)",
    "B.Com (Bachelor of Commerce)",
    "BA (English)",
  ],
  "Masters": [
    "M.Tech (Computer Science Engineering)",
    "MCA (Master of Computer Applications)",
    "M.Sc (Mathematics)",
    "M.Com (Master of Commerce)",
    "MA (English)",
  ],
};

export const isSchoolLevel = (q: string) => q === "Secondary School" || q === "High School";

export const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45+"] as const;
export const DIFFICULTIES = ["Basic", "Standard", "Competitive"] as const;

export type Field = keyof typeof FIELDS;

export interface Question {
  id: number;
  type: string;
  scenario?: string;
  question: string;
  format: "mcq" | "text";
  options?: string[];
  correctAnswer?: string;
  timeLimit: number;
  maxPoints: number;
}

export interface TestScores {
  logic: number;
  creativity: number;
  intuition: number;
  emotionalIntelligence: number;
  systemsThinking: number;
  overallScore: number;
  aiInsight: string;
  famousMatch: string;
  famousMatchReason: string;
  superpowers: string[];
  blindSpots: string[];
}

export interface TestResult {
  id: string;
  user_id: string;
  age_group: string;
  difficulty: string;
  field: string;
  subfield: string;
  logic: number;
  creativity: number;
  intuition: number;
  emotional_intelligence: number;
  systems_thinking: number;
  overall_score: number;
  percentile: number;
  tier: number;
  tier_title: string;
  ai_insight: string;
  famous_match: string;
  famous_match_reason: string;
  superpowers: string[];
  blind_spots: string[];
  created_at: string;
}

export const TIERS = [
  { tier: 1, min: 0, max: 30, title: "Awakening Mind", cardClass: "card-tier-1" },
  { tier: 2, min: 30, max: 50, title: "Developing Intellect", cardClass: "card-tier-2" },
  { tier: 3, min: 50, max: 70, title: "Sharp Thinker", cardClass: "card-tier-3" },
  { tier: 4, min: 70, max: 85, title: "Advanced Mind", cardClass: "card-tier-4" },
  { tier: 5, min: 85, max: 93, title: "Cognitive Elite", cardClass: "card-tier-5" },
  { tier: 6, min: 93, max: 98, title: "Apex Intellect", cardClass: "card-tier-6" },
  { tier: 7, min: 99, max: 100, title: "⚡ MASTERMIND", cardClass: "card-tier-7" },
] as const;

export function getTier(percentile: number) {
  return TIERS.find(t => percentile >= t.min && percentile <= t.max) || TIERS[0];
}

export function getTierTitle(score: number) {
  if (score >= 95) return "Mastermind";
  if (score >= 85) return "Supermind";
  if (score >= 70) return "Diamond";
  if (score >= 50) return "Gold";
  if (score >= 30) return "Silver";
  return "Bronze";
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸", UK: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", BR: "🇧🇷", KR: "🇰🇷",
    NG: "🇳🇬", ZA: "🇿🇦", MX: "🇲🇽", IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱", SE: "🇸🇪", PH: "🇵🇭", PK: "🇵🇰", EG: "🇪🇬",
  };
  return flags[country] || "🌍";
}
