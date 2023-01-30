const socket = io();

let currentRoom = "";
let loggedInUser = "";
let roomTitle = "";

// function to format the date.
// If the date is today, just return the time
$.date = function (dateObject) {
  let d = new Date(dateObject);
  let today = new Date();
  let date = "";

  if (
    !(
      d.getDate() == today.getDate() &&
      d.getMonth() == today.getMonth() &&
      d.getFullYear() == today.getFullYear()
    )
  ) {
    // message date is not today's date
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    if (day < 10) {
      day = "0" + day;
    }
    if (month < 10) {
      month = "0" + month;
    }

    date = day + "/" + month + "/" + year;
  }

  let time = d.toLocaleTimeString();

  return date + " " + time;
};

// extend jQuery to create a $.postJSON methoid that sets the content-type correctly,
// because $.post doesn't when the data is JSON
jQuery["postJSON"] = function (url, data, callback) {
  // shift arguments if data argument was omitted
  if (jQuery.isFunction(data)) {
    callback = data;
    data = undefined;
  }

  return jQuery.ajax({
    url: url,
    type: "POST",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: data,
    success: callback,
  });
};

// generic function that will render both historical messages from the db and live messages
function renderMessage(message) {
  let messageBoard = $(".chat-screen .message-board");
  let msgClass = "message other-message";
  if (loggedInUser == message.postedByUser.username) {
    msgClass = "message my-message";
  }
  $(messageBoard).append(
    $(
      '<div class="' +
        msgClass +
        '" id="' +
        message._id +
        '"><div class = "name">' +
        message.postedByUser.firstName +
        " " +
        message.postedByUser.lastName +
        '</div><div class = "text">' +
        message.message.messageText +
        "</div><div class = time>" +
        $.date(message.updatedAt) +
        "</div></div>"
    )
  );
}

// retrieve the chat history, and write to the chat room
function getChatHistory() {
  $.getJSON("/room/" + currentRoom + "?limit=20&page=0", function (data) {
    $.each(data.conversation, function (i, message) {
      renderMessage(message);
    });
  });
}

// "log" the user in, and set up the chat
function onLoginClick() {
  let username = $(".join-screen #username").val();
  let jqxhr = $.post("/auth/" + username)
    .done(function (data) {
      currentRoom = $("#rooms").val();
      roomTitle = $("#rooms option:selected").text();
      loggedInUser = username;

      // use a websocket to subscribe us to a socket room server side
      socket.emit("subscribe", username, currentRoom);

      // add the authorization token returned to the headers of all ajax calls to be made
      $.ajaxSetup({
        headers: { Authorization: "bearer " + data.authorization },
      });

      // switch "form" visibility
      $(".join-screen").removeClass("active");
      $(".chat-screen").addClass("active");

      // get the history for the room and render to screen
      getChatHistory();
    })
    .fail(function () {
      alert("unable to log you in. Please check your credentials.");
    });
}

// method to send post to the server for db storage and transmission to other users
function onSendMessageClick() {
  let message = $("#message-input");

  if (message.val().length == 0) {
    return;
  }

  let body = JSON.stringify({ messageText: message.val() });

  let jqxhr = $.postJSON("/room/" + currentRoom + "/message", body)
    .done(function (data) {
      message.val("");
    })
    .fail(function () {
      alert("unable to post message. Please try again.");
    });
}

// hook up button clicks
function addHandlers() {
  $("#login").click(onLoginClick);
  $("#send-message").click(onSendMessageClick);

  let dropdown = $("#rooms");
  dropdown.empty();

  $.getJSON("/room", function (data) {
    $.each(data.rooms, function (i, room) {
      dropdown.append($("<option></option>").val(room._id).html(room.roomName));
    });
  });

  dropdown.prop("selectedIndex", 0);
}

// listen for specific websocket messages
function wireWebSockets() {
  socket.on("greeting-from-server", function (message) {
    $("#message-from-server").html(message.greeting);
  });

  socket.on("new message", function (post) {
    renderMessage(post.message);
  });
}

$(document).ready(function () {
  addHandlers();
  wireWebSockets();
});
