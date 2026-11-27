const http = require("http");
const fs = require("fs");

const SYSTEM =
  "Sen 'AI Yordamchi' saytining yordamchisisan. Asosan o'zbek tilida javob ber. " +
  "Koreys tilini o'rgatganda har bir javobga o'zbekcha tarjima va qisqa grammatika izohi qo'sh.";

http
  .createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/chat") {
      let body = "";
      for await (const c of req) body += c;
      try {
        const { messages } = JSON.parse(body);
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-5-5",
            max_tokens: 1500,
            system: SYSTEM,
            messages,
          }),
        });
        const j = await r.json();
        const reply = j.content?.[0]?.text;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(reply ? { reply } : { error: j.error?.message || "Xatolik" }));
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Server xatosi" }));
      }
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(__dirname + "/index.html"));
  })
  .listen(process.env.PORT || 3000, () => console.log("Ishlayapti: port " + (process.env.PORT || 3000)));
