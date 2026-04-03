[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing') > $null

$bitmap = New-Object System.Drawing.Bitmap(1200, 630)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Fundo bege
$graphics.Clear([System.Drawing.Color]::FromArgb(247, 246, 242))

# Gradiente do logo (teal ao ouro)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(80, 120),
    [System.Drawing.Point]::new(280, 320),
    [System.Drawing.Color]::FromArgb(1, 105, 111),
    [System.Drawing.Color]::FromArgb(212, 168, 39)
)
$graphics.FillRectangle($brush, 80, 120, 200, 200)

# Linhas brancas (list items)
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 9)
$pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($pen, 115, 150, 225, 150)
$graphics.DrawLine($pen, 115, 200, 180, 200)
$graphics.DrawLine($pen, 115, 250, 240, 250)

# Check mark branco grande
$checkPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 11)
$checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($checkPen, 190, 290, 215, 310)
$graphics.DrawLine($checkPen, 215, 310, 260, 270)

# Fonts
$fontBig = New-Object System.Drawing.Font('Arial', 85, [System.Drawing.FontStyle]::Bold)
$fontMed = New-Object System.Drawing.Font('Arial', 48)
$fontSmall = New-Object System.Drawing.Font('Arial', 34)

# Cores
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 37, 29))
$brushGray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 105, 101))
$brushTeal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(1, 105, 111))

# Textos
$graphics.DrawString('StudyMaster', $fontBig, $brushTeal, 320, 95)
$graphics.DrawString('Agente de Estudo com IA', $fontMed, $brushDark, 320, 195)
$graphics.DrawString('Monte prompts personalizados e estude', $fontSmall, $brushGray, 320, 310)
$graphics.DrawString('com feedback imediato em qualquer IA', $fontSmall, $brushGray, 320, 360)

# Salvar
$bitmap.Save('og-image-wa-v2.png')
$fileSize = (Get-Item og-image-wa-v2.png).Length
Write-Host "Imagem gerada com sucesso: 1200x630 pixels"
Write-Host "Tamanho: $fileSize bytes"

$graphics.Dispose()
$bitmap.Dispose()
