import yaml
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime

def build():
    print("Loading data from data.yaml...")
    with open('data.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    print("Loading template.html...")
    env = Environment(loader=FileSystemLoader('.'))
    template = env.get_template('template.html')

    print("Rendering HTML...")
    output_html = template.render(data)

    print("Writing to index.html...")
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(output_html)

    print("Generating sitemap.xml...")
    today = datetime.now().strftime("%Y-%m-%d")
    sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://yucheon.io/</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>"""
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)

    print("Build complete! Open index.html to see changes.")

if __name__ == '__main__':
    build()
