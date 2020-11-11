import re
from io import BytesIO
import base64
from PIL import Image


class Util:
    @staticmethod
    def to_binary(buffer):
        return Image.open(BytesIO(base64.b64decode(buffer)))

    @staticmethod
    def to_base64(binary):
        return base64.b64encode(binary)