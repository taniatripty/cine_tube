

export interface LoginResponse {
    success: boolean,
    message: string,
    data: {
        token: string,
        accessToken: string,
        refreshToken: string,
        redirect: boolean,
        user: {
            name: string,
            email: string,
            emailVerified: boolean,
            image: string | null,
            createdAt: string,
            updatedAt: string,
            role: string,
            status: string,
            needpasswordChange: boolean,
            id: string
        }
    }
}