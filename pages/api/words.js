import _ from "lodash";
import fs from "fs";

import WORDS_MAP from "../../words.json";

/**
 * Title Caps
 *
 * Ported to JavaScript By John Resig - http://ejohn.org/ - 21 May 2008
 * Original by John Gruber - http://daringfireball.net/ - 10 May 2008
 * License: http://www.opensource.org/licenses/mit-license.php
 */
const titleCaps = (() => {
  const small =
    "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
  const punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";

  const lowercase = (word) => word.toLowerCase();
  const capitalize = (word) => word.substr(0, 1).toUpperCase() + word.substr(1);

  return (title) => {
    const parts = [],
      split = /[:.;?!] |(?: |^)["Ò]/g;
    let index = 0;

    while (true) {
      let m = split.exec(title);

      parts.push(
        title
          .substring(index, m ? m.index : title.length)
          .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, (all) =>
            /[A-Za-z]\.[A-Za-z]/.test(all) ? all : capitalize(all)
          )
          .replace(new RegExp("\\b" + small + "\\b", "ig"), lowercase)
          .replace(
            new RegExp("^" + punct + small + "\\b", "ig"),
            (_all, punct, word) => punct + capitalize(word)
          )
          .replace(new RegExp("\\b" + small + punct + "$", "ig"), capitalize)
      );

      index = split.lastIndex;

      if (m) parts.push(m[0]);
      else break;
    }

    return parts
      .join("")
      .replace(/ V(s?)\. /gi, " v$1. ")
      .replace(/(['Õ])S\b/gi, "$1s")
      .replace(/\b(AT&T|Q&A)\b/gi, (all) => all.toUpperCase());
  };
})();

const allWords = _.uniq(
  _.flatten(Object.values(WORDS_MAP))
    .filter((r) => r.length <= 20)
    .map(titleCaps)
);

export default async function getWords(req, res) {
  try {
    res.json(_.sampleSize(allWords, 144));
  } catch (err) {
    console.error("Server error:", err);
    res.statusCode = 500;
    res.json([]);
  }
}
