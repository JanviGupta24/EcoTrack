/**
 * Smoke-test all API routes. Requires server on PORT (default 5000) and MongoDB.
 * Usage: node scripts/test-all-routes.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}/api`;
const ROOT = `http://127.0.0.1:${PORT}`;

const results = [];
function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(pass ? "✅" : "❌", name, detail ? `- ${detail}` : "");
}

async function main() {
  let userToken = "";
  let userRefreshToken = "";
  let adminToken = "";
  let workerToken = "";
  let championToken = "";
  let lastReportId = "";
  let lastNotificationId = "";
  let courseId = "";

  try {
    const h = await axios.get(`${ROOT}/health`, { timeout: 5000 });
    ok("GET /health", h.data?.success === true);
  } catch (e) {
    ok("GET /health", false, e.message);
    console.error("\nStart the server first: npm run dev\n");
    process.exit(1);
  }

  const email = `route_test_${Date.now()}@example.com`;
  const password = "Test1234";

  try {
    const r = await axios.post(`${BASE}/auth/register`, {
      name: "Route Test",
      email,
      password,
    });
    userToken = r.data.accessToken;
    ok("POST /auth/register", !!userToken && r.data?.user?.role === "user");
  } catch (e) {
    ok("POST /auth/register", false, e.response?.data?.message || e.message);
  }

  try {
    const r = await axios.post(`${BASE}/auth/login`, { email, password });
    userToken = r.data.accessToken;
    userRefreshToken = r.data.refreshToken;
    ok("POST /auth/login", !!userToken);
  } catch (e) {
    ok("POST /auth/login", false, e.response?.data?.message || e.message);
  }

  if (userRefreshToken) {
    try {
      const r = await axios.post(`${BASE}/auth/refresh`, {
        refreshToken: userRefreshToken,
      });
      ok("POST /auth/refresh", !!(r.data?.accessToken && r.data?.refreshToken));
      if (r.data?.accessToken) userToken = r.data.accessToken;
      if (r.data?.refreshToken) userRefreshToken = r.data.refreshToken;
    } catch (e) {
      ok("POST /auth/refresh", false, e.response?.data?.message || e.message);
    }
  }

  const ua = { headers: { Authorization: `Bearer ${userToken}` } };

  const endpoints = [
    ["GET /users/me", () => axios.get(`${BASE}/users/me`, ua)],
    ["PATCH /users/me", () => axios.patch(`${BASE}/users/me`, { name: "Route Test" }, ua)],
    ["GET /users/stats", () => axios.get(`${BASE}/users/stats`, ua)],
    ["GET /users/leaderboard", () => axios.get(`${BASE}/users/leaderboard`, ua)],
    ["GET /waste/reports", () => axios.get(`${BASE}/waste/reports`, ua)],
    [
      "POST /waste/report (multipart minimal)",
      async () => {
        const FormData = require("form-data");
        const fd = new FormData();
        fd.append("wasteType", "plastic");
        fd.append("quantity", "small");
        fd.append("description", "api test");
        fd.append(
          "location",
          JSON.stringify({
            type: "Point",
            coordinates: [77.209, 28.6139],
            address: "Test",
          })
        );
        return axios.post(`${BASE}/waste/report`, fd, {
          headers: { ...fd.getHeaders(), ...ua.headers },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      },
    ],
    [
      "GET /waste/nearby-facilities",
      () =>
        axios.get(`${BASE}/waste/nearby-facilities`, {
          ...ua,
          params: { lng: 77.209, lat: 28.6139 },
        }),
    ],
    ["GET /payments/wallet", () => axios.get(`${BASE}/payments/wallet`, ua)],
    ["GET /payments/transactions", () =>
      axios.get(`${BASE}/payments/transactions`, ua),
    ],
    [
      "POST /payments/redeem (expect 400 if 0 pts)",
      () => axios.post(`${BASE}/payments/redeem`, { points: 0 }, ua),
    ],
    ["GET /training/courses", () => axios.get(`${BASE}/training/courses`, ua)],
    ["GET /training/my-courses", () =>
      axios.get(`${BASE}/training/my-courses`, ua),
    ],
    ["GET /training/certificates", () =>
      axios.get(`${BASE}/training/certificates`, ua),
    ],
    ["GET /notifications", () => axios.get(`${BASE}/notifications`, ua)],
    [
      "POST /ai/chatbot (503 no key ok)",
      () => axios.post(`${BASE}/ai/chatbot`, { message: "hi" }, ua),
    ],
  ];

  for (const [name, fn] of endpoints) {
    try {
      const r = await fn();
      ok(name, r.status >= 200 && r.status < 300, `status ${r.status}`);
      if (name.startsWith("POST /waste/report") && r.data?.report?._id) {
        lastReportId = r.data.report._id;
      }
    } catch (e) {
      const st = e.response?.status;
      const msg = e.response?.data?.message || e.message;
      if (name.includes("redeem") && st === 400) {
        ok(name, true, `status 400 invalid points (expected)`);
        continue;
      }
      if (
        name.includes("chatbot") &&
        (st === 503 || st === 500 || msg?.includes("not configured"))
      ) {
        ok(name, true, `AI unavailable (${st}): ${msg}`);
        continue;
      }
      ok(name, false, `${st} ${msg}`);
    }
  }

  if (lastReportId) {
    try {
      const r = await axios.get(
        `${BASE}/waste/reports/${lastReportId}`,
        ua
      );
      ok("GET /waste/reports/:id", r.status === 200);
    } catch (e) {
      ok(
        "GET /waste/reports/:id",
        false,
        e.response?.status + " " + e.response?.data?.message
      );
    }
  }

  /* Training: fetch first course id */
  try {
    const r = await axios.get(`${BASE}/training/courses`, ua);
    courseId = r.data?.courses?.[0]?._id;
    if (courseId) {
      await axios.get(`${BASE}/training/courses/${courseId}`, ua);
      ok("GET /training/courses/:id", true);
      await axios.get(`${BASE}/training/courses/${courseId}/progress`, ua);
      ok("GET /training/courses/:id/progress", true);
    } else {
      ok("GET /training/courses/:id", true, "skip — no courses in DB");
      ok("GET /training/courses/:id/progress", true, "skip");
    }
  } catch (e) {
    ok("GET /training/courses/:id", false, e.response?.data?.message || e.message);
  }

  /* Notifications detail */
  try {
    const r = await axios.get(`${BASE}/notifications?limit=1`, ua);
    lastNotificationId = r.data?.notifications?.[0]?._id;
    if (lastNotificationId) {
      await axios.patch(
        `${BASE}/notifications/${lastNotificationId}/read`,
        {},
        ua
      );
      ok("PATCH /notifications/:id/read", true);
    } else {
      ok("PATCH /notifications/:id/read", true, "skip — no notifications");
    }
    await axios.patch(`${BASE}/notifications/read-all`, {}, ua);
    ok("PATCH /notifications/read-all", true);
  } catch (e) {
    ok(
      "notifications patch",
      false,
      e.response?.data?.message || e.message
    );
  }

  /* Seed roles logins */
  const tryLogin = async (label, e, p) => {
    try {
      const r = await axios.post(`${BASE}/auth/login`, { email: e, password: p });
      ok(`login ${label}`, !!r.data?.accessToken);
      return r.data.accessToken;
    } catch (err) {
      ok(`login ${label}`, false, "seed user missing — run npm run seed");
      return "";
    }
  };

  adminToken = await tryLogin(
    "super_admin",
    "owner@ecotrack.com",
    "Owner@2025"
  );
  workerToken = await tryLogin(
    "worker",
    "plastic.worker@example.com",
    "Worker@Plastic"
  );
  championToken = await tryLogin(
    "champion",
    "saanvi.khurana@example.com",
    "Saanvi@2025"
  );

  if (adminToken) {
    const aa = { headers: { Authorization: `Bearer ${adminToken}` } };
    const adminCalls = [
      ["GET /admin/stats", () => axios.get(`${BASE}/admin/stats`, aa)],
      ["GET /admin/users", () => axios.get(`${BASE}/admin/users`, aa)],
      ["GET /admin/facilities", () => axios.get(`${BASE}/admin/facilities`, aa)],
      ["GET /admin/analytics", () => axios.get(`${BASE}/admin/analytics`, aa)],
      [
        "GET /admin/export",
        () =>
          axios.get(`${BASE}/admin/export`, {
            ...aa,
            params: { type: "users", format: "json" },
            responseType: "text",
          }),
      ],
    ];
    for (const [name, fn] of adminCalls) {
      try {
        const r = await fn();
        ok(name, r.status === 200, String(r.status));
      } catch (e) {
        ok(name, false, e.response?.status + " " + e.response?.data?.message);
      }
    }
    try {
      const pending = await axios.get(`${BASE}/waste/reports`, {
        ...aa,
        params: { status: "pending", limit: 1 },
      });
      const wrk = await axios.get(`${BASE}/admin/users`, {
        ...aa,
        params: { role: "worker", limit: 1 },
      });
      const rid = pending.data.reports?.[0]?._id;
      const wid = wrk.data.users?.[0]?._id;
      if (rid && wid) {
        const ar = await axios.post(
          `${BASE}/admin/assign-report`,
          { reportId: rid, workerId: wid },
          aa
        );
        ok("POST /admin/assign-report", ar.status === 200);
      } else {
        ok("POST /admin/assign-report", true, "skip — no pending or worker");
      }
    } catch (e) {
      ok("POST /admin/assign-report", false, e.response?.data?.message);
    }
  }

  if (workerToken) {
    const wa = { headers: { Authorization: `Bearer ${workerToken}` } };
    try {
      const r = await axios.get(`${BASE}/workers/stats`, wa);
      ok("GET /workers/stats", r.status === 200);
    } catch (e) {
      ok("GET /workers/stats", false, e.response?.data?.message);
    }
    try {
      const r = await axios.get(`${BASE}/workers/assigned-reports`, wa);
      ok("GET /workers/assigned-reports", r.status === 200);
      const rep = (r.data.reports || []).find((x) => x.status === "assigned");
      if (rep) {
        try {
          const u = await axios.patch(
            `${BASE}/workers/reports/${rep._id}/status`,
            { status: "in-progress", note: "api test" },
            wa
          );
          ok("PATCH /workers/reports/:id/status", u.status === 200);
          await axios.patch(
            `${BASE}/workers/reports/${rep._id}/status`,
            { status: "assigned", note: "revert for seed consistency" },
            wa
          ).catch(() => {});
        } catch (e) {
          ok(
            "PATCH /workers/reports/:id/status",
            false,
            e.response?.data?.message
          );
        }
      } else {
        ok("PATCH /workers/reports/:id/status", true, "skip — no assigned report");
      }
    } catch (e) {
      ok(
        "GET /workers/assigned-reports",
        false,
        e.response?.data?.message
      );
    }
    try {
      const r = await axios.get(`${BASE}/workers/schedule`, wa);
      ok("GET /workers/schedule", r.status === 200);
    } catch (e) {
      ok("GET /workers/schedule", false, e.response?.data?.message);
    }
  }

  if (championToken) {
    const ca = { headers: { Authorization: `Bearer ${championToken}` } };
    const champPaths = [
      ["GET /champion/dashboard", "/champion/dashboard"],
      ["GET /champion/reports", "/champion/reports"],
      ["GET /champion/events", "/champion/events"],
      ["GET /champion/resources", "/champion/resources"],
    ];
    for (const [label, path] of champPaths) {
      try {
        const r = await axios.get(`${BASE}${path}`, ca);
        ok(label, r.status === 200);
      } catch (e) {
        if (e.response?.status === 403) {
          ok(label, true, "skip — not green_champion");
        } else {
          ok(label, false, e.response?.data?.message);
        }
      }
    }
  }

  try {
    const nList = await axios.get(`${BASE}/notifications?limit=2`, ua);
    const ids = (nList.data.notifications || []).map((n) => n._id);
    if (ids.length >= 1) {
      await axios.patch(
        `${BASE}/notifications/read-multiple`,
        { ids },
        ua
      );
      ok("PATCH /notifications/read-multiple", true);
    } else {
      ok("PATCH /notifications/read-multiple", true, "skip");
    }
    const n2 = await axios.get(`${BASE}/notifications?limit=1`, ua);
    const nid = n2.data.notifications?.[0]?._id;
    if (nid) {
      await axios.patch(`${BASE}/notifications/${nid}/archive`, {}, ua);
      ok("PATCH /notifications/:id/archive", true);
      await axios.delete(`${BASE}/notifications/${nid}`, ua);
      ok("DELETE /notifications/:id", true);
    }
  } catch (e) {
    ok("notifications extra", false, e.response?.data?.message || e.message);
  }

  try {
    await axios.post(`${BASE}/ai/generate-quiz`, { topic: "recycling" }, ua);
    ok("POST /ai/generate-quiz", true);
  } catch (e) {
    const st = e.response?.status;
    ok(
      "POST /ai/generate-quiz",
      st === 503 || st === 500,
      `AI ${st}: ${e.response?.data?.message}`
    );
  }

  try {
    await axios.post(`${BASE}/payments/create-order`, { amount: 100 }, ua);
    ok("POST /payments/create-order", true);
  } catch (e) {
    const st = e.response?.status;
    ok(
      "POST /payments/create-order",
      st === 503 || st === 400,
      `expected 503/400 got ${st}`
    );
  }

  if (userToken) {
    try {
      const r = await axios.post(
        `${BASE}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      ok("POST /auth/logout", r.status === 200);
    } catch (e) {
      ok("POST /auth/logout", false, e.response?.data?.message);
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log("\n--- Summary ---", results.filter((r) => r.pass).length, "/", results.length, "ok");
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
