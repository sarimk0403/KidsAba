// schedule.js

let doctors = JSON.parse(localStorage.getItem('doctors')) || [];
let patients = JSON.parse(localStorage.getItem('patients')) || [];

// Function to generate time slots dynamically
function generateTimeSlots(startHour, endHour, interval) {
    const times = [];
    let currentHour = startHour;
    let currentMinutes = 0;

    while (currentHour < endHour || (currentHour === endHour && currentMinutes === 0)) {
        // Format time as 12-hour AM/PM
        const formattedTime = formatTime(currentHour, currentMinutes);
        times.push(formattedTime);

        // Increment time by the interval
        currentMinutes += interval;
        if (currentMinutes >= 60) {
            currentMinutes = 0;
            currentHour += 1;
        }
    }

    return times;
}

// Helper function to format time into 12-hour AM/PM format
function formatTime(hour, minutes) {
    const period = hour < 12 ? "AM" : "PM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinutes} ${period}`;
}


// Function to filter patients based on the selected day
function filterPatientsByDay(day) {
    return patients.filter(patient =>
        patient.availability.some(slot => {
            const availabilityDay = slot.split(' ')[0].trim().toLowerCase();
            return availabilityDay === day.toLowerCase();
        })
    );
}

function loadPatientsAndGenerateTable(day) {
    console.log(`Tab clicked: ${day}`);

    // Filter patients available on the selected day
    const filteredPatients = filterPatientsByDay(day);
    console.log("Filtered Patients:", filteredPatients);

    // Generate time slots (7:00 AM to 7:00 PM with 15-minute intervals)
    const times = generateTimeSlots(7, 19, 15);

    // Update Table Header with Filtered Patient Names
    const tableHeader = document.getElementById('tableHeader');
    tableHeader.innerHTML = `<th>Time</th>`; // Reset header
    filteredPatients.forEach(patient => {
        tableHeader.innerHTML += `<th>${patient.name}</th>`;
    });

    // Update Table Body with Time Rows
    const scheduleBody = document.getElementById('scheduleBody');
    scheduleBody.innerHTML = ''; // Clear previous rows

    times.forEach(time => {
        let row = `<tr><td>${time}</td>`; // Add time column
        filteredPatients.forEach(patient => {
            const isAvailable = checkAvailabilityForTime(patient, day, time);
            const cellStyle = isAvailable ? 'style="background-color: #d3d3d3;"' : '';
            row += `<td ${cellStyle}></td>`; // Add cell with lighter grey background if available
        });
        row += `</tr>`;
        scheduleBody.innerHTML += row; // Append row to table
    });
}

// Function to Check if Patient is Available at a Given Time
function checkAvailabilityForTime(patient, day, time) {
    const timeInMinutes = convertTimeToMinutes(time);

    console.log(`Checking availability for: ${patient.name}, Day: ${day}, Time: ${time} → ${timeInMinutes} minutes`);

    return patient.availability.some(slot => {
        // Split the slot into day and time range
        const normalizedSlot = slot.trim().replace(/\s*-\s*/g, '-').replace(/\s+/g, ' ');
    const [slotDay, timeRange] = normalizedSlot.split(' ');

    if (!slotDay || !timeRange) {
        console.error(`Failed to parse availability slot: ${slot}`);
        return false;
    }

        if (!slotDay || !timeRange) {
            console.warn(`Invalid slot format for patient ${patient.name}: ${slot}`);
            return false;
        }

        // Clean up spaces around the dash and split start/end times
        const cleanedTimeRange = timeRange.replace(/\s*-\s*/g, '-'); // Removes spaces around dash
        const [startTime, endTime] = cleanedTimeRange.split('-');

        if (!startTime || !endTime) {
            console.error(`Failed to parse start or end time for slot: ${slot}`);
            return false;
        }

        const startMinutes = convertTimeToMinutes(startTime);
        const endMinutes = convertTimeToMinutes(endTime);

        console.log(`Slot: ${slot}, Day: ${slotDay}, Start: ${startTime} (${startMinutes} min), End: ${endTime} (${endMinutes} min)`);

        if (isNaN(startMinutes) || isNaN(endMinutes)) {
            console.error(`Invalid time range: Start: ${startTime}, End: ${endTime}`);
            return false;
        }

        console.log(`Time Check: ${timeInMinutes} >= ${startMinutes} && ${timeInMinutes} < ${endMinutes}`);
        return slotDay.toLowerCase() === day.toLowerCase() && timeInMinutes >= startMinutes && timeInMinutes < endMinutes;
    });
}

// Helper Function: Convert Time to Minutes for Easy Comparison
function convertTimeToMinutes(time) {
    if (!time) {
        console.error("convertTimeToMinutes received invalid time:", time);
        return NaN;
    }

    const match = time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (!match) {
        console.error(`Invalid time format: ${time}`);
        return NaN;
    }

    let [_, hour, minutes, period] = match;
    hour = parseInt(hour, 10);
    minutes = parseInt(minutes || "0", 10);

    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    const totalMinutes = hour * 60 + minutes;
    console.log(`Parsed time: ${time} → ${totalMinutes} minutes`);
    return totalMinutes;
}

