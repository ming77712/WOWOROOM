let orderData = [];
const orderList = document.querySelector(".orderList");
const selectC3 = document.querySelector(".selectC3");
const sectionTitle = document.querySelector(".section-title");
const renderChart = document.querySelector(".renderChart");

function init() {
  getOrderList();
}

function renderC3Category() {
  // C3.js
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (!total[productItem.category]) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });

  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });

  let chart = c3.generate({
    bindto: ".chartCategory", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      // colors: {
      //   "Louvre 雙人床架": "#DACBFF",
      //   "Antony 雙人床架": "#9D7FEA",
      //   "Anty 雙人床架": "#5434A7",
      //   其他: "#301E5F",
      // },
    },
  });
}

function renderC3Title() {
  // C3.js
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (!total[productItem.title]) {
        total[productItem.title] = productItem.price * productItem.quantity;
      } else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });

  let titleAry = Object.keys(total);
  let newData = [];
  titleAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });

  let chart = c3.generate({
    bindto: ".chartTitle", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      // colors: {
      //   "Louvre 雙人床架": "#DACBFF",
      //   "Antony 雙人床架": "#9D7FEA",
      //   "Anty 雙人床架": "#5434A7",
      //   其他: "#301E5F",
      // },
    },
  });
}

function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      //   console.log(res.data);
      orderData = res.data.orders;
      let str = "";
      orderData.forEach((item) => {
        // 組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;
        let productStr = "";
        item.products.forEach((productItem) => {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });

        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        str += `<tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td >
              <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input
                type="button"
                class="delSingleOrder-Btn orderDelete"
                value="刪除"
                data-id="${item.id}"
              />
            </td>
          </tr>`;
      });
      orderList.innerHTML = str;
      renderC3Category();
    })
    .catch((error) => {
      console.log(error);
    });
}

orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");

  if (targetClass == "delSingleOrder-Btn orderDelete") {
    deleteOrderItem(id);
  }

  if (targetClass == "orderStatus") {
    let status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
  }
});

function changeOrderStatus(status, id) {
  let newStatus;

  if (status == "true") {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "修改訂單狀態成功",
        showConfirmButton: false,
        timer: 1500,
      });
      getOrderList();
    })
    .catch((error) => {
      console.log(error);
    });
}

function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "刪除該筆訂單成功",
        showConfirmButton: false,
        timer: 1500,
      });
      getOrderList();
    })
    .catch((error) => {
      console.log(error);
    });
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();

  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      Swal.fire({
        icon: "success",
        title: "刪除全部訂單成功",
        showConfirmButton: false,
        timer: 1500,
      });
      getOrderList();
    })
    .catch((error) => {
      console.log(error);
    });
});

selectC3.addEventListener("change", () => {
  if (selectC3.value === "全產品類別營收比重") {
    sectionTitle.textContent = "全產品類別營收比重";
    renderChart.classList.remove("chartTitle");
    renderChart.classList.add("chartCategory");
    renderC3Category();
  }
  if (selectC3.value === "全品項營收比重") {
    sectionTitle.textContent = "全品項營收比重";
    renderChart.classList.remove("chartCategory");
    renderChart.classList.add("chartTitle");
    renderC3Title();
  }
});

init();
