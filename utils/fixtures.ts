import { test as base } from '@playwright/test';
import { RequestHandler } from '../utils/request-handler';
import { APILogger } from './logger';
import { setCustomExpectLogger } from './customExpect';
import { config } from '../api-test.config';
import { createToken } from '../helpers/createToken';

export type TestOptions = {
  api: RequestHandler; 
  config: typeof config;
}

export type WorkerFixture = {
    authToken: string;
}

export const test = base.extend<TestOptions, WorkerFixture>({
    authToken: [async ({}, use) => {
        const authToken = await createToken(config.userEmail, config.userPassword);
        await use(authToken);
    }, {scope: 'worker'}], // ***


    // we create a fixture as follows below (first argument is a dependency (in our case empty object), second is always use)
    api: async({request, authToken}, use) => {
        const logger = new APILogger(); // **
        setCustomExpectLogger(logger);
        const requestHandler = new RequestHandler(request, config.apiUrl, logger, authToken);
        await use(requestHandler); //*

    },

    config: async({}, use) => {
        await use(config);
    }
});



//*
        // how the fixture works: all the code that you put before use method, will be executed as a precondition for the test when the fixture is called
        // the code you put after the use method, will be executed after the test 

// **
        // why do we put the instance creation there?
        // because of how the object oriented instance creation works: everytime we call the api fixture (in smokeTest in our case), 
        // a new instance of the logger will be created for that particular test run and will make sure that it will not interfere with other loggers for other tests
        // every test will collect its own logs even when running in parallel

// ***
        // Automatic Authorization RECAP
        // we created a worker scoped fixture (authToken). Worker scoped fixture initiated at the beggining of everything else of all the test execution before
        // the main fixture of api or config fixture
        // this worked fixture executes once per worker and crates a token. then we pass the token into the API fixture and the token value is then passed
        // down to the request handler. inside of the request handler, we have created a simple method that will be responsible for setting up the authorization
        // header value. So if clearAuthFlag was  provided, then we set the value of the header that was passed in the test.
        // if the value was not provided, just use a default value for the entire framework
        // if we want to clean the header and create unauthorized requests, then we can have the clearAuth method that just flips the flag 