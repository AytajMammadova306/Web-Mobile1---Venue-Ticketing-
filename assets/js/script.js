
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

// Stores tickets added by the user
let cart = [];

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



function renderCart() {

    const cartItems = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        const listItem = document.createElement("li");

        const ticketInfo = document.createElement("span");

        ticketInfo.textContent =
            `${item.section} - Row ${item.row}, Seat ${item.seat} - $${item.price}`;

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.classList.add("cart-remove");
        removeButton.textContent = "Remove";

        // Remove the corresponding ticket
        removeButton.addEventListener("click", function() {
            removeTicket(index);
        });

        listItem.appendChild(ticketInfo);
        listItem.appendChild(removeButton);

        cartItems.appendChild(listItem);

        total += item.price;
    });

    cartEmpty.hidden = cart.length > 0;

    cartTotal.textContent = `$${total}`;
}


function saveCart() {

    localStorage.setItem("venueCart", JSON.stringify(cart));

}


function removeTicket(index) {

    // Get the ticket being removed
    const removedTicket = cart[index];

    // Find its corresponding seat on the venue map
    const seat = Array.from(venue.querySelectorAll(".seat"))
        .find(seat =>
            seat.dataset.section === removedTicket.section &&
            seat.dataset.row === removedTicket.row &&
            seat.dataset.seat === removedTicket.seat
        );

    // Restore the seat's available state
    if (seat) {
        updateSeatState(seat, "available");
    }

    // Remove the ticket from the cart
    cart.splice(index, 1);
    saveCart();

    // Refresh cart display and total
    renderCart();
}


function loadCart() {

    const savedCart = localStorage.getItem("venueCart");

    if (savedCart === null) {
        renderCart();
        return;
    }

    try {

        const storedCart = JSON.parse(savedCart);

        if (!Array.isArray(storedCart)) {
            throw new Error("Invalid cart data");
        }

        cart = storedCart;

        // Restore corresponding seat states
        const seats = venue.querySelectorAll(".seat");

        seats.forEach(seat => {

            if (isSeatInCart(seat)) {
                updateSeatState(seat, "in-cart");
            }

        });

        // Update cart display and total
        renderCart();

    } catch (error) {

        console.error("Could not restore cart:", error);

        cart = [];
        localStorage.removeItem("venueCart");

        renderCart();
    }
}



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


function isSeatInCart(seat) {

    return cart.some(item =>
        item.section === seat.dataset.section &&
        item.row === seat.dataset.row &&
        item.seat === seat.dataset.seat
    );
}




// Listen for seat clicks
venue.addEventListener("click", function(event) {

    const clickedSeat = event.target.closest(".seat.available");

    if (!clickedSeat || isSeatInCart(clickedSeat)) {
        return;
    }
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



addToCartButton.addEventListener("click", function() {

    // Make sure a seat is selected
    if (selectedSeat === null) {
        return;
    }
    if (isSeatInCart(selectedSeat)) {
        return;
    }
    // Create a ticket object
    const ticket = {
        section: selectedSeat.dataset.section,
        row: selectedSeat.dataset.row,
        seat: selectedSeat.dataset.seat,
        price: Number(selectedSeat.dataset.price)
    };

    // Add ticket to cart
    cart.push(ticket);
    saveCart();

    // Change seat state to in-cart
    updateSeatState(selectedSeat, "in-cart");

    // Clear current selection
    selectedSeat = null;

    // Reset seat details panel
    seatDetailsEmpty.hidden = false;
    seatDetailsInfo.hidden = true;

    // Disable Add to Cart button
    addToCartButton.disabled = true;

    // Update cart display
    renderCart();

});





loadCart();