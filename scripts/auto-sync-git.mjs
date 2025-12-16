
import fs from 'node:fs';
import { exec } from 'node:child_process';
import path from 'node:path';

const WATCH_DIRS = ['src']; // Directories to watch
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last change

let timeout = null;
let isPushing = false;

function log(msg) {
    console.log(`[AutoSync] ${new Date().toLocaleTimeString()} - ${msg}`);
}

function syncGit() {
    if (isPushing) {
        log('Sync already in progress, skipping...');
        return;
    }

    isPushing = true;
    log('Starting sync...');

    exec('git add . && git commit -m "Auto-sync: Update detected" && git push', (error, stdout, stderr) => {
        isPushing = false;
        if (error) {
            // Ignore "nothing to commit" errors
            if (stdout && stdout.includes('nothing to commit')) {
                log('Nothing to commit.');
            } else {
                console.error(`[AutoSync] Error: ${error.message}`);
                if (stderr) console.error(stderr);
            }
        } else {
            log('Successfully synced to GitHub.');
            if (stdout) console.log(stdout);
        }
    });
}

function onChange(eventType, filename) {
    if (!filename) return;
    if (filename.includes('.git') || filename.includes('node_modules')) return;

    // Clear existing timer
    if (timeout) clearTimeout(timeout);

    log(`Change detected in ${filename}. Syncing in ${DEBOUNCE_MS / 1000}s...`);

    // Set new timer
    timeout = setTimeout(() => {
        syncGit();
    }, DEBOUNCE_MS);
}

log('Starting Auto-Sync Watcher...');
log(`Watching directories: ${WATCH_DIRS.join(', ')}`);

WATCH_DIRS.forEach(dir => {
    try {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, onChange);
        } else {
            log(`Warning: Directory ${dir} not found.`);
        }
    } catch (err) {
        log(`Error watching ${dir}: ${err.message}`);
    }
});

// Initial sync on startup
syncGit();
