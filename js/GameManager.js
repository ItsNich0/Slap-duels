console.log("Script started")

const playbutton = document.getElementById("play-button");
const settingsButton = document.getElementById("settings-button");

playbutton.addEventListener("click", () => {
  console.log("play-button triggered");
});

settingsButton.addEventListener("click", () => {
  console.log("settings-button triggered");
})
