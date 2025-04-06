import { createHash } from "crypto";
import axios from "axios";
import express from "express";
import path from "path";

const app = express();
app.use(express.json());
const port = 3000;
const clientId = "";
const redirect_uri = `http://127.0.0.1:${port}/callback`;
const scopes =
  "openid profile email accounting.transactions accounting.contacts accounting.settings.read";

var codeVerifier = "";

// TODO change this
app.get("/callback", (req, res) => {
  res.sendFile(path.join(path.resolve(), "src/auth-server/"));
});

app.get("/login-url", (req, res) => {
  codeVerifier = crypto.randomUUID();
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect_uri}&scope=${scopes}&state=123&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.send({ url });
});

app.post("/store-token", async (req, res) => {
  const { code } = req.body;

  console.log("code", code);
  console.log("codeVerifier", codeVerifier);

  const response = await axios.post(
    "https://identity.xero.com/connect/token",
    {
      grant_type: "authorization_code",
      client_id: clientId,
      code: code,
      redirect_uri,
      code_verifier: codeVerifier,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    },
  );

  console.log(response);

  res.send({ message: "Token stored successfully" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
