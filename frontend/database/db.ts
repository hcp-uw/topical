import { createClient } from '@supabase/supabase-js';

const sbUrl = 'https://wgsfauqeoajswlewbfjq.supabase.co';
const sbKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
if (sbKey === undefined) {
    throw new Error("Could not load Supabase API key from environment variables");
}
const sb = createClient(sbUrl, sbKey);

// Add a new topic to the database with its title, authors, summary, source and category.
async function dbInsertTopic(title: String, original_title: String, authors: String, summary: String, source_link: String, category: String, date: String) {
    try {
        let res = await sb.from("Topics").insert(
            {
                title: title.toLowerCase(), 
                original_title: original_title.toLowerCase(), 
                authors: authors.toLowerCase(), 
                summary: summary, 
                source_link: source_link, 
                category: category.toLowerCase(),
                source_date: date // must be form 'YYYY-MM-DD'
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
        let res = await sb.from("Topics").select().eq("id", id.toLowerCase());
        console.log(res);
        return res;
    } catch (e) {
        console.error(e)
    }
}

// Get n topics that the user hasn't seen from the database
async function dbGetN(uid: String, n: number) {
    try { 
        let userViews = await sb.from("UserViews").select("topic_id").eq("user_id", uid)

        const viewedIds = (userViews.data ?? []).map((r: any) => r.topic_id);

        let topics_query = sb.from("Topics").select("*").limit(Math.floor(n));

        if (viewedIds.length > 0) {
            topics_query = topics_query.not("id", "in", `(${viewedIds.join(",")})`);
        }
        
        const res = await topics_query;
        
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

export {sb, dbInsertTopic, dbGetTopic, dbGetN, dbGetAuthors, dbGetCategory}