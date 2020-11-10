import re
from io import BytesIO
import base64
from PIL import Image


class Util:
    @staticmethod
    def ToBinary(buffer):
        return Image.open(BytesIO(base64.b64decode(buffer)))
