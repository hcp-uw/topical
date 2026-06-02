import { createClient } from '@supabase/supabase-js';
import { sb } from './db';

// Documentation: https://supabase.com/docs/reference/javascript/v1/auth-signin

// Registers a new user with the provided email, password and name. 
// Returns sign up result on success, and null on error. 
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

// Checks the database for a user with the given email and password.
// Returns the log in result on success, or null on error.
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

// Signs the current user out.
// Returns null on success, error object on error.
async function authSignOut() {
    try {
        const {error} = await sb.auth.signOut() 
        return error;
    } catch (e) {
        console.error(e);
    }
}

// Checks whether the current session is authenticated. 
// Returns a user object is yes, and null if no.
async function authCurSession() {
    const { data: { user } } = await sb.auth.getUser()
    return user;
}

export { authSignUp, authLogIn, authSignOut, authCurSession }