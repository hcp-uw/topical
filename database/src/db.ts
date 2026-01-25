import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const sbUrl = 'https://vgagxddospjhsebqpbqa.supabase.co';
const sbKey = process.env.SUPABASE_KEY;
if (sbKey === undefined) {
    throw new Error("Could not load Supabase API key from environment variables");
}
const sb = createClient(sbUrl, sbKey);

// Add a new topic to the database with its title, authors, summary, source and category.
async function dbInsertTopic(title: String, authors: String, summary: String, source_link: String, category: String) {
    try {
        let res = await sb.from("Topics").insert(
            {
                title: title.toLowerCase(), 
                authors: authors.toLowerCase(), 
                summary: summary, 
                source_link: source_link, 
                category: category.toLowerCase()
            }
        )
        console.log(res)
    } catch (e) {
        console.error(e)
    }
}

// Get specific topic by ID
async function dbGetTopic(id: String) {
    try {
        let res = await sb.from("Topics").select().eq("title", id.toLowerCase());
        console.log(res);
        return res;
    } catch (e) {
        console.error(e)
    }
}

// Get all topics from the database
async function dbGetAll() {
    try { 
        let res = sb.from("Topics").select();
        console.log(res)
        return res;
    } catch (e) {
        console.error(e)
    }
}

// Get all topics with a matching category from the database.
async function dbGetCategory(category: String) {
    return sb.from("Topics").select().eq("category", category.toLowerCase())
}

// Get all topics with a matching author from the database.
async function dbGetAuthors(authors: String) {
    return sb.from("Topics").select().eq("authors", authors.toLowerCase())
}

export {sb, dbInsertTopic, dbGetTopic, dbGetAll, dbGetAuthors, dbGetCategory}