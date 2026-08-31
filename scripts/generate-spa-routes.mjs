
/**
 * generate-spa-routes.js
 *
 * After a static build (e.g. `vite build`), copies the built index.html
 * into a folder per client-side route so GitHub Pages serves a real
 * HTTP 200 for direct loads/refreshes/crawlers on those routes, instead
 * of relying on the 404.html SPA-fallback trick.
 *
 * Run this AFTER your normal build step, pointed at the build output dir.
 */

import fs from 'fs';
import path from 'path';

// --- Config: edit these two to match your project ---------------------

// Build output directory (Vite default: 'dist'; CRA default: 'build')
const BUILD_DIR = process.env.BUILD_DIR || 'dist';

// Every client-side route from App.tsx that should get its own real
// index.html file. Keep this in sync with your switch/if statements.
const ROUTES = [
    'mtg',
    'mtg-download',
    'privacy',
    'quote',
    'create-quote',
    'share-wwmt',
    'wwmt',
    'wdm',
    'linktree',
    'links',
];

// -------------------------------------------------------------------

function main() {
    const buildDir = path.resolve(process.cwd(), BUILD_DIR);
    const sourceIndex = path.join(buildDir, 'index.html');

    if (!fs.existsSync(sourceIndex)) {
        console.error(
            `[generate-spa-routes] Could not find ${sourceIndex}. ` +
            `Did you run the build first? (expected BUILD_DIR="${BUILD_DIR}")`
        );
        process.exit(1);
    }

    const html = fs.readFileSync(sourceIndex, 'utf8');
    let created = 0;

    for (const route of ROUTES) {
        const routeDir = path.join(buildDir, route);
        const routeIndex = path.join(routeDir, 'index.html');

        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(routeIndex, html);
        created += 1;
        console.log(`[generate-spa-routes] wrote ${path.relative(process.cwd(), routeIndex)}`);
    }

    console.log(`[generate-spa-routes] done — ${created} route(s) written to ${BUILD_DIR}/`);
}

main();