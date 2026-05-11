import { test } from '../utils/fixtures';
import { expect } from '../utils/customExpect';
import articleRequestPayload from '../request-objects/POST-article.json' with { type: 'json' };
import commentRequestPayload from '../request-objects/POST-comment.json' with { type: 'json' };
import { faker } from '@faker-js/faker';

test('HAR Flow - Article Lifecycle with Comments', async ({ api }) => {
    // Step 1: Create a new article (requires authentication)
    const articleRequest = structuredClone(articleRequestPayload);
    articleRequest.article.title = faker.lorem.sentence(5);
    articleRequest.article.description = faker.lorem.sentence(3);
    articleRequest.article.body = faker.lorem.paragraph(8);
    (articleRequest.article as any).tagList = [];

    const createArticleResponse = await api
        .path('/articles')
        .body(articleRequest)
        .postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles', true);
    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
    
    const articleSlug = createArticleResponse.article.slug;

    // Step 2: Get the created article by slug
    const getArticleResponse = await api
        .path(`/articles/${articleSlug}`)
        .getRequest(200);
    await expect(getArticleResponse).shouldMatchSchema('articles', 'GET_articles', true);
    expect(getArticleResponse.article.slug).shouldEqual(articleSlug);

    // Step 3: Get comments for the article (should be empty initially)
    const getCommentsResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200);
    await expect(getCommentsResponse).shouldMatchSchema('articles', 'GET_articles_comments', true);
    expect(getCommentsResponse.comments.length).shouldBeLessThanOrEqual(10);

    // Step 4: Add a comment to the article
    const commentRequest = structuredClone(commentRequestPayload);
    commentRequest.comment.body = faker.lorem.sentence(10);

    const createCommentResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .body(commentRequest)
        .postRequest(200);
    await expect(createCommentResponse).shouldMatchSchema('articles', 'POST_articles_comments', true);
    expect(createCommentResponse.comment.body).shouldEqual(commentRequest.comment.body);

    // Step 5: Verify article still exists with the comment
    const verifyCommentsResponse = await api
        .path(`/articles/${articleSlug}/comments`)
        .getRequest(200);
    await expect(verifyCommentsResponse).shouldMatchSchema('articles', 'GET_articles_comments', true);
    expect(verifyCommentsResponse.comments.length).shouldBeLessThanOrEqual(10);
    expect(verifyCommentsResponse.comments[0].body).shouldEqual(commentRequest.comment.body);
});
