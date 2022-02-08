const socket = io();

const $submitMessage = document.querySelector("#submitMessage");
const $messages = document.querySelector("#messages");

//-------------TEMPLATES

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (locationMessage) => {

  const html = Mustache.render(locationMessageTemplate, {

    locationMessage: locationMessage.text,
    createdAt: moment(locationMessage.createdAt).format("h:mm a"),
    
  });

  $messages.insertAdjacentHTML("beforeend", html);
});

//options

const {} = {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});


// send a message to the server from input
const form = document.querySelector("#chatForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  $submitMessage.setAttribute("disabled", "disabled");

  const message = document.querySelector("#chatInput").value;

  socket.emit("sendMessage", message);

  $submitMessage.removeAttribute("disabled");

  document.querySelector("#chatInput").value = "";
  document.querySelector("#chatInput").focus();
});

const loc = document.querySelector("#sendLocation");

loc.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  loc.querySelector("button").textContent = "Sending Location...";

  navigator.geolocation.getCurrentPosition((position) => {
    loc.querySelector("button").textContent = "Send Location";
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
});

socket.emit("join", {username, room}, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});