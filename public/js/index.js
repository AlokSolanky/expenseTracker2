function listProduct(productsData) {
  productsData.forEach((el) => {
    createLi(el);
  });
}
function showPagination({
  currentPage,
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previousPage,
  lastPage,
}) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (hasPreviousPage) {
    const btn2 = document.createElement("button");
    btn2.innerHTML = previousPage;
    btn2.addEventListener("click", () => {
      getProducts(previousPage);
    });
    pagination.appendChild(btn2);
  }
  const btn1 = document.createElement("button");
  btn1.innerHTML = `<h3>${currentPage}</h3>`;
  btn1.addEventListener("click", () => {
    getProducts(currentPage);
  });
  pagination.appendChild(btn1);

  if (hasNextPage) {
    const btn3 = document.createElement("button");
    btn1.innerHTML = nextPage;
    btn1.addEventListener("click", () => {
      getProducts(nextPage);
    });
    pagination.appendChild(btn3);
  }
}

function getProducts(page) {
  axios
    .get(`http://localhost:4000/api/expense?page=${page}`)
    .then(({ data: { products, ...pageData } }) => {
      listProduct(products);
      showPagination(pageData);
    });
}
window.onload = async () => {
  // fetchAll();
  const page = 1;

  axios
    .get(`http://localhost:4000/api/expense?page=${page}`, {
      headers: { Authorization: localStorage.getItem("token") },
    })
    .then(({ data: { products, ...pageData } }) => {
      listProduct(products);
      showPagination(pageData);
    })
    .catch((err) => {
      console.log(err);
    });

  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const amount = document.getElementById("amount").value;
    const type = document.getElementById("type").value;

    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:4000/api/expense",
        {
          name: name,
          amount: amount,
          type: type,
        },
        {
          headers: { Authorization: token },
        }
      )
      .then((response) => {
        console.log(response);
        createLi(response.data.response);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  document.getElementById("premium").addEventListener("click", async (e) => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:4000/member/premium", {
      headers: { Authorization: token },
    });
    console.log("response", response);
    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        let postResponse = await axios.post(
          "http://localhost:4000/member/updateStatus",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          { headers: { Authorization: token } }
        );
        if (postResponse.data.success) {
          const button = document.getElementById("premium");
          button.style.display = "none";
          const div = document.getElementById("premium_nav");
          div.style.display = "block";
          div.style.fontFamily = "verdana";
        }
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", function (response) {
      console.log(response);
      alert("something went wrong");
    });
  });
  document
    .getElementById("leaderboard")
    .addEventListener("click", async (e) => {
      const leaderBoard = document.getElementById("leaderboardArea");
      leaderBoard.style.display = "block";
      document.getElementById("leaderboard").disabled = true;
      let response = await axios.get(
        "http://localhost:4000/premium/leaderBoard"
      );
      response.data.forEach((element) => {
        const newLi = document.createElement("li");
        newLi.setAttribute("class", "list_item leaderBoardItems");
        // newLi.setAttribute("id", element.id);

        let nameTextNode = document.createElement("div");
        nameTextNode.innerHTML = `Name : ${element.name}`;
        let amountTextNode = document.createElement("div");
        amountTextNode.innerHTML = `Total : ${element.totalExpense}`;

        newLi.appendChild(nameTextNode);
        newLi.appendChild(amountTextNode);

        document.querySelector("#leaderboardArea").appendChild(newLi);
      });
    });

  document.getElementById("report").addEventListener("click", async () => {
    try {
      let response = await axios.get(
        "http://localhost:4000/api/expense/download",
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      if (response.data.success) {
        // console.log(response.data);
        let a = document.createElement("a");
        a.href = response.data.fileUrl;
        a.download = "expense.csv";
        a.click();
      }
    } catch (error) {
      console.log(error);
    }
  });
};
function fetchAll() {
  const token = localStorage.getItem("token");
  axios
    .get("http://localhost:4000/api/expense", {
      headers: { Authorization: token },
    })
    .then((response) => {
      //   console.log(response.data.response);
      if (response.data.premium) {
        const button = document.getElementById("premium");
        button.style.display = "none";
        const div = document.getElementById("premium_nav");
        div.style.display = "block";
        div.style.fontFamily = "verdana";
      }
      for (let i = 0; i < response.data.response.length; i++) {
        createLi(response.data.response[i]);
      }
    })
    .catch((error) => console.log(error));
}

function deleteLi(id, e) {
  console.log(id);
  e.remove();
  const token = localStorage.getItem("token");
  // we could also use this below written thing
  // const appointmentEntry = document.querySelector(`[data-id="${id}"]`);
  // appointmentEntry.remove();
  axios
    .delete(`http://localhost:4000/api/expense/${id}`, {
      headers: { Authorization: token },
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error(error));
}
function createLi(expense) {
  const newLi = document.createElement("li");
  newLi.setAttribute("class", "list-group-item");
  newLi.setAttribute("class", "list_item");
  newLi.setAttribute("id", expense.id);

  let nameTextNode = document.createTextNode(expense.name + "  ");
  let amountTextNode = document.createTextNode(expense.amount + "  ");
  let typeTextNode = document.createTextNode(expense.type);

  newLi.appendChild(nameTextNode);
  newLi.appendChild(amountTextNode);
  newLi.appendChild(typeTextNode);

  let del_btn = document.createElement("button");
  del_btn.setAttribute("class", "btn btn-sm btn-danger float-right delete");
  del_btn.textContent = "X";

  newLi.appendChild(del_btn);

  del_btn.addEventListener("click", (e) => {
    deleteLi(expense.id, e.target.parentElement);
  });

  document.querySelector(".li_container").appendChild(newLi);
}
