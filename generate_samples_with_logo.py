import os

# Logo path relative to design_prototypes folder
LOGO_PATH = "../images/logo_transparent.png"

palettes = [
    {
        "id": "1",
        "name": "Atardecer Suave",
        "bg": "#FEFDE2", # Cream (Original logic was slightly different but using v1 values or v4)
        # Using values from design_v4 logic roughly
        "styles": """
            body { background-color: #FEFDE2; color: #708090; }
            h2 { color: #CD5C5C; }
            .btn { background-color: #F4AB6A; color: white; }
        """
    },
    {
        "id": "2",
        "name": "Tierra Dorada",
        "styles": """
            body { background-color: #EDC9AF; color: #36454F; }
            h2 { color: #36454F; }
            .btn { background-color: #87A96B; color: white; }
        """
    },
    {
        "id": "3",
        "name": "Cobre y Platino",
        "styles": """
            body { background-color: #E5E4E2; color: #1C1C1C; }
            h2 { color: #B87333; }
            .btn { background-color: #D8B2A1; color: #1C1C1C; }
        """
    },
    {
        "id": "4",
        "name": "Bosque Sagrado",
        "styles": """
            body { background-color: #F5F5DC; color: #5D4037; }
            h2 { color: #2F4F4F; }
            .btn { background-color: #2F4F4F; color: white; }
        """
    },
    {
        "id": "5",
        "name": "Shakti y Naturaleza",
        "styles": """
            body { background-color: #ECECE5; color: #2E7D32; }
            h2 { color: #CC5500; }
            .btn { background-color: #EEDC82; color: #2E7D32; }
        """
    }
]

template = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arunāchala - {name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@300;400;500;700&display=swap');
        
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}

        .mobile-container {{
            width: 375px; 
            height: 667px;
            background-color: white; /* Will be overridden by body bg in some cases or handled by specific styles */
            padding: 40px 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            /* Force specific internal background if body is different, 
               but here we want the whole 'screen' to have the palette bg. 
               We will apply palette bg to .mobile-container and isolate body. */
        }}

        /* Reset body to neutral for screenshot consistency, let container carry color */
        body {{ background-color: #333; }} 
        .mobile-container {{
            /* Default */
            background-color: white;
        }}

        .logo {{
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }}

        h2 {{
            font-size: 1.8rem;
            margin: 0 0 15px 0;
        }}

        p {{
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.9;
        }}

        .btn {{
            padding: 15px 35px;
            border-radius: 30px;
            border: none;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}

        /* Palette Styles */
        {styles}
        /* Override body bg on container */
        .mobile-container {{
            /* The styles above applied to body, we want them on mobile-container mostly */
        }}
    </style>
    <!-- Inject Styles correctly: The 'styles' var targets body/h2/btn. 
         We want the screenshot to look like a phone. 
         So we will wrap the styles to apply to .mobile-container instead of body where appropriate,
         or just let the styles cascade if we scope them.
    -->
    <style>
        .mobile-container {{
             /* We need to apply the background color from the 'styles' string that targets body 
                to this container instead, or just parse it. 
                Simpler: let's hardcode the style injection in the loop.
             */
        }}
    </style>
</head>
<body>
    <!-- Inline styles for simplicity in this script -->
    <style>
        {styles} 
        /* Fix: ensure body background color is applied to container and body is neutral? 
           Actually, let's make the BODY the color, and the BODY dim is phone size?
           No, browser screenshot is rectangular. 
           Let's make a div that IS the phone screen. */
        body {{ background-color: #222 !important; }}
        .mobile-container {{
            /* We inherit color and background from the specific palette rules below */
        }}
        /* Re-write palette rules to target .mobile-container */
    </style>
    
    <!-- Redefining styles to target .mobile-container specifically for the screenshot -->
    <style>
        .mobile-container {{ height: 100%; min-height: 600px; width: 375px; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
        
        /* Specific overrides based on palette ID */
    </style>
    
    <div class="mobile-container" style="background-color: {bg_color}; color: {text_color}">
        <img src="{logo_path}" alt="Arunachala Logo" class="logo">
        <h2>Arunāchala</h2>
        <p>Yoga tradicional y terapias holísticas para reconectar con tu esencia.</p>
        <a href="#" class="btn" style="background-color: {btn_bg}; color: {btn_text}">Reservar Clase</a>
    </div>

</body>
</html>
"""

# Refined logic to extract colors for inline styles to avoid CSS complexity in script
palette_data = [
    {"id": "1", "bg": "#FFFDD0", "text": "#708090", "h2": "#CD5C5C", "btn_bg": "#F4A460", "btn_text": "#FFFFFF"},
    {"id": "2", "bg": "#EDC9AF", "text": "#36454F", "h2": "#36454F", "btn_bg": "#87A96B", "btn_text": "#FFFFFF"},
    {"id": "3", "bg": "#E5E4E2", "text": "#1C1C1C", "h2": "#B87333", "btn_bg": "#D8B2A1", "btn_text": "#1C1C1C"},
    {"id": "4", "bg": "#F5F5DC", "text": "#5D4037", "h2": "#2F4F4F", "btn_bg": "#2F4F4F", "btn_text": "#FFFFFF"},
    {"id": "5", "bg": "#ECECE5", "text": "#2E7D32", "h2": "#CC5500", "btn_bg": "#EEDC82", "btn_text": "#2E7D32"},
]

output_dir = "design_prototypes"
os.makedirs(output_dir, exist_ok=True)

for p in palette_data:
    content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample {p['id']}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Quicksand:wght@300;400;500;700&display=swap');
        body {{
            margin: 0; padding: 0;
            background-color: #333;
            display: flex; justify-content: center; align-items: center;
            height: 100vh;
            font-family: 'Quicksand', sans-serif;
            /* Remove focus outlines and tap highlights */
            -webkit-tap-highlight-color: transparent;
        }}
        * {{ outline: none !important; }}
        *:focus {{ outline: none !important; }}
        
        .mobile-screen {{
            width: 375px; height: 667px;
            background-color: {p['bg']};
            color: {p['text']};
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 40px; box-sizing: border-box;
            text-align: center;
            border-radius: 40px; /* Soft rounded container */
        }}
        .logo {{ width: 150px; height: auto; margin-bottom: 25px; }}
        h2 {{ 
            color: {p['h2']}; 
            margin-bottom: 15px; 
            font-size: 2.2rem; 
            font-family: 'Playfair Display', serif; /* Elegant heading */
        }}
        p {{ 
            margin-bottom: 35px; 
            line-height: 1.6; 
            font-weight: 500;
        }}
        .btn {{
            background-color: {p['btn_bg']};
            color: {p['btn_text']};
            padding: 18px 45px;
            text-decoration: none;
            border-radius: 50px; /* Pill shape */
            font-weight: 700;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }}
        .palette-label {{
            margin-top: 60px; font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;
        }}
    </style>
</head>
<body>
    <div class="mobile-screen">
        <img src="{LOGO_PATH}" alt="Logo" class="logo">
        <h2>Arunāchala</h2>
        <p>Espacio de Yoga y Terapias<br>para el bienestar integral.</p>
        <a href="#" class="btn">Empezar Ahora</a>
        <div class="palette-label">Opción {p['id']}</div>
    </div>
</body>
</html>"""
    
    with open(f"{output_dir}/sample_{p['id']}.html", "w") as f:
        f.write(content)
    print(f"Generated sample_{p['id']}.html")
