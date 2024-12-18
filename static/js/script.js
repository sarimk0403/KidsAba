let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
let patients = JSON.parse(localStorage.getItem('patients')) || [];

function formatTime(time) {
    // time format will be "7:00" or "19:15" from the dropdown
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour, 10);
    const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12; // Convert 24h to 12h
    const period = hourInt >= 12 ? "PM" : "AM"; // Determine AM or PM
    return `${formattedHour}:${minute} ${period}`;
}

function normalizeTimeRange(time) {
    return time
        .replace(/:00/g, '') // Remove :00 from times like "7:00 AM" → "7 AM"
        .replace(/\s+/g, '') // Remove spaces between times
        .toLowerCase();      // Convert to lowercase
}

// Function to generate time slots dynamically
function generateTimeSlots(startHour, endHour, interval) {
    const times = [];
    let currentHour = startHour;
    let currentMinutes = 0;

    while (currentHour < endHour || (currentHour === endHour && currentMinutes === 0)) {
        const period = currentHour < 12 ? "AM" : "PM";
        const formattedHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const formattedMinutes = currentMinutes.toString().padStart(2, "0");
        times.push(`${formattedHour}:${formattedMinutes} ${period}`);

        currentMinutes += interval;
        if (currentMinutes >= 60) {
            currentMinutes = 0;
            currentHour++;
        }
    }
    return times;
}

// Function to add availability fields
function addAvailabilityField(containerId) {
    const container = document.getElementById(containerId);

    const availabilityGroup = document.createElement("div");
    availabilityGroup.classList.add("availability-group");

    // Days Dropdown
    const daySelect = document.createElement("select");
    daySelect.classList.add("availability-day");
    daySelect.innerHTML = `
        <option value="">Select a day</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
    `;

    // Start Time Dropdown
    const startTimeSelect = document.createElement("select");
    startTimeSelect.classList.add("availability-start-time");
    startTimeSelect.innerHTML = generateTimeOptions();

    // End Time Dropdown
    const endTimeSelect = document.createElement("select");
    endTimeSelect.classList.add("availability-end-time");
    endTimeSelect.innerHTML = generateTimeOptions();

    availabilityGroup.appendChild(daySelect);
    availabilityGroup.appendChild(startTimeSelect);
    availabilityGroup.appendChild(endTimeSelect);
    container.appendChild(availabilityGroup);
}

// Function to generate time options (7:00 AM - 7:00 PM with 15-min intervals)
function generateTimeOptions() {
    const options = [];
    let currentHour = 7; // Start at 7:00 AM
    let currentMinutes = 0;

    while (currentHour < 19 || (currentHour === 19 && currentMinutes === 0)) {
        const period = currentHour < 12 ? "AM" : "PM";
        const formattedHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const formattedMinutes = currentMinutes.toString().padStart(2, "0");
        options.push(
            `<option value="${formattedHour}:${formattedMinutes} ${period}">${formattedHour}:${formattedMinutes} ${period}</option>`
        );

        currentMinutes += 15; // Increment by 15 minutes
        if (currentMinutes >= 60) {
            currentMinutes = 0;
            currentHour++;
        }
    }
    return options.join('');
}


// Function to add a doctor
function addDoctor() {
    const name = document.getElementById("doctorName").value;
    const position = document.getElementById("doctorPosition").value;
    const color = document.getElementById("doctorColor").value; // Get the selected color
    const availabilityElements = document.getElementById("doctorAvailabilityContainer").getElementsByClassName("availability-group");

    // Ensure all fields are filled
    if (!name || !position || availabilityElements.length === 0) {
        alert("Please fill in all fields.");
        return;
    }

    let availability = [];
    for (let element of availabilityElements) {
        const day = element.querySelector(".availability-day").value;
        const startTime = normalizeTimeRange(element.querySelector(".availability-start-time").value);
        const endTime = normalizeTimeRange(element.querySelector(".availability-end-time").value);

        if (day && startTime && endTime) {
            availability.push(`${day} ${startTime}-${endTime}`);

        } else {
            alert("Please complete all availability fields.");
            return;
        }
        
    }

    const newDoctor = { name, position, color, availability}; // Store color and availability as properties
    doctors.push(newDoctor);
    localStorage.setItem('doctors', JSON.stringify(doctors));

    displayDoctors();
    document.getElementById("doctorForm").reset();
    document.getElementById("doctorAvailabilityContainer").innerHTML = "";
}

// Function to add a patient
function addPatient() {
    const name = document.getElementById("patientName").value;
    const availabilityElements = document.getElementById("patientAvailabilityContainer").getElementsByClassName("availability-group");

    // Ensure all fields are filled
    if (!name || availabilityElements.length === 0) {
        alert("Please fill in all fields.");
        return;
    }

    let availability = [];
    for (let element of availabilityElements) {
        const day = element.querySelector(".availability-day").value;
        const startTime = normalizeTimeRange(element.querySelector(".availability-start-time").value);
        const endTime = normalizeTimeRange(element.querySelector(".availability-end-time").value);

        if (day && startTime && endTime) {
            availability.push(`${day} ${startTime}-${endTime}`);

        } else {
            alert("Please complete all availability fields.");
            return;
        }
        
    }

    const newPatient = { name, availability }; // Store availability as an array
    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));

    displayPatients();
    document.getElementById("patientForm").reset();
    document.getElementById("patientAvailabilityContainer").innerHTML = "";
}

// // Function to delete a doctor
// function deleteDoctor(index) {
//     if (confirm("Are you sure you want to delete this doctor?")) {
//         doctors.splice(index, 1);
//         localStorage.setItem('doctors', JSON.stringify(doctors));
//         displayDoctors();
//     }
// }

// // Function to delete a patient
// function deletePatient(index) {
//     if (confirm("Are you sure you want to delete this patient?")) {
//         patients.splice(index, 1);
//         localStorage.setItem('patients', JSON.stringify(patients));
//         displayPatients();
//     }
// }

// Function to delete a doctor
function deleteDoctor(index) {
    doctors.splice(index, 1); // Remove the doctor from the array
    localStorage.setItem('doctors', JSON.stringify(doctors)); // Update localStorage
    displayDoctors(); // Refresh the displayed list
}

// Function to delete a patient
function deletePatient(index) {
    patients.splice(index, 1); // Remove the patient from the array
    localStorage.setItem('patients', JSON.stringify(patients)); // Update localStorage
    displayPatients(); // Refresh the displayed list
}

// Display doctors
function displayDoctors() {
    const doctorList = document.getElementById('doctorList');
    doctorList.innerHTML = '<h3>Doctors</h3>';
    doctors.forEach((doctor, index) => {
        // Convert availability to a comma-separated string if it's an array
        let availabilityDisplay = Array.isArray(doctor.availability) ? doctor.availability.join(', ') : doctor.availability;

        doctorList.innerHTML += `
            <div>
                <p>${doctor.name} - ${doctor.position} - ${availabilityDisplay}</p>
                <button onclick="deleteDoctor(${index})">Delete</button>
            </div>
        `;
    });
}

// Display patients
function displayPatients() {
    const patientList = document.getElementById('patientList');
    patientList.innerHTML = '<h3>Patients</h3>';
    patients.forEach((patient, index) => {
        // Convert availability to a comma-separated string if it's an array
        let availabilityDisplay = Array.isArray(patient.availability) ? patient.availability.join(', ') : patient.availability;

        patientList.innerHTML += `
            <div>
                <p>${patient.name} - ${availabilityDisplay}</p>
                <button onclick="deletePatient(${index})">Delete</button>
            </div>
        `;
    });
}

// Initialize display
displayDoctors();
displayPatients();
