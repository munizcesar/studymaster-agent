[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing') > $null

$bitmap = New-Object System.Drawing.Bitmap(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Fundo bege (mantido como no original)
$graphics.Clear([System.Drawing.Color]::FromArgb(247, 246, 242))

# Gradiente do site (teal ao roxo ao laranja - do favicon)
$siteBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new(1200, 630),
    [System.Drawing.Color]::FromArgb(91, 91, 214),    # #5B5BD6 - teal
    [System.Drawing.Color]::FromArgb(124, 58, 237), # #7C3AED - roxo
    [System.Drawing.Color]::FromArgb(249, 115, 22)  # #F97316 - laranja
)
$siteBrush.SetSigmaBellShape(0.3)  # Suavizar a transição
$graphics.FillRectangle($siteBrush, 0, 0, 1200, 630)

# Círculos decorativos (manter do original, mas com cores do site)
$circleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(1100, 100),
    [System.Drawing.Point]::new(1500, 500),
    [System.Drawing.Color]::FromArgb(91, 91, 214),
    [System.Drawing.Color]::FromArgb(124, 58, 237)
)
$circleBrush.SetSigmaBellShape(0.5)
$graphics.FillEllipse($circleBrush, 700, -300, 800, 800)  # cx=1100, cy=100, r=400

$circleBrush2 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(100, 580),
    [System.Drawing.Point]::new(450, 930),
    [System.Drawing.Color]::FromArgb(91, 91, 214),
    [System.Drawing.Color]::FromArgb(124, 58, 237)
)
$circleBrush2.SetSigmaBellShape(0.5)
$graphics.FillEllipse($circleBrush2, -250, 230, 700, 700)  # cx=100, cy=580, r=350

# Favicon logo (replicando o SVG)
$favBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(100, 180),
    [System.Drawing.Point]::new(164, 244),
    [System.Drawing.Color]::FromArgb(91, 91, 214),
    [System.Drawing.Color]::FromArgb(124, 58, 237)
)
$favBrush.SetSigmaBellShape(0.5)
$graphics.FillRectangle($favBrush, 100, 180, 192, 192)

# Borda arredondada do favicon (usando retângulo simples)
$favPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)
$graphics.DrawRectangle($favPen, 100, 180, 192, 192)

# Linhas brancas do favicon
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 4)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($linePen, 114, 196, 224, 196)  # M14 22h28
$graphics.DrawLine($linePen, 114, 214, 194, 214)  # M14 31h20
$graphics.DrawLine($linePen, 114, 232, 218, 232)  # M14 40h24

# Círculo branco
$graphics.FillEllipse([System.Drawing.Brushes]::White, 184, 214, 22, 22)  # cx=46, cy=40, r=11

# Check mark
$checkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(91, 91, 214), 3.5)
$checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($checkPen, 166, 214, 179, 227)  # M41.5 40.5l3.2 3.2
$graphics.DrawLine($checkPen, 179, 227, 194, 203)  # l6.5-6.5

# Fonts (tamanhos ajustados para o novo layout)
$fontBig = New-Object System.Drawing.Font('Arial', 68, [System.Drawing.FontStyle]::Bold)  # Reduzido de 85
$fontMed = New-Object System.Drawing.Font('Arial', 28)  # Reduzido de 48
$fontSmall = New-Object System.Drawing.Font('Arial', 24)  # Reduzido de 34

# Cores
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 37, 29))
$brushGray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 105, 101))
$brushTeal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(91, 91, 214))
$brushWhite = [System.Drawing.Brushes]::White

# Textos (posições e conteúdos atualizados)
$graphics.DrawString('StudyMaster', $fontBig, $brushTeal, 320, 120)  # Movido para baixo
$graphics.DrawString('Agente de Estudo com IA', $fontMed, $brushDark, 320, 200)  # Movido para baixo
$graphics.DrawString('🎯 Estude com IA personalizada e feedback imediato', $fontSmall, $brushGray, 320, 280)  # Novo texto
$graphics.DrawString('studymaster-agent.pages.dev', $fontSmall, $brushGray, 800, 580)  # URL na parte inferior

# Salvar
$bitmap.Save('og-image-wa-v2.png')
$fileSize = (Get-Item og-image-wa-v2.png).Length
Write-Host "Imagem gerada com sucesso: 1200x630 pixels"
Write-Host "Tamanho: $fileSize bytes"

$graphics.Dispose()
$bitmap.Dispose()