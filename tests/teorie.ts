// What is API?
// API stands for Application Programming Interface (basically the communication with the server)
// API URL Components
// https://example/com/api/articles?limit=10&offset=0 - https (protocol) ; example.com (domain); /api/articles (path); limit... (query parameters)

//API request methods
// POST -> Create a new record on the server
// GET -> Read an existing record
// PUT -> Update an existing record
// DELETE -> Delete an existing record 
// These 4 create the acronim CRUD 

// HTTP response status codes
// 200-level: Success
// 400-level: something wrong with the request (client side) - we requested API to do something but the API is not designed to do/ did not understand 
// 500-level: something wrong at the server side - we did everything correctly, sent the request, but there is a problem on the server 


// ------------------------------------------------------------------------------------------------------------

// Test Hooks
// test hooks are a type of operation in the framework where you can repeat certain operations before/ after the tests
// beforeAll - used when you want to run some code before all tests inside of your test file 
// beforeEach - used when you need to run some code before every test to create some test precondition 
// afterEach - teardown after every test
// afterAll - something you want to execute after all tests are executed


// ------------------------------------------------------------------------------------------------------------

// Test fixtures
// test fixture is a function that can work as a precondition/teardown for your test
// similar to test hooks, but has more capabilities 

// ------------------------------------------------------------------------------------------------------------

// JSON Schema
// What is JSON schema? 
// JSON Schema is the JSON object that describes the structure of another JSON object. It is a sort of a contract that defines 
// what properties should be in the response, what types of those properties and the overall structure of the entire object