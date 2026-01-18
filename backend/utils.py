from clip import CLIPAnalyzer
import base64
from PIL import Image
import io
import os

clip = CLIPAnalyzer()

def get_clip_score(image : str, prompt: str):
    img_bytes = base64.b64decode(image)
    img = Image.open(io.BytesIO(img_bytes))
    
    results = clip.analyze(img, [prompt, "a photo of something else"])
    return round(results[prompt]*100)
    
def write_image(image: str, quest_id: str, user_id: str):
    img_bytes = base64.b64decode(image)
    output_dir = os.getenv('IMAGE_DIR')
    os.makedirs(output_dir, exist_ok=True)
    print(f"Writing image to {output_dir}")
    image_path = os.path.join(output_dir, f"{quest_id}_{user_id}")
    with open(image_path, 'wb') as f:
        f.write(img_bytes)
    return image_path

def read_image(quest_id: str, user_id: str ):
    output_dir = os.getenv('IMAGE_DIR')
    image_path = os.path.join(output_dir, f"{quest_id}_{user_id}")
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    return base64.b64encode(image_bytes).decode('utf-8')