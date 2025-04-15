function to24Hour(timeString) {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes, seconds] = time.split(":");

    hours = parseInt(hours, 10);

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function returnLatLng(callback) {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        console.log([lat, long]);
        callback([lat, long]);
    }, (error) => {
        console.error("Geolocation error:", error);
        callback([null, null]);
    })
}

async function fetchSunData(lat, lng) {
    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            const sunrise = data.results.sunrise;
            const sunset = data.results.sunset;

            return [sunrise, sunset];
        } else {
            console.error("API error:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function fetchDailyMinMaxCurrent(lat, lon) {
    const apiKey = "ttK662DmZBZaDND9LCsYwqwgdDM2myDs";

    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 1);

    const startTime = startDate.toISOString();
    const endTime = endDate.toISOString();

    const url = `https://api.tomorrow.io/v4/timelines?location=${lat},${lon}&fields=temperature&timesteps=1h&startTime=${startTime}&endTime=${endTime}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const intervals = data?.data?.timelines?.[0]?.intervals;

        if (intervals && intervals.length > 0) {
            const temps = intervals.map(i => i.values.temperature);
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);

            const currentHourIso = new Date().toISOString().slice(0, 13);
            const currentInterval = intervals.find(i => i.startTime.startsWith(currentHourIso));
            const currentTemp = currentInterval ? currentInterval.values.temperature : null;

            return { minTemp, maxTemp, currentTemp };
        } else {
            console.error("No temperature data found:", data);
            return null;
        }
    } catch (err) {
        console.error("Fetch error:", err);
        return null;
    }
}

async function translateString(stringToTranslate) //werkt slecht, niet gebruikt
{
    const translateUrl = "https://libretranslate.de/translate"; //geen andere betere api, alles $$$

    try {
        const translateResponse = await fetch(translateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: stringToTranslate,
                source: "en",
                target: "nl",
                format: "text"
            })
        });
    
        if (!translateResponse.ok) throw new Error("Failed to translate");
    
        const translatedData = await translateResponse.json();
        return translatedData.translatedText;
    } catch (err) {
        return "Error translating";
    }
}

async function fetchDailyFact()
{
    const apiKey = "Azjol0CdhtrDliiytSs/eQ==qG902L3DmgZr8aZ0";
    const url = "https://api.api-ninjas.com/v1/facts";

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-Api-Key': apiKey },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data[0].fact);
        return data[0].fact;
    } catch (error) {
        console.error('Error fetching the fact:', error.message);
        return "Error fetching response.";
    }
}

const leukeWeetjesFeit = document.getElementById("leuke-weetjes-feit");

function changeDailyFact() {
    fetchDailyFact().then(fact => {
        leukeWeetjesFeit.textContent = fact;
    });
}

changeDailyFact();

const moonTime = document.getElementById("moonTime");
const sunTime = document.getElementById("sunTime");

const moonTemp = document.getElementById("moonTemp");
const sunTemp = document.getElementById("sunTemp");

const currentTemp = document.getElementById("huidigeTemp");

function updateOpkomstOndergang() {
    returnLatLng(async ([lat, lon]) => {
        const [sunrise, sunset] = await fetchSunData(lat, lon);
    
        sunTime.textContent = to24Hour(sunrise);
        moonTime.textContent = to24Hour(sunset);

        fetchDailyMinMaxCurrent(lat, lon).then(data => {
            if (data) {
                sunTemp.textContent = data.maxTemp+"°C";
                moonTemp.textContent = data.minTemp+"°C";
                currentTemp.textContent = data.currentTemp+"°C";
            }
        });        
    });
}


updateOpkomstOndergang();

const tempInput = document.getElementById('tempInput');
const tempOverlay = document.querySelector('.red-overlay');
const tempGevoel = document.getElementById('tempGevoel');
huidigeTemp = 12;

function temperatuurVeranderd(temp, anim) {
    if(anim == true)
    {
        const nieuweGevoel = temp > huidigeTemp ? "Opwarmen" : "Koelen";
        tempGevoel.classList.add('fade-out');

        setTimeout(() => {
            tempGevoel.textContent = nieuweGevoel;
            tempGevoel.classList.remove('fade-out');
            tempGevoel.classList.add('fade-in');

            setTimeout(() => {
                tempGevoel.classList.remove('fade-in');
            }, 500);
        }, 500);

        if (huidigeTemp < temp) {
            tempOverlay.style.opacity = '1';
        } else if(huidigeTemp > temp) {
            tempOverlay.style.opacity = '0';
        }
    } else {
        tempInput.value = temp;
    }

    huidigeTemp = temp;
}

tempInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      this.blur();
      temperatuurVeranderd(parseFloat(tempInput.value), true);
    }
});

fetch('json/energy.json') //grafiek
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById('energyChart').getContext('2d');
    const times = data.energy_consumption.map(entry => entry.time);
    const values = data.energy_consumption.map(entry => entry.value);

    new Chart(ctx, {
        type: 'line',
        data: {
          labels: times,
          datasets: [{
            data: values,
            borderColor: 'white',
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2, // curves border thick/thin
            tension: 0.2 // curves bordering smooth or spiky
          }]          
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },          
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });      
  });

  fetch('json/energy.json') //zonnepanelen
  .then(res => res.json())
  .then(data => {
    const maxKwh = 240;
    const container = document.getElementById('staafjes');
    container.innerHTML = '';

    data.zonnepanelen.forEach(entry => {
      const heightPercent = (entry.value / maxKwh) * 100;

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'flex-end';
      wrapper.style.height = '100%';

      const label = document.createElement('div');
      label.innerHTML = `<strong>${entry.month}.</strong><br>${entry.value}`;
      label.style.fontSize = '12px';
      label.style.color = 'white';
      label.style.marginBottom = '6px';
      label.style.textAlign = 'center';

      const bar = document.createElement('div');
      bar.classList.add('staaf');
      bar.style.height = `${heightPercent}%`;

      wrapper.appendChild(label);
      wrapper.appendChild(bar);
      container.appendChild(wrapper);
    });
  });

const creditsTime = document.getElementById("creditsTime");
function updateCreditsTime(){
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    creditsTime.innerText = `${date} - ${time}`;
}

updateCreditsTime();
setInterval(updateCreditsTime, 1000);

function updateLightState(toggleId, isOn) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
    if (!["toggleButton1", "toggleButton2", "toggleButton3"].includes(toggleId)) return;

    if (toggle.checked !== isOn) {
        toggle.checked = isOn;

        toggle.dispatchEvent(new Event('change'));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const allToggles = document.querySelectorAll('.switch input[type="checkbox"]');
    const toggles = Array.from(allToggles).slice(0, 3); // only first 3 toggles

    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            const lightStates = toggles.map(t => t.checked ? 'HIGH' : 'LOW');

            console.log('Updated light states:', lightStates);

            fetch('post.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lights: lightStates.slice(0, 3)
                })
            })            
            .then(res => res.json())
            .then(data => {
                console.log('Server confirmed update:', data);
            })
            .catch(err => {
                console.error('Failed to update lights:', err);
            });
        });
    });
});
   
fetch('https://39702.hosts2.ma-cloud.nl/duurzaamhuis/post.php', {
    method: 'POST'
  })
  .then(res => res.json())
  .then(data => {
    //console.log('Fetched JSON:', data);
    temperatuurVeranderd(data.Temperature, false);
    data.lights.forEach((state, index) => {
      const toggleId = `toggleButton${index + 1}`;
      const isOn = state === 'HIGH';
      updateLightState(toggleId, isOn);
    });
  })
  .catch(err => console.error('Error fetching data:', err));  