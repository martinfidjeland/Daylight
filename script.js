console.log(`This application is inspired by Bakken & Bæcks' Daylight.`);

function load() {
  let long;
  let lat;
}

const title = document.getElementById("title");
const subtitle = document.getElementById("sub-title");
const rises = document.getElementById("rises");
const sets = document.getElementById("sets");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    long = position.coords.longitude;
    lat = position.coords.latitude;

    const date = new Date();
    const dateString = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    const yesterdayDateString = new Date(
      date.setDate(date.getDate() + 1) - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    let offset = date.getTimezoneOffset() / -60;
    offset = `0${offset}:00`;

    const proxy = "https://cors-anywhere.herokuapp.com/";

    Promise.all([
      fetch(
        `https://api.met.no/weatherapi/sunrise/2.0/.json?lat=${lat}&lon=${long}&date=${dateString}&offset=${offset}`
      ).then((response) => response.json()),
      fetch(
        `https://api.met.no/weatherapi/sunrise/2.0/.json?lat=${lat}&lon=${long}&date=${yesterdayDateString}&offset=${offset}`
      ).then((response) => response.json()),
    ]).then((data) => {
      const sunriseToday = data[0].location.time[0].sunrise.time
        .slice(11, -9)
        .replace(/:/, "");
      const sunsetToday = data[0].location.time[0].sunset.time
        .slice(11, -9)
        .replace(/:/, "");
      const sunriseYesterday = data[1].location.time[0].sunrise.time
        .slice(11, -9)
        .replace(/:/, "");
      const sunsetYesterday = data[1].location.time[0].sunset.time
        .slice(11, -9)
        .replace(/:/, "");

      let diff =
        +sunsetYesterday - +sunriseYesterday - (+sunsetToday - +sunriseToday);

      if (diff < 0) {
        diff = Math.abs(diff);
      }

      let min;

      if (diff === 1) {
        min = `${diff} minute`;
      } else {
        min = `${diff} minutes`;
      }

      if (+sunsetYesterday - +sunriseYesterday < +sunsetToday - +sunriseToday) {
        title.innerHTML = `Today we lost ${min} of sunlight.`;
      } else {
        title.innerHTML = `Today we gained ${min} of additional sunshine.`;
      }

      rises.innerHTML = data[0].location.time[0].sunrise.time.slice(11, -9);
      sets.innerHTML = data[0].location.time[0].sunset.time.slice(11, -9);
    });
  });
}

navigator.permissions &&
  navigator.permissions
    .query({
      name: "geolocation",
    })
    .then(function (PermissionStatus) {
      if (PermissionStatus.state == "granted") {
      } else if (PermissionStatus.state == "prompt") {
        title.innerHTML =
          "Location must be enabled for this application to work.";
      }
    });
