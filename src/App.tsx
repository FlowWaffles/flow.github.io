import Fail from './pages/Fail';
import GlobalLayout from './GlobalLayout'
import { useEffect } from 'react';
import { obiWaniFy } from './utils/obi';
import NotFound from './pages/not-found/NotFound'
import PrivacyPage from './pages/privacy/PrivacyPage.tsx';
import DisplayCustomQuotePage from './pages/quote/DisplayCustomQuotePage.tsx';
import CreateQuote from './pages/quote/CreateQuote.tsx';
import ShareOracle from './pages/quiz/Quiz.tsx';
import Oracle from './pages/oracle/Oracle.tsx';
import EightBall from './pages/eightball/EightBall.tsx';
import Commander from './pages/mtg/Commander.tsx';
import { useCurrentLocation } from './utils/location.ts';
import LinkTree from './pages/linktree/LinkTree.tsx';
import MtgDownload from './pages/mtg-download/MtgDownload.tsx';
import AppPrivacyPage from "./pages/life-tracker-app-privacy/PrivacyPage.tsx";

function App() {
    const { pathname } = useCurrentLocation();

    useEffect(() => {
        obiWaniFy();
    }, []);

    const normalizedPathname = pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;

    // Full-screen pages rendered without GlobalLayout chrome
    if (normalizedPathname === '/mtg') {
        return <Commander />;
    }

    if (normalizedPathname === '/mtg-download') {
        return <MtgDownload />;
    }

    const page = (() => {
        switch (normalizedPathname) {
            case '/':
                return <Fail />;
            case '/privacy':
                return <PrivacyPage />;
            case '/life-tracker-app-privacy':
                return <AppPrivacyPage />;
            case '/quote':
                return <DisplayCustomQuotePage />;
            case '/create-quote':
                return <CreateQuote />;
            case '/share-wwmt':
                return <ShareOracle />;
            case '/wwmt':
                return <Oracle />;
            case '/wdm':
                return <EightBall />;
            case '/linktree':
            case '/links':
                return <LinkTree />;
            default:
                return <NotFound />;
        }
    })();

    return (
        <>
            <GlobalLayout>
                {page}
            </GlobalLayout>
        </>
    );
}

export default App;
