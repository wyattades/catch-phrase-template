import { useState, useMemo } from "react";
import Head from "next/head";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";

const cardDiameter = "4.88in";

const wordCount = 72;

const scale = 100 / 742;
const cardRadius = 50;
const innerCircleRadius = 69 * scale;
const outerCircleRadius = 15 * scale;
const outerCircleOffset = 340 * scale;
const wordOffset = 247 * scale;

const isMacLike =
  typeof navigator !== "undefined"
    ? /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
    : false;

class PsuedoRandom {
  constructor(seed) {
    this.previous = seed;
  }

  static hash(a) {
    a = a ^ 61 ^ (a >> 16);
    a += a << 3;
    a ^= a >> 4;
    a *= 0x27d4eb2d;
    a ^= a >> 15;
    return a;
  }

  next() {
    this.previous = PsuedoRandom.hash(this.previous);
    return this.previous;
  }

  shuffle(array) {
    return sortBy(array, () => this.next());
  }
}

const getWordsArray = (words = [], shuffled = null) => {
  words = uniqBy(words, (w) => w.toLowerCase());

  if (words.length > wordCount * 2) words = words.slice(0, wordCount * 2);
  else if (words.length < wordCount * 2)
    words = [
      ...words,
      ...Array.from({ length: wordCount * 2 - words.length }).map(() => "???"),
    ];

  if (shuffled != null) words = new PsuedoRandom(shuffled).shuffle(words);

  return words;
};

function RenderCard({ words }) {
  const count = words.length;

  return (
    <div className="p-2">
      <div className="relative text-left">
        <svg
          style={{ width: cardDiameter, height: cardDiameter }}
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          <circle
            cx={50}
            cy={50}
            r={50}
            fill="none"
            strokeWidth="0.2"
            stroke="#000"
          />
          <circle
            cx={50}
            cy={50}
            r={innerCircleRadius}
            fill="none"
            strokeWidth="0.2"
            stroke="#000"
          />
          {Array.from({ length: 3 }).map((_, i) => {
            const angle = (360 * i) / 3;

            return (
              <g
                key={i}
                transform={`rotate(${angle} 50 50) translate(${
                  50 + outerCircleOffset
                } ${50})`}
              >
                <circle
                  x={0}
                  y={0}
                  r={outerCircleRadius}
                  fill="none"
                  strokeWidth="0.2"
                  stroke="#000"
                />
                <circle x={0} y={0} r={0.4} fill="#000" />
              </g>
            );
          })}

          {words.map((w, i) => {
            const angle = (360 * i) / count;

            return (
              <text
                key={i}
                x={50 + wordOffset}
                y={50}
                dominantBaseline="middle"
                textAnchor="middle"
                transform={`rotate(${angle} 50 50)`}
              >
                {w}
              </text>
            );
          })}
        </svg>
      </div>

      <style jsx>{`
        text {
          font-size: 2.1px;
          font-weight: 600;
          font-family: Arial;
        }
      `}</style>
    </div>
  );
}

function Checkbox({ value, onChange, label }) {
  return (
    <label className="hover:bg-gray-100 rounded cursor-pointer px-2 py-1 inline-flex items-center">
      <input
        type="checkbox"
        className="mr-2"
        checked={value ?? false}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
      <span className="leading-1">{label}</span>
    </label>
  );
}

function Button({ children, onClick }) {
  return (
    <button
      className="rounded border hover:bg-gray-100 px-2 py-1"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PhrasesEditor({ value, onChange }) {
  const [val, setVal] = useState(value.join("\n"));

  return (
    <div className="p-2 ml-8 hide-printer">
      <label htmlFor="words-input" className="block text-gray-600 mb-2">
        Enter phrases separated by new-lines:
      </label>
      <textarea
        id="words-input"
        className="border hover:shadow-inner active:shadow-inner rounded-sm px-2 py-1 w-72"
        value={val}
        onChange={(e) => {
          const val = e.target.value;
          // TODO: throttle
          setVal(val);
          onChange(val.trim().split(/\s*\n+\s*/));
        }}
        rows="24"
      />
      <p className="font-semibold mt-2">
        Word count: {value.length} out of {wordCount * 2}
      </p>
      <div className="mt-4">
        <Button
          onClick={async () => {
            const randWords = await fetch(`/api/words`).then((r) => r.json());

            setVal(randWords.join("\n"));
            onChange(randWords);
          }}
        >
          ???? Get random words
        </Button>
      </div>
    </div>
  );
}

export default function IndexPage() {
  const [words, setWords] = useState(() => ["Some phrase", "Another phrase"]);
  const [shuffled, setShuffled] = useState(null);

  const [card1Words, card2Words] = useMemo(() => {
    const arr = getWordsArray(words, shuffled);
    return [arr.slice(0, wordCount), arr.slice(wordCount)];
  }, [words, shuffled]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Catch Phrase! Card Template Generator</title>
        <meta
          name="description"
          content="Create custom cards for the hit game Catch Phrase!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold hide-printer">
          Catch Phrase!{" "}
          <span className="text-blue-600">Card Template Generator</span>
        </h1>

        <p className="mt-3 text-2xl hide-printer">
          Get started by editing the phrases. Then print this page with{" "}
          <code className="rounded bg-pink-100 px-2 py-1">
            {isMacLike ? "???" : "Ctrl"} P
          </code>
        </p>

        <div className="flex justify-center items-center mt-8 print:m-0">
          <div>
            <RenderCard words={card1Words} />
            <RenderCard words={card2Words} />
            <div className="hide-printer p-2">
              <Checkbox
                label="Shuffle words"
                value={shuffled != null}
                onChange={(checked) => {
                  setShuffled(checked ? (Math.random() * 10e8) | 0 : null);
                }}
              />
            </div>
          </div>
          <PhrasesEditor value={words} onChange={setWords} />
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t hide-printer">
        <a
          className="flex items-center justify-center hover:underline"
          href="https://wyattades.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ??? by Wyatt Ades
        </a>
      </footer>

      <style jsx global>{`
        @media print {
          .hide-printer {
            display: none !important;
          }
          .print\:m-0 {
            margin: 0;
          }
        }
        @page {
          margin: 0.4in;
        }

        ::selection {
          background: lavender;
        }
      `}</style>
    </div>
  );
}
