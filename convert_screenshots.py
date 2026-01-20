import os
import glob
from PIL import Image

source_dir = "/home/albertosanzdev/.gemini/antigravity/brain/01e7be9a-4504-417c-aca4-a8dcd3cf2f49/"
target_dir = "design_prototypes/"

# Map sample_id -> (timestamp, full_path)
latest_files = {}

files = glob.glob(os.path.join(source_dir, "sample_*_polished_*.png"))

for f in files:
    filename = os.path.basename(f)
    parts = filename.split('_')
    # Expected: sample, ID, polished, Timestamp.png
    if len(parts) >= 4:
        sample_id = parts[1]
        try:
            timestamp = int(parts[3].split('.')[0])
            
            if sample_id not in latest_files or timestamp > latest_files[sample_id][0]:
                latest_files[sample_id] = (timestamp, f)
        except ValueError:
            continue

print(f"Found latest files for samples: {list(latest_files.keys())}")

for sample_id, (_, src_path) in latest_files.items():
    try:
        img = Image.open(src_path)
        rgb_im = img.convert('RGB')
        dest_path = os.path.join(target_dir, f"sample_{sample_id}_polished.jpg")
        rgb_im.save(dest_path, "JPEG", quality=90)
        print(f"Converted {src_path} -> {dest_path}")
    except Exception as e:
        print(f"Error converting {src_path}: {e}")