// function generateSchedule() {
//     const tableBody = document.getElementById('scheduleBody');
//     if (!tableBody) {
//         console.error("Table body not found!");
//         return;
//     }

//     tableBody.innerHTML = ''; // Clear the table

//     const day = "Monday"; // Dynamically set for selected day
//     const times = generateTimeSlots(7, 19, 15); // 7 AM - 7 PM
//     const filteredPatients = filterPatientsByDay(day);

//     // Build the table rows dynamically
//     times.forEach(time => {
//         let row = `<tr><td>${time}</td>`;

//         filteredPatients.forEach(patient => {
//             row += `<td id="${time}-${patient.name}" style="background-color: #2c2c2c;"></td>`;
//         });

//         row += '</tr>';
//         tableBody.insertAdjacentHTML('beforeend', row);
//     });

//     console.log("Schedule table regenerated.");

//     // Assign doctors to time slots
//     assignDoctorsToSchedule(times, filteredPatients);
// }

function generateSchedule() {
    const tableBody = document.getElementById('scheduleBody');
    const day = getCurrentDay(); // Retrieve the currently selected day
    const times = generateTimeSlots(7, 19, 15); // 7 AM - 7 PM, 15-minute intervals

    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }

    tableBody.innerHTML = ''; // Clear previous table rows

    // Filter patients and doctors based on the selected day
    const filteredPatients = patients.filter(patient =>
        patient.availability.some(slot => slot.split(" ")[0].toLowerCase() === day.toLowerCase())
    );

    const availableDoctors = doctors.filter(doctor =>
        doctor.availability.some(slot => slot.split(" ")[0].toLowerCase() === day.toLowerCase())
    );

    console.log(`Generating schedule for ${day}`);
    console.log("Available Patients:", filteredPatients);
    console.log("Available Doctors:", availableDoctors);

    // Reset doctor busy times
    availableDoctors.forEach(doctor => {
        doctor.busyTimes = new Set();
    });

    // Populate table with patients' availability
    times.forEach(time => {
        let row = `<tr><td>${time}</td>`;
        filteredPatients.forEach(patient => {
            row += `<td id="${time}-${patient.name}" style="background-color: #2c2c2c;"></td>`;
        });
        row += '</tr>';
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Assign doctors to patients dynamically
    assignDoctorsToSchedule(times, filteredPatients, availableDoctors, day);
}


function switchDay(button, day) {
    // Remove 'active-day' class from all day tabs
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.remove('active-day');
    });

    // Add 'active-day' to the clicked button
    button.classList.add('active-day');

    // Log the day for debugging
    console.log(`Switched to: ${day}`);

    // Reload the table and regenerate schedule for the selected day
    loadPatientsAndGenerateTable(day); // Load patients' availability for the day
    generateSchedule();                // Generate doctor-patient assignments
}



function getCurrentDay() {
    const activeDayButton = document.querySelector('.active-day');
    return activeDayButton ? activeDayButton.textContent : 'Monday';
}






// Helper Function: Filter Doctors by Day
function filterDoctorsByDay(day) {
    return doctors.filter(doctor => 
        doctor.availability.some(slot => slot.split(" ")[0].toLowerCase() === day.toLowerCase())
    );
}

// Helper Function: Find an Available Doctor for a Given Time
function findAvailableDoctor(doctors, day, time) {
    for (const doctor of doctors) {
        const doctorAvailable = checkAvailabilityForTime(doctor, day, time);
        if (doctorAvailable && !doctor.busyTimes?.includes(time)) {
            return doctor; // Return the first available doctor
        }
    }
    return null; // No doctor available
}

function assignDoctorsToSchedule(times, patients, availableDoctors, day) {
    const doctorWorkMinutes = {}; // Total work minutes per doctor
    const doctorBusyTimes = {};   // Track time slots where each doctor is busy
    const patientAssignedMinutes = {}; // Track minutes assigned to each patient

    // Initialize trackers for doctors and patients
    availableDoctors.forEach(doctor => {
        doctorWorkMinutes[doctor.name] = 0;
        doctorBusyTimes[doctor.name] = new Set();
    });

    patients.forEach(patient => {
        patientAssignedMinutes[patient.name] = 0;
    });

    // Iterate through each time slot
    for (let i = 0; i < times.length; i++) {
        const time = times[i];

        for (const patient of patients) {
            if (patientAssignedMinutes[patient.name] >= 180) continue; // Stop if patient already has 3 hours

            for (const doctor of availableDoctors) {
                if (doctorWorkMinutes[doctor.name] >= 180) continue; // Stop if doctor has 3 hours

                // Skip if doctor is already busy at this time
                if (doctorBusyTimes[doctor.name].has(time)) continue;

                // Check doctor and patient availability
                const doctorAvailable = checkAvailabilityForTime(doctor, day, time);
                const patientAvailable = checkAvailabilityForTime(patient, day, time);

                if (doctorAvailable && patientAvailable) {
                    // Assign doctor to patient
                    assignDoctorToTimeSlot(time, patient, doctor);

                    // Track time slots and work limits
                    doctorBusyTimes[doctor.name].add(time);
                    doctorWorkMinutes[doctor.name] += 15;
                    patientAssignedMinutes[patient.name] += 15;

                    // If doctor hits a 3-hour block, prevent assigning until a later time
                    let nextTimeInMinutes = convertTimeToMinutes(times[i + 1] || '0:00 AM');
                    let currentTimeInMinutes = convertTimeToMinutes(time);
                    if (nextTimeInMinutes - currentTimeInMinutes > 15) {
                        doctorWorkMinutes[doctor.name] = 0; // Reset work minutes after gap
                    }
                    break;
                }
            }
        }
    }
}




