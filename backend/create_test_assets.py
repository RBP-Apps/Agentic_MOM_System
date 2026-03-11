
import os
import zipfile
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def create_pdf(path):
    doc = SimpleDocTemplate(path, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph("Fiscal Strategy 2026 - Draft", styles['Title']),
        Spacer(1, 12),
        Paragraph("This is a sample document for testing the Board Resolution upload feature.", styles['Normal']),
        Paragraph("Detailed financial projections and market expansion plans are included in the full version.", styles['Normal'])
    ]
    doc.build(elements)

def create_dummy_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

def create_zip(path, files):
    with zipfile.ZipFile(path, 'w') as zipf:
        for f in files:
            zipf.write(f, os.path.basename(f))

base_dir = r"C:\Users\prabh\Desktop\MOM_AI_Assistant\backend\test_files"

# 1. Create PDF
pdf_path = os.path.join(base_dir, "fiscal_strategy_2026_draft.pdf")
create_pdf(pdf_path)

# 2. Create Dummy Excel (just a CSV renamed for testing)
xlsx_path = os.path.join(base_dir, "market_research_summary.xlsx")
create_dummy_file(xlsx_path, "Region,Market Share,Proportion\nNorth,35%,0.35\nSouth,25%,0.25\nEast,20%,0.20\nWest,20%,0.20")

# 3. Create ZIP with a dummy content file
temp_txt = os.path.join(base_dir, "consent_note.txt")
create_dummy_file(temp_txt, "All directors have provided their verbal consent for the strategy alignment.")
zip_path = os.path.join(base_dir, "director_consent_forms.zip")
create_zip(zip_path, [temp_txt])
os.remove(temp_txt)

print("Sample test files created successfully in backend/test_files/")
