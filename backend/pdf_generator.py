import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.graphics.shapes import Drawing, String, Rect, Line
from datetime import datetime

def generate_pdf_report(forensic_data: dict) -> bytes:    
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=landscape(letter),
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_LEFT,
        spaceAfter=8
    )
    
    content = []
    
    content.append(Paragraph("DEEPFAKE FORENSIC ANALYSIS REPORT", title_style))
    content.append(Spacer(1, 0.2*inch))
    
    gen_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content.append(Paragraph(f"Generated: {gen_time}", normal_style))
    content.append(Spacer(1, 0.3*inch))
    
    content.append(Paragraph("VIDEO INFORMATION", heading_style))
    
    video_info_data = [
        ["File Name:", forensic_data.get('video_filename', 'N/A')],
        ["Duration:", f"{forensic_data.get('video_duration', '10.00')}s"],
        ["Frames Analyzed:", str(forensic_data.get('num_frames_analyzed', 300))],
        ["Frame Rate:", str(forensic_data.get('fps', 30)) + " fps"],
    ]
    
    video_table = Table(video_info_data, colWidths=[2*inch, 5*inch])
    video_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
    ]))
    content.append(video_table)
    content.append(Spacer(1, 0.3*inch))
    
    content.append(Paragraph("VERDICT", heading_style))
    verdict = forensic_data.get('verdict', 'UNKNOWN')
    probability = forensic_data.get('overall_probability', 0)
    
    verdict_text = f"Classification: {verdict} ({probability:.1%} Deepfake Probability)"
    content.append(Paragraph(verdict_text, normal_style))
    content.append(Spacer(1, 0.3*inch))
    
    content.append(Paragraph("KEY FINDINGS", heading_style))
    
    most_sus_frame = forensic_data.get('most_suspicious_frame', 0)
    window_size = 5
    stride = 5
    window_index = most_sus_frame // stride
    window_start = window_index * stride
    window_end = min(window_start + window_size - 1, len(forensic_data.get('frame_probabilities', [])) - 1)
    
    findings_data = [
        ["Metric", "Value"],
        ["Most Suspicious Frame Window", f"Frames #{window_start}-{window_end}"],
        ["Peak Score", f"{forensic_data.get('highest_frame_score', 0):.1%}"],
        ["Frames Flagged", f"{forensic_data.get('num_frames_fake', 0)} / {forensic_data.get('num_frames_analyzed', 300)}"],
        ["Temporal Instability", "Yes" if forensic_data.get('instability_detected', False) else "No"],
    ]
    
    findings_table = Table(findings_data, colWidths=[2.5*inch, 4.5*inch])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#333333')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
    ]))
    content.append(findings_table)
    content.append(Spacer(1, 0.3*inch))
    
    # Frame-by-Frame Graph
    content.append(Paragraph("FRAME ANALYSIS", heading_style))
    content.append(KeepTogether(_create_frame_chart(forensic_data)))
    content.append(Spacer(1, 0.2*inch))
    
    # Flagged Reasons
    if forensic_data.get('flagged_reasons'):
        content.append(Paragraph("FLAGGED CONCERNS", heading_style))
        for i, reason in enumerate(forensic_data.get('flagged_reasons', []), 1):
            content.append(Paragraph(f"{i}. {reason}", normal_style))
        content.append(Spacer(1, 0.2*inch))
    
    # Footer
    content.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    content.append(Paragraph(
        "Deepfake Forensic Analysis | Senior Capstone Project",
        footer_style
    ))
    
    # Build PDF
    doc.build(content)
    return pdf_buffer.getvalue()


def _create_frame_chart(forensic_data: dict):
    frame_probs = forensic_data.get('frame_probabilities', [])
    fps = forensic_data.get('fps', 10)
    
    # Calculate windows
    window_size = 5
    stride = 5
    windows = []
    window_start = 0
    
    while window_start < len(frame_probs):
        window_end = min(window_start + window_size, len(frame_probs))
        window_probs = frame_probs[window_start:window_end]
        max_prob = max(window_probs) if window_probs else 0
        avg_prob = sum(window_probs) / len(window_probs) if window_probs else 0
        windows.append({
            'start_frame': window_start,
            'end_frame': window_end,
            'max_prob': max_prob,
            'avg_prob': avg_prob,
            'start_time': window_start / fps,
        })
        window_start += stride
    
    drawing = Drawing(8.5*inch, 3.5*inch)
    
    margin_left = 0.6*inch
    margin_bottom = 0.4*inch
    margin_top = 0.3*inch
    chart_width = 7.5*inch
    chart_height = 2.8*inch
    
    chart_x = margin_left
    chart_y = margin_bottom
    
    drawing.add(Rect(chart_x, chart_y, chart_width, chart_height, fillColor=colors.HexColor('#fafafa'), strokeColor=colors.black, strokeWidth=1))
    
  
    threshold_y = chart_y + (chart_height * 0.5)
    drawing.add(Line(chart_x, threshold_y, chart_x + chart_width, threshold_y, 
                     strokeColor=colors.HexColor('#ff9800'), strokeWidth=1.5, strokeDashArray=[3,3]))
    
    if len(windows) > 0:
        bar_width = chart_width / len(windows)
        for i, window in enumerate(windows):
            prob = window['max_prob']
            bar_height = (prob / 1.0) * chart_height
            bar_x = chart_x + (i * bar_width) + 1
            bar_y = chart_y  
            
            bar_color = colors.HexColor('#e53935') if prob >= 0.5 else colors.HexColor('#1976d2')
            drawing.add(Rect(bar_x, bar_y, bar_width - 2, bar_height, 
                           fillColor=bar_color, strokeColor=None, fillOpacity=0.8))
    
    label_x = chart_x - 0.25*inch
    
    drawing.add(String(label_x, chart_y - 0.08*inch, "0%", fontSize=8, textAnchor="end"))
    
    drawing.add(String(label_x, threshold_y - 0.08*inch, "50%", fontSize=8, textAnchor="end"))
    
    drawing.add(String(label_x, chart_y + chart_height - 0.08*inch, "100%", fontSize=8, textAnchor="end"))
    
    drawing.add(String(0.3*inch, chart_y + chart_height/2 + 0.15*inch, "Probability", fontSize=8, 
                      textAnchor="start"))
    
    drawing.add(String(chart_x + chart_width/2, margin_bottom - 0.25*inch, "Temporal CNN Analysis - 5-Frame Windows @ 10 FPS", 
                      fontSize=8, textAnchor="middle"))
    
    return drawing
