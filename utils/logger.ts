export class APILogger {
    private recentLogs: any[] = [];

    logRequest(method: string, url: string, headers: Record<string, string>, body?: any) {
        const logEntry = {method, url, headers, body};
        this.recentLogs.push({type: 'Request Details', data: logEntry});
    }

    logResponse(statusCode: number, body?: any) {
        const logEntry = {statusCode, body};
        this.recentLogs.push({type: 'Response Details', data: logEntry});
    }

    getRecentLogs() {
        const logs = this.recentLogs.map(log => {
            return `====${log.type}====\n${JSON.stringify(log.data, null, 4)}`;
        }).join('\n\n');
        return logs;
    }
}

// RECAP: Custom logger
// we created a custom logger with 3 methods: to log request, log response and get recent logs 
// log request aggregates 4 details about the request method, url, headers and body(which is optional) 
// log response aggregates 2 details: status code and body (optional)
// all this information is added into recentLogs (array) and then we can use getRecentLogs method to loop through this array and return a single list 
// of the entire log trace in chronological order of request and response details and we can use this information to attach to reporter to make 
// the debugging of the test much easier  