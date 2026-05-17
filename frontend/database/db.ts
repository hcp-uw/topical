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
        const res = await sb.from("Topics").insert(
            {
                title: title, 
                original_title: original_title, 
                authors: authors, 
                summary: summary, 
                source_link: source_link, 
                category: category,
                source_date: date // must be form 'YYYY-MM-DD'
            }
        )
    } catch (e) {
        console.error(e);
    }
}

// Get specific topic by ID
async function dbGetTopic(id: String) {
    try {
        const res = await sb.from("Topics").select().eq("id", id.toLowerCase());
        return res;
    } catch (e) {
        console.error(e)
    }
}

// Get n topics that the user hasn't seen from the database
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

async function dbSearchN(searchTerm: String, offset: number, n: number) {
    try {
        const res = await sb.from("Topics").select()
            .or(`title.ilike.*${searchTerm}*,original_title.ilike.*${searchTerm}*,authors.ilike.*${searchTerm}*,summary.ilike.*${searchTerm}*,category.ilike.*${searchTerm}*`)
            .order("created_at", {ascending: false, nullsFirst: false})
            .range(offset, offset + n - 1);

        return res;
    } catch (e) {
        console.error(e)
    }
}

async function dbGetCategories() {
    try {
        const res = await sb.rpc("get_categories");

        return res;
    } catch (e) {
        console.error(e)
    }
}

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

async function dbAddView(userId: string, topicId: string) {
    try {
        const {error} = await sb.from("views").upsert({user_id: userId, topic_id: topicId});
    } catch (e) {
        console.error(e);
    }
}

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


export {sb, dbInsertTopic, dbGetTopic, dbGetN, dbSearchN, dbGetCategories, dbGetLiked, dbSetLiked, dbGetUserLikes}