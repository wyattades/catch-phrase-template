import _ from "lodash";
import fs from "fs";

import WORDS_MAP from "../../words.json";

const allWords = _.flatten(Object.values(WORDS_MAP))
  .filter((r) => r.length <= 20)
  .map(_.capitalize);

export default async function getWords(req, res) {
  try {
    res.json(_.sampleSize(allWords, 144));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.json([]);
  }
}
