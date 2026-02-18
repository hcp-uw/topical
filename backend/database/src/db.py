import os
from supabase import Client, create_client
from dotenv import load_dotenv

load_dotenv()

sbUrl = 'https://wgsfauqeoajswlewbfjq.supabase.co'
sbKey = os.environ.get("SUPABASE_KEY")

if sbKey is None:
    raise Exception("Could not find SUPABASE_KEY")

sb: Client = create_client(sbUrl, sbKey)

def dbInsertTopic(title: str, original_title: str, authors: str, summary: str,
                   source_link: str, category: str, source_date : str):
    try:
        res = sb.table("Topics").insert({
            "title": title.lower(), 
            "original_title": original_title.lower(),
            "authors": authors.lower(), 
            "summary": summary, 
            "source_link": source_link, 
            "category": category.lower(),
            "source_date": source_date
        }).execute()
        print(res)
    except Exception as e:
        print("Error:", e)