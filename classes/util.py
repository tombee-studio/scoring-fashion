from PIL import Image
from io import BytesIO
import base64


class Util:
    @staticmethod
    def ToBinary(buffer):
        return Image.open(BytesIO(base64.b64decode(buffer)))
