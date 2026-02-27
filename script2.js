const API_KEY = "a7a990f68cd6947140dfb923a0a8ea1b"; 

// This is an Object (very similar to nested C structures or multi-dimensional arrays).
// It holds State -> District -> Local Areas.
const locationDatabase = {
    "Uttarakhand": {
        "Dehradun": ["Dehradun", "Mussoorie", "Rishikesh", "Nala", "Manduwala", "Naugaon", "Prem Nagar"],
        "Haridwar": ["Haridwar", "Roorkee", "Laksar"],
        "Nainital": ["Nainital", "Haldwani", "Ramnagar"]
    },
    "Himachal Pradesh": {
        "Shimla": ["Shimla", "Kufri", "Mashobra"],
        "Kullu": ["Kullu", "Manali", "Bhuntar"]
    },
    "Delhi": {
        "New Delhi": ["Connaught Place", "Chanakyapuri"],
        "North Delhi": ["Civil Lines", "Rohini"],
        "South Delhi": ["Saket", "Vasant Kunj"]
    },
    "Maharashtra": {
        "Mumbai": ["Mumbai", "Andheri", "Dharavi", "Bandra"],
        "Pune": ["Pune", "Shivajinagar", "Kothrud"]
    },
    "Rajasthan": {
        "Jaisalmer": ["Jaisalmer", "Pokhran"],
        "Jaipur": ["Jaipur", "Amer", "Malviya Nagar"]
    },
    "Uttar Pradesh": {
        "Agra": ["Agra", "Tajganj", "Fatehabad"],
        "Lucknow": ["Lucknow", "Gomti Nagar", "Hazratganj"]
    }
};

const stateSelect = document.getElementById("state-select");
const districtSelect = document.getElementById("district-select");
const localSelect = document.getElementById("local-select");
const btn = document.getElementById("check-btn");
const resultBox = document.getElementById("result-box");

// 1. When the page loads, fill the State dropdown
window.onload = () => {
    for (let state in locationDatabase) {
        let option = document.createElement("option");
        option.value = state;
        option.innerText = state;
        stateSelect.appendChild(option);
    }
};

// 2. When a State is chosen, unlock and fill the District dropdown
stateSelect.addEventListener("change", () => {
    districtSelect.innerHTML = '<option value="">Select District</option>';
    localSelect.innerHTML = '<option value="">Select Local Area</option>';
    localSelect.disabled = true;

    const selectedState = stateSelect.value;
    if (selectedState) {
        districtSelect.disabled = false;
        const districts = locationDatabase[selectedState];
        for (let district in districts) {
            let option = document.createElement("option");
            option.value = district;
            option.innerText = district;
            districtSelect.appendChild(option);
        }
    } else {
        districtSelect.disabled = true;
    }
});

// 3. When a District is chosen, unlock and fill the Local Area dropdown
districtSelect.addEventListener("change", () => {
    localSelect.innerHTML = '<option value="">Select Local Area</option>';
    
    const selectedState = stateSelect.value;
    const selectedDistrict = districtSelect.value;

    if (selectedDistrict) {
        localSelect.disabled = false;
        // This targets the exact array of local places based on what was clicked above
        const localAreas = locationDatabase[selectedState][selectedDistrict];
        for (let i = 0; i < localAreas.length; i++) {
            let option = document.createElement("option");
            option.value = localAreas[i];
            option.innerText = localAreas[i];
            localSelect.appendChild(option);
        }
    } else {
        localSelect.disabled = true;
    }
});

// 4. When the button is clicked, fetch the weather data
btn.addEventListener("click", () => {
    const finalLocation = localSelect.value;

    if (!finalLocation) {
        alert("Please select a State, District, and Local Area.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${finalLocation},IN&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "404") {
                alert("Weather data not available for this specific local area. Try the main district.");
                return;
            }

            const temp = data.main.temp;
            const humidity = data.main.humidity;
            const weatherCondition = data.weather[0].main.toLowerCase();

            let rainAmount = 0;
            if (data.rain && data.rain["1h"]) {
                rainAmount = data.rain["1h"];
            }

            document.getElementById("location-name").innerText = "Location: " + data.name;
            document.getElementById("temp").innerText = temp;
            document.getElementById("humidity").innerText = humidity;
            document.getElementById("rain-data").innerText = rainAmount;

            calculateRisks(finalLocation.toLowerCase(), temp, humidity, rainAmount, weatherCondition);
            
            resultBox.classList.remove("hidden");
        })
        .catch(error => {
            alert("Error fetching data. Check your API key and connection.");
        });
});

// 5. The risk calculation logic
function calculateRisks(city, temp, humidity, rain, condition) {
    let fireRisk = "LOW ✅";
    if (temp > 35 && humidity < 30) fireRisk = "HIGH DANGER 🚨";
    else if (temp > 30 && humidity < 40) fireRisk = "MODERATE ⚠️";
    document.getElementById("fire-risk").innerText = fireRisk;

    let floodRisk = "LOW ✅";
    if (rain > 10 || condition.includes("thunderstorm") || condition.includes("extreme")) {
        floodRisk = "HIGH DANGER 🚨";
    } else if (rain > 2 || condition.includes("rain")) {
        floodRisk = "MODERATE ⚠️";
    }
    document.getElementById("flood-risk").innerText = floodRisk;

    // I have updated the hilly array to include the new locations from the database
    const hillyPlaces = ["dehradun", "mussoorie", "rishikesh", "nala", "manduwala", "naugaon", "nainital", "shimla", "kufri", "manali", "kullu"];
    let landslideRisk = "LOW ✅";
    let isHilly = false;

    for (let i = 0; i < hillyPlaces.length; i++) {
        if (hillyPlaces[i] === city) {
            isHilly = true;
            break;
        }
    }

    if (isHilly && (rain > 5 || condition.includes("rain"))) {
        landslideRisk = "HIGH DANGER 🚨";
    } else if (isHilly) {
        landslideRisk = "MODERATE ⚠️ (Hilly Terrain)";
    } else {
        landslideRisk = "LOW ✅ (Plain Terrain)";
    }
    document.getElementById("landslide-risk").innerText = landslideRisk;
}