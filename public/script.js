let cart = [];
let total = 0;

if (document.getElementById('menu')) {
  fetch('/menu')
    .then(res => res.json())
    .then(items => {
      const menuDiv = document.getElementById('menu');
      items.forEach(item => {
        menuDiv.innerHTML += `
          <div class="col-md-4">
            <div class="card">
              <img src="${item.image}" class="card-img-top" alt="${item.name}">
              <div class="card-body">
                <h5 class="card-title">${item.name} - $${item.price}</h5>
                <p class="card-text">${item.description}</p>
                <button class="btn btn-primary" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Add to Cart</button>
              </div>
            </div>
          </div>`;
      });
    });

  document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length === 0) return alert('Cart is empty!');
    fetch('/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById('order-confirmation').innerHTML = `Order placed! Your Order ID: ${data.orderId}`;
        cart = [];
        total = 0;
        updateCart();
      });
  });
}

if (document.getElementById('menu-form')) {
  fetch('/menu')
    .then(res => res.json())
    .then(items => {
      const adminMenuDiv = document.getElementById('admin-menu');
      items.forEach(item => {
        adminMenuDiv.innerHTML += `
          <div class="col-md-4">
            <div class="card">
              <img src="${item.image}" class="card-img-top" alt="${item.name}">
              <div class="card-body">
                <h5 class="card-title">${item.name} - $${item.price}</h5>
                <p class="card-text">${item.description}</p>
                <button class="btn btn-warning" onclick="editItem(${item.id}, '${item.name}', '${item.description}', ${item.price}, '${item.image}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
              </div>
            </div>
          </div>`;
      });
    });

  document.getElementById('menu-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/menu/${id}` : '/menu';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, image })
    }).then(() => location.reload());
  });
}

function addToCart(id, name, price) {
  cart.push({ id, name, price });
  total += price;
  updateCart();
}

function updateCart() {
  const cartList = document.getElementById('cart');
  cartList.innerHTML = '';
  cart.forEach(item => {
    cartList.innerHTML += `<li class="list-group-item">${item.name} - $${item.price}</li>`;
  });
  document.getElementById('total').textContent = total.toFixed(2);
}

function editItem(id, name, description, price, image) {
  document.getElementById('item-id').value = id;
  document.getElementById('name').value = name;
  document.getElementById('description').value = description;
  document.getElementById('price').value = price;
  document.getElementById('image').value = image;
}

function deleteItem(id) {
  if (confirm('Are you sure?')) {
    fetch(`/menu/${id}`, { method: 'DELETE' }).then(() => location.reload());
  }
}