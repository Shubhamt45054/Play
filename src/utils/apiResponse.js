class ApiResponse {
    // yeh class baniye hai hamne
    // isme hamne yeh data data constructor kaa...
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }