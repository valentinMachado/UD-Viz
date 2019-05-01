export function AuthenticationService(config, requestService) {
    this.config = config;
    this.loginUrl = `${config.server.url}${config.server.login}`;
    this.registerUrl = `${config.server.url}${config.server.register}`;
    this.requestService = new udvcore.RequestService();
    this.loginRequiredKeys = ['username', 'password'];
    this.registerRequiredKeys = ['username', 'firstName', 'lastName', 'password', 'email'];
    this.storageKeys = {
        token: 'user.token',
        firstname: 'user.firstname',
        lastname: 'user.lastname',
        username: 'user.username',
        email: 'user.email'
    };

    this.requestService = requestService;

    this.onLogin;
    this.onRegister;
    this.onLogout;

    this.initialize = function initialize() {
        this.requestService.setAuthenticationService(this);
        console.log('Authentication service initialized');
    }
    
    this.login = async function login(formData) {
        console.log('login3');
        const result = await this.requestService.send('POST', this.loginUrl, formData, false);
        const obj = JSON.parse(result);
        console.log(obj);
        const jwt = obj.token;
        if (jwt !== undefined && jwt !== null) {
            this.storeUser({
                token: jwt,
                firstname: 'Firstname',
                lastname: 'Lastname',
                username: 'Username',
                email: 'email@example.com'
            });
        }

        if (typeof this.onLogin === "function") {
            this.onLogin();
        }
    }

    this.logout = function logout() {
        this.removeUser();

        if (typeof this.onLogout === 'function') {
            this.onLogout();
        }
    }

    this.register = async function register(formData) {
        const result = await this.requestService.send('POST', this.registerUrl, formData, false);
        const obj = JSON.parse(result);

        if (typeof this.onRegister === 'function') {
            this.onRegister();
        }
    }

    this.formCheck = function formCheck(formData, requiredKeys) {
        for (var key of requiredKeys) {
            if (formData.get(key) === null) {
                console.error(`Missing key in form : ${key}`)
                return false;
            }
        }
        return true;
    }

    this.removeUser = function removeUser() {
        window.sessionStorage.removeItem(this.storageKeys.token);
        window.sessionStorage.removeItem(this.storageKeys.firstname);
        window.sessionStorage.removeItem(this.storageKeys.lastname);
        window.sessionStorage.removeItem(this.storageKeys.username);
        window.sessionStorage.removeItem(this.storageKeys.email);
    }

    this.storeUser = function storeUser(user) {
        window.sessionStorage.setItem(this.storageKeys.token, user.token);
        window.sessionStorage.setItem(this.storageKeys.firstname, user.firstname);
        window.sessionStorage.setItem(this.storageKeys.lastname, user.lastname);
        window.sessionStorage.setItem(this.storageKeys.username, user.username);
        window.sessionStorage.setItem(this.storageKeys.email, user.email);
    }

    this.getUser = function getUser() {
        let user = {};
        user.token = window.sessionStorage.getItem(this.storageKeys.token);
        if (user.token === null || user.token === undefined) {
            return null;
        }
        user.firstname = window.sessionStorage.getItem(this.storageKeys.firstname);
        user.lastname = window.sessionStorage.getItem(this.storageKeys.lastname);
        user.username = window.sessionStorage.getItem(this.storageKeys.username);
        user.email = window.sessionStorage.getItem(this.storageKeys.email);
        return user;
    }

    this.isUserLoggedIn = function isUserLoggedIn() {
        try {
            let user = this.getUser();
            console.log(user);
            return user !== null && user !== undefined;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    this.initialize();
}