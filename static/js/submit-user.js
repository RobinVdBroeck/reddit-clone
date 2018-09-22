function submit() {
  const usernameField = document.getElementById("username");
  const emailField = document.getElementById("email");
  const username = usernameField.value;
  const email = emailField.value;
  usernameField.value = "";
  emailField.value = "";
  fetch("/user", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      username,
      email
    })
  });
}
