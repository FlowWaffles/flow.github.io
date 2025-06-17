import { useState } from "react";

import { motivationQuotes } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";
import "./Quote.css";

const getRandomQuoteIndex = () =>
  Math.floor(Math.random() * motivationQuotes.length);

const DefaultQuotes = () => {
  const [quoteIndex, setQuoteIndex] = useState(getRandomQuoteIndex);
  const setNextQuoteIndex = () => {
    setQuoteIndex(getRandomQuoteIndex);
  };

  return (
    <div className="quote-container">
      <QuoteTypewriter
        key={quoteIndex}
        quote={motivationQuotes[quoteIndex]}
        onComplete={setNextQuoteIndex}
      />
    </div>
  );
};

export default DefaultQuotes;
