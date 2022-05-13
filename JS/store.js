
const cart__products = document.querySelector(".cart__products");
let cart = [];

window.onload = function(){
    getData();
    const clickButton = document.querySelectorAll(".card__button");       
}

// Función principal
function getData(){
    let url = "../JS/store.json";
    fetch(url)
        .then(response => response.json())
        .then(productData => {
            let containerProducts = "";
            productData.forEach(product => {
                let productContent = `
                <div class="products__card" data-category="${product["category"]}" data-all="${product["all"]}">
                <h4 class="card__title title">${product["name"]}</h4>
                <img class="card__img" src="${product["img"]}" alt="Imagen de ${product["name"]}">
                <p class="card__description">${product["description"]}</p>
                <div class="d-flex justify-content-between">
                    <h5 class="card__price">$${product["price"]}</h5>
                    <button class="card__button" data-id="${product["id"]}" data-name="${product["name"]}" data-price="${product["price"]}" data-img="${product["img"]}">Añadir al Carrito</button>
                </div>
            </div>`;
                containerProducts += productContent;
            });

            document.querySelector(".store__products").innerHTML = containerProducts;
            filterByCategory();
            filterByCategoryAll();

            const clickButton = document.querySelectorAll(".card__button");
            clickButton.forEach(btn => {
                btn.addEventListener("click", addToCartClicked);    
            });
        
            const storage = JSON.parse(localStorage.getItem("cart"));
            if(storage){
                cart = storage;
                renderCart();
            }
        })
        .catch(function(error){
            console.log("Hubo un problema con la petición fetch " + error.message);
        });
}

// Identifica elementos precisos dentro del archivo JSON
function getSingleProduct(productId){
    let url = "../JS/store.json";
    fetch(url)
        .then(consult => consult.json())
        .then(response => {
            const result = response.filter(product => product.id == productId);
            const productResult = result[0];
            const card__title = productResult["name"];
            const card__price = productResult["price"];
            const card__img = productResult["img"];

            const newProduct = {
                title: card__title,
                img: card__img,
                price: card__price,
                quantity: 1
            }
            addCardToShoppingCart(newProduct);
        })
        .catch(function(error){
            console.log("Hubo un problema con la petición fetch " + error.message);
        });
}

// Filtra los elementos por categoría para mostrar o no, según la sección actual
function filterByCategory(){
    const categoryLinks = document.querySelectorAll(".categoryLink");
    const products = document.querySelectorAll(".products__card");
    categoryLinks.forEach(categoryLink => {
        categoryLink.onclick = function (){
            let categoryId = categoryLink.id;
            products.forEach(product => {
                if(categoryId == "all" && product.dataset.all !== "false"){
                    showElement(product);
                }else if(categoryId == product.dataset.category){
                    showElement(product);
                }else{
                    hideElement(product);
                }
            });
        }
    });
}

// Filtra los elementos por booleano "all" para mostrar o no, según la sección actual
function filterByCategoryAll(){
    const products = document.querySelectorAll(".products__card");
    products.forEach(product => {
        if(product.dataset.all == "false"){
            hideElement(product);
        }else{
            showElement(product);
        }
    })
}

// Selecciona el elemento clickeado y activa una función
function addToCartClicked(event) {
    const button = event.target;
    const card__id = button.dataset.id;
    getSingleProduct(card__id);    
}

// Agrega elementos seleccionados al carrito
function addCardToShoppingCart(newProduct){
    const alert = document.querySelector(".alert__addCart");
    setTimeout(function(){
        alert.classList.add("alert__hide")
    }, 2000);
    alert.classList.remove("alert__hide");

    const inputElement = cart__products.getElementsByClassName("cart__inputElement");
    
    renderCart();
    for(let index = 0; index < cart.length; index++){
        if(cart[index].title.trim() === newProduct.title.trim()){
            cart[index].quantity++;
            const inputValue = inputElement[index];
            inputValue.value++;
            cartTotalPrice();
            return null;
        }
    }
    cart.push(newProduct);

    renderCart();
}

// Renderiza el carrito según los parametros otorgados
function renderCart(){
    cart__products.innerHTML = '';
    cart.map(product => {
        const tr = document.createElement('tr');
        tr.classList.add("itemCart");
        const content = `
        <th scope="row">1</th>
        <td class="cart__product">
            <img class="cart__product--img" src="${product.img}" alt="Imagen de ${product.title}">
            <h6 class="cart__product--title">${product.title}</h6>
        </td>
        <td class="cart__price"><p class="cart__price--p">$${product.price}</p></td>
        <td class="cart__quantity">
            <input class="cart__inputElement" type="number" min="1" value=${product.quantity}>
            <button class="delete btn btn-danger">X</button>
        </td>`;

        tr.innerHTML = content;
        cart__products.append(tr);

        tr.querySelector(".delete").addEventListener("click", removeProductCart);
        tr.querySelector(".cart__inputElement").addEventListener("change", sumQuantity);
    });
    cartTotalPrice();
}

// Calcula el precio total del carrito
function cartTotalPrice(){
    let totalPrice = 0;
    const cart__totalPrice = document.querySelector(".cart__totalPrice");
    cart.forEach((product) => {
        const price = Number(product.price);
        totalPrice = totalPrice + price*product.quantity;
    })

    cart__totalPrice.innerHTML = `Total $${totalPrice}`;
    addLocalStorage();
}

// Remueve el producto del carrito
function removeProductCart(event){
    const buttonDelete = event.target;
    const tr = buttonDelete.closest(".itemCart");
    const title = tr.querySelector(".cart__product--title").textContent;
    for(let i = 0; i < cart.length; i++){
        if(cart[i].title.trim() === title.trim()){
            cart.splice(i, 1);
        }
    }
    
    // Alertas de interacción con el botón "Añadir al carrito"
    const alert = document.querySelector(".alert__removeCart");
    setTimeout(function(){
        alert.classList.add("alert__hide")
    }, 2000);
    alert.classList.remove("alert__hide");

    tr.remove();
    cartTotalPrice();
}

// Controla la cantidad de elementos reiterados existentes en el carrito
function sumQuantity(event){
    const sumInput = event.target;
    const tr = sumInput.closest(".itemCart");
    const title = tr.querySelector(".cart__product--title").textContent;
    cart.forEach(product => {
        if(product.title.trim() === title){
            sumInput.value < 1 ? (sumInput.value = 1) : sumInput.value;
            product.quantity = sumInput.value;
            cartTotalPrice();
        }
    })
}

function addLocalStorage(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Sweet Alert del botón comprar
const btnBuy = document.getElementById("btn__buy");
btnBuy.onclick = () => {
    if(cart.length === 0){
        const alert = document.querySelector(".alert__cartEmpty");
        setTimeout(function(){
            alert.classList.add("alert__hide")
            }, 2000);
        alert.classList.remove("alert__hide");
        null
    }else{
        Swal.fire({
            title: '¿Quieres comprar tu producto?',
            text: "Un pequeño paso para el hombre, un gran salto para tu GTA",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Comprar!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire(
                '¡Compra efectuada!',
                'La transacción ha sido realizada.',
                'success'
              )
              cart = [];
              renderCart();
            }
          })
    }
    
}

// Muestra el elemento recibido como parámetro
const showElement = (element, display = "block") => {
    element.style.display = display
}

// Oculta el elemento recibido como parámetro
const hideElement = (element) => {
    element.style.display = "none"
}