window.onload = () => {
  fetchAll();

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
          const div = document.getElementById("premiumTrue");
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
    .getElementById("premiumTrue")
    .addEventListener("click", async (e) => {
      const leaderBoard = document.getElementById("leaderboardArea");
      leaderBoard.style.display = "block";
      document.getElementById("premiumTrue").disabled = true;
      let response = await axios.get(
        "http://localhost:4000/premium/leaderBoard"
      );
      response.data.forEach((element) => {
        console.log(element);
        const newLi = document.createElement("li");
        newLi.setAttribute("class", "list_item leaderBoardItems");
        // newLi.setAttribute("id", element.id);

        let nameTextNode = document.createElement("div");
        nameTextNode.innerHTML = `Name : ${element.name}`;
        let amountTextNode = document.createElement("div");
        amountTextNode.innerHTML = `Total : ${element.total_expense_amount}`;

        newLi.appendChild(nameTextNode);
        newLi.appendChild(amountTextNode);

        document.querySelector("#leaderboardArea").appendChild(newLi);
      });
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
        const div = document.getElementById("premiumTrue");
        div.style.display = "block";
        div.style.fontFamily = "verdana";
      }
      for (let i = 0; i < response.data.response.length; i++) {
        createLi(response.data.response[i]);
      }
    })
    .catch((error) => console.error(error));
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
