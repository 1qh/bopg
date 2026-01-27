from base64 import b64decode
from io import BytesIO

from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI()
model = YOLO('best.pt')

# taken from https://huggingface.co/OpenDILabCommunity/webpage_element_detection/blob/main/web_detect_best_m_4x_600.pt


class ImageRequest(BaseModel):
  image: str


@app.post('/boxes')
def boxes(request: ImageRequest) -> list[dict]:
  boxes = model.predict(Image.open(BytesIO(b64decode(request.image))), classes=[0, 4], conf=0.5)[0].boxes
  if not boxes:
    return []

  xywhn = boxes.xywhn.tolist()
  return [
    {
      'x': x,
      'y': y,
      'w': w,
      'h': h,
    }
    for (x, y, w, h) in xywhn
  ]
