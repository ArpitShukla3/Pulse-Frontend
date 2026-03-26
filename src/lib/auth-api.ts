import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth-store'

export async function signUp(data: {
    name: string
    email: string
    password: string
}) {
    const res = await api.post('/api/auth/signup', {
        ...data,
        deviceType: 'web',
    })
    return res.data
}

export async function signIn(data: { email: string; password: string }) {
    const res = await api.post('/api/auth/signin', {
        ...data,
        deviceType: 'web',
    })
    const { user, accessToken, refreshToken } = res.data
    useAuthStore.getState().setAuth(user, accessToken, refreshToken)
    return res.data
}

export async function findUsers(search: string) {
    const res = await api.get('/api/auth/app/findUsers', {
        params: { search },
    })
    return res.data
}
