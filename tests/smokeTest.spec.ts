import { test } from '../utils/fixtures';
import { expect } from '../utils/customExpect';
import articleRequestPayload from '../request-objects/POST-article.json';
import {faker} from '@faker-js/faker';
import { getNewRandomArticle } from '../utils/data-generator';


// import { createToken } from '../helpers/createToken';
// let authToken: string;
// test.beforeAll('run before all', async({config}) => {
//     authToken = await createToken(config.userEmail, config.userPassword);
// });


test('GET articles', async({api}) => {
    const response = await api
        .path('/articles')
        .params({limit:10, offset:0})
        .getRequest(200);
    
    await expect(response).shouldMatchSchema('articles', 'GET_articles');
    expect(response.articles.length).shouldBeLessThanOrEqual(10);
    expect(response.articlesCount).shouldEqual(10);
    
    // Verify slug matches title format (spaces replaced with "-", commas removed, and ends with number)
    response.articles.forEach((article: any) => {
        const expectedSlugBase = article.title.replace(/,/g, '').replace(/\s/g, '-');
        const actualSlugBase = article.slug.replace(/-\d+$/, '');
        expect(actualSlugBase).shouldEqual(expectedSlugBase);
    });
        
});

test('GET tags', async({api}) => {
    const response = await api
        .path('/tags')
        .getRequest(200);

        await expect(response).shouldMatchSchema('tags', 'GET_tags'); // *
        expect(response.tags[0]).shouldEqual('Test');
        expect(response.tags.length).shouldBeLessThanOrEqual(10);
});

test('Create (POST) and DELETE article', async({api}) => {
    // const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload)); // **
    // articleRequest.article.title = 'This is a new title';

    const articleRequest = getNewRandomArticle();
    const createArticleResponse = await api 
        .path('/articles')
        // .headers({Authorization: authToken})
        .body(articleRequest)
        .postRequest(201);

    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles');
    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
    const slugID = createArticleResponse.article.slug;

     const articlesResponse = await api
        .path('/articles')
        // .headers({Authorization: authToken})
        .params({limit:10, offset:0})
        .getRequest(200);
    
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles');
    expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title);

    await api
        .path(`/articles/${slugID}`)
        // .headers({Authorization: authToken})
        .deleteRequest(204);
    
});


test('Create (POST), update (PUT), and DELETE article', async({api}) => {
    const articleTitle = faker.lorem.sentence(5);
    const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
    articleRequest.article.title = articleTitle;

    const createArticleResponse = await api 
        .path('/articles')
        // .headers({Authorization: authToken})
        .body(articleRequest)
        .postRequest(201);

    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles');
    expect(createArticleResponse.article.title).shouldEqual(articleTitle);
    const slugID = createArticleResponse.article.slug;

    const articleTitleUpdated = faker.lorem.sentence(6);
    articleRequest.article.title = articleTitleUpdated;
    const updateArticleResponse = await api 
        .path(`/articles/${slugID}`)
        // .headers({Authorization: authToken})
        .body(articleRequest)
        .putRequest(200);
    
    await expect(updateArticleResponse).shouldMatchSchema('articles', 'PUT_articles');
    expect(updateArticleResponse.article.title).shouldEqual(articleTitleUpdated);

    const newSlugID = updateArticleResponse.article.slug;
    

     const articlesResponse = await api
        .path('/articles')
        // .headers({Authorization: authToken})
        .params({limit:10, offset:0})
        .getRequest(200);
    
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles');
    expect(articlesResponse.articles[0].title).shouldEqual(articleTitleUpdated);

    await api
        .path(`/articles/${newSlugID}`)
        // .headers({Authorization: authToken})
        .deleteRequest(204);
    
});

//*
    // for the boolean argument you put true when the file needs to be created/updated, but if the file is already created and you do not need to update it, 
    // put false (or empty)
    // IMPORTANT. don't forget to remove true after you created a schema. if you keep the true, your assertion will never fail because it will always 
    // generate a new schema 

// **
    // by using this type of structure (const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload)); ) we are breaking the dependency to the 
    // original object. Why do we need to do this. So we can safely modify the object if needed. Why? 
    // in sequencial run, you should be fine without doing this step
    // but during parallel execution, if you are using the same object in multiple tests, there is a very high chance that multiple tests would 
    // perform request at the same time and they will use the modified object instead of the original one and tests will fail
    // so in parallel execution, !!! make sure you break the dependency 