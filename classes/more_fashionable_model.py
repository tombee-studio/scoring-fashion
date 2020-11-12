import glob
from classes.util import Util
import json


class MoreFashionableModel:
    def __init__(self):
        pass

    def result(self):
        characters = []
        for file in glob.glob('data/*.jpeg'):
            with open(file, 'rb') as image:
                characters.append({
                    'score': 4.0,
                    'base64': Util.to_base64(image.read()).decode(),
                    'items': [

                    ]
                })
        return characters
