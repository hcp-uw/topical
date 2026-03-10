import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const sbUrl = 'https://wgsfauqeoajswlewbfjq.supabase.co';
const sbKey = process.env.SUPABASE_KEY;
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

        let topics_query = sb.from("Topics").select("*").limit(Math.floor(n));

        if (userViews.data != null && userViews.data.length > 0) {
            n = userViews.data.length
            let topicIds = "("
            for (let i = 0; i < n - 1; i++) {
                topicIds += userViews.data[i].topic_id + ","
            }
            topicIds += userViews.data[n-1].topic_id + ")"

            topics_query = topics_query.not("id", "in", topicIds);
        }
        
        const res = await topics_query;
        
        return res;
    } catch (e) {
        console.error(e)
    }
}

async function dbSearch(searchTerm: String) {
    try {
        let res = await sb.from("Topics").select()
            .or(`title.ilike.${searchTerm},
                original_title.ilike.${searchTerm},
                authors.ilike.${searchTerm},
                summary.ilike.${searchTerm},
                category.ilike.${searchTerm}`
            )

        return res
    } catch (e) {
        console.error(e)
    }
}

export {sb, dbInsertTopic, dbGetTopic, dbGetN, dbSearch}