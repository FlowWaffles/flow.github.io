import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Fail from './pages/Fail';
import GlobalLayout from './GlobalLayout'
import {useEffect} from 'react';
import {obiWaniFy} from './utils/obi';
import NotFound from './pages/not-found/NotFound'
import PrivacyPage from './pages/privacy/PrivacyPage.tsx';
import DisplayCustomQuotePage from './pages/quote/DisplayCustomQuotePage.tsx';
import CreateQuote from './pages/quote/CreateQuote.tsx';
import Example from './pages/examples/Example.tsx';

function App() {
    useEffect(() => {
        obiWaniFy();
    }, []);

    return (
        <>
            <GlobalLayout>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Fail/>}/>
                        <Route path="/privacy" element={<PrivacyPage/>}/>
                        <Route path="/quote" element={<DisplayCustomQuotePage/>}/>
                        <Route path="/create-quote" element={<CreateQuote/>}/>
                        <Route path="/example" element={<Example/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </BrowserRouter>
            </GlobalLayout>
        </>
    );
}

export default App;
