from PIL import Image
from clip import CLIPAnalyzer

def main():
    # 1. Get the Singleton instance
    analyzer = CLIPAnalyzer()

    # 2. Define your specific prompts
    prompts1 = ["a photo of a cat", "a photo of not a cat"]
    prompts2 = ["a photo of car", "a photo of not a car"]
    filename = "cat.jpg"

    try:
        # 3. Load the image from disk
        print(f"Opening {filename}...")
        image = Image.open(filename)

        # 4. Analyze
        print("Analyzing...")
        results = analyzer.analyze(image, prompts1)

        # 5. Print Results
        print("\n--- Results ---")
        for prompt, score in results.items():
            print(f"Prompt: '{prompt}' | Confidence: {score:.4f}")

        
                # 4. Analyze
        print("Analyzing...")
        results = analyzer.analyze(image, prompts2)

        # 5. Print Results
        print("\n--- Results ---")
        for prompt, score in results.items():
            print(f"Prompt: '{prompt}' | Confidence: {score:.4f}")




    except FileNotFoundError:
        print(f"Error: Could not find '{filename}' in the current directory.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()