import { test, expect } from '@playwright/test';

let authToken: string;

test.beforeAll('run before all', async({request}) => {
   // POST request to login
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {"user":{"email":"arabella-test@test.com","password":"very-secret"}}
  });
  const tokenResponseJSON = await tokenResponse.json();
  // save the authorization token
  authToken = 'Token ' + tokenResponseJSON.user.token;
  
});


test('GET test tags', async ({ request }) => {
  const tagsResponse = await request.get('https://conduit-api.bondaracademy.com/api/tags'); // this is the response object
  //to get the response body from the response object, you need to call another method 
  const tagsResponseJSON = await tagsResponse.json();

  //assertions
  expect(tagsResponse.status()).toEqual(200);
  expect(tagsResponseJSON.tags[0]).toEqual('Test');
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10);
  
});

test('GET test articles', async({request}) => {
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0');
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toEqual(200);
  expect(articlesResponseJSON.articles.length).toBeLessThanOrEqual(10);
  expect(articlesResponseJSON.articlesCount).toEqual(10);

});


// ------------------------------------------------------------------------------------------------------------

test('Create article (POST) and DELETE it', async({request}) => {

  // POST request to create new article
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
          "title": "Test title from playwright",
          "description": "test description",
          "body": "test body",
          "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });

  const newArticleResponseJSON = await newArticleResponse.json();
  expect(newArticleResponse.status()).toEqual(201);

  // save the slug id
  const slugID = newArticleResponseJSON.article.slug;
  
  // validate that the new article that we created is visible 
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: authToken
    }
  });
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toEqual(200);
  expect(articlesResponseJSON.articles[0].title).toEqual('Test title from playwright');

  // delete the created article 
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
    headers: {
      Authorization: authToken
    }
  });
  expect(deleteArticleResponse.status()).toEqual(204);
  
});

// ------------------------------------------------------------------------------------------------------------

test('Create article (POST), update (PUT), and DELETE it', async({request}) => {

  // POST request to create new article
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
          "title": "Test NEW article",
          "description": "test description",
          "body": "test body",
          "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });

  const newArticleResponseJSON = await newArticleResponse.json();
  expect(newArticleResponse.status()).toEqual(201);
  
  expect(newArticleResponseJSON.article.title).toEqual('Test NEW article');

  // save the slug id
  const slugID = newArticleResponseJSON.article.slug;

  // update created article using PUT
  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
    data: {
      "article": {
          "title": "Test UPDATED article",
          "description": "test description",
          "body": "test body",
          "tagList": []
      }
    },
    headers: {
      Authorization: authToken
    }
  });
  const updateArticleResponseJSON = await updateArticleResponse.json();
  expect(updateArticleResponse.status()).toEqual(200);
  expect(updateArticleResponseJSON.article.title).toEqual('Test UPDATED article');

  // extract a new slug id for the modified article
  const newSlugId = updateArticleResponseJSON.article.slug;
  
  // validate that the new article that we created is visible 
  const articlesResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', {
    headers: {
      Authorization: authToken
    }
  });
  const articlesResponseJSON = await articlesResponse.json();

  expect(articlesResponse.status()).toEqual(200);
  expect(articlesResponseJSON.articles[0].title).toEqual('Test UPDATED article');

  // delete the created & modified article using the new slug id
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${newSlugId}`, {
    headers: {
      Authorization: authToken
    }
  });
  expect(deleteArticleResponse.status()).toEqual(204);
  
});
