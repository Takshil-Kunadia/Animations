document.addEventListener("DOMContentLoaded", function () {
    const cards = document.querySelectorAll(".card");
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

    cards.forEach((card) => {
        intersectionObserver.observe(card);
    });
});
