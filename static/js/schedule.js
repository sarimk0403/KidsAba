// schedule.js

let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
let patients = JSON.parse(localStorage.getItem('patients')) || [];

// Setup an empty schedule
function setupEmptySchedule() {
    const scheduleTableBody = document.getElementById("scheduleTable").querySelector("tbody");
    const hours = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
    scheduleTableBody.innerHTML = '';
    
    hours.forEach(hour => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${hour}</td>` + "<td></td>".repeat(5);
        scheduleTableBody.appendChild(row);
    });
}

// Define colors for each doctor
// const doctorColors = {
//     "Sarim Khan": "lightcoral",
//     "Lesli": "lightblue",
//     "Jenny": "lightgreen",
//     "Mo": "lightpurple",
//     "AL": "lightyellow"
// };

// Generate the schedule by matching doctors and patients based on availability overlap
// Generate the schedule by matching doctors and patients based on availability overlap
function generateSchedule() {
    console.log("generateSchedule button clicked");
    setupEmptySchedule(); // Clear and reset the table

    const scheduleTableBody = document.getElementById("scheduleTable").querySelector("tbody");
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let unscheduledPatients = [];
    let unscheduledDoctors = [];

    // Track each doctor's scheduled hours, reset for each generation
    let doctorScheduleTracker = doctors.map(doctor => {
        return {
            ...doctor,
            scheduledHours: 0,
            totalHours: doctor.availability.reduce((total, slot) => {
                const [day, timeRange] = slot.split(' ');
                const [startTime, endTime] = timeRange.split('-');
                return total + (parseTime(endTime) - parseTime(startTime));
            }, 0)
        };
    });

    // Shuffle the doctorScheduleTracker array to introduce randomness
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Shuffle doctors to start with a different random order each time
    shuffle(doctorScheduleTracker);

    // Iterate over each patient to find scheduling opportunities
    patients.forEach(patient => {
        console.log(`Scheduling patient: ${patient.name}`);
        let hoursScheduled = 0;

        patient.availability.forEach(patientSlot => {
            const [patientDay, patientTimeRange] = patientSlot.split(' ');
            const [patientStartTime, patientEndTime] = patientTimeRange.split('-');
            let patientStartHour = parseTime(patientStartTime);
            let patientEndHour = parseTime(patientEndTime);
            let hoursNeeded = patientEndHour - patientStartHour;

            if (isNaN(patientStartHour) || isNaN(patientEndHour)) {
                console.error(`Invalid time range for patient ${patient.name}: ${patientSlot}`);
                return; // Skip if time parsing fails
            }

            // Find the day index for column matching
            let dayIndex = days.indexOf(patientDay);
            if (dayIndex === -1) {
                console.error(`Invalid day for patient availability: ${patientDay}`);
                return;
            }

            // Randomly select a doctor for the entire patient session, if possible
            for (let hour = patientStartHour; hour < patientEndHour; hour++) {
                let row = Array.from(scheduleTableBody.rows).find(row => parseTime(row.cells[0].innerText) === hour);

                if (row && row.cells[dayIndex + 1].innerHTML === "") {
                    // Find all available doctors for this time slot and day
                    let availableDoctors = doctorScheduleTracker.filter(doctor => {
                        return doctor.availability.some(doctorSlot => {
                            const [doctorDay, doctorTimeRange] = doctorSlot.split(' ');
                            const [doctorStartTime, doctorEndTime] = doctorTimeRange.split('-');
                            let doctorStartHour = parseTime(doctorStartTime);
                            let doctorEndHour = parseTime(doctorEndTime);
                            return (
                                doctorDay === patientDay &&
                                doctorStartHour <= hour &&
                                doctorEndHour > hour &&
                                doctor.scheduledHours < doctor.totalHours
                            );
                        });
                    });

                    if (availableDoctors.length > 0) {
                        // Randomly select a doctor from available doctors
                        let selectedDoctor = availableDoctors[Math.floor(Math.random() * availableDoctors.length)];

                        console.log(`Assigning ${patient.name} to ${selectedDoctor.name} at ${hour} on ${patientDay}`);

                        // Assign color to the cell based on the doctor's color property
                        let doctorColor = selectedDoctor.color || "lightgrey";

                        // Update the cell's content and color
                        row.cells[dayIndex + 1].innerHTML = `
                            <span style="font-size: larger;">
                                ${patient.name}
                            </span><br>
                            <span style="font-size: small;">${selectedDoctor.name}</span>
                        `;
                        row.cells[dayIndex + 1].style.backgroundColor = doctorColor;

                        selectedDoctor.scheduledHours++;
                        hoursScheduled++;
                    }
                }
            }
        });

        // Check if the patient still has unscheduled hours
        let remainingHours = patient.availability.reduce((total, slot) => {
            const [day, timeRange] = slot.split(' ');
            const [startTime, endTime] = timeRange.split('-');
            return total + (parseTime(endTime) - parseTime(startTime));
        }, 0) - hoursScheduled;

        if (remainingHours > 0) {
            unscheduledPatients.push({ name: patient.name, remainingHours: remainingHours });
        }
    });

    // After attempting to schedule, check for unscheduled doctors
    doctorScheduleTracker.forEach(doctor => {
        let remainingHours = doctor.totalHours - doctor.scheduledHours;
        if (remainingHours > 0) {
            unscheduledDoctors.push({ name: doctor.name, remainingHours: remainingHours });
        }
    });

    // Display unscheduled patients and their remaining hours
    displayUnscheduledPatients(unscheduledPatients);

    // Display unscheduled doctors and their remaining hours
    displayUnscheduledDoctors(unscheduledDoctors);
}

// Helper function to parse time (e.g., "8:00 AM" => 8)
function parseTime(time) {
    if (!time) {
        console.error("parseTime() received an invalid time:", time);
        return -1;  // Return a default error value
    }

    time = time.toUpperCase().replace(/\s+/g, '');  // Remove spaces and convert to uppercase
    if (time.includes('AM') || time.includes('PM')) {
        time = time.replace(/(AM|PM)/, ' $1');  // Add space before AM/PM if missing, e.g., "8AM" to "8 AM"
    }

    const [hour, period] = time.split(' ');
    let [h, m] = hour.includes(':') ? hour.split(':') : [hour, "00"];
    h = parseInt(h, 10);
    if (period === 'PM' && h !== 12) {
        h += 12; // Convert PM times to 24-hour format
    } else if (period === 'AM' && h === 12) {
        h = 0; // Midnight is 0
    }
    return h;
}

// Function to display unscheduled patients and their remaining hours
function displayUnscheduledPatients(unscheduledPatients) {
    const unscheduledSection = document.getElementById("unscheduledPatients");
    unscheduledSection.innerHTML = '<h3>Unscheduled Patients and Remaining Hours</h3>';

    if (unscheduledPatients.length === 0) {
        unscheduledSection.innerHTML += '<p>All patients have been scheduled.</p>';
    } else {
        unscheduledPatients.forEach(patient => {
            unscheduledSection.innerHTML += `
                <p>${patient.name} - Remaining Hours: ${patient.remainingHours}</p>
            `;
        });
    }
}

// Function to display unscheduled doctors and their remaining hours
function displayUnscheduledDoctors(unscheduledDoctors) {
    const unscheduledSection = document.getElementById("unscheduledDoctors");
    unscheduledSection.innerHTML = '<h3>Unscheduled Doctors and Remaining Hours</h3>';

    if (unscheduledDoctors.length === 0) {
        unscheduledSection.innerHTML += '<p>All doctors have been fully scheduled.</p>';
    } else {
        unscheduledDoctors.forEach(doctor => {
            unscheduledSection.innerHTML += `
                <p>${doctor.name} - Remaining Hours: ${doctor.remainingHours}</p>
            `;
        });
    }
}

// Initial empty schedule display
document.addEventListener("DOMContentLoaded", setupEmptySchedule);
