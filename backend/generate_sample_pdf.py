
import io
import os
from datetime import date, time
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader

# --- Mocking the DotDict and Meeting Object Structure ---
class DotDict:
    def __init__(self, d: dict):
        for k, v in d.items():
            if isinstance(v, dict):
                setattr(self, k, DotDict(v))
            elif isinstance(v, list) and v and isinstance(v[0], dict):
                setattr(self, k, [DotDict(i) for i in v])
            else:
                setattr(self, k, v)

# --- PDF Generation Logic (Copy of generate_meeting_pdf from meetings.py) ---
def draw_header_footer(canvas, doc):
    canvas.saveState()
    # Header Blue bars
    canvas.setFillColor(colors.HexColor("#60a5fa"))
    canvas.rect(0, 830, 297, 12, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#4f46e5"))
    canvas.rect(297, 830, 298, 12, fill=1, stroke=0)

    # Footer bars
    canvas.setFillColor(colors.HexColor("#60a5fa"))
    p1 = canvas.beginPath()
    p1.moveTo(0, 0); p1.lineTo(200, 0); p1.lineTo(220, 15); p1.lineTo(0, 15); p1.close()
    canvas.drawPath(p1, stroke=0, fill=1)

    canvas.setFillColor(colors.HexColor("#4f46e5"))
    p2 = canvas.beginPath()
    p2.moveTo(200, 0); p2.lineTo(595.27, 0); p2.lineTo(595.27, 25); p2.lineTo(230, 25); p2.close()
    canvas.drawPath(p2, stroke=0, fill=1)

    # Logo & Company Name
    logo_path = r"c:\Users\prabh\Desktop\MOM_AI_Assistant\B PNG.png"
    if os.path.exists(logo_path):
        logo = ImageReader(logo_path)
        canvas.drawImage(logo, 30, 755, width=60, height=60, preserveAspectRatio=True, mask='auto')
        canvas.setStrokeColor(colors.HexColor("#1e293b"))
        canvas.setLineWidth(1.5)
        canvas.line(100, 760, 100, 805)
        canvas.setFillColor(colors.HexColor("#000000"))
        canvas.setFont("Helvetica-Bold", 24)
        canvas.drawString(110, 785, "Botivate")
        canvas.setFont("Helvetica-Oblique", 11)
        canvas.drawString(110, 770, "Powering Businesses")
        canvas.drawString(110, 757, "On Autopilot")

    canvas.setFillColor(colors.HexColor("#1e293b"))
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawRightString(565, 790, "BOTIVATE SERVICES LLP")
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(colors.HexColor("#4f46e5"))
    canvas.drawRightString(565, 775, "Shriram Business Park, Block-I ,")
    canvas.drawRightString(565, 762, "Office No- 224 , Vidhan Sabha Rd,")
    canvas.drawRightString(565, 749, "Raipur, Chhattisgarh 493111")

    canvas.setStrokeColor(colors.HexColor("#4f46e5"))
    canvas.setLineWidth(1.5)
    canvas.line(30, 735, 565, 735)

    canvas.setFillColor(colors.HexColor("#000000"))
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(30, 45, "HR Department")
    canvas.setFont("Helvetica-Bold", 10)
    canvas.setFillColor(colors.HexColor("#475569"))
    canvas.drawString(30, 32, "Botivate Services LLP")
    canvas.restoreState()

def generate_sample_pdf(meeting, output_path):
    doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=120, bottomMargin=120)
    styles = getSampleStyleSheet()
    h1_style = ParagraphStyle('BotivateH1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor("#1e293b"), spaceAfter=12)
    h2_style = ParagraphStyle('BotivateH2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=11, textColor=colors.HexColor("#334155"), spaceAfter=8, spaceBefore=12)
    normal_style = ParagraphStyle('BotivateNormal', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=colors.HexColor("#475569"), leading=14, spaceAfter=6)
    table_style = TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#334155")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ])

    elements = []
    elements.append(Paragraph(f"<b>BOARD RESOLUTION MINUTES</b>", h1_style))
    elements.append(Paragraph(f"<b>Subject:</b> {meeting.title}", normal_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"<b>Dear Directors,</b>", normal_style))
    elements.append(Paragraph(f"The Board of Directors meeting for <b>{meeting.organization}</b> was held on <b>{meeting.date}</b> at <b>{meeting.time}</b>. Below are the formal resolutions and minutes recorded during the session:", normal_style))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"• <b>Organization:</b> {meeting.organization}", normal_style))
    elements.append(Paragraph(f"• <b>Meeting Type:</b> {meeting.meeting_type}", normal_style))
    elements.append(Paragraph(f"• <b>Venue:</b> {meeting.venue}", normal_style))
    elements.append(Spacer(1, 10))

    # Next Meeting
    if meeting.next_meeting:
        elements.append(Paragraph("<b>Next Meeting Schedule</b>", h2_style))
        elements.append(Paragraph(f"• <b>Date:</b> {meeting.next_meeting.next_date}", normal_style))
        elements.append(Paragraph(f"• <b>Time:</b> {meeting.next_meeting.next_time}", normal_style))
        elements.append(Spacer(1, 10))

    # Attendees
    elements.append(Paragraph("<b>Attendance (Board of Directors)</b>", h2_style))
    attendees_data = [["Name", "Designation", "Status"]]
    for a in meeting.attendees:
        attendees_data.append([a.user_name, a.designation, a.attendance_status])
    att_table = Table(attendees_data, colWidths=[180, 200, 100], hAlign='LEFT')
    att_table.setStyle(table_style)
    elements.append(att_table)
    elements.append(Spacer(1, 10))

    # Agenda
    elements.append(Paragraph("<b>Meeting Agenda</b>", h2_style))
    for idx, item in enumerate(meeting.agenda_items, 1):
        elements.append(Paragraph(f"{idx}. {item.topic}: {item.description}", normal_style))
    elements.append(Spacer(1, 10))

    # Discussion / Resolution Text
    elements.append(Paragraph("<b>Formal Resolution Wording</b>", h2_style))
    elements.append(Paragraph(meeting.discussion.summary_text, normal_style))
    elements.append(Spacer(1, 10))

    # Tasks
    elements.append(Paragraph("<b>Mandated Action Items</b>", h2_style))
    task_data = [["Task", "Responsible director", "Deadline", "Status"]]
    for t in meeting.tasks:
        task_data.append([Paragraph(t.title, normal_style), t.responsible_person, t.deadline, t.status])
    task_table = Table(task_data, colWidths=[200, 130, 80, 70], hAlign='LEFT')
    task_table.setStyle(table_style)
    elements.append(task_table)

    # Attached Documents section
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<b>List of Reference Documents</b>", h2_style))
    if meeting.files:
        for f in meeting.files:
            elements.append(Paragraph(f"• {f.file_path} ({f.file_type})", normal_style))
    else:
        elements.append(Paragraph("No supporting documents were recorded for this resolution.", normal_style))

    doc.build(elements, onFirstPage=draw_header_footer, onLaterPages=draw_header_footer)

