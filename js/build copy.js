// ==========================================
// ADU Build Cottage - Complete System Engine
// ==========================================
let catalog = {};
let selectedModel = null;
let selectedItems = [];

// DOM Elements
const productArea = document.getElementById("productArea");
const selectedModelText = document.getElementById("selectedModel");
const selectedItemsDiv = document.getElementById("selectedItems");
const grandTotal = document.getElementById("grandTotal");

// ===============================
// Load Catalog Configuration
// ===============================
fetch("data/catalog.json")
.then(res => res.json())
.then(data => {
    catalog = data;
    
    // INITIAL RUN STATE SETUP: Check if a quote is already cached in localStorage first
    const saved = localStorage.getItem("aduQuote");
    const defaultRadio = document.querySelector(".model-option:checked");
    let currentModelName = defaultRadio ? defaultRadio.dataset.name : null;

    if (saved) {
        const quote = JSON.parse(saved);
        selectedModel = quote.model;
        
        // Dynamic Live Synchronization: Ensure newly added category defaults are auto-merged
        const matchingModel = catalog.models.find(m => m.name === selectedModel.name);
        if (matchingModel && matchingModel.includes) {
            let mergedItems = [...(quote.items || [])];
            matchingModel.includes.forEach(liveItem => {
                if (!mergedItems.some(i => i.name === liveItem.name)) {
                    mergedItems.push(liveItem);
                }
            });
            selectedItems = mergedItems;
        } else {
            selectedItems = quote.items || [];
        }
    } else {
        if (defaultRadio) {
            let initialPrice = parseFloat(defaultRadio.value) || 24970;
            selectedModel = {
                name: currentModelName,
                price: initialPrice
            };
            
            const matchingModel = catalog.models.find(m => m.name === currentModelName);
            if (matchingModel && matchingModel.includes) {
                selectedItems = [...matchingModel.includes];
            }
        }
    }
    // Render elements and configure handlers cleanly
    buildProducts();
    setupModelSelection();
    loadQuoteVisuals();
});

// ===============================
// Build and Render Product List
// ===============================
function buildProducts() {
    if (!productArea) return;
    productArea.innerHTML = "";
    catalog.categories.forEach(category => {
        let html = `
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>${category.title}</h3>
                </div>
                <div class="row">
        `;
        category.items.forEach(item => {
            const isChecked = selectedItems.some(i => i.name === item.name);
            html += `
            <div class="col-md-6 col-xl-4 mb-4 product-card">
                <div class="card h-100">
                    <img src="images/products/${category.folder}/${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body d-flex flex-column">
                        <h5>${item.name}</h5>
                        <p class="text-success fw-bold">$${item.price.toLocaleString()}</p>
                        <div class="form-check mt-auto">
                            <input class="form-check-input addon" type="checkbox" data-name="${item.name}" data-price="${item.price}" ${isChecked ? "checked" : ""}>
                            <label class="form-check-label">Add to Cottage</label>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        html += `</div></div></div>`;
        productArea.innerHTML += html;
    });
    setupAddons();
}

// ===============================
// Model Option Event Handlers
// ===============================
function setupModelSelection() {
    document.querySelectorAll(".model-option").forEach(radio => {
        radio.addEventListener("change", function() {
            const modelName = this.dataset.name;
            const modelPrice = parseFloat(this.value) || 24970;
            
            selectedModel = {
                name: modelName,
                price: modelPrice
            };
            
            selectedItems = [];
            const matchingModel = catalog.models.find(m => m.name === modelName);
            if (matchingModel && matchingModel.includes) {
                selectedItems = [...matchingModel.includes];
            }
            buildProducts();
            updateQuote();
        });
    });
}

// ===============================
// Checkbox Change Event Handlers
// ===============================
function setupAddons() {
    document.querySelectorAll(".addon").forEach(box => {
        box.addEventListener("change", function() {
            const item = {
                name: box.dataset.name,
                price: Number(box.dataset.price)
            };
            if (box.checked) {
                if (!selectedItems.some(i => i.name === item.name)) {
                    selectedItems.push(item);
                }
            } else {
                selectedItems = selectedItems.filter(i => i.name !== item.name);
            }
            updateQuote();
        });
    });
}

// ===============================
// Dynamic Search Box Parsing
// ===============================
const searchBox = document.getElementById("searchBox");
if (searchBox) {
    searchBox.addEventListener("keyup", function() {
        const keyword = this.value.toLowerCase();
        document.querySelectorAll(".product-card").forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(keyword) ? "" : "none";
        });
    });
}

// ===============================
// Calculate Totals and Render DOM
// ===============================
function updateQuote() {
    let total = selectedModel ? selectedModel.price : 24970; 
    
    if (selectedModel) {
        if (selectedModelText) {
            selectedModelText.innerHTML = `
            <strong>${selectedModel.name}</strong><br>
            $${selectedModel.price.toLocaleString()}
            `;
        }
    } else {
        if (selectedModelText) selectedModelText.innerHTML = "None Selected";
    }

    if (selectedItems.length === 0) {
        if (selectedItemsDiv) {
            selectedItemsDiv.innerHTML = `<p class="text-muted">No extra add-ons selected.</p>`;
        }
    } else {
        let html = "";
        
        // Deterministic sorting based on catalog positions
        const databaseOrder = [];
        if (catalog && catalog.categories) {
            catalog.categories.forEach(cat => {
                if (cat.items) databaseOrder.push(...cat.items.map(i => i.name));
            });
        }
        
        const orderedSelectedItems = [...selectedItems].sort((a, b) => {
            return databaseOrder.indexOf(a.name) - databaseOrder.indexOf(b.name);
        });

        orderedSelectedItems.forEach(item => {
            total += item.price;
            html += `
            <div class="d-flex justify-content-between border-bottom py-2">
                <span>${item.name}</span>
                <strong>$${item.price.toLocaleString()}</strong>
            </div>`;
        });
        if (selectedItemsDiv) selectedItemsDiv.innerHTML = html;
    }
    
    if (grandTotal) grandTotal.innerHTML = "$" + total.toLocaleString();
    saveQuote();
}

// ===============================
// Browser Cache Records Storage
// ===============================
function saveQuote() {
    if (!grandTotal) return;
    localStorage.setItem(
        "aduQuote",
        JSON.stringify({
            model: selectedModel,
            items: selectedItems,
            total: grandTotal.innerText
        })
    );
}

function loadQuoteVisuals() {
    document.querySelectorAll(".model-option").forEach(radio => {
        if (selectedModel && radio.dataset.name === selectedModel.name) {
            radio.checked = true;
        }
    });
    
    document.querySelectorAll(".addon").forEach(box => {
        box.checked = selectedItems.some(i => i.name === box.dataset.name);
    });
    updateQuote();
}
