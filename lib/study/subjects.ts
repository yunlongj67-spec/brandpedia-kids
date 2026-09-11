// Student study-reference organizer — subject taxonomy.
// Each subject carries display metadata + keyword signals used by the
// keyword classifier (lib/study/classify.ts), which is the always-on
// fallback when no LLM API key is configured.

export type SubjectKey =
  | "math"
  | "science"
  | "language"
  | "history"
  | "geography"
  | "computer-science"
  | "art"
  | "music"
  | "pe"
  | "other";

export interface Subject {
  key: SubjectKey;
  label: string;
  emoji: string;
  /** hex accent color used for badges / subject headers */
  color: string;
  /** lowercased signal words; English words use word-boundary matching,
   *  non-ASCII (e.g. Chinese) terms use substring matching. */
  keywords: string[];
}

export const SUBJECTS: Subject[] = [
  {
    key: "math",
    label: "Mathematics",
    emoji: "➗",
    color: "#6c5ce7",
    keywords: [
      "math", "maths", "mathematics", "arithmetic", "algebra", "geometry",
      "calculus", "trigonometry", "statistic", "probability", "equation",
      "formula", "theorem", "fraction", "decimal", "integer", "polynomial",
      "derivative", "integral", "matrix", "vector", "multiply", "division",
      "addition", "subtraction", "graph", "function", "coefficient",
      "quadratic", "angle", "triangle", "polygon", "perimeter", "area",
      "volume", "percent", "exponent", "数学", "代数", "几何", "方程",
    ],
  },
  {
    key: "science",
    label: "Science",
    emoji: "🔬",
    color: "#06d6a0",
    keywords: [
      "science", "physics", "chemistry", "biology", "experiment", "atom",
      "molecule", "electron", "proton", "neutron", "cell", "dna", "gene",
      "photosynthesis", "organism", "bacteria", "virus", "force", "energy",
      "gravity", "motion", "velocity", "acceleration", "mass", "density",
      "temperature", "heat", "light", "sound", "wave", "element", "reaction",
      "acid", "mitosis", "meiosis", "evolution", "species", "科学", "物理",
      "化学", "生物", "实验", "细胞",
    ],
  },
  {
    key: "language",
    label: "Language",
    emoji: "📖",
    color: "#ff5d8f",
    keywords: [
      "english", "language", "grammar", "essay", "poem", "poetry",
      "vocabulary", "spelling", "verb", "noun", "adjective", "adverb",
      "tense", "sentence", "paragraph", "literature", "reading", "writing",
      "novel", "metaphor", "simile", "comprehension", "synonym", "antonym",
      "punctuation", "pronoun", "preposition", "conjunction", "spanish",
      "french", "语文", "英语", "语法", "作文", "阅读",
    ],
  },
  {
    key: "history",
    label: "History",
    emoji: "🏛️",
    color: "#c2410c",
    keywords: [
      "history", "historical", "ancient", "empire", "revolution", "war",
      "battle", "dynasty", "king", "queen", "emperor", "president",
      "century", "civilization", "medieval", "renaissance", "colony",
      "independence", "constitution", "treaty", "archaeology", "artifact",
      "prehistoric", "历史", "朝代", "战争", "革命", "古代",
    ],
  },
  {
    key: "geography",
    label: "Geography",
    emoji: "🌍",
    color: "#4cc9f0",
    keywords: [
      "geography", "continent", "capital", "climate", "river", "mountain",
      "ocean", "desert", "forest", "population", "latitude", "longitude",
      "equator", "hemisphere", "terrain", "landscape", "volcano",
      "earthquake", "glacier", "border", "region", "urban", "rural",
      "agriculture", "地理", "地图", "气候", "山脉", "河流",
    ],
  },
  {
    key: "computer-science",
    label: "Computer Science",
    emoji: "💻",
    color: "#2563eb",
    keywords: [
      "computer", "coding", "programming", "algorithm", "program",
      "software", "hardware", "python", "javascript", "java", "html",
      "css", "sql", "database", "internet", "loop", "boolean", "binary",
      "byte", "compiler", "debug", "array", "recursion", "frontend",
      "backend", "api", "server", "data structure", "编程", "代码", "计算机",
      "算法", "程序",
    ],
  },
  {
    key: "art",
    label: "Art",
    emoji: "🎨",
    color: "#f59e0b",
    keywords: [
      "art", "drawing", "draw", "paint", "painting", "artist", "design",
      "sketch", "sculpture", "canvas", "brush", "portrait", "illustration",
      "creativity", "shade", "hue", "pattern", "texture", "composition",
      "美术", "绘画", "素描", "设计",
    ],
  },
  {
    key: "music",
    label: "Music",
    emoji: "🎵",
    color: "#d946ef",
    keywords: [
      "music", "song", "sing", "singer", "rhythm", "melody", "beat",
      "tempo", "instrument", "piano", "guitar", "violin", "drum", "chord",
      "scale", "harmony", "lyrics", "band", "orchestra", "composer",
      "pitch", "treble", "音乐", "歌曲", "钢琴", "吉他",
    ],
  },
  {
    key: "pe",
    label: "Physical Education",
    emoji: "⚽",
    color: "#ef4444",
    keywords: [
      "physical education", "sport", "sports", "exercise", "fitness",
      "football", "soccer", "basketball", "baseball", "tennis", "swimming",
      "running", "athlete", "training", "yoga", "health", "muscle",
      "volleyball", "hockey", "athletics", "体育", "运动", "锻炼", "足球",
    ],
  },
  {
    key: "other",
    label: "Other",
    emoji: "📚",
    color: "#6b6a8f",
    keywords: [],
  },
];

export const SUBJECT_MAP: Record<SubjectKey, Subject> = SUBJECTS.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<SubjectKey, Subject>,
);

export const SUBJECT_KEYS: SubjectKey[] = SUBJECTS.map((s) => s.key);

/** Lookup with a safe fallback to "other". */
export function getSubject(key: string): Subject {
  return SUBJECT_MAP[key as SubjectKey] ?? SUBJECT_MAP.other;
}
