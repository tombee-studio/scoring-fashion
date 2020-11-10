from torchvision import datasets, models, transforms
import torch.nn as nn
import torch
from PIL import Image


class ScoringModel:
    feature_extract = True
    num_classes = 1

    def __init__(self):
        self.input_size = 224
        self.data_transform = transforms.Compose([
            transforms.RandomResizedCrop(self.input_size),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
        self.model = models.resnet34(pretrained=True)

    def load(self):
        self.set_parameter_requires_grad(self.model, ScoringModel.feature_extract)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Linear(num_ftrs, ScoringModel.num_classes)

        model_path = 'models/model06.pth'
        self.model.load_state_dict(torch.load(model_path))

    def show_result(self, image):
        image = self.data_transform(image)
        image = image.reshape(1, 3, 224, 224)
        output = self.model(image)
        return output

    def set_parameter_requires_grad(self, model, feature_extracting):
        if feature_extracting:
            for param in model.parameters():
                param.requires_grad = False
