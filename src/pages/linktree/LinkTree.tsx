import './LinkTree.css';
import Icon from '@mdi/react';
import {mdiUnicornVariant} from '@mdi/js';

const LinkTree = () => {
    return (
        <main className="linktree">
            <h1 className="linktree-title">Flow.Fail</h1>

            <section className="linktree-main">
                <div className="linktree-links">
                    <a
                        className="linktree-link"
                        href="https://www.instagram.com/flow.paints.mtg/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                    >
                        <img className="linktree-icon" src="/assets/Instagram_white.svg" alt="Instagram icon"/>
                        <span>flow.paints.mtg</span>
                    </a>
                    <a
                        className="linktree-link"
                        href="/mtg"
                        aria-label="Flow.Fail MTG LifeTracker"
                    >
                        <Icon path={mdiUnicornVariant} size={1} color="#fff" className="linktree-icon"/>
                        <span>Flow.Fail MTG LifeTracker</span>
                    </a>
                    <a
                        className="linktree-link"
                        href="https://moxfield.com/users/flow666"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="My Decks on Moxfield"
                    >
                        <img className="linktree-icon linktree-icon-moxfield" src="/assets/moxfield.png"
                             alt="Moxfield logo"/>
                        <span>my decks</span>
                    </a>
                </div>
            </section>

            <section className="linktree-contact">
                <hr className="linktree-separator"/>
                <p className="linktree-contact-label">Contact:</p>
                <p className="linktree-feedback">Feedback or interested in MTG card alter commissions? Email me.</p>
                <a className="linktree-email" href="mailto:hello@flow.fail">hello@flow.fail</a>
            </section>
        </main>
    );
};

export default LinkTree;
