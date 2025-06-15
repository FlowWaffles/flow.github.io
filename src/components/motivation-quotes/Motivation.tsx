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
    <QuoteTypewriter
      key={quoteIndex}
      quote={motivationQuotes[quoteIndex]}
      onComplete={setNextQuoteIndex}
    />
  );
};

export default Motivation;
