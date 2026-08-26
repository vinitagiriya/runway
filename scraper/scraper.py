"""
scraper.py
-----------
Ye script YC (Y Combinator) ki India hiring page se REAL company data nikaalta hai,
aur seedha PostgreSQL database (Neon) mein daal deta hai.

Kaam kaise karta hai:
1. Playwright (ek real, headless browser) se webpage kholte hain aur end tak scroll
   karte hain — kyunki YC ki list "infinite scroll" hai: companies JavaScript se load
   hoti hain jaise-jaise neeche scroll karo. Sirf static HTML mangwane se (requests
   wagera) shuru ki ~50 hi milti thi, baaki miss ho jaati thi.
2. BeautifulSoup se un links ko dhoondhte hain jo company pages ki taraf jaate hain
   (in links ka pattern hamesha same rehta hai: /companies/<naam>)
3. Har link ke text se company ka naam, batch, status, employees, location nikaalte hain
4. Sab data Postgres mein "upsert" karte hain (agar company already hai to update,
   nahi to naya insert)

IMPORTANT: Websites apna HTML design badalte rehte hain, lekin URL pattern
(/companies/xyz) generally stable rehta hai — isliye humne isi pe scraper base kiya hai.
"""

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import psycopg2
import re
import os
from dotenv import load_dotenv

load_dotenv()  # .env file se DATABASE_URL padhega

