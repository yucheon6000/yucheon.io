import yaml
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime

def build():
    print("Loading data from data.yaml...")
    with open('data.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # Group news by year
    grouped_news = {}
    for item in data.get('news', []):
        date_str = item.get('date', '')
        parts = date_str.split()
        if len(parts) == 2:
            month, year = parts[0].rstrip(','), parts[1]
        else:
            month, year = date_str, 'Other'
        
        if year not in grouped_news:
            grouped_news[year] = []
        grouped_news[year].append({
            'month': month,
            'content': item.get('content', '')
        })
        
    sorted_news = []
    # Sort years descending (e.g. 2026, 2025...)
    for yr in sorted(grouped_news.keys(), reverse=True):
        sorted_news.append({
            'year': yr,
            'entries': grouped_news[yr]
        })
    data['news'] = sorted_news

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
