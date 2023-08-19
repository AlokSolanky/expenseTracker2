const form = document.getElementById("form");

window.onload = () => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    const user = { email, password };

    console.log("Hello world");

    try {
      let response = await axios.post(
        "http://localhost:4000/user/signin",
        user
      );
      document.querySelector(".error").innerHTML = response.data.result;
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        location.replace(
          "F:/Sharpener/nodejs/fullexpensetracker2/public/index.html"
        );
      }
    } catch (err) {
      console.log(err);
    }
  });
};
