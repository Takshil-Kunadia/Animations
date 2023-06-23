document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card");
    // IntersectionObserver
    // It is used to observe the intersection changes between the target element and the parent element.
    const intersectionObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach((entry) => {
                entry.target.classList.toggle("show", entry.isIntersecting);
            });
        },
        {
            threshold: 0.3,
        }
    );

    // Observe each card
    cards.forEach((card) => {
        intersectionObserver.observe(card);
    });
});
