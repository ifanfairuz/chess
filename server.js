const child_process = require("child_process");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const io = require("@pm2/io");
const app = express();
const port = 3000;

const stockfish = child_process.spawn("stockfish", { stdio: "pipe" });
stockfish.on("close", () => {
  console.log("close");
});

function stockfishSend(command, grep = "") {
  return new Promise((res) => {
    if (grep !== "") {
      stockfish.stdout.on("data", (data) => {
        const message = String(data);
        message.split("\n").forEach((msg) => {
          if (msg.includes(grep)) {
            stockfish.stdout.removeAllListeners("data");
            console.log(msg);
            res(msg);
          }
        });
      });
    }
    stockfish.stdin.write(Buffer.from(command + "\n", "utf-8"));
    if (grep == "") res("OK");
  });
}

const LastHitTime = io.metric({ name: "Last Hit Time", unit: "ms" });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("build"));

app.post("/find", (req, res) => {
  const t = Date.now();
  const depth = req.body.depth || 18;
  stockfishSend("position fen " + req.body.fen);
  stockfishSend("go depth " + depth, "bestmove ")
    .then((msg) => {
      res.send(msg.replace("bestmove ", "").substring(0, 5).trim());
      LastHitTime.set(Date.now() - t);
    })
    .catch((err) => console.error(err));
});

app.listen(port, () => {
  console.log(`Stockfish API listening on port ${port}`);
});