# --- Sample Data ---
sample_meeting = DotDict({
    "id": "BR-TEST-001",
    "title": "Approval of Annual Fiscal Strategy & New Product Launch",
    "organization": "Botivate Services LLP",
    "meeting_type": "Board Resolution",
    "date": "March 15, 2026",
    "time": "11:00 AM",
    "venue": "Main Conference Room, HQ",
    "next_meeting": {
        "next_date": "April 10, 2026",
        "next_time": "02:00 PM"
    },
    "attendees": [
        {"user_name": "Prabhat Singh", "designation": "Managing Director", "email": "prabhatkumarsictc7070@gmail.com", "attendance_status": "Present"},
        {"user_name": "Ghanshyam Dewangan", "designation": "Executive Director", "email": "ghanshyamdewangan1472@gmail.com", "attendance_status": "Present"},
        {"user_name": "Ananya Sharma", "designation": "Independent Director", "email": "ananya@example.com", "attendance_status": "Absent"}
    ],
    "agenda_items": [
        {"topic": "Q1 Performance Review", "description": "Reviewing financial statements for Jan-Mar 2026."},
        {"topic": "AI Expansion Project", "description": "Approval of budget for the new MOM AI Assistant module."}
    ],
    "discussion": {
        "summary_text": "RESOLVED THAT the Board hereby approves the allocation of INR 5,000,000 for the development and deployment of the 'MOM AI Assistant' phase 2.\n\nFURTHER RESOLVED THAT Mr. Prabhat Singh is authorized to execute all necessary agreements and documents to finalized the vendor selection for cloud infrastructure."
    },
    "tasks": [
        {"title": "Verify Vendor Compliance", "responsible_person": "Prabhat Singh", "deadline": "2026-03-25", "status": "Pending"},
        {"title": "Draft Press Release", "responsible_person": "Ghanshyam Dewangan", "deadline": "2026-03-28", "status": "Pending"}
    ],
    "files": [
        {"file_path": "fiscal_strategy_2026_draft.pdf", "file_type": "PDF"},
        {"file_path": "market_research_summary.xlsx", "file_type": "Excel"},
        {"file_path": "director_consent_forms.zip", "file_type": "ZIP"}
    ]
})

output_pdf = "Sample_BR_MOM.pdf"
generate_sample_pdf(sample_meeting, output_pdf)
print(f"Sample PDF generated: {output_pdf}")
