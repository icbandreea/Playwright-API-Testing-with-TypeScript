import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path: path.resolve(__dirname, '.env')});


const processENV = process.env.TEST_ENV;
const env = processENV || 'prod';
console.log('Test environment is: ' + env);


const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: 'arabella-test@test.com',
    userPassword: 'very-secret'
};

if(env === 'qa') {
    config.userEmail = 'arabella-test@test.com';
    config.userPassword = 'very-secret';
}

if(env === 'prod') {
    config.userEmail = process.env.PROD_USERNAME as string;
    config.userPassword = process.env.PROD_PASSWORD as string;
}

export {config};

// RECAP: API Configuration file
// to manage static values (hardcoded) that you need for your framework, you need to create a file (api-test.config.ts), where we created a default object 
// as a config 
// if you want to switch between environments you can override those values