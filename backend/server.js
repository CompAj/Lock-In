import express from "express";
import bodyParser from "body-parser";
import Cloudflare from "cloudflare";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve /certificates/* from the ./certificates folder
app.use(
  "/certificates",
  express.static(path.join(__dirname, "certificates"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mobileconfig")) {
        res.setHeader("Content-Type", "application/x-apple-aspen-config");
      }
    },
  })
);

// 📝 Place certificates/cloudflare.mobileconfig on disk.
// ✅ Access at: http://localhost:3000/certificates/cloudflare.mobileconfig

const client = new Cloudflare({ apiToken: process.env.API_TOKEN });

// Use POST if you expect a body
app.post("/create-policy", async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const gatewayRule = await client.zeroTrust.access.policies.list('',
      {
        account_id: process.env.ACCOUNT_ID,
        includes: { 
          email: {
            email
          }
        },
      }
    );

    res.json(gatewayRule);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.post("/create-access-policy", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: "email required" });

    const accountId = process.env.ACCOUNT_ID;
    const applicationId = process.env.ACCESS_APP_ID;
    const policyName = `Access Policy for ${email}`;

    const listParams = {
      account_id: accountId,
    };
    if (applicationId) listParams.application_id = applicationId;

    const existing = await client.zeroTrust.access.policies.list(listParams);
    const match = existing?.result?.find((policy) => policy.name === policyName);

    if (match) {
      const updated = await client.zeroTrust.access.policies.update({
        account_id: accountId,
        policy_id: match.id,
        ...(applicationId ? { application_id: applicationId } : {}),
        decision: "allow",
        name: policyName,
        include: [{ email: { email } }],
      });

      return res.json({ ok: true, action: "updated", policy: updated });
    }

    const created = await client.zeroTrust.access.policies.create({
      account_id: accountId,
      ...(applicationId ? { application_id: applicationId } : {}),
      decision: "allow",
      name: policyName,
      include: [{ email: { email } }],
    });

    res.json({ ok: true, action: "created", policy: created });
  } catch (err) {
    console.error("create-access-policy error", err);
    res
      .status(500)
      .json({ ok: false, error: String(err), details: err.errors ?? null });
  }
});

app.post("/create-block-policy", async (req, res) => {
  try {
    const { email, blocks = {}, duration } = req.body ?? {};
    console.log(email, blocks, duration);
    if (!email) return res.status(400).json({ error: "email required" });

    const NETWORK_RULES = {
      tiktok: [
        'any(net.sni.domains[*] == "tiktok.com")',
        'any(net.sni.domains[*] == "www.tiktok.com")',
      ],
      instagramReels: [
        'any(net.sni.domains[*] == "instagram.com")',
        'any(net.sni.domains[*] == "www.instagram.com")',
      ],
      youtubeShorts: [
        'any(net.sni.domains[*] == "youtube.com")',
        'any(net.sni.domains[*] == "www.youtube.com")',
      ],
      socialMediaGeneral: ["any(net.fqdn.content_category[*] in {149})"],
    };

    const HTTP_RULES = {
      tiktok: [
        'any(http.request.domains[*] == "tiktok.com")',
        'any(http.request.domains[*] == "www.tiktok.com")',
      ],
      instagramReels: [
        'any(http.request.domains[*] == "instagram.com")',
        'any(http.request.domains[*] == "www.instagram.com")',
      ],
      youtubeShorts: [
        'any(http.request.domains[*] == "youtube.com")',
        'any(http.request.domains[*] == "www.youtube.com")',
      ],
      socialMediaGeneral: [
        "any(http.request.uri.content_category[*] in {149})",
      ],
    };

    const selectedKeys = Object.entries(blocks)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);

    if (selectedKeys.length === 0) {
      return res.status(400).json({ error: "no blocks selected" });
    }

    const networkClauses = selectedKeys.flatMap(
      (key) => NETWORK_RULES[key] ?? []
    );
    const httpClauses = selectedKeys.flatMap((key) => HTTP_RULES[key] ?? []);

    const results = [];

    if (networkClauses.length > 0) {
      const networkTraffic =
        networkClauses.length === 1
          ? networkClauses[0]
          : `(${networkClauses.join(" or ")})`;

      console.log("network traffic:", networkTraffic);
      const networkRule = await client.zeroTrust.gateway.rules.create({
        account_id: process.env.ACCOUNT_ID,
        action: "block",
        name: `network-block-${crypto.randomUUID()}`,
        description: "Network layer block generated from app toggles",
        enabled: true,
        filters: ["l4"],
        traffic: networkTraffic,
      });
      results.push({ type: "network", rule: networkRule });
    }

    if (httpClauses.length > 0) {
      const httpTraffic =
        httpClauses.length === 1
          ? httpClauses[0]
          : `(${httpClauses.join(" or ")})`;

      console.log("http traffic:", httpTraffic);
      const httpRule = await client.zeroTrust.gateway.rules.create({
        account_id: process.env.ACCOUNT_ID,
        action: "block",
        name: `http-block-${crypto.randomUUID()}`,
        description: "HTTP layer block generated from app toggles",
        enabled: true,
        filters: ["http"],
        traffic: httpTraffic,
      });
      results.push({ type: "http", rule: httpRule });
    }

    res.json({ ok: true, result: results });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: String(err), details: err.errors ?? null });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
