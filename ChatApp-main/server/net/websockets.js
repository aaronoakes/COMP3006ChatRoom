// these are the websocket messages we expect to receive from the chat client
class WebSockets {
  connection(client) {
    // send welcome mmessage when a socket connection is made
    client.emit('greeting-from-server', {
      greeting: 'Welcome to ChatAarr'
    });

    // add identity of user mapped to the socket id
    client.on("subscribe", (username, roomId) => {
      client.join(roomId);
      // console.log("socks ", global.io.sockets.adapter.rooms);
    });
  }
}

export default new WebSockets();
