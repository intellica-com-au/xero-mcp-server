#!/usr/bin/env node

import { createHash } from "crypto";
import axios from "axios";
import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const authServer = () => {
  const app = express();
  app.use(express.json());
  const port = 3000;
  const clientId = process.env.XERO_APP_CLIENT_ID;
  const redirect_uri = `http://localhost:${port}/callback`;
  const scopes =
    "openid profile email accounting.transactions accounting.contacts accounting.settings.read";

  const memoryStore = {
    codeVerifier: "",
    accessToken: "",
  };

  // TODO change this
  app.get("/callback", async (req, res) => {
    const { code } = req.query;

    const response = await axios.post(
      "https://identity.xero.com/connect/token",
      {
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        redirect_uri,
        code_verifier: memoryStore.codeVerifier,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    memoryStore.accessToken = response.data.access_token;

    res.sendFile(path.join(path.resolve(), "/"));
  });

  app.get("/login-url", (req, res) => {
    memoryStore.codeVerifier = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    const codeChallenge = createHash("sha256")
      .update(memoryStore.codeVerifier, "ascii")
      .digest("base64url");

    const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect_uri}&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    res.send({ url });
  });

  app.get("/token", (req, res) => {
    res.send({
      accessToken: memoryStore.accessToken,
      isAuthenticated: !!memoryStore.accessToken,
    });
  });

  return app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
