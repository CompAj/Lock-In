import express from "express";
import bodyParser from "body-parser";
import Cloudflare from "cloudflare";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

const client = new Cloudflare({
  apiToken: process.env.API_TOKEN,
});

app.get("/create-policy", async (req, res) => {
  const user = req.body;

  const gatewayRule = await client.zeroTrust.gateway.rules.create({
    account_id: process.env.ACCOUNT_ID,
    action: "block",
    name: crypto.randomUUID(),
    description: "",
    enabled: true,
    filters: ["dns"],
    traffic: "any(dns.content_category[*] in {149})",
    identity: `${user.email}`,
    device_posture: "",
  });

  res.json(gatewayRule);
});

app.post("/create-access-policy", async (req, res) => {
  const { email } = req.body;

  const policy = await client.zeroTrust.access.policies.create({
    account_id: process.env.ACCOUNT_ID,
    decision: "allow",
    name: `Access Policy for ${email}`,
    include: [
      {
        email: {
          email,
        },
      },
    ],
  });

  res.json(policy);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
