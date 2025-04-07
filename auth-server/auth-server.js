import { createHash } from "crypto";
import axios from "axios";
import express from "express";
import path from "path";

const app = express();
app.use(express.json());
const port = 3000;
const clientId = process.env.XERO_APP_CLIENT_ID;
const redirect_uri = `http://localhost:${port}/callback`;
const scopes =
  "openid profile email accounting.transactions accounting.contacts accounting.settings.read";

var codeVerifier = "";
var accessToken = "";

// TODO change this
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  // const response = await axios.post(
  //   "https://identity.xero.com/connect/token",
  //   {
  //     grant_type: "authorization_code",
  //     client_id: clientId,
  //     code: code,
  //     redirect_uri,
  //     code_verifier: codeVerifier,
  //   },
  //   {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //       Accept: "application/json",
  //     },
  //   },
  // );

  // accessToken = response.data.access_token;
  // console.log("accessToken", accessToken);

  res.sendFile(path.join(path.resolve(), "/auth-server/"));
});

app.get("/login-url", (req, res) => {
  codeVerifier = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const codeChallenge = createHash("sha256")
    .update(codeVerifier, "ascii")
    .digest("base64url");

  const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect_uri}&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  console.log("codeVerifier", codeVerifier);

  res.send({ url });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
