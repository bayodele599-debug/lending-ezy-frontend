// Responsive browser smoke checks against the built Next.js server.
// Uses the Playwright installation supplied by .github/workflows/responsive.yml.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
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
      // Structural and navigation checks on every page at every viewport.
      const structure = await page.evaluate(() => {
        const h1 = document.querySelectorAll("#main-content h1").length;
        const title = document.title;
        const broken = [...document.querySelectorAll('a[href]')].filter(link => {
          const href = link.getAttribute("href");
          if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("https://")) return false;
          const url = new URL(href, location.href);
          const valid = new Set(["/", "/apply", "/dashboard", "/personal", "/business", "/about", "/partner", "/faq", "/how-it-works", "/join", "/privacy", "/terms"]);
          const routeExists = valid.has(url.pathname);
          const anchorExists = !url.hash || (url.pathname !== location.pathname && url.pathname !== "/") || document.getElementById(decodeURIComponent(url.hash.slice(1))) !== null;
          return !routeExists || !anchorExists;
        }).map(link => link.getAttribute("href")).slice(0, 10);
        return { h1, title, broken };
      });
      if (structure.h1 !== 1) failures.push(width + " " + route + " expected one page h1, got " + structure.h1);
      if (!structure.title?.includes("Lending Ezy")) failures.push(width + " " + route + " missing descriptive page title");
      if (structure.broken.length) failures.push(width + " " + route + " internal links/anchors invalid: " + structure.broken.join(", "));
      if ((width === 390 || width === 1440) && ["/", "/apply", "/dashboard", "/join", "/personal", "/business"].includes(route)) {
        try {
          const report = await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
          const important = report.violations.filter(v => v.impact === "critical" || v.impact === "serious");
          if (important.length) failures.push(width + " " + route + " accessibility issues: " + important.map(v => v.id + " (" + v.nodes.length + ")").join(", "));
        } catch (e) {
          failures.push(width + " " + route + " accessibility audit failed: " + String(e));
        }
      }

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
      await page.goto(baseURL + "/business", { waitUntil: "domcontentloaded" });
      const productSelection = page.getByRole("group", {name:"Borrowing purpose"});
      if (await productSelection.getByRole("button", {name:"Business"}).getAttribute("aria-pressed") !== "true")
        throw new Error("Business page calculator did not default to business");
      const calculatorAmount = await page.getByLabel("Amount (USD)").inputValue();
      if (calculatorAmount !== "60000") throw new Error("Business calculator amount was not 60000: "+calculatorAmount);
      await page.getByRole("button", {name:"Reset"}).click();
      if (await page.getByLabel("Amount (USD)").inputValue() !== "60000") throw new Error("Business calculator reset to personal figures");
      await page.goto(baseURL + "/apply?type=business&currency=GBP&amount=45000&months=36&rate=8", { waitUntil: "domcontentloaded" });
      // US is the starting country; an existing saved plan remains authoritative when editing.
      const defaultCountry = await page.getByLabel("Country or region").inputValue();
      if (defaultCountry !== "US") throw new Error("Country should start as United States, got: " + defaultCountry);
      await page.getByLabel("Country or region").selectOption("GB");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByLabel("Financing amount (GBP)").waitFor();
      const firstStepPosition = await page.evaluate(() => ({
        scrollY: window.scrollY,
        headingTop: document.querySelector(".planner-panel h2")?.getBoundingClientRect().top ?? -1,
        headerBottom: document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0,
        viewportHeight: window.innerHeight,
        focusedHeading: document.activeElement === document.querySelector(".planner-panel h2")
      }));
      if (!firstStepPosition.focusedHeading) throw new Error("Next step heading is not keyboard-focused");
      if (firstStepPosition.scrollY < 40 || firstStepPosition.headingTop < firstStepPosition.headerBottom - 3 ||
          firstStepPosition.headingTop > firstStepPosition.viewportHeight - 70) {
        throw new Error("Next step is outside visible form area: " + JSON.stringify(firstStepPosition));
      }
      const actualAmount = await page.getByLabel("Financing amount (GBP)").inputValue();
      const actualRate = await page.getByLabel("Assumed annual interest rate (%)").inputValue();
      if (actualAmount !== "45000" || actualRate !== "8") throw new Error("Calculator deep link did not populate the planner");
      await page.getByRole("button", { name: "Continue" }).click();
      const secondPosition = await page.evaluate(() => ({
        scrollY: window.scrollY,
        headingTop: document.querySelector(".planner-panel h2")?.getBoundingClientRect().top ?? -1,
        headerBottom: document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0,
        focusedHeading: document.activeElement === document.querySelector(".planner-panel h2")
      }));
      if (!secondPosition.focusedHeading || secondPosition.scrollY < 40 ||
          secondPosition.headingTop < secondPosition.headerBottom - 3)
        throw new Error("Review step lost form position: " + JSON.stringify(secondPosition));
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
      await page.getByRole("button", {name:"Back"}).click();
      if (await page.getByLabel("Country or region").inputValue() !== "GB") throw new Error("Back erased edited country");
      console.log("PASS " + width + "px customer journey | country/edit/scroll/save/reload/download/duplicate/compare/delete");
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
