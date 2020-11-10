import os
from classes.scoring_model import ScoringModel
from classes.util import Util
from flask import Flask, render_template, url_for, request
import json

app = Flask(__name__)
scoringModel = ScoringModel()
scoringModel.load()


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
    image = Util.ToBinary(json.loads(request.data.decode())["buffer"]).convert('RGB')
    return str(scoringModel.show_result(image).detach().numpy()[0][0]), 200


if __name__ == '__main__':
    app.run()
