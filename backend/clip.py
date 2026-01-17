import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

class CLIPAnalyzer:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            print("Singleton: Loading CLIP model... (this happens only once)")
            cls._instance = super(CLIPAnalyzer, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        model_id = "openai/clip-vit-base-patch32"
        
        try:
            self.model = CLIPModel.from_pretrained(model_id).to(self.device)
            self.processor = CLIPProcessor.from_pretrained(model_id)
            self.model.eval()
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise e

    def analyze(self, image: Image.Image, prompts: list[str]) -> dict:
        if image.mode != "RGB":
            image = image.convert("RGB")

        inputs = self.processor(
            text=prompts, 
            images=image, 
            return_tensors="pt", 
            padding=True
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Softmax to get probabilities that sum to 1.0
        probs = outputs.logits_per_image.softmax(dim=1)
        
        results = {}
        for idx, prompt in enumerate(prompts):
            results[prompt] = probs[0][idx].item()
            
        return results