import { createContext, useState, useContext, useEffect } from "react"
import { registerRequest, loginrequest, profilerequest, verifytokenRequet, forgetPasswordRequet } from "../api/auth.js"
import Cookies from "js-cookie"

export const Authcontext = createContext()

export const useAuth = () => {
    const context = useContext(Authcontext);
    if(!context) {
        throw new Error("UseAuth must be used within an AuthProvider")
    }

    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [errores, setErrores] = useState([])
    const [loading, setLoading] = useState(true)
    
    const signup = async (user) => {
        try {
            const res = await registerRequest(user) 
            setUser(res.data)
            // console.log("Auth:", user)
            setAuthenticated(true)
        } catch (error) {
            setErrores(error.response.data)
        }
    }

    const singin = async (user) => {
        try {
            const res = await loginrequest(user)
            // console.log(res);
            setAuthenticated(true) 
            setUser(res.data)
        } catch (error) {
            if( Array.isArray(error.response.data)){
                setErrores(error.response.data)
            } else {
                setErrores([error.response.data.message])
            }
        }
    }

    const Logout = () => {
        Cookies.remove('token');
        setAuthenticated(false)
        setUser(null)
    }
    
    useEffect( () => {
        if(errores.length > 0 ) {
            const timer = setTimeout(() => {
                setErrores([])
            }, 7000)
            // una vez que no se utiliza limpiamos el setTimeout
            return () => clearTimeout(timer)
        }
    }, [errores] )
    
    useEffect( () => {
        async function checkLogin () {
            const cookies = Cookies.get()

            if(!cookies.token) {
                setAuthenticated(false)
                setLoading(false)
                return setUser(null)
            }    

            try {
                const res = await verifytokenRequet(cookies.token) 
                if(!res.data) {
                    setAuthenticated(false)
                    setLoading(false)
                    return;
                }
                
                setAuthenticated(true)
                setUser(res.data)
                setLoading(false)
            } catch (error) {
                setAuthenticated(false)
                setUser(null)
                setLoading(false)
            }
            
        }

        checkLogin()
    }, [] )

    const profile = async (id) => {
        try {
            const res = await profilerequest(id)
            // console.log("dsd", res.data);
            return res.data;
        } catch (error) {
            console.log(error);
        }
    } 

    const forget_Pass = async (id) => {
        try {
            const res = await forgetPasswordRequet(id)
            // console.log(res);
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <Authcontext.Provider value={{
            signup,
            singin,
            user,
            isAuthenticated,
            errores,
            loading,
            profile,
            Logout,
            forget_Pass
        }}>
            {children}
        </Authcontext.Provider>
    )
}