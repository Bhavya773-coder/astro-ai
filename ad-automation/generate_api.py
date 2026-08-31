import os
import sys

def main():
    try:
        import google.generativeai as genai
    except ImportError:
        print("Error: The 'google-generativeai' package is not installed.")
        print("Please run: pip install google-generativeai")
        sys.exit(1)

    # 1. Fetch API Key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable is not set.")
        print("Please set it in your terminal or system environment.")
        sys.exit(1)

    genai.configure(api_key=api_key)

    # 2. Get prompt from user or use default
    default_prompt = (
        "A mystical astrological illustration for Instagram ad, pastel watercolor theme, "
        "crescent moon and stars, modern spiritual aesthetic, square 1:1 aspect ratio"
    )
    prompt = input(f"Enter prompt for image [Press Enter for default: '{default_prompt}']: ")
    if not prompt.strip():
        prompt = default_prompt

    print("\nRequesting image generation via official Gemini API (Imagen 3)...")
    
    try:
        # Load the Imagen model
        model = genai.ImageGenerationModel("imagen-3.0-generate-002")
        
        # Generate image
        result = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="1:1",
            output_mime_type="image/png",
        )
        
        # Save image
        output_filename = "gemini_api_ad.png"
        for image in result.images:
            image.image.save(output_filename)
            print(f"Success! Saved generated image as '{output_filename}' in current directory.")
            break
            
    except Exception as e:
        print(f"Error during image generation: {e}")
        print("Make sure your API key has access to the Imagen 3 model.")

if __name__ == "__main__":
    main()
