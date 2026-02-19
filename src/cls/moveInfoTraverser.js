import { isObject, mergeJson } from "../methods/data.js";

const MOVE_METADATA_KEYS = new Set([
  "title",
  "annotation",
  "description",
  "board_arrows",
  "board_highlights",
  "credits",
  "transpose",
  "comment",
]);

function compileMoveInfo() {
  const result = {};

  const filesContext = require.context("../data/move-info", true, /\.json$/);
  const filesDataList = filesContext
    .keys()
    .map((fileKey) => filesContext(fileKey));

  for (const jsonData of filesDataList) {
    mergeJson(result, jsonData);
  }

  return result;
}

export default class MoveInfoTraverser {
  static _MOVE_INFO = compileMoveInfo();

  constructor(...moves) {
    this._node = MoveInfoTraverser._MOVE_INFO;

    this._latestTitle = undefined;
    this._transposedFrom = [];

    this.title = "";
    this.annotation = undefined;
    this.description = undefined;
    this.boardArrows = [];
    this.boardHighlights = {};
    this.credits = [];
    this.nextMoveEntries = new Set();

    this._setData();
    this.add(...moves);
  }

  add(...moves) {
    for (const move of moves) {
      this._node = this._node[move] ?? {};
      this._setData();
    }
  }

  _setData() {
    this.nextMoveEntries = new Set();

    if (this._node["title"]) this._latestTitle = this._node["title"];

    this.annotation = this._node["annotation"];
    this.description = this._node["description"];
    this.boardArrows = this._node["board_arrows"] ?? [];
    this.boardHighlights = this._node["board_highlights"] ?? {};
    this.credits = this.credits.concat(this._node["credits"] ?? []);

    while (this._node["transpose"]) {
      let transpose = this._node["transpose"];

      if (this._latestTitle) this._transposedFrom.push(this._latestTitle);
      this._latestTitle = undefined;

      // Coalesce string move lists into arrays
      if (typeof transpose === "string") {
        transpose = transpose.split(" ");
      }

      this._node = MoveInfoTraverser._MOVE_INFO;
      for (const transposeMove of transpose) {
        this._node = this._node[transposeMove] ?? {};

        if (this._node["title"]) this._latestTitle = this._node["title"];
      }
    }

    for (const nodeKey in this._node) {
      if (!MOVE_METADATA_KEYS.has(nodeKey)) this.nextMoveEntries.add(nodeKey);
    }

    // Generate full title
    const titleParts = this._transposedFrom.concat(
      this._latestTitle ? [this._latestTitle] : []
    );
    this.title = titleParts.length ? titleParts.join(" >> ") : "";
  }
}
