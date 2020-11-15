import glob
from classes.util import Util
import json
import requests

TARGET_URL = [
    'https://fashion-scoring-api.herokuapp.com/more',
    'https://ps7dd07cv1.execute-api.us-east-2.amazonaws.com/more'
]

def more(buffer, gender, my_osyaredo):
    r = requests.post(TARGET_URL[1],
                      data=json.dumps({
                          'buffer': buffer,
                          'gender': gender,
                          'my_osyaredo': my_osyaredo
                      }),
                      headers={'Content-Type': 'application/json'})
    print(r.text)
    return json.loads(json.loads(r.text)["body"])
