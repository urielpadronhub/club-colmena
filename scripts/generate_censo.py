#!/usr/bin/env python3
"""
Generador de Formato de Censo Inicial - El Club de La Colmena
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Registrar fuentes
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Crear documento
output_path = '/home/z/my-project/download/Censo_Inicial_Club_Colmena.pdf'
doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    topMargin=0.5*inch,
    bottomMargin=0.5*inch,
    leftMargin=0.75*inch,
    rightMargin=0.75*inch,
    title='Censo_Inicial_Club_Colmena',
    author='Z.ai',
    creator='Z.ai',
    subject='Formato de censo inicial para becados - El Club de La Colmena'
)

# Estilos
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='Title',
    fontName='Times New Roman',
    fontSize=18,
    alignment=TA_CENTER,
    spaceAfter=6,
    textColor=colors.HexColor('#D97706')  # Amber color
)

subtitle_style = ParagraphStyle(
    name='Subtitle',
    fontName='Times New Roman',
    fontSize=14,
    alignment=TA_CENTER,
    spaceAfter=20,
    textColor=colors.HexColor('#92400E')
)

section_style = ParagraphStyle(
    name='Section',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=6,
    textColor=colors.HexColor('#1F4E79')
)

field_style = ParagraphStyle(
    name='Field',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_LEFT,
    textColor=colors.black
)

small_style = ParagraphStyle(
    name='Small',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#666666')
)

# Contenido
story = []

# Título principal con logo de abeja
story.append(Paragraph("<b>CLUB DE LA COLMENA</b>", title_style))
story.append(Paragraph("CENSO INICIAL DE FAMILIAS BECADAS", subtitle_style))
story.append(Spacer(1, 10))

# Línea decorativa
line_data = [['─' * 80]]
line_table = Table(line_data, colWidths=[7*inch])
line_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#D97706')),
]))
story.append(line_table)
story.append(Spacer(1, 15))

# SECCIÓN 1: FAMILIA
story.append(Paragraph("<b>1. FAMILIA (APELLIDO)</b>", section_style))
story.append(Spacer(1, 5))

fam_data = [
    ['Apellido de la Familia:', '_____________________________________________']
]
fam_table = Table(fam_data, colWidths=[2*inch, 4.5*inch])
fam_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
    ('ALIGN', (1, 0), (1, 0), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(fam_table)
story.append(Spacer(1, 15))

# SECCIÓN 2: REPRESENTANTES
story.append(Paragraph("<b>2. REPRESENTANTES (PADRE Y MADRE)</b>", section_style))
story.append(Spacer(1, 8))

# Tabla de representantes
rep_header = [
    [Paragraph('<b>Parentesco</b>', field_style), 
     Paragraph('<b>Nombre Completo</b>', field_style), 
     Paragraph('<b>Cédula de Identidad</b>', field_style), 
     Paragraph('<b>Teléfono</b>', field_style)]
]

rep_data = rep_header + [
    ['PADRE', '', '', ''],
    ['MADRE', '', '', ''],
]

rep_table = Table(rep_data, colWidths=[1*inch, 2.5*inch, 1.8*inch, 1.2*inch])
rep_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEF3C7')),  # Light amber
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D97706')),
    ('ROWHEIGHT', (0, 1), (-1, -1), 35),
]))
story.append(rep_table)
story.append(Spacer(1, 15))

# SECCIÓN 3: ALUMNO POSTULADO
story.append(Paragraph("<b>3. ALUMNO POSTULADO</b>", section_style))
story.append(Spacer(1, 8))

alumno_header = [
    [Paragraph('<b>Nombre Completo del Alumno</b>', field_style), 
     Paragraph('<b>Edad</b>', field_style), 
     Paragraph('<b>Grado a Cursar</b>', field_style)]
]

alumno_data = alumno_header + [
    ['', '', ''],
]

alumno_table = Table(alumno_data, colWidths=[3.5*inch, 1.2*inch, 1.8*inch])
alumno_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEF3C7')),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D97706')),
    ('ROWHEIGHT', (0, 1), (-1, -1), 35),
]))
story.append(alumno_table)
story.append(Spacer(1, 15))

# SECCIÓN 4: DIRECCIÓN
story.append(Paragraph("<b>4. DIRECCIÓN DE HABITACIÓN</b>", section_style))
story.append(Spacer(1, 8))

dir_data = [
    ['Dirección completa:', '________________________________________________________________________'],
    ['', '________________________________________________________________________'],
    ['Ciudad/Parroquia:', '_______________________', 'Estado:', '_______________________'],
]

dir_table = Table(dir_data, colWidths=[1.5*inch, 2.5*inch, 0.8*inch, 1.7*inch])
dir_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('SPAN', (1, 0), (3, 0)),
    ('SPAN', (1, 1), (3, 1)),
]))
story.append(dir_table)
story.append(Spacer(1, 15))

# SECCIÓN 5: PLANTEL DE PROCEDENCIA
story.append(Paragraph("<b>5. PLANTEL DE PROCEDENCIA</b>", section_style))
story.append(Spacer(1, 8))

plantel_data = [
    ['Nombre del Plantel:', '_______________________________________________________'],
    ['Dirección del Plantel:', '_______________________________________________________'],
]

plantel_table = Table(plantel_data, colWidths=[1.5*inch, 5*inch])
plantel_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(plantel_table)
story.append(Spacer(1, 25))

# Línea decorativa
story.append(line_table)
story.append(Spacer(1, 20))

# SECCIÓN 6: FIRMAS
story.append(Paragraph("<b>6. FIRMAS DE CONFORMIDAD</b>", section_style))
story.append(Spacer(1, 15))

firmas_data = [
    ['________________________', '________________________', '________________________'],
    ['Firma del Padre', 'Firma de la Madre', 'Firma del Representante'],
    ['C.I.: ________________', 'C.I.: ________________', 'C.I.: ________________'],
    ['', '', ''],
    ['________________________', '________________________', '________________________'],
    ['Fecha: ___/___/______', 'Sello de la Organización', 'Vo.Bo. Coordinador'],
]

firmas_table = Table(firmas_data, colWidths=[2.2*inch, 2.2*inch, 2.2*inch])
firmas_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(firmas_table)
story.append(Spacer(1, 20))

# Pie de página
footer_style = ParagraphStyle(
    name='Footer',
    fontName='Times New Roman',
    fontSize=8,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)

story.append(Paragraph("El Club de La Colmena - Maracaibo, Estado Zulia, Venezuela", footer_style))
story.append(Paragraph("Unidos por la educación de nuestros niños", footer_style))
story.append(Paragraph("@clubdelacolmena", footer_style))

# Construir PDF
doc.build(story)

print(f"✅ PDF generado exitosamente: {output_path}")
