// Imports
import express from 'express';
import { db } from './db.js';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import { time } from 'console';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function logEvent(req, agent, host, path) {
    const logEntry = {
        time: {
            now: Date.now(),
            print: new Date().toLocaleString()
        },
        agent: agent,
        host: host,
        path: path,
        method: req.method, // Include HTTP method
        url: req.url,       // Include request URL
        headers: req.headers // Include headers if needed
    };

    await db.push('logs', logEntry);
    return;
}

export async function app() {
    try { 
        const config = await db.get('config')

        const app = express()

        app.get('/client/:type/:fileName', async function (req, res) {

            const type = req.params.type
            const fileName = req.params.fileName
            res.sendFile(path.join(__dirname, `/client/${type}/${fileName}`));

        })

        app.get('/:path', async (req, res) => {
            await logEvent(req, req.headers['user-agent'], req.headers['host'], req.path);

            const path = req.params.path;
            const paths = await db.get('config.pages');

            if (path == 'dashboard') {
                res.send('Welcome to your dashboard!')
            } else if (paths && paths[path]) {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths[path].title}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths[path].content} </main> </body> </html>`);
                return;
            } else {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths['404'].title}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths['404'].content} </main> </body> </html>`);
                return;
            }

        })

        app.listen(config.port, () => {
            console.log(`[ExoLite] Thank you for using our services!\nYour dashboard page will automatically open in your browser.\nTo access your dashboard manually, please visit localhost:${config.port}/dashboard`);
            open(`http://localhost:${config.port}/dashboard`);
        })

    } catch (error) {
        console.error("[ExoLite] Error initializing the dashboard:", error);
    }
}