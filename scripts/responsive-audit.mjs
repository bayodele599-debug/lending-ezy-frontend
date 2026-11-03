// Responsive browser smoke checks against the built Next.js server.
// Uses the Playwright installation supplied by .github/workflows/responsive.yml.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const widths = [320, 360, 390, 430, 650, 768, 900, 1024, 1280, 1440, 1920];
const routes = ["/", "/personal", "/business", "/how-it-works", "/about", "/faq", "/partner", "/join", "/privacy", "/terms"];
const captures = new Set([320, 390, 768, 1440]);
const failures = [];
const warnings = [];

await mkdir("responsive-screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  page.on("pageerror", error => failures.push(width + " JavaScript error: " + error.message));
  for (const route of routes) {
    try {
      await page.goto(baseURL + route, { waitUntil: "domcontentloaded", timeout: 35000 });
      await page.locator("#main-content").waitFor({ timeout: 12000 });

      const metrics = await page.evaluate(() => {
        const header = document.querySelector(".site-header");
        const viewport = document.documentElement.clientWidth;
        const screenOverflow = document.documentElement.scrollWidth - viewport;
        const overlays = document.querySelectorAll(".editorial-photo figcaption, .editorial-photo a").length;
        return {
          viewport,
          scrollWidth: document.documentElement.scrollWidth,
          screenOverflow,
          headerPosition: header ? getComputedStyle(header).position : "missing",
          overlays
        };
      });

      if (metrics.screenOverflow > 1) {
        const offenders = await page.evaluate(() => [...document.querySelectorAll("body *")]
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && (rect.right > document.documentElement.clientWidth + 2 || rect.left < -2);
          })
          .slice(0, 7).map(el => ({ tag: el.tagName, className: String(el.className).slice(0, 70) })));
        failures.push(width + " " + route + " horizontal overflow " + metrics.screenOverflow + "px " + JSON.stringify(offenders));
      }

      if (metrics.headerPosition !== "sticky") {
        failures.push(width + " " + route + " header is not sticky: " + metrics.headerPosition);
      }
      if (metrics.overlays !== 0) failures.push(width + " " + route + " photo credit overlay still present");

      if (["/", "/personal", "/business"].includes(route)) {
        await page.evaluate(() => window.scrollTo(0, 640));
        await page.waitForTimeout(65);
        const top = await page.locator(".site-header").evaluate(el => el.getBoundingClientRect().top);
        const expected = width <= 650 ? 10 : 14;
        if (Math.abs(top - expected) > 2) failures.push(width + " " + route + " header did not remain at sticky top: " + top);
      }

      if (route === "/" && width <= 900) {
        const toggle = page.locator(".menu-toggle");
        await toggle.click();
        if (!await page.locator("#mobile-navigation").isVisible()) failures.push(width + " menu did not open");
        await page.keyboard.press("Escape");
        if (await page.locator("#mobile-navigation").isVisible()) failures.push(width + " menu did not close via Escape");
      }

      if (captures.has(width) && ["/", "/personal", "/business", "/join"].includes(route)) {
        const slug = route === "/" ? "home" : route.slice(1);
        await page.screenshot({ path: "responsive-screenshots/" + slug + "-" + width + ".png", fullPage: true, animations: "disabled" });
      }
      console.log("PASS " + width + "px " + route + " | doc=" + metrics.scrollWidth + "px");
    } catch (error) {
      failures.push(width + " " + route + " " + String(error));
    }
  }
  await context.close();
}
await browser.close();
for (const item of warnings) console.warn("WARN " + item);
for (const item of failures) console.error("FAIL " + item);
console.log("Responsive audit: " + (widths.length * routes.length) + " viewport-route combinations; " + failures.length + " failures.");
if (failures.length) process.exitCode = 1;
