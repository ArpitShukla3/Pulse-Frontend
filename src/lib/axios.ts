import axios from 'axios'
import { useAuthStore } from '@/store/auth-store'

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
})

// ---------- Request interceptor: attach access token ----------
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ---------- Response interceptor: refresh on 401 ----------
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value: string) => void
    reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => {
        if (error) {
            p.reject(error)
        } else {
            p.resolve(token as string)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If the refresh endpoint itself 401s, logout and bail
        if (
            error.response?.status === 401 &&
            originalRequest.url?.includes('/api/auth/refresh-token')
        ) {
            useAuthStore.getState().clearAuth()
            window.location.href = '/login'
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request until the token is refreshed
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            const { refreshToken, updateAccessToken, clearAuth } =
                useAuthStore.getState()

            if (!refreshToken) {
                clearAuth()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const { data } = await axios.post(
                    'http://localhost:3000/api/auth/refresh-token',
                    { refreshToken, deviceType: 'web' },
                )
                const newAccessToken: string = data.accessToken
                updateAccessToken(newAccessToken)
                processQueue(null, newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                clearAuth()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    },
)

export default api
