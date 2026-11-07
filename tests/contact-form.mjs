// Start `npm run preview` before this test. ALL outgoing POSTs are intercepted.
import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
try {
  for (const lang of ["en", "fr"]) {
    const page = await browser.newPage();
    await page.addInitScript((lang) => localStorage.setItem("gucc-lang-v2", lang), lang);
    let posts = [];
    let mode = "success";
    await page.route("**/*", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      posts.push(route.request());
      assert.equal(route.request().url(), "https://api.web3forms.com/submit");
      if (mode === "network") return route.abort("failed");
      if (mode === "timeout") return; // Keep intercepted, never reach the real service.
      if (mode === "html") return route.fulfill({ status: 200, contentType: "text/html", body: "<html>Outage</html>" });
      const status = Number(mode) || (mode === "rejected" ? 400 : 200);
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: mode === "success" }) });
    });
    await page.goto("http://localhost:8081/contact");
    const form = page.locator("form");
    const name = form.locator('input[autocomplete="name"]');
    const email = form.locator('input[type="email"]');
    const programme = form.locator('input[placeholder]');
    const message = form.locator("textarea");
    const submit = form.locator('button[type="submit"]');
    await name.waitFor();
    await page.waitForFunction((lang) => document.documentElement.lang === lang, lang);
    // Validation never contacts the API.
    await submit.click();
    assert.equal(posts.length, 0);
    await name.fill("Mock visitor");
    await email.fill("invalid");
    await message.fill("Mock message");
    await submit.click();
    assert.equal(posts.length, 0);
    await email.fill("visitor@example.com");
    await programme.fill("GSEM, UNIGE");
    await form.locator('button[aria-pressed]').nth(2).click();
    // Honeypot: no POST, no clearing or success acknowledgement.
    await form.locator('[name="botcheck"]').fill("spam", { force: true });
    await submit.click();
    assert.equal(posts.length, 0);
    assert.equal(await message.inputValue(), "Mock message");
    await form.locator('[name="botcheck"]').fill("", { force: true });
    for (mode of ["network", "timeout", "html", "408", "429", "500", "522", "rejected"]) {
      const before = posts.length;
      await submit.click();
      await form.locator('[role="alert"]').waitFor({ timeout: 20000 });
      assert.equal(posts.length, before + 1, `${lang} ${mode}: one POST`);
      assert.equal(await name.inputValue(), "Mock visitor");
      assert.equal(await email.inputValue(), "visitor@example.com");
      assert.equal(await programme.inputValue(), "GSEM, UNIGE");
      assert.equal(await message.inputValue(), "Mock message");
      assert.equal(await form.locator('button[aria-pressed="true"]').textContent(), lang === "fr" ? "Partenariat" : "Partnership");
      assert.match(await form.locator('[role="alert"]').textContent(), mode === "rejected" ? /refusé|rejected/ : /peut-être|may have/);
    }
    mode = "success";
    const before = posts.length;
    await submit.dblclick();
    await page.locator(".form-success").waitFor();
    assert.equal(posts.length, before + 1, "duplicate click cannot cause another POST");
    const payload = posts.at(-1).postDataJSON();
    assert.equal(payload.programme, "GSEM, UNIGE");
    assert.equal(payload.request, lang === "fr" ? "Partenariat" : "Partnership");
    assert.equal(payload.email, "visitor@example.com");
    await page.locator('.form-success button').click();
    assert.equal(await name.inputValue(), "");
    assert.equal(await email.inputValue(), "");
    assert.equal(await programme.inputValue(), "");
    assert.equal(await message.inputValue(), "");
    console.log(`${lang.toUpperCase()}: validation, honeypot, all failures preserve fields, confirmed success clears fields, single POST passed`);
    await page.close();
  }
} finally {
  await browser.close();
}
