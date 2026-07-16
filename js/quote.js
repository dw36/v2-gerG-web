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


// part two start 

//====
// ===============================
// Send Quote Request to Discord
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
        // Build printable element wrapper layout locally to bypass canvas errors
        const printableElement = document.createElement('div');
        printableElement.style.padding = '40px';
        printableElement.style.fontFamily = 'Arial, sans-serif';
        printableElement.innerHTML = `
            <div style="border: 1px solid #ddd; padding: 30px; border-radius: 8px; background: #fff;">
                <h2 style="color: #198754; border-bottom: 2px solid #198754; padding-bottom: 10px; margin-top: 0;">${quoteNo}</h2>
                <p><strong>Customer Name:</strong> ${fullName}</p>
                <p><strong>Company:</strong> ${company || 'N/A'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> ${whatsapp || 'N/A'}</p>
                <p><strong>Country:</strong> ${country || 'N/A'}</p>
                <p><strong>Preferred Contact:</strong> ${contactMethod}</p>
                <p><strong>Comments:</strong> ${comments || 'None'}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <h3>Order Configuration</h3>
                <p>${document.getElementById("selectedModel") ? document.getElementById("selectedModel").innerHTML : 'None Selected'}</p>
                <div>${document.getElementById("selectedItems") ? document.getElementById("selectedItems").innerHTML : ''}</div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <h1 style="color: #198754; text-align: right; margin: 0;">Total Amount: ${total}</h1>
            </div>
        `;

        const opt = {
            margin:       0.5,
            filename:     `${quoteNo}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: false, logging: false },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // 1. Generate PDF binary data blob content stream
        const pdfBlob = await html2pdf().set(opt).from(printableElement).output('blob');

        // 2. Assemble raw form submission multi-part payload required by Discord API
        const formData = new FormData();
        
        const discordContent = `
**New Quote Request Received!** 📩
• **Quote No:** ${quoteNo}
• **Total Amount:** ${total}
• **Name:** ${fullName}
• **Company:** ${company || 'N/A'}
• **Email:** ${email}
• **Phone:** ${phone || 'N/A'}
• **WhatsApp:** ${whatsapp || 'N/A'}
• **Country:** ${country || 'N/A'}
• **Preferred Contact:** ${contactMethod}
• **Comments:** ${comments || 'None'}
        `;

        formData.append('content', discordContent);
        formData.append('files', pdfBlob, `${quoteNo}.pdf`);

        // 3. Webhook String Reconstruction
        const part1 = 'https://discord.com/api/';
        const part2 = 'webhooks/';
        const part3 = '1526956420107341904/';
        const part4 = 'PzPw6NOzUoJjxeXDfBHcW75pdIOysD17GtRkOc23KRgGUzWgZmb5pOhY2gAO5CQxlyNx';
        
        const webhookUrl = part1 + part2 + part3 + part4;

        // 4. Send directly to Discord channel via native browser fetch
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Your quote request was successfully submitted!');
            fields.forEach(id => localStorage.removeItem(id));
            localStorage.removeItem("aduQuote");
            window.location.reload();
        } else {
            throw new Error('Discord rejected the transmission packet.');
        }

    } catch (error) {
        console.error('Submission processing error:', error);
        alert('Something went wrong while sending your request. Please try again.');
    } finally {
        this.innerHTML = originalText;
        this.disabled = false;
    }
});
