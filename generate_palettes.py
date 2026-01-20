import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

# Create directory if it doesn't exist
os.makedirs('palettes', exist_ok=True)

def create_palette_image(colors, filename):
    # Crear la figura
    fig, ax = plt.subplots(figsize=(8, 2))
    
    # Dibujar los rectángulos de color
    for i, color in enumerate(colors):
        rect = patches.Rectangle((i, 0), 1, 1, linewidth=0, edgecolor='none', facecolor=color)
        ax.add_patch(rect)
    
    # Ajustes visuales (quitar ejes y bordes)
    ax.set_xlim(0, len(colors))
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    # Guardar imagen
    plt.savefig(filename, bbox_inches='tight', pad_inches=0)
    plt.close()

# --- DEFINICIÓN DE COLORES ---

# Opción 4: Bosque Sagrado (Monocromática)
# Verde Bosque, Verde Matcha, Blanco Hueso, Marrón Corteza
colors_4 = ['#2F4F4F', '#8FBC8F', '#F5F5DC', '#5D4037']

# Opción 5: Shakti y Naturaleza (Contraste)
# Verde Logo (Aprox), Terracota Quemado, Arena Dorada, Gris Niebla
# NOTA: Cambia '#2E7D32' por el código exacto del logo de tu cliente si lo tienes.
colors_5 = ['#2E7D32', '#CC5500', '#EEDC82', '#ECECE5'] 

# --- GENERAR IMÁGENES ---
create_palette_image(colors_4, "palettes/palette_4_bosque.png")
create_palette_image(colors_5, "palettes/palette_5_shakti.png")
