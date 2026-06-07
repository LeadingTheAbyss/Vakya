from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 15)
        self.cell(0, 10, "VENDOR SERVICE AGREEMENT", ln=True, align="C")
        self.ln(10)

def create_contract(output_path):
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)
    
    # Intro
    pdf.multi_cell(0, 10, "This Vendor Service Agreement (\"Agreement\") is entered into by and between TechCorp Solutions Pvt. Ltd. (\"Client\") and the Service Provider identified below (\"Provider\").")
    pdf.ln(5)
    
    # Clause 1
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "1. Payment Terms", ln=True)
    pdf.set_font("helvetica", size=12)
    pdf.multi_cell(0, 10, "The Client shall pay the Service Provider within 90 days of receiving the invoice. The Client reserves the right to withhold payment at its sole discretion if it deems the work unsatisfactory.")
    pdf.ln(5)
    
    # Clause 2
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "2. Termination for Convenience", ln=True)
    pdf.set_font("helvetica", size=12)
    pdf.multi_cell(0, 10, "Either party may terminate this Agreement at any time by providing 7 days written notice.")
    pdf.ln(5)
    
    # Clause 3
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 10, "3. Confidentiality", ln=True)
    pdf.set_font("helvetica", size=12)
    pdf.multi_cell(0, 10, "Both parties agree to keep all proprietary information confidential for 2 years following termination of this Agreement. This obligation does not apply to information already in the public domain.")
    pdf.ln(5)
    
    # Note: Missing Jurisdiction & Governing Law intentionally to trigger the Missing Risk
    
    pdf.output(output_path)

if __name__ == "__main__":
    output_file = "sample_contract.pdf"
    create_contract(output_file)
    print(f"Created {output_file}")
