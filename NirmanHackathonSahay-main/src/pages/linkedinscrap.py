import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import time
import re

class TimesJobsScraper:
    def __init__(self):  # Corrected constructor
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.base_url = "https://www.timesjobs.com/candidate/job-search.html"
        self.cutoff_date = datetime.now() - timedelta(days=5)
    
    def clean_text(self, text):
        """Clean extracted text by removing extra spaces and special characters"""
        if text:
            return re.sub(r'\s+', ' ', text.strip())
        return 'N/A'
    
    def extract_experience(self, text):
        """Extract years of experience from text"""
        if text:
            match = re.search(r'(\d+\s*-?\s*\d*\+?\s*yrs)', text.lower())
            return match.group(1) if match else text.strip()
        return 'N/A'

    def parse_date(self, date_text):
        """Parse relative date to datetime object"""
        try:
            date_text = date_text.lower()
            if 'just' in date_text or 'hour' in date_text or 'minute' in date_text:
                return datetime.now()
            elif 'today' in date_text:
                return datetime.now()
            elif 'yesterday' in date_text:
                return datetime.now() - timedelta(days=1)
            elif 'day' in date_text:
                days = int(re.search(r'(\d+)', date_text).group(1))
                return datetime.now() - timedelta(days=days)
            elif 'week' in date_text:
                weeks = int(re.search(r'(\d+)', date_text).group(1))
                return datetime.now() - timedelta(weeks=weeks)
            return None
        except:
            return None

    def scrape_jobs(self, keyword=None, location=None):
        """Scrape job listings from TimesJobs"""
        all_jobs = []
        page = 1
        no_new_jobs_count = 0  # Counter for pages without new jobs
        
        while True:
            try:
                print(f"Scraping page {page}...")
                
                params = {
                    'searchType': 'personalizedSearch',
                    'from': 'submit',
                    'txtKeywords': keyword or '',
                    'txtLocation': location or '',
                    'sequence': page,
                    'startPage': page
                }
                
                response = requests.get(
                    self.base_url,
                    headers=self.headers,
                    params=params
                )
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                job_cards = soup.find_all('li', class_='clearfix job-bx wht-shd-bx')
                
                if not job_cards:
                    print(f"No more jobs found on page {page}")
                    break
                
                new_jobs_found = False
                
                for card in job_cards:
                    try:
                        # Check posting date first
                        date_span = card.find('span', class_='sim-posted')
                        if date_span:
                            date_text = self.clean_text(date_span.text)
                            post_date = self.parse_date(date_text)
                            
                            # Skip if job is older than 15 days
                            if not post_date or post_date < self.cutoff_date:
                                continue
                            
                            new_jobs_found = True
                            
                            # Basic job info
                            header = card.find('header', class_='clearfix')
                            title = self.clean_text(header.find('h2').text) if header else 'N/A'
                            company = self.clean_text(header.find('h3', class_='joblist-comp-name').text) if header else 'N/A'
                            
                            # Job URL
                            job_link = header.find('a')['href'] if header and header.find('a') else 'N/A'
                            
                            # Job details
                            job_details = card.find('ul', class_='top-jd-dtl clearfix')
                            
                            # Experience
                            exp_li = job_details.find('li', text=re.compile(r'card_travel')) if job_details else None
                            experience = self.extract_experience(exp_li.text) if exp_li else 'N/A'
                            
                            # Location
                            loc_li = job_details.find('li', text=re.compile(r'location_on')) if job_details else None
                            location_text = self.clean_text(loc_li.text) if loc_li else 'N/A'
                            
                            # Skills
                            skills_div = card.find('span', class_='srp-skills')
                            skills = self.clean_text(skills_div.text) if skills_div else 'N/A'
                            
                            # Job description
                            desc_div = card.find('ul', class_='list-job-dtl clearfix')
                            description = self.clean_text(desc_div.text) if desc_div else 'N/A'
                            
                            job_info = {
                                'title': title,
                                'company': company,
                                'experience_required': experience,
                                'location': location_text,
                                'skills_required': skills,
                                'description': description,
                                'date_posted': date_text,
                                'url': job_link,
                                'source': 'TimesJobs'
                            }
                            
                            all_jobs.append(job_info)
                            
                    except Exception as e:
                        print(f"Error parsing job card: {e}")
                        continue
                
                if not new_jobs_found:
                    no_new_jobs_count += 1
                    if no_new_jobs_count >= 3:  # Stop if 3 consecutive pages have no new jobs
                        print("No new jobs found in last 3 pages, stopping search")
                        break
                else:
                    no_new_jobs_count = 0  # Reset counter if new jobs found
                
                page += 1
                time.sleep(2)  # Respectful delay between requests
                
            except Exception as e:
                print(f"Error scraping page {page}: {e}")
                break
        
        return pd.DataFrame(all_jobs)

    def save_to_csv(self, df, filename=None):
        """Save DataFrame to CSV with analytics"""
        if not df.empty:
            filename = filename or f"timesjobs_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            print(f"\nSaved {len(df)} jobs to {filename}")
            
            # Print detailed analytics
            print("\nJOB SEARCH ANALYTICS")
            print("-" * 50)
            
            print("\nJob Categories Found:")
            print(df['title'].value_counts().head())
            
            print("\nTop Companies Hiring:")
            print(df['company'].value_counts().head())
            
            print("\nTop Locations:")
            print(df['location'].value_counts().head())
            
            print("\nExperience Requirements:")
            print(df['experience_required'].value_counts().head())
            
            print("\nMost Demanded Skills:")
            all_skills = ', '.join(df['skills_required'].dropna()).lower()
            skills_list = [skill.strip() for skill in all_skills.split(',')]
            skills_freq = pd.Series(skills_list).value_counts()
            print(skills_freq.head())
        else:
            print("No jobs to save")

def main():
    scraper = TimesJobsScraper()
    
    print("TimesJobs Scraper (Last 15 Days)")
    print("-" * 50)
    
    # Get user input
    keyword = input("Enter job keyword (e.g., Python Developer): ").strip()
    location = input("Enter location (e.g., Mumbai, Pune): ").strip()
    
    print(f"\nScraping TimesJobs for '{keyword}' in '{location}'...")
    print("Gathering all jobs posted in the last 15 days")
    print("This may take a few minutes...")
    
    df = scraper.scrape_jobs(keyword, location)
    
    # Show results
    if not df.empty:
        print(f"\nFound {len(df)} jobs posted in the last 15 days:")
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', None)
        print("\nSample of recent jobs found:")
        print(df[['title', 'company', 'location', 'date_posted']].head())
        
        scraper.save_to_csv(df)
    else:
        print("\nNo recent jobs found")

if __name__ == "__main__":
    main()
