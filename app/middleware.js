import { UAParser } from "ua-parser-js";
import { isBot, isAICrawler, isAIAssistant } from 'ua-parser-js/bot-detection';
import { db } from './db.js';

export async function middleware(req, res) {
    await db.add('analytics.requests.all', 1) // Requests - Logs all traffic

    if (!(req.path).includes('.js') && !(req.path).includes('.css') && !(req.path).includes('.ico') && !(req.path).includes('api')) {

        await db.add('lastLog', 1)
        const newLog = await db.get('lastLog')
        const start = Date.now(); // Capture start time

        // ---- User Agent Parsing ----
        const parser = new UAParser(req.headers["user-agent"]);
        const reqData = parser.getResult();

        // ---- Analytics ----
        const osName = reqData.os.name || "Unknown";
        const browserName = reqData.browser.name || "Unknown";
        await db.add(`analytics.os.${osName}`, 1)
        await db.add(`analytics.browser.${browserName}`, 1)
        await db.add(`analytics.path.${req.path}`, 1)

        const ip = Array.isArray(req.ips) && req.ips.length > 0 ? req.ips[0] : "Localhost";
        const region = req.get("cf-ipcountry") || (req.ip === "::1" || req.ip === "127.0.0.1" ? "Localhost" : "UNKNOWN");

        async function pushLog(flag, flagMessage) {
            const duration = Date.now() - start; // Calculate duration
            const logEntry = {
                id: newLog,
                method: req.method,
                path: req.path,
                status: res.statusCode,
                flagged: flag,
                note: flagMessage,
                ip: ip,
                agent: reqData.ua,
                deviceType: reqData.device.type || "Unknown",
                deviceModel: reqData.device.model || "Unknown",
                deviceVendor: reqData.device.vendor || "Unknown",
                os: osName,
                browserName: browserName,
                browserVersion: `${reqData.browser.version || "Unknown"}`,
                browserMajor: `${reqData.browser.major || "Unknown"}`,
                browserType: `${reqData.browser.type || "Unknown"}`,
                engineName: reqData.engine.name,
                engineVersion: reqData.engine.version,
                cpu: reqData.cpu.architecture,
                region: region,
                aiCrailer: isAICrawler(req.headers["user-agent"]),
                aiAssistant: isAIAssistant(req.headers["user-agent"]),
                bot: isBot(req.headers["user-agent"]),
                time: new Date().toLocaleString(),
                timing: {
                    proccessing: `${duration}ms`,
                },
            };
            await db.push('logs', logEntry);
            return;
        }

        if (isAICrawler(req.headers["user-agent"]) || isAIAssistant(req.headers["user-agent"]) || isBot(req.headers["user-agent"])) {
            // Event listener for when the response finishes
            res.on('finish', async () => {
                await pushLog(true, 'Flagged for being marked either a Bot, AI Crawler, or AI Assistant. Please reveiew the log\'s security notes for further details.').then(async () => {
                    return;
                })
            });
        } else {
            // Event listener for when the response finishes
            res.on('finish', async () => {
                await pushLog(false, null).then(async () => {
                    return;
                })
            });
        }

    } else {
        await db.add('analytics.requests.hidden', 1) // Requests - Hidden Traffic
    }
}