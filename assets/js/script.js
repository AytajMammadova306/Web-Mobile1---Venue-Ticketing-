
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

        const priceInfo = document.createElement("p");
        priceInfo.classList.add("section-price");
        priceInfo.textContent = `$${section.price} per seat`;

        sectionElement.appendChild(heading);
        sectionElement.appendChild(priceInfo);

        // Generate rows
        for (let i = 0; i < section.rows; i++) {

            const rowLetter = String.fromCharCode(65 + i);

            const rowElement = document.createElement("div");
            rowElement.classList.add("seat-row");

            const rowLabel = document.createElement("span");
            rowLabel.classList.add("row-label");
            rowLabel.textContent = rowLetter;

            rowElement.appendChild(rowLabel);

            // Generate seats in each row
            for (let j = 1; j <= section.seatsPerRow; j++) {

                const seatId = `${rowLetter}-${j}`;

                const seat = document.createElement("button");

                seat.type = "button";
                seat.classList.add("seat", section.id);

                seat.textContent = j;

                seat.dataset.section = section.name;
                seat.dataset.row = rowLetter;
                seat.dataset.seat = j;
                seat.dataset.price = section.price;

                const isUnavailable =
                    section.unavailableSeats.includes(seatId);

                if (isUnavailable) {
                    updateSeatState(seat, "unavailable");
                } else {
                    updateSeatState(seat, "available");
                }

                rowElement.appendChild(seat);
            }

            sectionElement.appendChild(rowElement);
        }

        venue.appendChild(sectionElement);
    });
}

generateVenue();



// Currently selected seat
let selectedSeat = null;

// Get seat detail elements
const seatDetailsEmpty = document.getElementById("seat-details-empty");
const seatDetailsInfo = document.getElementById("seat-details-info");

const detailSection = document.getElementById("detail-section");
const detailRow = document.getElementById("detail-row");
const detailSeat = document.getElementById("detail-seat");
const detailPrice = document.getElementById("detail-price");
const detailStatus = document.getElementById("detail-status");

const addToCartButton = document.getElementById("add-to-cart");



function updateSeatState(seat, newState) {

    seat.classList.remove(
        "available",
        "inspected",
        "in-cart",
        "unavailable"
    );

    seat.classList.add(newState);

    seat.disabled = newState === "unavailable";

    seat.setAttribute(
        "aria-label",
        `${seat.dataset.section}, Row ${seat.dataset.row}, Seat ${seat.dataset.seat}, ${newState}`
    );
}



// Listen for seat clicks
venue.addEventListener("click", function(event) {

    const clickedSeat = event.target.closest(".seat.available");

    // Ignore clicks that are not on available seats
    if (!clickedSeat) {
        return;
    }

    // Reset previously selected seat
    if (selectedSeat !== null) {
        updateSeatState(selectedSeat, "available");
    }

    // Select the new seat
    selectedSeat = clickedSeat;
    updateSeatState(selectedSeat, "inspected");

    // Display seat information
    detailSection.textContent = selectedSeat.dataset.section;
    detailRow.textContent = selectedSeat.dataset.row;
    detailSeat.textContent = selectedSeat.dataset.seat;
    detailPrice.textContent = `$${selectedSeat.dataset.price}`;
    detailStatus.textContent = "Inspected";

    // Show the details panel
    seatDetailsEmpty.hidden = true;
    seatDetailsInfo.hidden = false;

    // Enable Add to Cart button
    addToCartButton.disabled = false;
});
