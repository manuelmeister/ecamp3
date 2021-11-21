const puppeteer = require('puppeteer');
const Sentry = require("@sentry/node");
const express = require('express')
const app = express()

const { PRINT_SERVER, SHARED_COOKIE_DOMAIN, SENTRY_WORKER_PRINT_PUPPETEER_DSN, AMQP_HOST, AMQP_PORT, AMQP_VHOST, AMQP_USER, AMQP_PASS } = require('./environment.js');

async function startBrowser() {
    const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://browserless:3005?token=gugus' });
    const page = await browser.newPage();
    return {browser, page};
}

async function closeBrowser(browser) {
    return browser.close();
}

async function html2pdf(url, filename, sessionId) {
    const {browser, page} = await startBrowser();

    // page.setCacheEnabled(false)
    await page.goto(url);
    //await page.waitForNavigation({timeout: 10, waitUntil: 'domcontentloaded'});

    //await page.waitForTimeout(15000);
    //await page.waitForSelector(".pagedjs_pages", {timeout:15000}); // TODO: easy to fail, if response takes longer than expected

    return page.createPDFStream({
        margin: {
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
        },
        printBackground: true,
        preferCSSPageSize: true
    });
}

app.get('/', async (req, res) => {

        try {
            const gugus = await html2pdf(`http://print:3003`)

            res.setHeader('Content-disposition', 'inline; filename="picasso.pdf"');
            res.setHeader('Content-type', 'application/pdf');
            gugus.pipe(res)
        } catch (e) {
            res.send(e)
        }
})

app.listen(3010)