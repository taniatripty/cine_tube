
// {
//     "success": true,
//     "message": "Registration successful.",
//     "data": {
//         "token": "555TaX3Xq1I5GPsae1hInYBdviZ4bRdT",
//         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJTaEJaRmNtUTlYMTc4eFBDVGhPTFpWZ1N2aVNNZTVrYyIsInJvbGUiOiJVU0VSIiwibmFtZSI6ImFmcmluIiwiZW1haWwiOiJhZnJpbkBnbWFpbC5jb20iLCJzdGF0dXMiOiJBQ1RJVkUiLCJpYXQiOjE3OTQ1MTE5ODIsImV4cCI6MTc5NDU5ODM4Mn0.JCivSHy_Bbraq9bG4t2I3UPOzpYgvmq1jXntEjvIet0",
//         "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJTaEJaRmNtUTlYMTc4eFBDVGhPTFpWZ1N2aVNNZTVrYyIsInJvbGUiOiJVU0VSIiwibmFtZSI6ImFmcmluIiwiZW1haWwiOiJhZnJpbkBnbWFpbC5jb20iLCJzdGF0dXMiOiJBQ1RJVkUiLCJpYXQiOjE3OTQ1MTE5ODIsImV4cCI6MTc5NTExNjc4Mn0.glLUQMUSzP2DZPnn9xxpT5fQOhgDNs9_xbWn3dfn58I",
//         "user": {
//             "name": "afrin",
//             "email": "afrin@gmail.com",
//             "emailVerified": false,
//             "image": null,
//             "createdAt": "2026-11-12T19:33:02.115Z",
//             "updatedAt": "2026-11-12T19:33:02.115Z",
//             "role": "USER",
//             "status": "ACTIVE",
//             "needpasswordChange": false,
//             "id": "ShBZFcmQ9X178xPCThOLZVgSviSMe5kc"
//         }
//     }
// }


export interface RegisterResponse {
    success: boolean,
    message: string,
    data: {
        token: string,
        accessToken: string,
        refreshToken: string,
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