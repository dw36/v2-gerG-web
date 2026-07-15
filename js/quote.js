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