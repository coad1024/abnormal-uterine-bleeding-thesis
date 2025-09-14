import fitz  # PyMuPDF
import os
from PIL import Image
import io

pdf_path = r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\THESIS.pdf"
output_dir = r"C:\Users\coad1\OneDrive\Desktop\Thesis Figures and descriptions\Thesis_images"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)

# Problem pages that need special handling
problem_pages = [55, 57, 59, 61, 62, 64]

for page_num in range(len(doc)):
    page = doc[page_num]
    
    # For problem pages, try rendering the page as high-resolution image first
    if (page_num + 1) in problem_pages:
        # Render page as high-resolution image (3x zoom for better quality)
        mat = fitz.Matrix(3.0, 3.0)  # 3x zoom
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        
        # Save the high-res page image
        filename = f"page{page_num+1}_highres.png"
        with open(os.path.join(output_dir, filename), "wb") as f:
            f.write(img_data)
        
        # Also try to extract individual images with higher quality
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Try to enhance the image if it's JPEG
            if image_ext.lower() == 'jpeg':
                try:
                    # Open with PIL and enhance
                    img_pil = Image.open(io.BytesIO(image_bytes))
                    # Convert to RGB if needed
                    if img_pil.mode != 'RGB':
                        img_pil = img_pil.convert('RGB')
                    # Enhance contrast and sharpness
                    from PIL import ImageEnhance
                    enhancer = ImageEnhance.Contrast(img_pil)
                    img_pil = enhancer.enhance(1.5)  # Increase contrast
                    enhancer = ImageEnhance.Sharpness(img_pil)
                    img_pil = enhancer.enhance(2.0)  # Increase sharpness
                    
                    # Save as PNG for better quality
                    filename = f"page{page_num+1}_img{img_index+1}_enhanced.png"
                    img_pil.save(os.path.join(output_dir, filename), "PNG", quality=95)
                except Exception as e:
                    print(f"Error enhancing image from page {page_num+1}: {e}")
                    # Fallback to original
                    filename = f"page{page_num+1}_img{img_index+1}.{image_ext}"
                    with open(os.path.join(output_dir, filename), "wb") as f:
                        f.write(image_bytes)
            else:
                filename = f"page{page_num+1}_img{img_index+1}.{image_ext}"
                with open(os.path.join(output_dir, filename), "wb") as f:
                    f.write(image_bytes)
    else:
        # Regular extraction for other pages
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            filename = f"page{page_num+1}_img{img_index+1}.{image_ext}"
            with open(os.path.join(output_dir, filename), "wb") as f:
                f.write(image_bytes)

print("Image extraction completed!")
print(f"Enhanced images saved for pages: {problem_pages}")
