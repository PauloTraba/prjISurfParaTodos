// /assets/js/api.js

const api = axios.create({
    baseURL: 'https://surf-para-todes.onrender.com',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// O nosso interceptor continua igual, adicionando o token de autorização
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);