from PIL import Image
import os

input_path = "images/arunachala-esp-circular_-rgb.webp"
output_path = "images/logo_transparent.png"

def remove_white_bg():
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Threshold for 'white': R, G, B > 240
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Created {output_path}")

if __name__ == "__main__":
    remove_white_bg()
