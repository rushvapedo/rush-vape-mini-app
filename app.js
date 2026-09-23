const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const categories = [
  {id:"liquids", name:"Жидкости 💜"},
  {id:"disposable", name:"Одноразки 💧"},
  {id:"devices", name:"Устройства 🔥"},
  {id:"consumables", name:"Расходники 🧩"},
  {id:"accessories", name:"Аксессуары ✨"}
];

const products = [
  {id:1,cat:"liquids",name:"Пример жидкости №1",price:550,icon:"🧪"},
  {id:2,cat:"liquids",name:"Пример жидкости №2",price:600,oldPrice:650,icon:"🧪"},
  {id:3,cat:"disposable",name:"Пример одноразки №1",price:700,icon:"💨"},
  {id:4,cat:"devices",name:"Пример устройства №1",price:1990,icon:"⚡"},
  {id:5,cat:"consumables",name:"Пример расходника №1",price:450,icon:"🔧"},
  {id:6,cat:"accessories",name:"Пример аксессуара №1",price:350,icon:"✨"}
];

let selectedCategory = null;
let cart = JSON.parse(localStorage.getItem("rush_cart") || "{}");

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

function renderCategories(){
  $("categories").innerHTML = categories.map(c =>
    `<button class="category ${selectedCategory===c.id?"active":""}" onclick="selectCategory('${c.id}')">${c.name}</button>`
  ).join("");
}

function renderProducts(){
  const q = $("search").value.trim().toLowerCase();
  let list = products.filter(p => (!selectedCategory || p.cat===selectedCategory) && p.name.toLowerCase().includes(q));
  $("products").innerHTML = list.length ? list.map(p => `
    <article class="product">
      <div class="product-img">${p.icon}</div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">${categories.find(c=>c.id===p.cat)?.name || ""}</div>
        <div class="price">${money(p.price)}</div>
        ${p.oldPrice ? `<div class="product-meta"><s>${money(p.oldPrice)}</s></div>` : ""}
        <button class="add" onclick="addToCart(${p.id})">В корзину</button>
      </div>
    </article>`).join("") : `<p style="color:#9b9ba7">Ничего не найдено.</p>`;
  $("sectionTitle").textContent = selectedCategory ? categories.find(c=>c.id===selectedCategory).name : "Популярное";
  $("clearCategory").classList.toggle("hidden", !selectedCategory);
}

function selectCategory(id){ selectedCategory = selectedCategory===id ? null : id; renderCategories(); renderProducts(); }
$("clearCategory").onclick = () => { selectedCategory=null; renderCategories(); renderProducts(); };
$("search").addEventListener("input", renderProducts);

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart(); showToast("Товар добавлен в корзину");
}
function saveCart(){ localStorage.setItem("rush_cart", JSON.stringify(cart)); renderCartCount(); }
function renderCartCount(){ $("cartCount").textContent = Object.values(cart).reduce((a,b)=>a+b,0); }

function renderCart(){
  const ids = Object.keys(cart).filter(id=>cart[id]>0);
  if(!ids.length){ $("cartItems").innerHTML = `<p style="color:#9b9ba7">Корзина пока пустая.</p>`; $("orderBtn").disabled=true; }
  else {
    $("orderBtn").disabled=false;
    $("cartItems").innerHTML = ids.map(id=>{
      const p=products.find(x=>x.id==id), qty=cart[id];
      return `<div class="cart-row">
        <div class="cart-info"><div class="cart-name">${p.name}</div><div class="cart-price">${money(p.price)} × ${qty}</div></div>
        <div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><b>${qty}</b><button onclick="changeQty(${p.id},1)">+</button></div>
      </div>`;
    }).join("");
  }
  const total=ids.reduce((s,id)=>s+products.find(p=>p.id==id).price*cart[id],0);
  $("cartTotal").textContent=money(total);
}
function changeQty(id,d){ cart[id]=(cart[id]||0)+d; if(cart[id]<=0) delete cart[id]; saveCart(); renderCart(); }

$("cartTop").onclick=()=>{ $("cartSheet").classList.remove("hidden"); renderCart(); };
$("closeCart").onclick=()=>$("cartSheet").classList.add("hidden");

$("orderBtn").onclick=()=>{
  const items=Object.keys(cart).map(id=>{const p=products.find(x=>x.id==id);return `${p.name} × ${cart[id]}`}).join("\n");
  const total=Object.keys(cart).reduce((s,id)=>s+products.find(p=>p.id==id).price*cart[id],0);
  if(tg?.showPopup){
    tg.showPopup({title:"Заказ",message:`${items}\n\nИтого: ${money(total)}`,buttons:[{id:"ok",type:"ok",text:"Понятно"}]});
  } else alert(`Заказ\n\n${items}\n\nИтого: ${money(total)}`);
};

$("ageConfirm").onclick=()=>{ localStorage.setItem("rush_age_ok","1"); $("ageGate").classList.add("hidden"); };
if(localStorage.getItem("rush_age_ok")==="1") $("ageGate").classList.add("hidden");

function showToast(t){const el=$("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1600)}

renderCategories(); renderProducts(); renderCartCount();
