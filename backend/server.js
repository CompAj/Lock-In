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
    const user = req.body;
    if (!user?.email) return res.status(400).json({ error: "email required" });

    const gatewayRule = await client.zeroTrust.gateway.rules.create({
      account_id: process.env.ACCOUNT_ID,
      action: "block",
      name: crypto.randomUUID(),
      description: "",
      enabled: true,
      filters: ["dns"],
      traffic: "any(dns.content_category[*] in {149})",
      // Identity targeting belongs in 'target' conditions, not a free string field.
      // Keep simple first; refine later with proper selectors.
    });

    res.json(gatewayRule);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.post("/create-access-policy", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });

  const policy = await client.zeroTrust.access.policies.create({
    account_id: process.env.ACCOUNT_ID,
    decision: "allow",
    name: `Access Policy for ${email}`,
    include: [{ email: { email } }],
  });

  res.json(policy);
});

app.post("/create-block-policy", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: "email required" });

    const rule = await client.zeroTrust.gateway.rules.create({
      account_id: process.env.ACCOUNT_ID,
      action: "block",
      name: crypto.randomUUID(),
      description: "Block Facebook for one user",
      enabled: true,
      filters: ["http"],
      traffic: "any(http.request.uri.content_category[*] in {149})",
    });

    res.json({ ok: true, result: rule });
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