import { useState } from "react";

import { motivationQuotes } from "./Quotes";
import QuoteTypewriter from "./QuoteTypewriter";
import "./Motivation.css";

const getRandomQuoteIndex = () =>
  Math.floor(Math.random() * motivationQuotes.length);

const Motivation = () => {
  const [quoteIndex, setQuoteIndex] = useState(getRandomQuoteIndex);
  const setNextQuoteIndex = () => {
    setQuoteIndex(getRandomQuoteIndex);
  };

  return (
    <div className="motivation-quote-container">
      <QuoteTypewriter
        key={quoteIndex}
        quote={motivationQuotes[quoteIndex]}
        onComplete={setNextQuoteIndex}
      />
    </div>
  );
};

export default Motivation;
