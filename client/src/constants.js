import { ReactComponent as BlunderIcon } from "./res/Blunder.svg";
import { ReactComponent as MistakeIcon } from "./res/Mistake.svg";
import { ReactComponent as InaccuracyIcon } from "./res/Inaccuracy.svg";
import { ReactComponent as DubiousIcon } from "./res/Dubious.svg";
import { ReactComponent as AcceptableIcon } from "./res/Acceptable.svg";
import { ReactComponent as AccurateIcon } from "./res/Accurate.svg";
import { ReactComponent as GreatIcon } from "./res/Great.svg";
import { ReactComponent as BrilliantIcon } from "./res/Brilliant.svg";
import { ReactComponent as MissIcon } from "./res/Miss.svg";
import { invertLookup } from "./methods/data";

export const DIFFICULTY_LOOKUP = {
  0: "Definition",
  1: "Beginner",
  2: "Novice",
  3: "Intermediate",
};

export const RARITY_LOOKUP = {
  0: "Common",
  1: "Uncommon",
  2: "Rare",
};

export const GLOSSARY_CATEGORY_LOOKUP = {
  0: `${DIFFICULTY_LOOKUP[0]}s`,
  1: `${DIFFICULTY_LOOKUP[1]} Topics`,
  2: `${DIFFICULTY_LOOKUP[2]} Topics`,
  3: `${DIFFICULTY_LOOKUP[3]} Topics`,
};
export const INVERTED_GLOSSARY_CATEGORY_LOOKUP = invertLookup(
  GLOSSARY_CATEGORY_LOOKUP,
);

export const ANNOTATION_ICON_LOOKUP = {
  "??": BlunderIcon,
  "?": MistakeIcon,
  "?!": InaccuracyIcon,
  "~": DubiousIcon,
  "✔": AcceptableIcon,
  "★": AccurateIcon,
  "!": GreatIcon,
  "!!": BrilliantIcon,
  "✖": MissIcon,
};
