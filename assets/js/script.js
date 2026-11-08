
const venueData = [
    {
        id: "left",
        name: "Left Section",
        price: 25,
        rows: 5,
        seatsPerRow: 8,
        unavailableSeats: ["A-3", "B-5", "D-2"]
    },
    {
        id: "center",
        name: "Center Section",
        price: 45,
        rows: 5,
        seatsPerRow: 8,
        unavailableSeats: ["A-4", "C-3", "E-6"]
    },
    {
        id: "right",
        name: "Right Section",
        price: 30,
        rows: 5,
        seatsPerRow: 8,
        unavailableSeats: ["B-2", "C-7", "E-4"]
    }
];



const venue = document.getElementById("venue");

function generateVenue() {

    venue.innerHTML = "";

    venueData.forEach(section => {

        // Create a section container
        const sectionElement = document.createElement("div");
        sectionElement.classList.add("venue-section");

        // Create section heading
        const heading = document.createElement("h2");
        heading.textContent = section.name;

        sectionElement.appendChild(heading);

        // Generate rows
        for (let i = 0; i < section.rows; i++) {

            const rowLetter = String.fromCharCode(65 + i);

            const rowElement = document.createElement("div");
            rowElement.classList.add("seat-row");

            // Generate seats in each row
            for (let j = 1; j <= section.seatsPerRow; j++) {

                const seatId = `${rowLetter}-${j}`;

                const seat = document.createElement("button");

                seat.type = "button";
                seat.classList.add("seat");

                seat.textContent = j;

                seat.dataset.section = section.name;
                seat.dataset.row = rowLetter;
                seat.dataset.seat = j;
                seat.dataset.price = section.price;

                const isUnavailable =
                    section.unavailableSeats.includes(seatId);

                if (isUnavailable) {
                    seat.classList.add("unavailable");
                    seat.disabled = true;
                    seat.setAttribute("aria-label",
                        `${section.name}, Row ${rowLetter}, Seat ${j}, unavailable`);
                } else {
                    seat.classList.add("available");
                    seat.setAttribute("aria-label",
                        `${section.name}, Row ${rowLetter}, Seat ${j}, available`);
                }

                rowElement.appendChild(seat);
            }

            sectionElement.appendChild(rowElement);
        }

        venue.appendChild(sectionElement);
    });
}

generateVenue();
