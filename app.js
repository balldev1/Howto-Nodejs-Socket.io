const httpServer = require("http").createServer((req, res) => {
  res.statusCode = 400;
  res.setHeader("Content-Type", "text/plain");
  res.end("This endpoint only support WebSocket conections");
});

httpServer.listen(3000);

const options = {
  /* */
};

const io = require("socket.io")(httpServer, options);

// *** connect serrev
io.on("connection", (socket) => {
  console.log("Hello Server" + socket.id);

  // event
  socket.on("send", (data) => {
    console.log(data);
  });

  // sendemit === event
  // response === listen
  socket.on("sendemit", (data) => {
    io.emit("response", data);
  });

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });
});

// *** namespace => local/chat
const ChatNameSpace = io.of("/chat");
ChatNameSpace.on("connection", (socket) => {
  // message === event
  socket.on("message", (data) => {
    ChatNameSpace.emit("message", data);
  });
});

// *** QueryParams => local/chat
// socket.handshake.query; === number params
const QueryParams = io.of("/query");
QueryParams.on("connection", (socket) => {
  // QueryParams
  const { room } = socket.handshake.query;
  if (room == undefined) {
    console.log("Not room");
  } else {
    console.log(room);
  }

  // message === event
  socket.on("message", (data) => {
    QueryParams.emit("message", data);
  });
});

// *** HeaderAuthen => local/chat
// socket.handshake.query; === number params
const HeaderAuthen = io.of("/header");

HeaderAuthen.use((socket, next) => {
  // Headers ตรวจสอบ auth ถ้าไม่ใช่ ให้ log
  const token = socket.request.headers["authorization"];
  if (token != "tokentest") {
    console.log("token is not valid");
    return;
  } else {
    next();
  }
});

HeaderAuthen.on("connection", (socket) => {
  // log header.auth
  const token = socket.request.headers["authorization"];

  console.log(token);
  // message === event
  socket.on("message", (data) => {
    QueryParams.emit("message", data);
  });
});
