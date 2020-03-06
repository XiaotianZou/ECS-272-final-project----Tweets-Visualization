import json
import tweepy
import GetOldTweets3 as got
import ssl
import nltk
import contractions
from nltk.stem import PorterStemmer
from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import word_tokenize, RegexpTokenizer

ssl._create_default_https_context = ssl._create_unverified_context

# tweepy
# def get_tweets(screen_name, count):
#     """
#     screen_name: screen_name in string
#     count: max tweet number
#     :return: a list of dic with keys 'created_at' and 'full_text', both string
#     """
#     consumer_key = '10ZCSY0nk8ke7sJrWq0TLmbnw'
#     consumer_secret = 'b2VMSOnP4epXkedJCqfIkpL7953E1vWABwTNGnbQkULsXTfBrN'
#     access_token = '582255004-iEsoGNZh6JyKkU0f7l9F2gr7qpvw2BLxyWdD5EmA'
#     access_token_secret = 'rHarf5wMb4LnYjP42U9ZPuml202BifQA66EqJ4eXcBlD0'
#
#     auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
#     auth.set_access_token(access_token, access_token_secret)
#
#     api = tweepy.API(auth)
#     status_list = api.user_timeline(screen_name=screen_name, count=count, tweet_mode="extended")
#
#     tweets = [{'created_at': json.loads(json.dumps(status._json))['created_at'],
#               'full_text': json.loads(json.dumps(status._json))['full_text']} for status in status_list]
#
#     return tweets

# print(get_tweets("realDonaldTrump", count=200))

# GetOldTweets3
def get_tweets_got(user_name, since, until, count=100):
    """
    :param user_name: string after '@'
    :param since: yyyy-mm-dd UTC
    :param until: yyyy-mm-dd UTC
    :param count: int, default 100
    :return: a list of dicts (time: datetime, text: string)
    """
    tweetCriteria = got.manager.TweetCriteria().setUsername(user_name) \
        .setSince(since) \
        .setUntil(until) \
        .setMaxTweets(count) \
        .setEmoji("unicode")
    tweets = got.manager.TweetManager.getTweets(tweetCriteria)

    tweets = [{'time': tweet.date,
               'text': tweet.text} for tweet in tweets]

    return tweets


def process_tweets(tweet):
    """
    :param tweet: a single tweet from "get_tweets_got" function
    :return: a tweet-like dict
    """
    time = tweet['time']
    text = tweet['text']

    # change can't to cannot, don't to do not
    text = contractions.fix(text)

    # tokenize
    words = word_tokenize(text)

    # stemmer to be changed
    stemmer = SnowballStemmer("english")
    # stemmer = PorterStemmer()

    words = [stemmer.stem(word).lower() for word in words if word.isalpha()]

    return {'time': time,
            'words': words}


def do_testing():
    tweets = get_tweets_got("realDonaldTrump", since='2020-03-04', until='2020-03-05', count=200)[:20]
    print(process_tweets(tweets[1]))
    # for t in tweets:
    #     print(process_tweets(t))


# for testing
# print(get_tweets_got("realDonaldTrump", since='2020-02-02', until='2020-03-02', count=200))

do_testing()