const user = (username, password, email, createdAt) => {
    return {
        getUserName: () => username,
        getPassword: () => password,
        getEmail: () => email,
        getCreatedAt: () => createdAt
    };
}

module.exports = { user };