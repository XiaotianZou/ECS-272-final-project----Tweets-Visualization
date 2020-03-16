from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

import json
import tweepy
import GetOldTweets3 as got
import ssl
import nltk
from nltk.stem import PorterStemmer
from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import word_tokenize, RegexpTokenizer
from nltk.corpus import stopwords
import numpy as np
import csv
import gensim.downloader as api
from scipy.spatial import distance

word_vectors = api.load("glove-wiki-gigaword-100")


nltk.download('stopwords')
nltk.download('punkt')

ssl._create_default_https_context = ssl._create_unverified_context
stops = set(stopwords.words("english"))
anew = 'static/NRC-VAD-Lexicon.txt'
emo_dict = {'anger': 0, 'anticipation': 1, 'disgust': 2, 'fear': 3, 'joy': 4, 'sadness': 5, 'surprise': 6, 'trust': 7}
similarity_threshold = 0.7

# GetOldTweets3
def init_word_emotion_list():
    word_dict = {}
    f = open('static/NRC_emotion_lexicon_list.txt')
    lines = f.readlines()
    for line in lines:
        if line.find('1') != -1:
            components = line.split('\t')
            if components[1] != 'positive' and components[1] != 'negative':
                if components[0] in word_dict.keys():
                    word_dict[components[0]].append(components[1])
                else:
                    word_dict[components[0]] = [components[1]]
    return word_dict

def get_str_vector(inputs):
    result = []
    for word in inputs:
        try:
            if word == ' ':
                continue
            if  result == []:
                result.append(np.array(word_vectors[word]))
            else:
                result[-1] += np.array(word_vectors[word])
        except KeyError:
            pass
        continue
    return np.array(result)

def init_vad():
    vad_arr = {}
    f = open(anew)
    lines = f.readlines()
    for line in lines:
        components = line.split('	')
        vad_arr[components[0]] = []
        for i in range(1, 4):
            vad_arr[components[0]].append(float(components[i]))
    return vad_arr


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


def get_p_value(word, word_dict):
    p_arr = [0, 0, 0, 0, 0, 0, 0, 0]
    if word in word_dict.keys():
        for emo in word_dict[word]:
            p_arr[emo_dict[emo]] += 1
    return p_arr

def get_mean(arr):
    result = []
    for index in range(len(arr)):
        tmp_sum = 0
        for i in range(len(arr[index])):
            tmp_sum += arr[index][i]
        result.append(tmp_sum / len(arr[index]))
    return result

def get_strs_similarity(vec1, vec2):
    similarity = 1 - distance.cosine(vec1, vec2)
    if similarity > similarity_threshold:
        return True
    else:
        return False

def get_cluster(tweets):
    split_marks = [0]
    word_list = tweets[0]['text'].split()
    former_vec = get_str_vector(word_list)
    for i in range(1, len(tweets)):
        word_list = tweets[i]['text'].split()
        vec = get_str_vector(word_list)
        print(vec)
        if len(vec) == 0:
            continue
        sim = get_strs_similarity(vec, former_vec)
        if sim == True:
            split_marks[-1] = i + 1
        else:
            split_marks.append(i + 1)
        former_vec = vec
    return split_marks


def process_tweets(tweets, word_dict, vad_dict):
    """
    :param tweet: a single tweet from "get_tweets_got" function
    :return: a tweet-like dict
    """
    time_arr = []
    words_arr = []
    p_arr = [0, 0, 0, 0, 0, 0, 0, 0]
    v_list = [[0], [0], [0], [0], [0], [0], [0], [0]]
    a_list = [[0], [0], [0], [0], [0], [0], [0], [0]]
    d_list = [[0], [0], [0], [0], [0], [0], [0], [0]]
    trigger_words_list = []
    for tweet in tweets:
        tmp_trigger_words = []
        time = tweet['time']
        text = tweet['text']
        time_arr.append(str(time))
        words_arr.append(text)
        # tokenize
        words = word_tokenize(text)
        for i in range(len(words)):
            if words[i] in stops or not words[i].isalpha():
                continue
            neg = False
            # 检查当前word前是否有否定词
            for index in range(i - 1, i - 3, -1):
                if index < 0:
                    break
                if words[index] == 'not' or words[index] == 'no' or words[index] == 'n\'t':
                    neg = True
                    break
            tmp_p_val = get_p_value(words[i], word_dict)
            for index in range(len(p_arr)):
                p_arr[index] += tmp_p_val[index]
                if words[i] in vad_dict.keys() and tmp_p_val[index] > 0:
                    v = vad_dict[words[i]][0]
                    a = vad_dict[words[i]][1]
                    d = vad_dict[words[i]][2]
                    if index == 0:
                        tmp_trigger_words.append([words[i], v, a, d, tmp_p_val])
                    if neg:
                        v = 1 - v
                        a = 1 - a
                        d = 1 - d
                        # v = 5 - (v - 5)
                        # a = 5 - (a - 5)
                        # d = 5 - (d - 5)
                    
                    v_list[index].append(v)
                    a_list[index].append(a)
                    d_list[index].append(d)
        trigger_words_list.extend(tmp_trigger_words)
    return {'time': time_arr,
            'words': words_arr,
            'category': p_arr,
            'valence': get_mean(v_list),
            'arousal': get_mean(a_list),
            'dominance': get_mean(d_list),
            'trigger': trigger_words_list}



def index(req):
    tweets = get_tweets_got(req.GET['id'], since='2020-01-02', until='2020-03-09', count=500)
    word_dict = init_word_emotion_list()
    vad_dict = init_vad()
    result = {'data': []}
    i = 0
    split_marks = get_cluster(tweets)
    print(split_marks)
    for i in range(0, len(split_marks) - 1):
        result['data'].append(process_tweets(tweets[split_marks[i]: split_marks[i + 1]], word_dict, vad_dict))
    res = HttpResponse(json.dumps(result), content_type="application/json")
    res["Access-Control-Allow-Origin"] = "*"
    res["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    res["Access-Control-Max-Age"] = "1000"
    res["Access-Control-Allow-Headers"] = "*"
    print(res._headers)
    return res