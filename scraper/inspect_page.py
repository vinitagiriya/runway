"""
inspect_page.py
-----------------
Agar scraper.py sahi data na nikale, ye script chalao — ye tumhe dikhayega
ki website ka actual raw text/HTML kaisa dikhta hai, taaki scraper.py ka
pattern (regex) usse match karke update kiya ja sake.

Ye "debugging" kehlata hai — real developers isi tarah pata lagate hain
ki scraper kyun fail ho raha hai.
"""

import requests
from bs4 import BeautifulSoup
import re

URL = "https://www.ycombinator.com/companies/location/india/hiring"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

response = requests.get(URL, headers=HEADERS, timeout=20)
soup = BeautifulSoup(response.text, "html.parser")

links = soup.find_all("a", href=re.compile(r"^/companies/[a-zA-Z0-9\-]+$"))

print(f"Total company links mile: {len(links)}\n")
print("--- Pehle 5 links ka RAW TEXT (isse dekho actual format kya hai) ---\n")

for link in links[:5]:
    print(f"HREF: {link['href']}")
    print(f"TEXT: {link.get_text(separator=' | ', strip=True)}")
    print("---")
