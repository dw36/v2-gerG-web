document.addEventListener("DOMContentLoaded", () => {

    const models = [
        {
            name: "1 BR 300sqft",
            price: 16900
        },
        {
            name: "2 BR 600sqft",
            price: 31700
        },
        {
            name: "3 BR 900sqft",
            price: 48700
        }
    ];

    document.querySelectorAll(".model-card").forEach((card, index) => {

        card.style.cursor = "pointer";

        card.addEventListener("click", () => {

            localStorage.setItem(
                "selectedModel",
                JSON.stringify(models[index])
            );

            window.location.href = "build.html";

        });

    });

});