// Helper Function: Assign Doctor to a Time Slot
function assignDoctorToTimeSlot(time, patient, doctor) {
    const cellId = `${time}-${patient.name}`; // Match cell IDs dynamically
    const cell = document.getElementById(cellId);

    if (!cell) {
        console.warn(`No cell found for time: ${time} and patient: ${patient.name}`);
        return;
    }

    // Update cell with doctor's name and color
    cell.style.backgroundColor = doctor.color || '#3498db'; // Default color if not set
    cell.style.color = '#fff'; // White text for visibility
    cell.textContent = doctor.name; // Display doctor's name in the cell
}


// Helper Function: Create a New Table Row for a Time Slot
function createNewRow(tableBody, time) {
    const row = document.createElement("tr");
    row.setAttribute("data-time", time);

    row.innerHTML = `<td>${time}</td>` + "<td></td>".repeat(6); // One cell for each day (Mon-Sat)
    tableBody.appendChild(row);
    return row;
}

// Helper Function: Mark a Doctor Busy for a Time Slot
function markDoctorBusy(doctor, day, time) {
    if (!doctor.busyTimes) doctor.busyTimes = [];
    doctor.busyTimes.push(time);
}

function showDay(day) {
    console.log(`Tab clicked: ${day}`);
    loadPatientsAndGenerateTable(day); // Reload table based on selected day
    //generateSchedule();
}

// Initialize with Monday
document.addEventListener("DOMContentLoaded", () => {
    showDay('Monday');
});

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
/*
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
*/

// Helper function to parse time (e.g., "8:00 AM" => 8)
// function parseTime(time) {
//     if (!time) {
//         console.error("parseTime() received an invalid time:", time);
//         return -1;  // Return a default error value
//     }

//     time = time.toUpperCase().replace(/\s+/g, '');  // Remove spaces and convert to uppercase
//     if (time.includes('AM') || time.includes('PM')) {
//         time = time.replace(/(AM|PM)/, ' $1');  // Add space before AM/PM if missing, e.g., "8AM" to "8 AM"
//     }

//     const [hour, period] = time.split(' ');
//     let [h, m] = hour.includes(':') ? hour.split(':') : [hour, "00"];
//     h = parseInt(h, 10);
//     if (period === 'PM' && h !== 12) {
//         h += 12; // Convert PM times to 24-hour format
//     } else if (period === 'AM' && h === 12) {
//         h = 0; // Midnight is 0
//     }
//     return h;
// }

// Function to display unscheduled patients and their remaining hours
// function displayUnscheduledPatients(unscheduledPatients) {
//     const unscheduledSection = document.getElementById("unscheduledPatients");
//     unscheduledSection.innerHTML = '<h3>Unscheduled Patients and Remaining Hours</h3>';

//     if (unscheduledPatients.length === 0) {
//         unscheduledSection.innerHTML += '<p>All patients have been scheduled.</p>';
//     } else {
//         unscheduledPatients.forEach(patient => {
//             unscheduledSection.innerHTML += `
//                 <p>${patient.name} - Remaining Hours: ${patient.remainingHours}</p>
//             `;
//         });
//     }
// }

// Function to display unscheduled doctors and their remaining hours
// function displayUnscheduledDoctors(unscheduledDoctors) {
//     const unscheduledSection = document.getElementById("unscheduledDoctors");
//     unscheduledSection.innerHTML = '<h3>Unscheduled Doctors and Remaining Hours</h3>';

//     if (unscheduledDoctors.length === 0) {
//         unscheduledSection.innerHTML += '<p>All doctors have been fully scheduled.</p>';
//     } else {
//         unscheduledDoctors.forEach(doctor => {
//             unscheduledSection.innerHTML += `
//                 <p>${doctor.name} - Remaining Hours: ${doctor.remainingHours}</p>
//             `;
//         });
//     }
// }



// Initial empty schedule display
//document.addEventListener("DOMContentLoaded", setupEmptySchedule);
