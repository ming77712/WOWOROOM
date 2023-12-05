const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCartTableList = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const totalPrice = document.querySelector(".totalPrice");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

let addQuantity;
let isEmpty = 0;
let productData = [];
let searchCategory = [];
let cartData = [];

const constraints = {
  姓名: {
    presence: {
      message: "必填",
      allowEmpty: false,
    },
  },
  電話: {
    numericality: {
      message: "格式不正確",
    },
    presence: {
      message: "必填",
    },
  },
  Email: {
    email: {
      message: "格式不正確",
    },
    presence: {
      message: "必填",
    },
  },
  寄送地址: {
    presence: {
      message: "必填",
      allowEmpty: false,
    },
  },
};

function init() {
  getProductList();
  getCartList();
}

function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then((res) => {
      productData = res.data.products;
      renderProductList(productData);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((res) => {
      cartData = res.data.carts;
      totalPrice.textContent = res.data.finalTotal;
      let str = "";
      cartData.forEach((item) => {
        str += `<tr>
              <td>
                <div class="cardItem-title">
                  <img src=${item.product.images} alt="" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${item.product.price}</td>
              <td> 
          ${item.quantity}
          </td>
              <td>NT$${item.product.price * item.quantity}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-id=${
                  item.id
                }> clear </a>
              </td>
            </tr>`;
      });

      shoppingCartTableList.innerHTML = str;
    })
    .catch((error) => {
      console.log(error);
    });
}

function renderProductList(dataType) {
  let str = "";
  dataType.forEach((item) => {
    str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src=${item.images}
          alt=""
        />
        <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li>`;
  });
  productWrap.innerHTML = str;
}

productSelect.addEventListener("change", (e) => {
  const category = e.target.value;
  searchCategory.length = 0;
  if (category === "全部") {
    renderProductList(productData);
    return;
  }
  productData.forEach((item) => {
    if (category === item.category) {
      searchCategory.push(item);
    }
  });

  renderProductList(searchCategory);
});

productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");

  addQuantity = 1;

  cartData.forEach((item) => {
    if (productId === item.product.id) {
      addQuantity = item.quantity + 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: addQuantity,
        },
      }
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "成功加入購物車",
        showConfirmButton: false,
        timer: 1500,
      });
      getCartList();
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: error,
        showConfirmButton: false,
        timer: 2000,
      });
    });
});

shoppingCartTableList.addEventListener("click", (e) => {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");

  if (cartId === null) {
    return;
  }

  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "刪除單筆購物車成功",
        showConfirmButton: false,
        timer: 1500,
      });
      getCartList();
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: error,
        showConfirmButton: false,
        timer: 2000,
      });
    });
});

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "刪除購物車成功",
        showConfirmButton: false,
        timer: 1500,
      });
      getCartList();
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "購物車是空的",
        showConfirmButton: false,
        timer: 2000,
      });
    });
});

orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (cartData.length === 0) {
    Swal.fire({
      icon: "error",
      title: "請加入商品",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }

  const customerForm = document.querySelector(".orderInfo-form");
  const customerInputInfo = document.querySelectorAll(".orderInfo-input");
  const message = document.querySelectorAll(".orderInfo-message");
  message.forEach((item) => {
    if (item.textContent) {
      item.textContent = ``;
    }
  });

  const errors = validate(customerForm, constraints);

  isEmpty = 0;

  if (errors) {
    Object.keys(errors).forEach((keys) => {
      document.querySelector(`[data-message="${keys}"]`).textContent =
        errors[keys];
    });
    isEmpty = 1;
  }

  if (isEmpty) return;

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerInputInfo[0].value,
            tel: customerInputInfo[1].value,
            email: customerInputInfo[2].value,
            address: customerInputInfo[3].value,
            payment: customerInputInfo[4].value,
          },
        },
      }
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "訂單建立成功",
        showConfirmButton: false,
        timer: 1500,
      });
      customerForm.reset();
      getCartList();
    })
    .catch((error) => {
      console.log(error);
    });
});

init();
