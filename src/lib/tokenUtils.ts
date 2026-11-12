/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt , { JwtPayload } from "jsonwebtoken";

const TOKEN_EXPIRY_BUFFER_SECONDS = 5 * 60

export const isTokenExpiringSoon = (token: string): boolean => {
    const decoded = jwt.decode(token)

    if (!decoded || typeof decoded === "string" || typeof decoded.exp !== "number") {
        return true
    }

    return decoded.exp <= Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_BUFFER_SECONDS
}



const verifyToken=(token:string, secret:string)=>{
try {
    const decoded=jwt.verify(token,secret) as JwtPayload
    return{
        success:true,
        data:decoded
    }

    
} catch (error:any) {
    return{
        success:false,
        message:error.message,
        error
    }
    
}
}

const decodedToken=(token:string)=>{
    const decoded=jwt.decode(token) as string 
    return decoded
}

export const jwtutils={
   
    verifyToken,
    decodedToken
}