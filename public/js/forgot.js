window.onload = () => {
  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    let obj = { email: document.getElementById("email").value };

    try {
      let response = await axios.post(
        "http://localhost:4000/password/forgotpassword",
        obj,
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      if (response.data.success) {
        alert("password change");
        location.replace(
          "F:/Sharpener/nodejs/fullexpensetracker2/public/signin.html"
        );
      }
    } catch (error) {
      console.log(error);
    }
  });
};
