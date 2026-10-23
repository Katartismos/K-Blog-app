import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY || "",
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: 30,
      max: 10,
    }),
  ],
});
