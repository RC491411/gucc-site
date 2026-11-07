import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTACT_ENDPOINT, submitContact } from "../src/lib/contact-submit.ts";

const fields = {
  name: "Test visitor", email: "visitor@example.com", programme: "GSEM, UNIGE",
  request: "Partnership", message: "Mocked test only", language: "EN",
};

test("Web3Forms transport (all requests intercepted; no email sent)", async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  const mock = (handler: typeof fetch) => {
    calls = 0;
    globalThis.fetch = ((...args) => { calls++; return handler(...args); }) as typeof fetch;
  };
  await t.test("structured success and documented JSON fields / reply-to", async () => {
    mock(async (url, init) => {
      assert.equal(url, CONTACT_ENDPOINT);
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init.headers).get("Content-Type"), "application/json");
      const body = JSON.parse(String(init.body));
      const { access_key, ...publicFields } = body;
      // Do not print the embedded key, including in test failures.
      assert.ok(typeof access_key === "string" && /^[a-f0-9-]{36}$/i.test(access_key));
      assert.deepEqual(publicFields, { ...fields, subject: "New message from GUCC website", from_name: "GUCC website", botcheck: false });
      return Response.json({ success: true });
    });
    assert.equal(await submitContact(fields), "success");
    assert.equal(calls, 1);
  });
  for (const status of [408, 429, 500, 522]) {
    await t.test(`${status}: unknown outcome, exactly one POST`, async () => {
      mock(async () => Response.json({ success: false }, { status }));
      assert.equal(await submitContact(fields), "unknown");
      assert.equal(calls, 1);
    });
  }
  await t.test("network error: no retry", async () => {
    mock(async () => { throw new TypeError("Mock offline"); });
    assert.equal(await submitContact(fields), "unknown");
    assert.equal(calls, 1);
  });
  await t.test("timeout aborts, no retry even if fetch never settles", async () => {
    let signal: AbortSignal | undefined;
    mock(async (_url, init) => { signal = init?.signal ?? undefined; return new Promise(() => {}); });
    assert.equal(await submitContact(fields, 10), "unknown");
    assert.equal(signal?.aborted, true);
    assert.equal(calls, 1);
  });
  await t.test("timeout also covers a hanging response body", async () => {
    mock(async () => new Response(new ReadableStream({ start() {} })));
    assert.equal(await submitContact(fields, 10), "unknown");
    assert.equal(calls, 1);
  });
  for (const body of ["<html>Gateway error</html>", "null", '"ok"', '{"success":"true"}', '{}']) {
    await t.test(`no unstructured success: ${body}`, async () => {
      mock(async () => new Response(body));
      assert.equal(await submitContact(fields), "unknown");
      assert.equal(calls, 1);
    });
  }
  await t.test("structured rejection", async () => {
    mock(async () => Response.json({ success: false }, { status: 400 }));
    assert.equal(await submitContact(fields), "rejected");
    assert.equal(calls, 1);
  });
  await t.test("non-2xx cannot be considered success", async () => {
    mock(async () => Response.json({ success: true }, { status: 500 }));
    assert.equal(await submitContact(fields), "unknown");
    assert.equal(calls, 1);
  });
});
