import { useCallback, useRef, useState } from "react";

import type { Quote } from "./Quotes";

interface QuoteTypewriterProps {
  quote: Quote;
  onComplete: () => void;
  typeInterval?: number;
  nextQuoteInverval?: number;
}

const QuoteTypewriter = ({
  quote,
  onComplete,
  typeInterval = 30,
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
        let index = 0;

        authorInterval.current = setInterval(() => {
          index++;
          setAuthorText(quote.author.slice(0, index));

          if (index === quote.author.length) {
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
        let index = 0;

        quoteInterval.current = setInterval(() => {
          index++;
          setQuoteText(quote.quote.slice(0, index));

          if (index === quote.quote.length) {
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
        if (completeTimeout.current) clearInterval(completeTimeout.current);
      };
    },
    [nextQuoteInverval, onComplete, quote.author, quote.quote, typeInterval]
  );

  return (
    <div className="motivation-quote" ref={refCallback}>
      <blockquote>
        <p className="motivational-quote-placeholder">{quote.quote}</p>
        <p>{quoteText}</p>
        <footer className="motivation-author">
          <span className="motivational-quote-placeholder">{quote.author}</span>
          <span>{authorText}</span>
        </footer>
      </blockquote>
    </div>
  );
};

export default QuoteTypewriter;
