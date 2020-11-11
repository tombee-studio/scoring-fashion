import os
from classes.scoring_model import ScoringModel
from classes.more_fashionable_model import MoreFashionableModel
from classes.util import Util
from flask import Flask, render_template, url_for, request
import json

app = Flask(__name__)
scoringModel = ScoringModel()
scoringModel.load()

more_fashionable = MoreFashionableModel()


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')


@app.route('/score', methods=["POST"])
def score():
    image = Util.to_binary(json.loads(request.data.decode())["buffer"]).convert('RGB')
    result = more_fashionable.result()
    value = scoringModel.show_result(image).detach().numpy()[0][0]
    return json.dumps({
        'score': str(round(value, 2)),
        'result': result
    }), 200


if __name__ == '__main__':
    app.run()
