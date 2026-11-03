// Responsive browser smoke checks against the built Next.js server.
// Uses the Playwright installation supplied by .github/workflows/responsive.yml.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const widths = [320, 360, 390, 430, 650, 768, 900, 1024, 1280, 1440, 1920];
const routes = ["/", "/personal", "/business", "/how-it-works", "/about", "/faq", "/partner", "/join", "/apply", "/dashboard", "/privacy", "/terms"];
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
  let currentRoute = "/";
  page.on("pageerror", error => failures.push(width + " " + currentRoute + " JavaScript error: " + error.message));
  for (const route of routes) {
    currentRoute = route;
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

      if (captures.has(width) && ["/", "/personal", "/business", "/join", "/apply", "/dashboard"].includes(route)) {
        const slug = route === "/" ? "home" : route.slice(1);
        // Capture the page in its natural top-of-page state, not from the prior sticky-header scroll test.
        await page.evaluate(() => { window.scrollTo({ top: 0, behavior: "instant" }); document.activeElement?.blur?.(); });
        await page.waitForTimeout(100);
        await page.screenshot({ path: "responsive-screenshots/" + slug + "-" + width + ".png", fullPage: true, animations: "disabled" });
      }
      console.log("PASS " + width + "px " + route + " | doc=" + metrics.scrollWidth + "px");
    } catch (error) {
      failures.push(width + " " + route + " " + String(error));
    }
  }

  // Exercise a real planning journey in the same browser used for layout tests.
  // Only financial assumptions are persisted; no personal identifiers or fake applications.
  if (width === 390 || width === 1440) {
    currentRoute = "/apply → /dashboard customer journey";
    try {
      await page.goto(baseURL + "/apply?type=business&currency=GBP&amount=45000&months=36&rate=8", { waitUntil: "domcontentloaded" });
      await page.getByLabel("Country or region").selectOption("GB");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByLabel("Financing amount (GBP)").waitFor();
      const actualAmount = await page.getByLabel("Financing amount (GBP)").inputValue();
      const actualRate = await page.getByLabel("Assumed annual interest rate (%)").inputValue();
      if (actualAmount !== "45000" || actualRate !== "8") throw new Error("Calculator deep link did not populate the planner");
      await page.getByRole("button", { name: "Continue" }).click();
      if (!await page.getByText("This saves a private financial estimate", { exact: false }).isVisible()) {
        throw new Error("Plan review disclosure is missing");
      }
      await page.getByRole("button", { name: "Save my plan" }).click();
      await page.waitForURL(/\/dashboard\?saved=1/, { timeout: 10000 });
      await page.locator(".saved-card").first().waitFor();
      if (await page.locator(".saved-card").count() !== 1) throw new Error("New plan was not saved");
      await page.reload();
      if (await page.locator(".saved-card").count() !== 1) throw new Error("Saved plan did not survive reload");
      const planExport = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download repayment schedule" }).click();
      const download = await planExport;
      if (!download.suggestedFilename().endsWith(".csv")) throw new Error("Schedule export filename is not CSV");
      await page.getByRole("button", { name: "Duplicate plan" }).click();
      if (await page.locator(".saved-card").count() !== 2) throw new Error("Duplication failed");
      for (const input of await page.locator(".saved-compare input").all()) await input.check();
      if (!await page.locator(".saved-compare-table").isVisible()) throw new Error("Comparison table is missing");
      await page.getByRole("button", { name: "Remove plan" }).first().click();
      await page.getByRole("button", { name: "Delete plan" }).click();
      if (await page.locator(".saved-card").count() !== 1) throw new Error("Delete failed");
      await page.getByRole("link", { name: "Edit plan" }).click();
      await page.getByLabel("Country or region").waitFor();
      if (await page.getByLabel("Country or region").inputValue() !== "GB") throw new Error("Edit did not load saved plan");
      console.log("PASS " + width + "px customer planning journey | save/reload/download/duplicate/compare/delete/edit");
    } catch (error) {
      failures.push(width + " customer journey " + String(error));
    }
  }
  await context.close();
}
await browser.close();
for (const item of warnings) console.warn("WARN " + item);
for (const item of failures) console.error("FAIL " + item);
console.log("Responsive audit: " + (widths.length * routes.length) + " viewport-route combinations; " + failures.length + " failures.");
if (failures.length) process.exitCode = 1;
