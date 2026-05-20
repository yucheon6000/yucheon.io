import yaml
from jinja2 import Environment, FileSystemLoader
import os

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

    print("Build complete! Open index.html to see changes.")

if __name__ == '__main__':
    build()
