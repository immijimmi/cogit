import { compileJsonFiles } from "../methods/data.js";

export const GLOSSARY = compileJsonFiles(
  require.context("../data/glossary", true, /\.json$/)
);

export const MOVE_INFO = compileJsonFiles(
  require.context("../data/move-info", true, /\.json$/)
);
