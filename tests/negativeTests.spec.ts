import { test } from "../utils/fixtures";
import { expect } from "../utils/customExpect";

[
  {
    username: "dd",
    usernameErrorMessage: "is too short (minimum is 3 characters)",
  },
  { username: "ddd", usernameErrorMessage: "" },
  { username: "dddddddddddddddddddd", usernameErrorMessage: "" },
  {
    username: "ddddddddddddddddddddd",
    usernameErrorMessage: "is too long (maximum is 20 characters)",
  },
].forEach(({ username, usernameErrorMessage }) => {

  test(`Error message validation for ${username}`, async ({ api }) => {
    const newUserResponse = await api
      .path("/users")
      .body({
        user: {
          email: "d",
          password: "d",
          username: username,
        },
      })
      .clearAuth()
      .postRequest(422);

    if(username.length === 3 || username.length === 20) {
        expect(newUserResponse.errors).not.toHaveProperty('username');
    } else {
        expect(newUserResponse.errors.username[0]).shouldEqual(usernameErrorMessage);
    }
  });
});

// RECAP Data driven testing
// here we tested boundary cases for error messages received as API response
// in our page, if we want to sign up, we have some error messages. in the case of the username, if you put 2 characters, there would be an error message 
// saying that it should be at least 3 characters. and if you put more than 20 ch, error message again
// so in this test we are checking though boundary testing. 2 ch, 3 ch, 20 ch, 21 ch
// so we create an array with the data (username and usernameErrorMessage). using forEach method we can go through all data and validate the error messages
