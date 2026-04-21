
import logging
import os
import tweepy
from config import (
    TWITTER_API_KEY, TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET,
    TWITTER_BEARER_TOKEN
)

logger = logging.getLogger(__name__)


def _get_clients():
    """v1 aur v2 clients banao"""
    auth = tweepy.OAuth1UserHandler(
        TWITTER_API_KEY, TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
    )
    v1 = tweepy.API(auth, wait_on_rate_limit=True)

    v2 = tweepy.Client(
        bearer_token=TWITTER_BEARER_TOKEN,
        consumer_key=TWITTER_API_KEY,
        consumer_secret=TWITTER_API_SECRET,
        access_token=TWITTER_ACCESS_TOKEN,
        access_token_secret=TWITTER_ACCESS_SECRET,
        wait_on_rate_limit=True
    )
    return v1, v2


def post_meme_tweet(image_path: str, tweet_text: str) -> bool:
    """
    Image ke saath tweet post karo.
    Returns: True if success, False if fail
    """
    try:
        v1, v2 = _get_clients()

        # Step 1: Image upload (v1 API)
        logger.info(f"Image upload ho raha hai: {image_path}")
        media = v1.media_upload(filename=image_path)
        media_id = media.media_id
        logger.info(f"Media ID: {media_id}")

        # Step 2: Tweet post (v2 API)
        tweet_text = _truncate_tweet(tweet_text)
        response = v2.create_tweet(
            text=tweet_text,
            media_ids=[media_id]
        )

        tweet_id = response.data["id"]
        logger.info(f"✅ Tweet posted! ID: {tweet_id} | URL: https://twitter.com/i/web/status/{tweet_id}")
        return True

    except tweepy.TweepyException as e:
        logger.error(f"Twitter API error: {e}")
        return False
    except Exception as e:
        logger.error(f"Post fail: {e}")
        return False


def post_text_tweet(tweet_text: str) -> bool:
    """Sirf text tweet (bina image ke)"""
    try:
        _, v2 = _get_clients()
        tweet_text = _truncate_tweet(tweet_text)
        response = v2.create_tweet(text=tweet_text)
        tweet_id = response.data["id"]
        logger.info(f"✅ Text tweet posted! ID: {tweet_id}")
        return True
    except Exception as e:
        logger.error(f"Text tweet fail: {e}")
        return False


def verify_credentials() -> bool:
    """Twitter credentials check karo"""
    try:
        v1, _ = _get_clients()
        user = v1.verify_credentials()
        logger.info(f"Twitter auth OK: @{user.screen_name}")
        return True
    except Exception as e:
        logger.error(f"Twitter credentials invalid: {e}")
        return False


def _truncate_tweet(text: str, max_len: int = 270) -> str:
    """Tweet length limit enforce karo"""
    if len(text) <= max_len:
        return text
    return text[:max_len - 3] + "..."
