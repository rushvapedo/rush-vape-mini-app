const products = [
  { id: 1, name: "Злая монашка", category: "Жидкости", price: 450, strength: "70 mg" },
  { id: 2, name: "Podonki Podgon", category: "Жидкости", price: 350, strength: "50 mg" },
  { id: 3, name: "Narcoz", category: "Жидкости", price: 400, strength: "50 mg" },
  { id: 4, name: "Kasta", category: "Снюс", price: 400 },
  { id: 5, name: "D.L.T.A", category: "Снюс", price: 400 }
];

const state = {
  category: "Все",
  search: "",
  cart: JSON.parse(localStorage.getItem("rushCart") || "{}")
};

const $ = (id) => document.getElementById(id);
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

function saveCart() {
  localStorage.setItem("rushCart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function renderCategories() {
  const names = ["Все", ...new Set(products.map(p => p.category))];

  $("categories").innerHTML = names.map(name => `
    <button class="category-btn ${state.category === name ? "active" : ""}" data-category="${name}">
      ${name}
    </button>
  `).join("");

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.category;
      render();
    });
  });
}

function visibleProducts() {
  const q = state.search.trim().toLowerCase();

  return products.filter(p => {
    const categoryOk =
      state.category === "Все" || state.category === p.category;

    const searchOk =
      !q ||
      `${p.name} ${p.category} ${p.strength || ""}`
        .toLowerCase()
        .includes(q);

    return categoryOk && searchOk;
  });
}

function renderProducts() {
  const list = visibleProducts();

  $("sectionTitle").textContent =
    state.category === "Все" ? "Товары" : state.category;

  $("clearCategory").classList.toggle(
    "hidden",
    state.category === "Все"
  );

  $("products").innerHTML = list.length
    ? list.map(p => `
      <article class="product-card">
        <div class="product-image-placeholder">
          ${p.category}
        </div>

        <div class="product-info">
          <h3>${p.name}</h3>

          ${
            p.strength
              ? `<p class="product-meta">${p.strength}</p>`
              : ""
          }

          <div class="product-bottom">
            <strong>${formatPrice(p.price)}</strong>

            <button class="add-btn" data-id="${p.id}">
              В корзину
            </button>
          </div>
        </div>
      </article>
    `).join("")
    : `<p class="empty">Ничего не найдено.</p>`;

  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.id));
    });
  });
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;

  saveCart();
  renderCart();
  showToast("Товар добавлен в корзину");
}

function removeFromCart(id) {
  delete state.cart[id];

  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  state.cart[id] = (state.cart[id] || 0) + delta;

  if (state.cart[id] <= 0) {
    delete state.cart[id];
  }

  saveCart();
  renderCart();
}

function cartData() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({
      product: products.find(p => p.id === Number(id)),
      qty
    }))
    .filter(x => x.product && x.qty > 0);
}

function renderCart() {
  const items = cartData();

  let total = 0;
  let count = 0;

  $("cartItems").innerHTML = items.length
    ? items.map(({ product, qty }) => {
        total += product.price * qty;
        count += qty;

        return `
          <div class="cart-item">
            <div>
              <strong>${product.name}</strong>
              <div>${formatPrice(product.price)} × ${qty}</div>
            </div>

            <div class="qty">
              <button data-minus="${product.id}">−</button>
              <span>${qty}</span>
              <button data-plus="${product.id}">+</button>
              <button data-remove="${product.id}">✕</button>
            </div>
          </div>
        `;
      }).join("")
    : `<p class="empty">Корзина пуста.</p>`;

  $("cartTotal").textContent = formatPrice(total);
  $("cartCount").textContent = count;

  document.querySelectorAll("[data-minus]").forEach(button => {
    button.addEventListener("click", () => {
      changeQty(Number(button.dataset.minus), -1);
    });
  });

  document.querySelectorAll("[data-plus]").forEach(button => {
    button.addEventListener("click", () => {
      changeQty(Number(button.dataset.plus), 1);
    });
  });

  document.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      removeFromCart(Number(button.dataset.remove));
    });
  });
}

function showToast(text) {
  const toast = $("toast");

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function render() {
  renderCategories();
  renderProducts();
  renderCart();
}

$("ageConfirm").addEventListener("click", () => {
  $("ageGate").classList.add("hidden");
});

$("search").addEventListener("input", event => {
  state.search = event.target.value;
  renderProducts();
});

$("clearCategory").addEventListener("click", () => {
  state.category = "Все";
  render();
});

$("cartTop").addEventListener("click", () => {
  $("cartSheet").classList.remove("hidden");
});

$("closeCart").addEventListener("click", () => {
  $("cartSheet").classList.add("hidden");
});

$("orderBtn").addEventListener("click", () => {
  if (cartData().length === 0) {
    showToast("Корзина пуста");
    return;
  }

  showToast("Заказ пока работает в демонстрационном режиме");
});

render();
