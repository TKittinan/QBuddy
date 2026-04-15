import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users'; // URL ของ Backend

export const getUsers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createUser = async (userData: any) => {
    const response = await axios.post(API_URL, userData);
    return response.data;
};