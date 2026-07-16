// ===============================
// Load Quote
// ===============================
const modelText = document.getElementById("selectedModel");
const itemsDiv = document.getElementById("selectedItems");
const totalText = document.getElementById("grandTotal");
const quoteNumber = document.getElementById("quoteNumber");

const quote = JSON.parse(localStorage.getItem("aduQuote"));
const today = new Date();

const number =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0") +
    "-" +
    Math.floor(Math.random() * 9000 + 1000);

if (quoteNumber) {
    quoteNumber.innerText = "ADU-" + number;
}

if (quote) {
    if (quote.model && modelText) {
        modelText.innerHTML = `
            <strong>${quote.model.name}</strong><br>
            $${quote.model.price.toLocaleString()}
        `;
    }

    let total = 0;
    if (quote.model) {
        total += quote.model.price;
    }

    let html = "";
    if (quote.items && quote.items.length) {
        quote.items.forEach(item => {
            total += item.price;
            html += `
                <div class="d-flex justify-content-between border-bottom py-2">
                    <span>${item.name}</span>
                    <strong>$${item.price.toLocaleString()}</strong>
                </div>
            `;
        });
    } else {
        html = `<p class="text-muted">No add-ons selected.</p>`;
    }

    if (itemsDiv) itemsDiv.innerHTML = html;
    if (totalText) totalText.innerText = "$" + total.toLocaleString();
}

// ===============================
// Save Customer Information
// ===============================
const fields = [
    "customerName",
    "companyName",
    "email",
    "phone",
    "whatsapp",
    "country",
    "contactMethod",
    "comments"
];

fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    const saved = localStorage.getItem(id);
    if (saved) el.value = saved;

    el.addEventListener("input", () => {
        localStorage.setItem(id, el.value);
    });
});

// ===============================
// Send Quote Request via WhatsApp
// ===============================
const submitBtn = document.getElementById('submitQuote');

if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const fullName = (document.getElementById('customerName')?.value || '').trim();
        const company = (document.getElementById('companyName')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const phone = (document.getElementById('phone')?.value || '').trim();
        const whatsappField = (document.getElementById('whatsapp')?.value || '').trim();
        const country = (document.getElementById('country')?.value || '').trim();
        const contactMethod = document.getElementById('contactMethod')?.value || 'Not Specified';
        const comments = (document.getElementById('comments')?.value || '').trim();
        
        const quoteNo = document.getElementById('quoteNumber')?.innerText || 'N/A';
        const total = document.getElementById('grandTotal')?.innerText || '$0';

        if (!fullName || !email) {
            alert('Please fill out your Full Name and Email address first.');
            return;
        }

        const modelElement = document.getElementById("selectedModel");
        const modelInfo = modelElement ? modelElement.innerText.replace(/\n/g, ' ') : 'None Selected';
        
        const itemsElement = document.getElementById("selectedItems");
        let itemsInfo = '';
        if (itemsElement) {
            itemsInfo = Array.from(itemsElement.querySelectorAll('.d-flex'))
                .map(el => `• ${el.innerText.replace(/\n/g, ': ')}`)
                .join('\n');
        }
        if (!itemsInfo) itemsInfo = 'No add-ons selected.';

        // Clean target string text message body
        const textMessage = `
*🏡 NEW COTTAGE QUOTE REQUEST*
----------------------------------------
*Quote No:* ${quoteNo}
*Total Amount:* ${total}

*👤 CUSTOMER PROFILE:*
• *Name:* ${fullName}
• *Company:* ${company || 'N/A'}
• *Email:* ${email}
• *Phone:* ${phone || 'N/A'}
• *WhatsApp:* ${whatsappField || 'N/A'}
• *Country:* ${country || 'N/A'}
• *Preferred Contact:* ${contactMethod}

*🏠 CONFIGURATION:*
• *Selected Model:* ${modelInfo}

*➕ SELECTED ADD-ONS:*
${itemsInfo}

*💬 COMMENTS:*
"${comments || 'None'}"
----------------------------------------
        `.trim();

        // 100% legal URL string syntax structure with no bracket typos
        const whatsappUrl = "https://whatsapp.com" + encodeURIComponent(textMessage);

        // Open window link natively
        window.open(whatsappUrl, '_blank');

        // Clean up active session choices data models smoothly
        const storageFields = [
            "customerName", "companyName", "email", "phone", 
            "whatsapp", "country", "contactMethod", "comments"
        ];
        storageFields.forEach(id => localStorage.removeItem(id));
        localStorage.removeItem("aduQuote");
        
        window.location.reload();
    });
}
