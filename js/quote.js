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
// ===============================
// Send Quote Request to Discord
// ===============================

document.getElementById('submitQuote').addEventListener('click', async function() {
    // 1. Collect form data values
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

    // Basic required validation check
    if (!fullName || !email) {
        alert('Please fill out your Full Name and Email address.');
        return;
    }

    // Change button visual state during processing
    const originalText = this.innerHTML;
    this.innerText = '⌛ Sending Request...';
    this.disabled = true;

    try {
        // 2. Locate target element container to build the document
        // Selects the main interactive grid element container containing the quote
        const element = document.querySelector('section.py-5'); 
        
        const opt = {
            margin:       0.5,
            filename:     `${quoteNo}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generates binary data stream blob via your html2pdf client dependency
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

        // 3. Assemble multiform body wrapper payload for Discord asset transmission
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
        formData.append('file', pdfBlob, `${quoteNo}.pdf`);

        // 4. Dispatch transaction payload request to endpoint
        // Paste your generated channel string endpoint address here:
        const webhookUrl = 'https://discord.com/api/webhooks/1526956420107341904/PzPw6NOzUoJjxeXDfBHcW75pdIOysD17GtRkOc23KRgGUzWgZmb5pOhY2gAO5CQxlyNx
'; 

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Your quote request was successfully submitted!');
            // Clears fields persistence locally if submit is successful
            fields.forEach(id => localStorage.removeItem(id));
            localStorage.removeItem("aduQuote");
        } else {
            throw new Error('Server transmission dropped');
        }

    } catch (error) {
        console.error('Error handling workflow execution:', error);
        alert('Something went wrong while sending your request. Please try again.');
    } finally {
        // Revert element styles back to active state
        this.innerHTML = originalText;
        this.disabled = false;
    }
});
