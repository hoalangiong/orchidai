from PIL import Image
import os
import sys

# Google Play Store requirements:
# - Min: 320px
# - Max: 3840px
# - Aspect ratio: 16:9 or 9:16 (portrait recommended)
# - Format: PNG or JPEG
# - Max file size: 8MB per image
# - Recommended: 1080x1920px (9:16 portrait)

input_dir = r"C:\Users\Dell Precision 5560\Downloads\orchidgg\screenshort"
output_dir = r"C:\Users\Dell Precision 5560\orchid-farm-v2\resources\screenshots"

os.makedirs(output_dir, exist_ok=True)

files = [f for f in os.listdir(input_dir) if f.endswith('.jpg')]
files.sort()

print(f"Found {len(files)} screenshots")

for i, filename in enumerate(files, 1):
    input_path = os.path.join(input_dir, filename)
    output_filename = f"screenshot_{i}.jpg"
    output_path = os.path.join(output_dir, output_filename)

    try:
        img = Image.open(input_path)
        width, height = img.size

        print(f"\n{filename}:")
        print(f"  Original: {width}x{height}")

        # Check if resize needed
        # Google Play recommends 1080x1920 for portrait
        target_width = 1080
        target_height = 1920

        # Calculate aspect ratio
        aspect = width / height
        target_aspect = target_width / target_height

        # If image is portrait and close to 9:16, resize to 1080x1920
        if height > width:  # Portrait
            if aspect < 0.6:  # Close to 9:16 (0.5625)
                # Resize to fit 1080x1920
                img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            else:
                # Keep aspect ratio, scale to width 1080
                new_height = int(height * (target_width / width))
                img_resized = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
        else:  # Landscape or square
            # Keep aspect ratio, scale to fit
            if width > target_width:
                new_height = int(height * (target_width / width))
                img_resized = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
            else:
                img_resized = img

        # Save with optimization
        img_resized.save(output_path, 'JPEG', quality=85, optimize=True)

        # Check file size
        file_size = os.path.getsize(output_path) / 1024  # KB
        final_width, final_height = img_resized.size

        print(f"  Final: {final_width}x{final_height}")
        print(f"  Size: {file_size:.1f} KB")
        print(f"  Saved: {output_filename}")

    except Exception as e:
        print(f"  Error: {e}")

print(f"\n✅ Processed {len(files)} screenshots")
print(f"📁 Output: {output_dir}")
