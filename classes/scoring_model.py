from torchvision import datasets, models, transforms
import torch.nn as nn
import torch
from glob import glob
import os
from PIL import Image
import glob

#ここだけ弄ってくれたら動くはず。
model_path = 'models/res_18_80.model.pth'
image_path = 'data/m1_akiiiio04_17878073.jpeg'


def set_parameter_requires_grad(model, feature_extracting):
    if feature_extracting:
        for param in model.parameters():
            param.requires_grad = False


def show_result(model, image, data_transform):
    image = data_transform(image)
    image = image.reshape(1,3,224,224)
    output = model(image)
    x = output.detach().numpy().copy()
    
    return x[0][0]


def to_score(score):
    if score > 0:
        score = (score/2) + 50
    else:
        score = 50 + (score/2)
        
    if score > 100:
        score = 100
        
    if score < 0:
        score = 0
        
    return round(score, 1)


def scoring(image):
    feature_extract = True
    num_classes = 1
    model = models.resnet18(pretrained=True)
    set_parameter_requires_grad(model, feature_extract)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(nn.Linear(num_ftrs, 256),
                nn.LeakyReLU(),
                nn.Linear(256, 32),
                nn.LeakyReLU(),
                nn.Linear(32, 1))

    #ハイパラ設定
    feature_extract = True
    num_classes  = 1
    input_size = 224

    #モデルをcpuで動かす↓
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    #モデルをgpuで動かす↓
    # model.load_state_dict(torch.load(model_path))

    data_transform = transforms.Compose([
            transforms.RandomResizedCrop(input_size),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    score = to_score(show_result(model, image, data_transform))
    return score


if __name__ == "__main__":
    for file in glob.glob('data/*.jpeg'):
        print(scoring(Image.open(file)))