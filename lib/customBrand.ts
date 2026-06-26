// BrandPedia Kids — synthesize a Brand record from a free-text name.
// Used by the offline generator when a user "explores" a brand we don't know.

import type { Brand } from "./types";
import { slugify } from "./slug";

const EMOJIS = ["⭐", "🚀", "🎉", "🌟", "✨", "🧩", "🎯", "🔮", "💡", "🌈", "🎈", "🏆"];
const COLORS = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.codePointAt(i)!) >>> 0;
  return h;
}

export function synthesizeBrand(name: string): Brand {
  const clean = name.trim();
  const id = slugify(clean);
  const h = hash(id);
  const emoji = EMOJIS[h % EMOJIS.length];
  const color = COLORS[h % COLORS.length];

  return {
    id,
    name: clean,
    nameEn: clean,
    slug: id,
    category: "other",
    logo: emoji,
    color,
    slogan: `一起认识${clean}`,
    sloganEn: `Get to know ${clean}`,
    description: `${clean}是一个你想了解的品牌。AI 正在用小朋友听得懂的方式，给你讲讲它的故事。`,
    descriptionEn: `${clean} is a brand you want to learn about. AI explains it in a kid-friendly way.`,
    featured: false,
    generated: true,
    funFact: `关于${clean}，AI 给你准备了一些有趣的小知识，快往下看吧！`,
    funFactEn: `AI prepared some fun facts about ${clean} — keep reading!`,
    keyFacts: [
      `${clean}有很多值得讲的故事`,
      "它有自己的产品和服务",
      "它也在和对手们竞争",
      "它的营销方式很有意思",
    ],
    keyFactsEn: [
      `${clean} has lots of stories worth telling`,
      "It has its own products and services",
      "It competes with rivals too",
      "Its marketing is really interesting",
    ],
  };
}
