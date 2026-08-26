import {useEffect, useState} from 'react';
import './MtgDownload.css';

type ReleaseMetadata = {
    version: string;
    downloadUrl: string;
    fileName: string;
};

const fallbackRelease: ReleaseMetadata = {
    version: 'demo',
    downloadUrl: '/downloads/mtg-demo-latest.apk',
    fileName: 'mtg-demo-latest.apk',
};

const MtgDownload = () => {
    const [release, setRelease] = useState<ReleaseMetadata>(fallbackRelease);

    useEffect(() => {
        let cancelled = false;

        const loadRelease = async () => {
            const response = await fetch('/downloads/latest.json', { cache: 'no-store' });
            if (!response.ok) {
                return;
            }

            const data = await response.json() as Partial<ReleaseMetadata>;
            if (cancelled || !data.version || !data.downloadUrl || !data.fileName) {
                return;
            }

            setRelease({
                version: data.version,
                downloadUrl: data.downloadUrl,
                fileName: data.fileName,
            });
        };

        loadRelease().catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="mtg-download">
            <section className="mtg-download-card">
                <p className="mtg-download-kicker">Demo version</p>
                <h1 className="mtg-download-title">
                    <span className="mtg-download-title-main">Flow.Fail</span>
                    <br />
                    <span className="mtg-download-title-sub">MTG LifeTracker</span>
                </h1>
                <br />
                <p className="mtg-download-copy">
                    This is a demo APK for the MTG app.
                    <br />
                    It is meant for testing and manual installs on Android.
                </p>
                <p className="mtg-download-version">Release {release.version}</p>
                <a className="mtg-download-button" href={release.downloadUrl} download>
                    Download APK
                </a>
                <p className="mtg-download-filename">{release.fileName}</p>
            </section>
        </main>
    );
};

export default MtgDownload;
