
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

let cart = [];

const venue = document.getElementById("venue");

function generateVenue() {

    venue.innerHTML = "";

    venueData.forEach(section => {

        const sectionElement = document.createElement("div");
        sectionElement.classList.add("venue-section");

        const heading = document.createElement("h2");
        heading.textContent = section.name;

        const priceInfo = document.createElement("p");
        priceInfo.classList.add("section-price");
        priceInfo.textContent = `$${section.price} per seat`;

        sectionElement.appendChild(heading);
        sectionElement.appendChild(priceInfo);

        for (let i = 0; i < section.rows; i++) {

            const rowLetter = String.fromCharCode(65 + i);

            const rowElement = document.createElement("div");
            rowElement.classList.add("seat-row");

            const rowLabel = document.createElement("span");
            rowLabel.classList.add("row-label");
            rowLabel.textContent = rowLetter;

            rowElement.appendChild(rowLabel);

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

    const removedTicket = cart[index];

    const seat = Array.from(venue.querySelectorAll(".seat"))
        .find(seat =>
            seat.dataset.section === removedTicket.section &&
            seat.dataset.row === removedTicket.row &&
            seat.dataset.seat === removedTicket.seat
        );

    if (seat) {
        updateSeatState(seat, "available");
    }

    cart.splice(index, 1);
    saveCart();

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

        const seats = venue.querySelectorAll(".seat");

        seats.forEach(seat => {

            if (isSeatInCart(seat)) {
                updateSeatState(seat, "in-cart");
            }

        });

        renderCart();

    } catch (error) {

        console.error("Could not restore cart:", error);

        cart = [];
        localStorage.removeItem("venueCart");

        renderCart();
    }
}



let selectedSeat = null;

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




venue.addEventListener("click", function(event) {

    if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        return;
    }

    const clickedSeat = event.target.closest(".seat.available");

    if (!clickedSeat || isSeatInCart(clickedSeat)) {
        return;
    }

    if (selectedSeat !== null) {
        updateSeatState(selectedSeat, "available");
    }

    selectedSeat = clickedSeat;
    updateSeatState(selectedSeat, "inspected");

    detailSection.textContent = selectedSeat.dataset.section;
    detailRow.textContent = selectedSeat.dataset.row;
    detailSeat.textContent = selectedSeat.dataset.seat;
    detailPrice.textContent = `$${selectedSeat.dataset.price}`;
    detailStatus.textContent = "Inspected";

    seatDetailsEmpty.hidden = true;
    seatDetailsInfo.hidden = false;

    addToCartButton.disabled = false;
});



addToCartButton.addEventListener("click", function() {

    if (selectedSeat === null) {
        return;
    }
    if (isSeatInCart(selectedSeat)) {
        return;
    }
    const ticket = {
        section: selectedSeat.dataset.section,
        row: selectedSeat.dataset.row,
        seat: selectedSeat.dataset.seat,
        price: Number(selectedSeat.dataset.price)
    };

    cart.push(ticket);
    saveCart();

    updateSeatState(selectedSeat, "in-cart");

    selectedSeat = null;

    seatDetailsEmpty.hidden = false;
    seatDetailsInfo.hidden = true;

    addToCartButton.disabled = true;

    renderCart();

});





loadCart();


const mapViewport = document.getElementById("map-viewport");
const mapContent = document.getElementById("map-content");

let scale = 1;
let translateX = 0;
let translateY = 0;

const minScale = 0.7;
const maxScale = 2;
const zoomStep = 0.1;
const moveStep = 40;


function updateMapTransform() {

    const maxX = Math.max(
        0,
        (mapContent.offsetWidth * scale - mapViewport.clientWidth) / 2
    );

    const maxY = Math.max(
        0,
        (mapContent.offsetHeight * scale - mapViewport.clientHeight) / 2
    );
    translateX = Math.max(-maxX, Math.min(translateX, maxX));
    translateY = Math.max(-maxY, Math.min(translateY, maxY));

    mapContent.style.transform =
        `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;
}



document.getElementById("zoom-in").addEventListener("click", function() {

    scale = Math.min(scale + zoomStep, maxScale);

    updateMapTransform();
});

document.getElementById("zoom-out").addEventListener("click", function() {

    scale = Math.max(scale - zoomStep, minScale);

    updateMapTransform();
});

document.getElementById("move-up").addEventListener("click", function() {

    translateY -= moveStep;

    updateMapTransform();
});

document.getElementById("move-down").addEventListener("click", function() {

    translateY += moveStep;

    updateMapTransform();
});

document.getElementById("move-left").addEventListener("click", function() {

    translateX -= moveStep;

    updateMapTransform();
});

document.getElementById("move-right").addEventListener("click", function() {

    translateX += moveStep;

    updateMapTransform();
});


document.getElementById("reset-view").addEventListener("click", function() {
    scale = 1;
    translateX = 0;
    translateY = 0;

    updateMapTransform();
});

mapViewport.addEventListener("wheel", function(event) {
    event.preventDefault();

    if (event.deltaY < 0) {
        scale = Math.min(scale + zoomStep, maxScale);
    } else {
        scale = Math.max(scale - zoomStep, minScale);
    }

    updateMapTransform();
}, { passive: false });


let isPointerDown = false;
let isDragging = false;
let suppressNextClick = false;

let startX = 0;
let startY = 0;

let initialTranslateX = 0;
let initialTranslateY = 0;


mapViewport.addEventListener("pointerdown", function(event) {

    if (event.pointerType === "mouse" && event.button !== 0) {
        return;
    }

    isPointerDown = true;
    isDragging = false;

    startX = event.clientX;
    startY = event.clientY;

    initialTranslateX = translateX;
    initialTranslateY = translateY;

    suppressNextClick = false;

    event.target.setPointerCapture(event.pointerId);

});


mapViewport.addEventListener("pointermove", function(event) {

    if (!isPointerDown) {
        return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (!isDragging && Math.hypot(deltaX, deltaY) > 5) {
        isDragging = true;
    }

    if (!isDragging) {
        return;
    }

    translateX = initialTranslateX + deltaX;
    translateY = initialTranslateY + deltaY;

    updateMapTransform();

});


mapViewport.addEventListener("pointerup", function() {

    if (isDragging) {
        suppressNextClick = true;
    }

    isPointerDown = false;
    isDragging = false;

});


mapViewport.addEventListener("pointercancel", function() {

    isPointerDown = false;
    isDragging = false;

});

mapViewport.addEventListener("click", function(event) {

    if (suppressNextClick) {
        suppressNextClick = false;

        event.preventDefault();
        event.stopPropagation();
    }

}, true);

updateMapTransform();