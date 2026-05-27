import random
from typing import List, Dict, Any
from supabase import Client, create_client
import os
from dotenv import load_dotenv

load_dotenv()

class RecommendationEngine:
    """
    Recommendation system that suggests articles based on user interests.
    Weighs user likes (full weight) and views (1/4 weight) to generate recommendations.
    """
    
    def __init__(self, db: Client):
        self.db = db
        self.view_weight = 0.25
        self.like_weight = 1.0
    
    def get_user_interests(self, user_id: int) -> Dict[str, float]:
        """
        Fetch user's initial interests from likes and views.
        Returns a dictionary mapping topic_id to weighted score.
        """
        try:
            likes_response = self.db.table("Likes").select("topic_id").eq("user_id", user_id).execute()
            likes = likes_response.data if likes_response.data else []
            
            views_response = self.db.table("Views").select("topic_id").eq("user_id", user_id).execute()
            views = views_response.data if views_response.data else []
        except Exception as e:
            print(f"Error fetching user interests: {e}")
            return {}
        
        topic_scores = {}
        
        # Process likes (full weight)
        for like in likes:
            topic_id = like['topic_id']
            topic_scores[topic_id] = topic_scores.get(topic_id, 0) + self.like_weight
        
        # Process views (1/4 weight)
        for view in views:
            topic_id = view['topic_id']
            topic_scores[topic_id] = topic_scores.get(topic_id, 0) + self.view_weight
        
        return topic_scores
    
    def get_candidate_articles(self, topic_scores: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Fetch list of potential articles based on user's interest topics.
        Returns articles sorted by relevance score.
        """
        if not topic_scores:
            try:
                response = self.db.table("Topics").select("*").limit(20).execute()
                return response.data if response.data else []
            except Exception as e:
                print(f"Error fetching random articles: {e}")
                return []
        
        articles = []
        for topic_id, score in topic_scores.items():
            try:
                response = self.db.table("Topics").select("*").eq("id", topic_id).execute()
                topic_articles = response.data if response.data else []
                for article in topic_articles:
                    article['relevance_score'] = score
                    articles.append(article)
            except Exception as e:
                print(f"Error fetching articles for topic {topic_id}: {e}")
        
        # Remove duplicates and sort by relevance
        seen_ids = set()
        unique_articles = []
        for article in articles:
            if article['id'] not in seen_ids:
                seen_ids.add(article['id'])
                unique_articles.append(article)
        
        return sorted(unique_articles, key=lambda x: x['relevance_score'], reverse=True)
    
    def get_next_recommendation(self, user_id: int) -> Dict[str, Any]:
        """
        Generate the next article recommendation for a user.
        """
        # Fetch user interests
        topic_scores = self.get_user_interests(user_id)
        
        # Get candidate articles
        candidate_articles = self.get_candidate_articles(topic_scores)
        
        if not candidate_articles:
            return None
        
        # Randomly select from candidates (weighted by relevance)
        recommended_article = random.choices(
            candidate_articles,
            weights=[a['relevance_score'] for a in candidate_articles],
            k=1
        )[0]
        
        return recommended_article


# Usage example
if __name__ == "__main__":
    sbUrl = 'https://wgsfauqeoajswlewbfjq.supabase.co'
    sbKey = os.environ.get("SUPABASE_KEY")
    
    if sbKey is None:
        raise Exception("Could not find SUPABASE_KEY")
    
    sb = create_client(sbUrl, sbKey)
    recommender = RecommendationEngine(sb)
    
    user_id = 1
    next_article = recommender.get_next_recommendation(user_id)
    print(f"Recommended article: {next_article}")