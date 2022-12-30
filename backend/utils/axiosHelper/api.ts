import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';

const instance = axios.create({
	baseURL: 'http://jsonplaceholder.typicode.com/',
	timeout: 15000,
});

const responseBody = (response: AxiosResponse) => response.data;

export const requests = {
	get: (url: string,headers?: AxiosRequestHeaders)  => {
        let config : AxiosRequestConfig = {
            headers: headers
        }
        return instance.get(url,config).then(responseBody);

    },
	post: (url: string, body: {}) => instance.post(url, body).then(responseBody),
	put: (url: string, body: {}) => instance.put(url, body).then(responseBody),
	delete: (url: string) => instance.delete(url).then(responseBody),
};