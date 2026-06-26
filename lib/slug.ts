// Slug helpers — produce URL-safe slugs from Chinese / English brand names.

const PINYIN_MAP: Record<string, string> = {
  可口可乐: "coca-cola",
  麦当劳: "mcdonalds",
  星巴克: "starbucks",
  乐事: "lays",
  伊利: "yili",
  迪士尼: "disney",
  乐高: "lego",
  任天堂: "nintendo",
  泡泡玛特: "popmart",
  环球影城: "universal-studios",
  苹果: "apple",
  谷歌: "google",
  微软: "microsoft",
  大疆: "dji",
  耐克: "nike",
  阿迪达斯: "adidas",
  安踏: "anta",
  李宁: "li-ning",
  宜家: "ikea",
  沃尔玛: "walmart",
  名创优品: "miniso",
  "7-Eleven": "7-eleven",
  "7eleven": "7-eleven",
  特斯拉: "tesla",
  比亚迪: "byd",
  滴滴: "didi",
  芭比: "barbie",
  美泰: "mattel",
  新东方: "new-oriental",
  学而思: "xueersi",
  米其林: "michelin",
  蜜雪冰城: "mixue",
  汪汪队: "paw-patrol",
};

export function slugify(input: string): string {
  const trimmed = input.trim();
  if (PINYIN_MAP[trimmed]) return PINYIN_MAP[trimmed];

  // ASCII fallback: lowercase, spaces/odd chars → '-', collapse repeats
  const ascii = trimmed
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) return ascii;

  // Non-ASCII with no pinyin mapping → base36 hash so it's stable & URL-safe
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.codePointAt(i)!) >>> 0;
  }
  return `b${hash.toString(36)}`;
}
