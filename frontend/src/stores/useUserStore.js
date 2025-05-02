import {create} from 'zustand';
import axios from '../lib/axios';
import {toast} from 'react-hot-toast';

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: false,

    signup: async (name, email, password, confirmPassword) => {
        set({loading: true});
        if (password !== confirmPassword) {
            set({loading: false});
            return toast.error('Passwords do not match');
        }
        try {
            const response = await axios.post('/auth/signup', {name, email, password});
            set({user: response.data, loading: false});
            toast.success('Account created successfully!');
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || 'An error occurred during signup');
        }
    },

    login: async (email, password) => {
        set({loading: true});
        try {
            const response = await axios.post('/auth/login', { email, password});
            set({user: response.data, loading: false});
            toast.success('Login successfully!');
        } catch (error) {
            set({loading: false});
            toast.error(error.response.data.message || 'An error occurred during signup');
        }
    },

    logout: async () => {
        try {
            await axios.post('/auth/logout');
            set({user: null});
        } catch (error) {
            toast.error(error.response.data.message || 'An error occurred during logout');
        }
    },

    checkAuth: async () => {
        set({checkingAuth: true});
        try {
            const response = await axios.get('/auth/profile');
            set({user: response.data, checkingAuth: false});
        } catch (error) {
            set({checkingAuth: false, user: null});
            toast.error(error.response?.data?.message || 'An error occurred during authentication check');
        }
    }
}))