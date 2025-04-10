const datum = document.getElementById("js--datum");
const energyButton = document.getElementById("js--energieVerbruikButton");
const cycleButton = document.getElementById("js--cycleButton");
const devicesButton = document.getElementById("js--manageDevicesButton");
const today = new Date();

let day = today.getDate();
let month = today.getMonth() + 1;
let year = today.getFullYear();

day = day < 10 ? '0' + day : day;
month = month < 10 ? '0' + month : month;
const formattedDate = `${day}/${month}/${year}`;

datum.innerText = formattedDate;

energyButton.addEventListener('click', () => {
    window.location.href = "energyusage.html";
})

cycleButton.addEventListener('click', () => {
    window.location.href = "daynight.html";
})

devicesButton.addEventListener('click', () => {
    window.location.href = "managedevices.html";
})