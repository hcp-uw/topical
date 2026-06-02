import { createClient } from '@supabase/supabase-js';

const sbUrl = 'https://wgsfauqeoajswlewbfjq.supabase.co';
const sbKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
if (sbKey === undefined) {
    throw new Error("Could not load Supabase API key from environment variables");
}
const sb = createClient(sbUrl, sbKey);


// Fetches articles that the user with id uid hasn't seen from the database. Fetches n articles, offset by offset parameter. 
// Limits categories of articles to categories parameter. If categories is empty, it does not limit by category. 
// Returns query result, including error if there is one.
async function dbGetN(uid: String, offset: number, n: number, categories: string[]) {
    try { 
        let userViews = await sb.from("views").select("topic_id").eq("user_id", uid)

        const viewedIds = (userViews.data ?? []).map((r: any) => r.topic_id);

        offset = Math.floor(offset);
        n = Math.floor(n);
        let topics_query = sb.from("Topics").select().order("created_at", {ascending: false, nullsFirst: false}).range(offset, offset + n - 1);

        if (viewedIds.length > 0) {
            topics_query = topics_query.not("id", "in", `(${viewedIds.join(",")})`);
        }
        if (categories.length > 0) {
            topics_query = topics_query.in("category", categories)
        }
        
        const res = await topics_query;
        
        return res;
    } catch (e) {
        console.error(e)
    }
}

// Searches the database for articles where the title, original title, authors, summary or category contains the searchTerm parameter.
// Returns the query result, including error if there is one. 
async function dbSearchN(searchTerm: String, offset: number, n: number) {
    try {
        const res = await sb.from("Topics").select()
            .or(`title.ilike.%${searchTerm}%,original_title.ilike.%${searchTerm}%,authors.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
            .order("created_at", {ascending: false, nullsFirst: false})
            .range(offset, offset + n - 1);

        return res;
    } catch (e) {
        console.error(e)
    }
}

// Queries the database for all unique categories present. 
// Returns the query result, including error if there is one. 
async function dbGetCategories() {
    try {
        const res = await sb.rpc("get_categories");

        return res;
    } catch (e) {
        console.error(e)
    }
}

// Returns whether the user with id userId has liked the article with id topicId.
// Alerts on failure. 
async function dbGetLiked(userId: string, topicId: string) {
    try {
        const {data, error} = await sb.from("likes").select().eq("user_id", userId).eq("topic_id", topicId);
        if (error !== null) {
            alert("Error fetching like status: " + error);
            return;
        } 
        dbAddView(userId, topicId);
        if (data.length === 1) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
    }
}

// Marks the article with id topicId as being viewed by the user with id userId.
async function dbAddView(userId: string, topicId: string) {
    try {
        const {error} = await sb.from("views").upsert({user_id: userId, topic_id: topicId});
    } catch (e) {
        console.error(e);
    }
}

// If status parameter is true, adds a record to the database indicating that the user with id userId has liked article with id topicId.
// If status parameter is false, removes any such record that already exists. 
async function dbSetLiked(userId: string, topicId: string, status: boolean) {
    try {
        if (status) {
            const {error} = await sb.from("likes").upsert({user_id: userId, topic_id: topicId});
        } else {
            const {error} = await sb.from("likes").delete().eq("user_id", userId).eq("topic_id", topicId);
        }
    } catch (e) {
        console.error(e);
    }
}

// Queries the database for all articles that have been liked by the user with id userId. 
// Alerts on error, and returns the list of articles otherwise. 
async function dbGetUserLikes(userId: string) {
    try {
        const {data, error} = await sb.from("likes").select("topic_id").eq("user_id", userId);
        if (error !== null) {
            alert("Error fetching liked topics: " + error);
        } else {
            const likedIds = data.map((r: any) => r.topic_id);
            const res = await sb.from("Topics").select().in("id", likedIds);
            return res.data;
        }
    } catch (e) {
        console.error(e);
    }
}

export {sb, dbGetN, dbSearchN, dbGetCategories, dbGetLiked, dbSetLiked, dbGetUserLikes}