# Ek page ki jagah, ab hum YC ki kai alag category pages se data khinchenge
# Har page mein kuch alag companies hoti hain — isse total count badh jaata hai
#
# Ab har URL ke saath uska "sector" bhi map kiya hai. Jab kisi company ka slug
# in industry pages me se kisi pe milta hai, to wahi sector uski row me save
# hoga — pehle hum har company ko hardcoded "YC-backed" de dete the.
# location/hiring pages ka sector None hai kyunki wo pages sector specify nahi karte.
TARGET_URLS = {
    "https://www.ycombinator.com/companies/location/india/hiring": None,
    "https://www.ycombinator.com/companies/location/india": None,
    "https://www.ycombinator.com/companies/industry/fintech/india": "Fintech",
    "https://www.ycombinator.com/companies/industry/b2b/india": "B2B",
    "https://www.ycombinator.com/companies/industry/saas/india": "SaaS",
    "https://www.ycombinator.com/companies/industry/ai/india": "AI",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_page(browser, url):
    """Diye gaye URL ka poora HTML laata hai — page ko end tak scroll karke,
    taaki infinite-scroll se load hone wali SAARI companies mil jayein,
    sirf shuru ki nahi.

    Ek hi 'browser' baar-baar (saare URLs ke liye) pass kiya jaata hai, taaki
    har baar naya browser launch na karna pade — isse bahut time bachta hai,
    especially jab humein 100+ individual company pages bhi visit karne hain."""
    print(f"Fetching: {url}")
    page = browser.new_page(user_agent=HEADERS["User-Agent"])
    page.goto(url, timeout=30000)
    page.wait_for_load_state("networkidle")

    # Jab tak scroll karne se page ki height badhna band na ho jaye
    # (matlab naya content aana ruk gaya), scroll karte raho.
    previous_height = 0
    same_height_count = 0
    while same_height_count < 3:  # 3 baar height same rahi to maan lo end aa gaya
        page.mouse.wheel(0, 4000)
        page.wait_for_timeout(1200)  # naye content ko load hone ka time do
        current_height = page.evaluate("document.body.scrollHeight")
        if current_height == previous_height:
            same_height_count += 1
        else:
            same_height_count = 0
        previous_height = current_height

    html = page.content()
    page.close()
    return html


def fetch_linkedin_url(browser, company_page_url):
    """Company ke apne YC page (jaise ycombinator.com/companies/zepto) pe jaake,
    us page ke saare links me se koi LinkedIn wala link dhoondta hai.
    Agar nahi milta, None wapas karta hai — error nahi deta (kyunki har
    company ka LinkedIn page listed nahi hota)."""
    try:
        page = browser.new_page(user_agent=HEADERS["User-Agent"])
        page.goto(company_page_url, timeout=20000)
        page.wait_for_load_state("networkidle")

        link = page.query_selector("a[href*='linkedin.com']")
        linkedin_url = link.get_attribute("href") if link else None

        page.close()
        return linkedin_url
    except Exception as e:
        print(f"  LinkedIn nahi mil paya ({company_page_url}): {e}")
        return None




def parse_companies(html, companies, sector=None):
    """HTML se company details nikaal ke di gayi 'companies' dictionary mein add karta hai.
    Same dictionary baar-baar pass karne se, alag-alag pages ka data apne aap merge ho jaata hai
    aur duplicate companies (slug ke basis pe) apne aap skip ho jaati hain.

    'sector' us page ka industry label hai (jaise "Fintech", "SaaS") — jis page se
    yeh function bulaya gaya hai. Agar wahi company pehle kisi aur (sector-less) page
    pe mil chuki hai, to uska sector yahin se bhar diya jaata hai."""
    soup = BeautifulSoup(html, "html.parser")

    links = soup.find_all("a", href=re.compile(r"^/companies/[a-zA-Z0-9\-]+$"))

    for link in links:
        href = link["href"]
        slug = href.strip("/").split("/")[-1]

        text = link.get_text(separator=" ", strip=True)

        if not text or "•" not in text:
            continue

        parts = [p.strip() for p in text.split("•")]
        if len(parts) < 2:
            continue

        first_part = parts[0]

        batch_match = re.search(r"\b([WSF]\d{4})\b", first_part)
        batch = batch_match.group(1) if batch_match else None

        if "Y Combinator" in first_part:
            name = first_part.split("Y Combinator")[0].strip()
        else:
            name = first_part.strip()

        status = parts[1].strip() if len(parts) > 1 else None

        employees = None
        if len(parts) > 2:
            emp_match = re.search(r"([\d,]+)", parts[2])
            employees = emp_match.group(1) if emp_match else None

        # Location nikaalna — lekin kuch pages pe location ke baad company ki
        # poori description bhi jud jaati hai (bina bullet ke). Isliye hum sirf
        # shuru ke "Capitalized, Capitalized, Capitalized" jaise pattern ko lete hain
        # (jaise "Bengaluru" ya "Mumbai, Maharashtra, India") — baaki (description) ignore karte hain.
        location = None
        if len(parts) > 3:
            raw_location = parts[3].strip()
            location_match = re.match(
                r"^((?:[A-Z][A-Za-z\.]*)(?:,\s*[A-Z][A-Za-z\.]*)*)", raw_location
            )
            if location_match:
                location = location_match.group(1).strip()
            else:
                location = raw_location[:60]  # fallback: bahut lamba na ho

        if slug not in companies and name:
            companies[slug] = {
                "company_name": name,
                "sector": sector,
                "batch": batch,
                "status": status,
                "employees": employees,
                "location": location,
                "source_url": f"https://www.ycombinator.com{href}",
            }
        elif slug in companies and companies[slug].get("sector") is None and sector:
            # Company pehle kisi general (non-industry) page pe mil chuki thi —
            # ab is industry page se uska sector bhar do.
            companies[slug]["sector"] = sector

    return companies


def save_to_postgres(companies):
    """Companies dictionary ko Postgres mein insert/update karta hai."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL nahi mila — .env file check karo.")
        return

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    for c in companies.values():
        cur.execute(
            """
            INSERT INTO companies (company_name, sector, batch, status, employees, location, hiring_status, source_url, linkedin_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (company_name)
            DO UPDATE SET
                sector = EXCLUDED.sector,
                status = EXCLUDED.status,
                employees = EXCLUDED.employees,
                location = EXCLUDED.location,
                hiring_status = EXCLUDED.hiring_status,
                linkedin_url = EXCLUDED.linkedin_url,
                scraped_at = NOW();
            """,
            (
                c["company_name"],
                c.get("sector") or "Uncategorized",
                c.get("batch"),
                c.get("status"),
                c.get("employees"),
                c.get("location"),
                c.get("hiring_status", "Unknown"),
                c.get("source_url"),
                c.get("linkedin_url"),
            ),
        )

    # Ab pura scroll karke poori list mil jaati hai, isliye jo company is baar
    # bilkul nahi mili, woh sach me YC ki list se hat chuki hai (naam badla,
    # acquired ho gayi, etc.) — na ki humse miss hui. Aisी purani rows hata do,
    # taaki database me stale/outdated companies na reh jayein.
    current_names = [c["company_name"] for c in companies.values()]
    if current_names:
        cur.execute(
            "DELETE FROM companies WHERE company_name != ALL(%s);",
            (current_names,),
        )
        if cur.rowcount:
            print(f"{cur.rowcount} purani/stale companies hata di gayi (ab YC listing mein nahi hain).")

    conn.commit()
    cur.close()
    conn.close()
    print(f"Database update ho gaya — {len(companies)} companies save hui.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Pehle sirf "hiring" page se pata karte hain kaun-kaun si companies abhi hiring kar rahi hain
        hiring_url = list(TARGET_URLS.keys())[0]  # pehla URL = /hiring wala page
        hiring_html = fetch_page(browser, hiring_url)
        hiring_companies = {}
        parse_companies(hiring_html, hiring_companies, sector=TARGET_URLS[hiring_url])
        hiring_slugs = set(hiring_companies.keys())
        print(f"Hiring page se {len(hiring_slugs)} companies mili.\n")

        # Ab saare pages (hiring + baaki categories) se combine data nikaalte hain
        all_companies = {}
        for url, sector in TARGET_URLS.items():
            html = fetch_page(browser, url)
            parse_companies(html, all_companies, sector=sector)
            print(f"Is page ke baad total unique companies: {len(all_companies)}\n")

        # Jo companies hiring_slugs mein hain unhe "Hiring" mark karo, baaki "Unknown"
        for slug, data in all_companies.items():
            data["hiring_status"] = "Hiring" if slug in hiring_slugs else "Unknown"

        # Ab har company ke apne YC page pe jaake uska LinkedIn link dhoondte hain.
        # Isme sabse zyada time lagega (ek-ek company ka page load karna padta hai),
        # isliye har 20 companies ke baad progress print karte hain.
        total = len(all_companies)
        print(f"\n--- LinkedIn links dhoondh rahe hain ({total} companies) ---")
        for i, (slug, data) in enumerate(all_companies.items(), start=1):
            data["linkedin_url"] = fetch_linkedin_url(browser, data["source_url"])
            if i % 20 == 0 or i == total:
                print(f"  {i}/{total} companies check ho gayi...")

        browser.close()

    print("\n--- Sample (pehli 3 companies) ---")
    for c in list(all_companies.values())[:3]:
        print(c)

    save_to_postgres(all_companies)
