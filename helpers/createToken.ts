import { RequestHandler } from "../utils/request-handler";
import { config } from "../api-test.config";
import { APILogger } from "../utils/logger";
import { request } from "@playwright/test";


export async function createToken(email: string, password: string) {
    const context = await request.newContext();
    const logger = new APILogger();
    const api = new RequestHandler(context, config.apiUrl, logger);

    try {
    // POST request to login
    const tokenResponse = await api
        .path('/users/login')
        .body({"user":{"email":email,"password":password}})
        .postRequest(200);

  // save the authorization token
    return 'Token ' + tokenResponse.user.token;

    } catch(error) {
        (Error as any).captureStackTrace(error, createToken);
        throw error;
    } finally {
        await context.dispose();
    }

}

// RECAP: Authorization helper
// when you need some repetitive operations that create a precondition for your tests, creating a helper function is the way to go
// there are 2 ways that you can do it: 
// a) create a function that has a dependency on the api fixture so you pass this fixture inside of the function as a dependency and the  execute the api request
// b) if you want to create an independent function, you need to create a new request context (const context = await request.newContext())
// then you can pass that request context into the RequestHandler and api logger is also needed to be provided (const api = new RequestHandler(context, config.apiUrl, logger))
// then using try catch block you create an api request and then in finally you need to dispose the context that you created to properly close the separation 
// the createToken function becomes completely independent and you can run it outside of the test if needed 