// ===============================
// Load Quote
// ===============================

const modelText=document.getElementById("selectedModel");
const itemsDiv=document.getElementById("selectedItems");
const totalText=document.getElementById("grandTotal");
const quoteNumber=document.getElementById("quoteNumber");

const quote=JSON.parse(localStorage.getItem("aduQuote"));

const today=new Date();

const number=
today.getFullYear().toString()+
String(today.getMonth()+1).padStart(2,"0")+
String(today.getDate()).padStart(2,"0")+
"-"+
Math.floor(Math.random()*9000+1000);

quoteNumber.innerText="ADU-"+number;

if(quote){

if(quote.model){

modelText.innerHTML=`

<strong>${quote.model.name}</strong><br>

$${quote.model.price.toLocaleString()}

`;

}

let total=0;

if(quote.model){

total+=quote.model.price;

}

let html="";

if(quote.items && quote.items.length){

quote.items.forEach(item=>{

total+=item.price;

html+=`

<div class="d-flex justify-content-between border-bottom py-2">

<span>${item.name}</span>

<strong>

$${item.price.toLocaleString()}

</strong>

</div>

`;

});

}else{

html=`

<p class="text-muted">

No add-ons selected.

</p>

`;

}

itemsDiv.innerHTML=html;

totalText.innerText="$"+total.toLocaleString();

}
// ===============================
// Save Customer Information
// ===============================

const fields=[
"customerName",
"companyName",
"email",
"phone",
"whatsapp",
"country",
"contactMethod",
"comments"
];

fields.forEach(id=>{

const el=document.getElementById(id);

if(!el) return;

const saved=localStorage.getItem(id);

if(saved){

el.value=saved;

}

el.addEventListener("input",()=>{

localStorage.setItem(id,el.value);

});

});


// part one ends 


// part two starts

// ===============================
// Send Quote Request to Discord (Plain Text)
// ===============================

document.getElementById('submitQuote').addEventListener('click', async function() {
    const fullName = document.getElementById('customerName').value.trim();
    const company = document.getElementById('companyName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const country = document.getElementById('country').value.trim();
    const contactMethod = document.getElementById('contactMethod').value;
    const comments = document.getElementById('comments').value.trim();
    const quoteNo = document.getElementById('quoteNumber').innerText;
    const total = document.getElementById('grandTotal').innerText;

    if (!fullName || !email) {
        alert('Please fill out your Full Name and Email address.');
        return;
    }

    const originalText = this.innerHTML;
    this.innerText = '⌛ Sending Request...';
    this.disabled = true;

    try {
        // Collect model configuration text blocks cleanly
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
        
        // Assemble the clean plain text layout template for Discord
        const messageBody = `
========================================
📋 **NEW COTTAGE QUOTE REQUEST** 📋
========================================
• **Quote No:** ${quoteNo}
• **Total Amount:** ${total}

👤 **CUSTOMER PROFILE**
• **Name:** ${fullName}
• **Company:** ${company || 'N/A'}
• **Email:** ${email}
• **Phone:** ${phone || 'N/A'}
• **WhatsApp:** ${whatsapp || 'N/A'}
• **Country:** ${country || 'N/A'}
• **Preferred Contact:** ${contactMethod}

🏡 **COTTAGE CONFIGURATION**
• **Selected Model:** ${modelInfo}

➕ **SELECTED ADD-ONS**
${itemsInfo}

💬 **COMMENTS / NOTES**
"${comments || 'None'}"
========================================
        `;

        // Split tracking tokens to block scrapers
        const part1 = 'https://discord.com';
        const part2 = 'webhooks/';
        const part3 = '1526956420107341904/';
        const part4 = 'PzPw6NOzUoJjxeXDfBHcW75pdIOysD17GtRkOc23KRgGUzWgZmb5pOhY2gAO5CQxlyNx';
        
        const webhookUrl = part1 + part2 + part3 + part4;

        // Execute direct text transfer via plain string transmission
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: messageBody
            })
        });

        if (response.ok) {
            alert('Your quote request was successfully submitted!');
            fields.forEach(id => localStorage.removeItem(id));
            localStorage.removeItem("aduQuote");
            window.location.reload();
        } else {
            throw new Error('Endpoint transaction rejected.');
        }

    } catch (error) {
        console.error('Submission processing error:', error);
        alert('Something went wrong while sending your request. Please try again.');
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
    }
});
