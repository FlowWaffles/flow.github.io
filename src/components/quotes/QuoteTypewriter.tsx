import { useCallback, useRef, useState } from "react";

import type { Quote } from "./Quotes";

interface QuoteTypewriterProps {
  quote: Quote;
  onComplete: () => void;
  typeInterval?: number;
  nextQuoteInverval?: number;
}

const renderWithLineBreaks = (text: string) => {
  return text.split('\n').map((line, index, arr) => (
      <span key={index}>
      {line}
        {index !== arr.length - 1 && <br />}
    </span>
  ));
};

const QuoteTypewriter = ({
  quote,
  onComplete,
  typeInterval = 50,
  nextQuoteInverval = 10000,
}: QuoteTypewriterProps) => {
  const [quoteText, setQuoteText] = useState("");
  const [authorText, setAuthorText] = useState("");

  const quoteInterval = useRef<number | null>(null);
  const authorInterval = useRef<number | null>(null);
  const completeTimeout = useRef<number | null>(null);

  // called once on mount
  const refCallback = useCallback(
    (node: HTMLDivElement | null) => {
      const typeAuthor = () => {

        if (!quote.author) return onComplete();

        const authorFormated = '- ' + quote.author;
        let index = 0;

        authorInterval.current = setInterval(() => {
          index++;

          setAuthorText(authorFormated.slice(0, index));

          if (index === authorFormated.length) {
            if (authorInterval.current) {
              clearInterval(authorInterval.current);
            }
            completeTimeout.current = setTimeout(() => {
              onComplete();
            }, nextQuoteInverval);
          }
        }, typeInterval);
      };

      const typeQuote = () => {
        const quoteFormated = '"' + quote.quote + '"';
        let index = 0;

        quoteInterval.current = setInterval(() => {
          index++;
          setQuoteText(quoteFormated.slice(0, index));

          if (index === quoteFormated.length) {
            if (quoteInterval.current) {
              clearInterval(quoteInterval.current);
            }
            typeAuthor();
          }
        }, typeInterval);
      };

      if (node) typeQuote();

      // cleanup on unmount
      return () => {
        if (quoteInterval.current) clearInterval(quoteInterval.current);
        if (authorInterval.current) clearInterval(authorInterval.current);
        if (completeTimeout.current) clearTimeout(completeTimeout.current);
      };
    },
    [nextQuoteInverval, onComplete, quote.author, quote.quote, typeInterval]
  );

  return (
    <div className="quote" ref={refCallback}>
      <p className="placeholder">{renderWithLineBreaks(`"${quote.quote}"`)}</p>
      <p>{renderWithLineBreaks(quoteText)}</p>
      <footer className="author">
        <span className="placeholder">- {quote.author}</span>
        <span className="animated-text">{authorText}</span>
      </footer>
    </div>
  );
};

export default QuoteTypewriter;
