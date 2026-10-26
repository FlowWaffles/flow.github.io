import '../linktree/LinkTree.css';
import './MtgTester.css';

const MtgTester = () => {
    return (
        <main className="linktree mtg-tester-page">
            <h1 className="linktree-title">Become a Tester</h1>

            <section className="linktree-main">
                <div className="linktree-links">
                    <p className="mtg-tester-description">
                        Flow.Fail MTG LifeTracker is a Magic: The Gathering Commander life tracker app.
                    </p>
                    <img
                        className="mtg-tester-preview"
                        src="/assets/lifetracker-preview.jpeg"
                        alt="Flow.Fail MTG LifeTracker app preview"
                    />
                    <div className="mtg-tester-step">
                        <p className="mtg-tester-label">1. Join the Google Group</p>
                        <a
                            className="mtg-tester-url"
                            href="https://groups.google.com/g/flowfail-mtg-lifetracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open Google Group in a new tab"
                        >
                            https://groups.google.com/g/flowfail-mtg-lifetracker
                        </a>
                    </div>
                    <div className="mtg-tester-step">
                        <p className="mtg-tester-label">2. Become a tester on Google Play</p>
                        <a
                            className="mtg-tester-url"
                            href="https://play.google.com/apps/testing/flow.fail.mtg.twa"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open Play testing page in a new tab"
                        >
                            https://play.google.com/apps/testing/flow.fail.mtg.twa
                        </a>
                    </div>
                    <div className="mtg-tester-step">
                        <p className="mtg-tester-label">3. Install the app</p>
                        <a
                            className="mtg-tester-url"
                            href="https://play.google.com/store/apps/details?id=flow.fail.mtg.twa"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Open app install page in a new tab"
                        >
                            https://play.google.com/store/apps/details?id=flow.fail.mtg.twa
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default MtgTester;
