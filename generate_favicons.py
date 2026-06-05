from PIL import Image
import os

def generate_favicons(source_path, output_dir):
    sizes = {
        'favicon-16x16.png': (16, 16),
        'favicon-32x32.png': (32, 32),
        'apple-touch-icon.png': (180, 180),
        'android-chrome-192x192.png': (192, 192),
        'android-chrome-512x512.png': (512, 512),
    }
    
    img = Image.open(source_path)
    
    # Garantir que o diretório de saída existe
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    for name, size in sizes.items():
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        resized_img.save(os.path.join(output_dir, name))
        print(f"Gerado: {name} ({size[0]}x{size[1]})")
    
    # Gerar o favicon.ico (contendo múltiplos tamanhos)
    img.save(os.path.join(output_dir, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    print("Gerado: favicon.ico")

if __name__ == "__main__":
    source = "/home/ubuntu/upload/SIMBOLO.png"
    output = "/home/ubuntu/studymaster-agent"
    generate_favicons(source, output)
