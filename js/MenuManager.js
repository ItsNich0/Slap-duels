console.log("Menu manager has launched")

const playbutton = document.getElementById("play-button");
const settingsButton = document.getElementById("settings-button");
const nameinput = document.getElementById("name-input");

playbutton.addEventListener("click", () => {
  if (nameinput.value.length < 3 && !localStorage.getItem("Nickname"))
  {
    alert("enter a name that is at least 3 characters long!");
    return;
  }
  localStorage.setItem("Nickname", name);
  console.log("play-button triggered");
  window.location.href="Game.html";
});

settingsButton.addEventListener("click", () => {
  console.log("settings-button triggered");
})
