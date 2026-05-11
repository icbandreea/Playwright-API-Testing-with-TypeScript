import articleRequestPayload from '../request-objects/POST-article.json' with { type: 'json' };
import {faker} from '@faker-js/faker';

export function getNewRandomArticle() {
    const articleRequest = structuredClone(articleRequestPayload);
    articleRequest.article.title = faker.lorem.sentence(5);
    articleRequest.article.description = faker.lorem.sentence(3);
    articleRequest.article.body = faker.lorem.paragraph(8);

    return articleRequest;
    
}

// RECAP Test data generator
// we can generate random data by using the faker library  npm install --save-dev @faker-js/faker
// you can modify properties directly in the test, or if more data is needed to be generated you can crate a file like this one where you create a function 
// that handles the creating and generating random data and use the function in your tests