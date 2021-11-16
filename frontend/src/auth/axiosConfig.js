import axios from 'axios'
import {useHistory} from "react-router-dom";
import {useEffect} from "react"

import {  useDispatch } from 'react-redux';
import {  createNotification } from '../reduxStore/appSlice'


axios.defaults.baseURL = "../";
axios.defaults.headers['Authorization'] = localStorage.getItem('access_token') ? "JWT " + localStorage.getItem('access_token') : null ;

export function InjectAxiosInterceptors () {
    const history = useHistory()
    const dispatch = useDispatch()
    useEffect(() => {
      setAxiosInterceptor(history,dispatch)
    }, [history])
  
    return null
  }
  
export const setAxiosInterceptor = (history, dispatch) =>{
axios.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && originalRequest.url ==='server/token/refresh/') {
            dispatch(createNotification(["Refresh token rejected" , 'error']))
            history.push('/login')
            return Promise.reject(error);
        }
        if (error.response.data.code === "token_not_valid" &&
            error.response.status === 401 && 
            error.response.statusText === "Unauthorized") 
            {
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken){
                    const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

                    // exp date in token is expressed in seconds, while now() returns milliseconds:
                    const now = Math.ceil(Date.now() / 1000);
                    console.log(tokenParts.exp);

                    if (tokenParts.exp > now) {
                        return axios
                        .post('server/api/token/refresh/', {refresh: refreshToken})
                        .then((response) => {
            
                            localStorage.setItem('access_token', response.data.access);
                            localStorage.setItem('refresh_token', response.data.refresh);
            
                            axios.defaults.headers['Authorization'] = "JWT " + response.data.access;
                            originalRequest.headers['Authorization'] = "JWT " + response.data.access;
            
                            return axios(originalRequest);
                        })
                        .catch(err => {
                            dispatch(createNotification([err.message, 'error'])) 
                        });
                    }else{
                        dispatch(createNotification(["Refresh token is expired" , 'error'])) 
                    }
                }else{
                    dispatch(createNotification(["Refresh token not found" , 'error']))
                }
        }
    dispatch(createNotification(["Refresh token rejected. Please login again" , 'error']))
    history.push('/login')    
    return Promise.reject(error);
  }
);
}
export default axios
