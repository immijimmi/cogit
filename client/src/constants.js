import { ReactComponent as BlunderIcon } from "./res/Blunder.svg";
import { ReactComponent as MistakeIcon } from "./res/Mistake.svg";
import { ReactComponent as InaccuracyIcon } from "./res/Inaccuracy.svg";
import { ReactComponent as DubiousIcon } from "./res/Dubious.svg";
import { ReactComponent as AcceptableIcon } from "./res/Acceptable.svg";
import { ReactComponent as AccurateIcon } from "./res/Accurate.svg";
import { ReactComponent as GreatIcon } from "./res/Great.svg";
import { ReactComponent as BrilliantIcon } from "./res/Brilliant.svg";
import { ReactComponent as MissIcon } from "./res/Miss.svg";
import { invertLookup } from "./methods/data.js";

export const GLOSSARY_CATEGORY_LOOKUP = {
  0: "Definitions",
  1: "Beginner Topics",
  2: "Novice Topics",
  3: "Intermediate Topics",
};
export const INVERTED_GLOSSARY_CATEGORY_LOOKUP = invertLookup(
  GLOSSARY_CATEGORY_LOOKUP
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
