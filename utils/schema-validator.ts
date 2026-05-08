import fs from 'fs/promises';
import path from 'path';
import Ajv from 'ajv';
import {createSchema} from 'genson-js';
import addFormats from 'ajv-formats';

const SCHEMA_BASE_PATH = './response-schemas';
const ajv = new Ajv({allErrors: true});
addFormats(ajv); //** 


export async function validateSchema(dirName:string, fileName: string, responseBody: object, createSchemaFlag: boolean = false) {
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`);

    if(createSchemaFlag) {
        await generateNewSchema(responseBody, schemaPath);
    }


    const schema = await loadSchema(schemaPath);
    const validate = ajv.compile(schema);

    const valid = validate(responseBody);
    if (!valid) {
        throw new Error(
            `Schema validation ${fileName}_schema.json failed:\n` +
            `${JSON.stringify(validate.errors, null, 4)}\n\n` +
            `Actual response body: \n` +
            `${JSON.stringify(responseBody, null, 4)}`
        );
    }
    
}


async function loadSchema(schemaPath:string) {
    try {
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
    } catch (err) {
       if (err instanceof Error) {
            throw new Error(`Failed to read the schema file: ${err.message}`);
        }
            throw new Error('Failed to read the schema file: Unknown error');
    }

}

// *
async function generateNewSchema(responseBody:object, schemaPath: string) {
            try {
            const generatedSchema = createSchema(responseBody);
            await fs.mkdir(path.dirname(schemaPath), {recursive: true});
            await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4));
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create the schema file: ${error.message}`);
            }
            throw new Error('Failed to create the schema file: Unknown error');
        }
}


// *
    // RECAP Schema Generation
    // To automatically generate schema we created inside of the schema-validator a simple function generateNewSchema that uses createSchema method from the genson-js library 
    // based on the response object this library can generate the schema and then using fs mkdir and writeFile we are saving this JSON file inside our project
    // and then using the flag true or false inside of the method you can decide whether you want to create or update the schema, or you want to run a regular 
    // test to match the schema validation 


//** 

    // RECAP Additional Data formats
    // we can add extra formats through the ajv-formats library. to do that you need to install package  npm i ajv-formats --save-dev and import it 
    // import addFormats from 'ajv-formats'; and then simply put the following code:   addFormats(ajv);
    // with this, if you want to for example validate that a property has date-time format (because in our schema updatedAt is a date but it is decalred as string)
    // you can add in the schema this "format": "date-time". 
    // Important: the disadvantage here is genson-js library does not automate formats, which basically means that after the schema generation you
    // manually add your formats, but if the schema needs to be updated, all the formats will be erased and you will have to manually add them again
    // so use this if is absolutely needed
    // but if you need to make this step automated you need to add some kind of processing after the schema generated with custom code to add the formats 


    // ***

        // RECAP Schema validation wrap up
        // when do we need to use/not use schema validation (or when to use regular assertions)
        // the answear is simple: use schema validation after every single response - it is a very simple and easy way to validate that your API 
        // doesn't have integration issues. you can recreate the schema and rerun the schema test again and again
        // when to use the assertions because you don't want to create the properties for every single property inside of your response
        // so based on our test: create and delete article// we need to validate the schema after every single response 
        // but you need to add the assertions for the properties that you modify during the test (in our test we created the article with 3 values - 
        // title, description and body) - so when we make the assertion, we only need to validate those 3 values that we created ( we need to validate 
        // that the API actually created them ). we don't care about anything else because for the rest the schema validation will take care 
        // So basically the rule is: if your test involves any functional operation and you made functional action, validate result for your action. 
        // For everything else, just use schema validation