import re
import os

def clean_title(title):
    # Remove any text after common separators
    separators = ['150 FPS', ' - ', ' with ', ', with', ' for ', ' by ']
    for sep in separators:
        if sep in title:
            title = title.split(sep)[0]
    
    # Remove extra spaces
    title = ' '.join(title.split())
    
    return title.strip()

def parse_tools_file(input_file):
    # Check if file exists
    if not os.path.exists(input_file):
        print(f"Error: Cannot find file '{input_file}'")
        return

    # Extract month/year from input filename for output filename
    output_file = input_file.replace('.txt', '.js')
    
    print(f"Reading from: {input_file}")
    
    # Read the input file
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"File content length: {len(content)} characters")
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Split into entries (each entry is separated by blank lines)
    entries = content.strip().split('\n\n')
    print(f"Found {len(entries)} entries")
    tools = []

    for i, entry in enumerate(entries):
        lines = [line.strip() for line in entry.split('\n') if line.strip()]
        
        # Skip entries that are too short
        if len(lines) < 2:
            continue

        # First line that's not a command (Clone, Stats, etc.) is the title
        title = None
        for line in lines:
            if not any(cmd in line for cmd in ['Clone', 'Stats', 'Archive', 'Edit', 'QR Code', 'Copied']):
                title = line
                break

        # Find the group
        group = None
        for line in lines:
            if any(line.startswith(g) for g in [
                'Recomendo', 'Book Freak', 'Tips Tools Shoptales',
                'Podcast', 'Nomadico', 'Books-on-Paper',
                'Whats in my NOW', 'Possibilities-Tools'
            ]):
                group = line
                break

        # Find the URL
        url = None
        for line in lines:
            if 'geni.us' in line or 'amazon.com' in line:
                url = line
                break

        if title and group and url:
            # Clean up the data
            title = clean_title(title)
            title = title.replace('"', '\\"')
            group = group.replace('"', '\\"')
            url = url.replace('"', '\\"')
            
            # Create the tool entry
            tool = {
                "title": title,
                "url": url,
                "group": group
            }
            tools.append(tool)
            print(f"Entry {i+1}: {title[:50]}...")

    print(f"\nFound {len(tools)} valid tools")

    # Write the JavaScript file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('const coolToolsData = [\n')
            
            for tool in tools:
                f.write('    {\n')
                f.write(f'        "title": "{tool["title"]}",\n')
                f.write(f'        "url": "{tool["url"]}",\n')
                f.write(f'        "group": "{tool["group"]}"\n')
                f.write('    },\n')
            
            f.write('];\n')
        print(f"\nSuccessfully created {output_file}")
    except Exception as e:
        print(f"Error writing file: {e}")

# Usage
parse_tools_file('coolToolsData202411.txt')