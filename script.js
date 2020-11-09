function load() {
    let long;
    let lat;
}

console.log(`This application is inspired by Bakken & Bæcks' Daylight.`);

const headerTitle = document.getElementById('header-title');
const headerSubtitle = document.getElementById('header-subtitle');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        long = position.coords.longitude;
        lat = position.coords.latitude;

        const date = new Date();
        const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
        const tomorrowDateString = new Date(date.setDate(date.getDate() + 1) - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

        let offset = (date.getTimezoneOffset() / -60);
        offset = `0${offset}:00`;

        const proxy = 'https://cors-anywhere.herokuapp.com/';

        Promise.all([
            fetch(`https://api.met.no/weatherapi/sunrise/2.0/.json?lat=${lat}&lon=${long}&date=${dateString}&offset=${offset}`).then(response => response.json()),
            fetch(`https://api.met.no/weatherapi/sunrise/2.0/.json?lat=${lat}&lon=${long}&date=${tomorrowDateString}&offset=${offset}`).then(response => response.json())

        ]).then(data => {
            const sunriseToday = data[0].location.time[0].sunrise.time.slice(11, -9).replace(/:/, '');
            const sunsetToday = data[0].location.time[0].sunset.time.slice(11, -9).replace(/:/, '');
            const sunriseTomorrow = data[1].location.time[0].sunrise.time.slice(11, -9).replace(/:/, '');
            const sunsetTomorrow = data[1].location.time[0].sunset.time.slice(11, -9).replace(/:/, '');

            let today = +sunsetToday - +sunriseToday;
            let tomorrow = +sunsetTomorrow - +sunriseTomorrow;
            let diff = tomorrow - today;

            let y;

            if (diff < 0) {
                y = Math.abs(diff);
            }

            let min;
            let isAre;

            if (y === 1) {
                min = `${y} minute`;
                isAre = 'is'
            } else {
                min = `${y} minutes`;
                isAre = 'are'
            }

            if (today > tomorrow) {
                headerTitle.innerHTML = `Tomorrow there ${isAre} ${min} less sunlight than today.`;
            } else {
                headerTitle.innerHTML = `Tomorrow there ${isAre} ${min} more sunlight than today.`;
            }

            document.getElementById('header-subtitle').innerHTML = `The sun rises at ${data[0].location.time[0].sunrise.time.slice(11, -9)} today and sets at ${data[0].location.time[0].sunset.time.slice(11, -9)}.`;
        });
    });
} 

navigator.permissions && navigator.permissions.query({
    name: 'geolocation'
}) .then(function (PermissionStatus) {
    if (PermissionStatus.state == 'granted') {
    } else if (PermissionStatus.state == 'prompt') {
        headerTitle.innerHTML = 'Location must be enabled for this application to work.';
    }
})
