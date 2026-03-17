import http from "http";
import app from "./app";
import { db } from "./config/db";
import { initSocket } from "./socket";

const PORT = Number(process.env.PORT || 5001);

async function start() {
  const conn = await db.getConnection();
  conn.release();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});