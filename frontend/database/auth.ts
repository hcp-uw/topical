import { createClient } from '@supabase/supabase-js';
import { sb } from './db';

// Documentation: https://supabase.com/docs/reference/javascript/v1/auth-signin

// Add user when they sign up
async function authSignUp(email: string, password: string, name: string) {
    try {
        let {data, error} = await sb.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                }
            }
        })
        return error === null ? data : null;
    } catch (e) {
        console.error(e);
    }
}

// Checks the database for user trying to log in
async function authLogIn(email: string, password: string) {
    try {
        const {data, error} = await sb.auth.signInWithPassword({
            email: email,
            password: password,
        })
        return error === null ? data : null;
    } catch (e) {
        console.error(e);
    }
}

// Signs the user out
async function authSignOut() {
    try {
        const {error} = await sb.auth.signOut() 
        return error;
    } catch (e) {
        console.error(e);
    }
}

async function authCurSession() {
    const { data: { user } } = await sb.auth.getUser()
    return user;
}

export { authSignUp, authLogIn, authSignOut, authCurSession }