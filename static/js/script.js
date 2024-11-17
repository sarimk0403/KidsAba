let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
let patients = JSON.parse(localStorage.getItem('patients')) || [];

// Function to add availability fields
function addAvailabilityField(containerId) {
    const container = document.getElementById(containerId);

    const availabilityGroup = document.createElement("div");
    availabilityGroup.classList.add("availability-group");

    const daySelect = document.createElement("select");
    daySelect.classList.add("availability-day");
    daySelect.innerHTML = `
        <option value="">Select a day</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
    `;

    const startTimeSelect = document.createElement("select");
    startTimeSelect.classList.add("availability-start-time");
    startTimeSelect.innerHTML = `
        <option value="">Start Time</option>
        <option value="8am">8:00 AM</option>
        <option value="9am">9:00 AM</option>
        <option value="10am">10:00 AM</option>
        <option value="11am">11:00 AM</option>
        <option value="12pm">12:00 PM</option>
        <option value="1pm">1:00 PM</option>
        <option value="2pm">2:00 PM</option>
        <option value="3pm">3:00 PM</option>
        <option value="4pm">4:00 PM</option>
        <option value="5pm">5:00 PM</option>
    `;

    const endTimeSelect = document.createElement("select");
    endTimeSelect.classList.add("availability-end-time");
    endTimeSelect.innerHTML = `
        <option value="">End Time</option>
        <option value="9am">9:00 AM</option>
        <option value="10am">10:00 AM</option>
        <option value="11am">11:00 AM</option>
        <option value="12pm">12:00 PM</option>
        <option value="1pm">1:00 PM</option>
        <option value="2pm">2:00 PM</option>
        <option value="3pm">3:00 PM</option>
        <option value="4pm">4:00 PM</option>
        <option value="5pm">5:00 PM</option>
        <option value="6pm">6:00 PM</option>
    `;

    availabilityGroup.appendChild(daySelect);
    availabilityGroup.appendChild(startTimeSelect);
    availabilityGroup.appendChild(endTimeSelect);
    container.appendChild(availabilityGroup);
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
        const startTime = element.querySelector(".availability-start-time").value;
        const endTime = element.querySelector(".availability-end-time").value;

        if (day && startTime && endTime) {
            availability.push(`${day.trim()} ${startTime.trim()}-${endTime.trim()}`);
        } else {
            alert("Please complete all availability fields.");
            return;
        }
    }

    const newDoctor = { name, position, color, availability: availability }; // Store color and availability as properties
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
        const startTime = element.querySelector(".availability-start-time").value;
        const endTime = element.querySelector(".availability-end-time").value;

        if (day && startTime && endTime) {
            availability.push(`${day.trim()} ${startTime.trim()}-${endTime.trim()}`);
        } else {
            alert("Please complete all availability fields.");
            return;
        }
    }

    const newPatient = { name, availability: availability }; // Store availability as an array
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
