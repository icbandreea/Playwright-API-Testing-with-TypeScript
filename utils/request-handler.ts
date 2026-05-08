import { APIRequestContext} from "@playwright/test";
import { APILogger } from "./logger";
import test from "@playwright/test";

export class RequestHandler {

    private request!: APIRequestContext;
    private logger!: APILogger;
    private baseUrl!: string | undefined;
    private defaultBaseUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};
    private defaultAuthToken!: string;
    private clearAuthFlag!: boolean;

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger, authToken: string = '') {
        this.request = request;
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
        this.defaultAuthToken = authToken;
    }


    url(url: string) {
        this.baseUrl = url;
        return this;
        //*
    }

    path(path: string) {
        this.apiPath = path;
        return this;
    }

    params(params: object) {
        this.queryParams = params;
        return this;
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }

    body(body: object) {
        this.apiBody = body;
        return this;
    }

    clearAuth() {
        this.clearAuthFlag = true;
        return this;
    }

    async getRequest(statusCode: number) {
        let responseJSON : any;

        const url = this.getUrl();
        // ****
        await test.step(`GET request to: ${url}`, async() => {
            this.logger.logRequest('GET', url, this.getHeaders());
            const response = await this.request.get(url, {
                headers: this.getHeaders()
            });
            this.cleanupFields();
            const actualStatus = response.status();
            responseJSON = await response.json();
            this.logger.logResponse(actualStatus, responseJSON);
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
        });
        

        return responseJSON;
    }

    async postRequest(statusCode: number) {
        let responseJSON : any;
        const url = this.getUrl();

        await test.step(`POST request to: ${url}`, async() => {
            this.logger.logRequest('POST', url, this.getHeaders(), this.apiBody);
            const response = await this.request.post(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            });
            this.cleanupFields();
            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON);

            this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
        }); 
        

        return responseJSON;
    }

    async putRequest(statusCode: number) {
        let responseJSON : any;

        const url = this.getUrl();
        await test.step(`PUT request to: ${url}`, async() => {
            this.logger.logRequest('PUT', url, this.getHeaders(), this.apiBody);
            const response = await this.request.put(url, {
                headers: this.getHeaders(),
                data: this.apiBody
            });
            this.cleanupFields();
            const actualStatus = response.status();
            responseJSON = await response.json();

            this.logger.logResponse(actualStatus, responseJSON);

            this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
        });
        
        

        return responseJSON;
    }

    async deleteRequest(statusCode: number) {
        
        const url = this.getUrl();

        await test.step(`DELETE request to: ${url}`, async() => {
            this.logger.logRequest('DELETE', url, this.getHeaders());
            const response = await this.request.delete(url, {
                headers: this.getHeaders()
            });
            this.cleanupFields();
            const actualStatus = response.status();
            this.logger.logResponse(actualStatus);
            
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
        });
        
        
    }
    

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
        for(const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value); //** 
        }
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if(actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentLogs();
            const error = new Error(`Expected status ${expectedStatus}, but got ${actualStatus}\n\nRecent API Activity: \n${logs}`);
            if ((Error as any).captureStackTrace) {
                (Error as any).captureStackTrace(error, callingMethod);
                }
            throw error;
        }
    }

    private getHeaders() {
        if(!this.clearAuthFlag) {
            this.apiHeaders['Authorization'] = this.apiHeaders['Authorization'] || this.defaultAuthToken;
        }
        return this.apiHeaders;
    }

    private cleanupFields() {
        this.apiBody = {};
        this.apiHeaders = {};
        this.baseUrl = undefined;
        this.apiPath = '';
        this.queryParams = {};
        this.clearAuthFlag = false;
    } // ***


}




// * 
        // when method is called, we want to return the same instance of the class 
        // return this - this is called fluent interface design - by returning this at the end of the execution, 
        // we provide access for this method to other methods inside the class
        // by doing this, we are able to chain methods one by one using dot notation

// ** 
        //searchParams.append() adds query parameters to a URL—basically the stuff that comes after the ?
        //url.searchParams gives you access to the query string part of the URL; .append(key, value) adds a new parameter.

// ***
        // we created this method to help with cleaning up the variables after each request. Why do we need that? 
        // if for example in a test we have multiple requests one after another, there is a really big chance that for some requests, the parameters to have 
        // values leaked from the previous requests. what do i mean by that? 
        // example we make a get request for get attributes where the url has query params, but when we make a get tags request, that url should 
        // not have query params. But if we do not clean them after the first request, those will leak to the next request, which is incorrect 

// ****
        // RECAP Reporting Improvement
        // test.step helps us to remove unhelpfull steps from test reporter. basically clean up unnecessary steps 