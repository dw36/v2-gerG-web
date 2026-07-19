// ==========================================
// ADU Build Cottage - Dynamic Invoice Calculator
// ==========================================
let basePrice = 24970; 
let modelName = "1 BR 300sqft";
let shippingMultiplier = 1;

// Read the system runtime selection state array from shared cache
const savedQuote = localStorage.getItem("aduQuote");
if (savedQuote) {
    const quote = JSON.parse(savedQuote);
    if (quote.model && quote.model.name) {
        modelName = quote.model.name;
        basePrice = parseFloat(quote.model.price) || 24970;
        
        // Dynamically compute shipping scale value rules
        if (modelName === "2 BR 600sqft") {
            shippingMultiplier = 2;
        } else if (modelName === "3 BR 900sqft") {
            shippingMultiplier = 3;
        } else {
            shippingMultiplier = 1;
        }
    }
}

const totalShipping = 12800 * shippingMultiplier;

const summaryDiv = document.getElementById("summary");
if (summaryDiv) {
    summaryDiv.innerHTML = `
        <h5>Base Cottage (${modelName})</h5>
        <p>$${basePrice.toLocaleString()}</p>
        <h5>Shipping (x${shippingMultiplier})</h5>
        <p>$${totalShipping.toLocaleString()}</p>
        <hr>
        <h4>Total</h4>
        <h3>$${(basePrice + totalShipping).toLocaleString()}</h3>
    `;
}
