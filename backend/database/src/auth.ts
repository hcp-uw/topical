import { createClient } from '@supabase/supabase-js';
import "dotenv/config";
import { sb } from './db';

// Documentation: https://supabase.com/docs/reference/javascript/v1/auth-signin

// Add user when they sign up
async function authSignUp(email: string, password: string, fname: string, lname: string) {
    try {
        let res = await sb.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: fname, 
                    last_name: lname
                }
            }
        })
        console.log(res)
    } catch (e) {
        console.error(e);
    }
}

// Checks the database for user trying to log in
async function authLogIn(email: string, password: string) {
    try {
        let res = await sb.auth.signInWithPassword({
            email: email,
            password: password,
        })
        console.log(res);
        return res;
    } catch (e) {
        console.error(e);
    }
}

// Signs the user out
async function authSignOut() {
    try {
        let res = await sb.auth.signOut() 
        console.log(res);
        return res;
    } catch (e) {
        console.error(e);
    }
}

export { authSignUp, authLogIn, authSignOut }