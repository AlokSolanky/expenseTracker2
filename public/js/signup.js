const form = document.getElementById("form");

window.onload = () => {
  console.log("page loaded");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    const user = { name, email, password };

    console.log(user);

    try {
      let response = await axios.post(
        "http://localhost:4000/user/signup",
        user
      );
      console.log(response);
      document.querySelector(".error").innerHTML = response.data.result;
    } catch (err) {
      console.log(err);
    }
  });
};
