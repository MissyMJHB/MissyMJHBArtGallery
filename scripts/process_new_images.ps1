# PowerShell script: process_new_images.ps1 (auto-written)
param(
  [string] $InputDir = "Gallery\\new_uploads",
  [string[]] $Files,
  [int] $MaxDimension = 2000,
  [switch] $DryRun
)
function Get-NextGalleryNumber {
  param([string]$GalleryDir)
  $pattern = '^Gallery(\\d+)$'
  $nums = @()
  Get-ChildItem -Path $GalleryDir -File | ForEach-Object {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    if ($name -match $pattern) { $nums += [int]$Matches[1] }
  }
  if ($nums.Count -eq 0) { return 1 }
  $i = 1
  while ($true) {
    if ($nums -notcontains $i) { return $i }
    $i++
  }
}
function Save-JpegWithQuality {
  param(
    [System.Drawing.Image] $Image,
    [string] $OutPath,
    [int] $Quality = 85
  )
  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [int]$Quality)
  $Image.Save($OutPath, $jpegCodec, $encParams)
}
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = (Get-Item -Path $scriptRoot).Parent.Parent.FullName
$galleryDir = Join-Path $repoRoot 'Gallery'
$captionDir = Join-Path $galleryDir 'captions'
if (-not (Test-Path $captionDir)) { New-Item -ItemType Directory -Path $captionDir -Force | Out-Null }
if (-not (Test-Path (Join-Path $galleryDir 'new_uploads'))) { New-Item -ItemType Directory -Path (Join-Path $galleryDir 'new_uploads') -Force | Out-Null }
$inputFullDir = if ($Files) { $null } else { Join-Path $repoRoot $InputDir }
$fileList = @()
if ($Files) {
  foreach ($f in $Files) { $fileList += (Resolve-Path -Path $f).Path }
} elseif (Test-Path $inputFullDir) {
  $fileList = Get-ChildItem -Path $inputFullDir -File | Where-Object { $_.Extension -match '\\.jpe?g$|\\.png$|\\.gif$|\\.webp$' } | ForEach-Object { $_.FullName }
} else {
  Write-Host "Input directory not found: $inputFullDir" -ForegroundColor Yellow
  exit 1
}
if ($fileList.Count -eq 0) { Write-Host "No image files found to process."; exit 0 }
Add-Type -AssemblyName System.Drawing
foreach ($path in $fileList) {
  try {
    Write-Host "Processing: $path"
    $img = [System.Drawing.Image]::FromFile($path)
    $width = $img.Width; $height = $img.Height
    $scale = [math]::Min(1, $MaxDimension / [math]::Max($width, $height))
    $newW = [int]([math]::Max(1, [math]::Round($width * $scale)))
    $newH = [int]([math]::Max(1, [math]::Round($height * $scale)))
    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.DrawImage($img, 0, 0, $newW, $newH)
    $n = Get-NextGalleryNumber -GalleryDir $galleryDir
    $outName = "Gallery$n.jpg"
    $outPath = Join-Path $galleryDir $outName
    if ($DryRun) {
      Write-Host "Would write: $outPath (size ${newW}x${newH})"
      $img.Dispose(); $gfx.Dispose(); $bmp.Dispose(); continue
    }
    Save-JpegWithQuality -Image $bmp -OutPath $outPath -Quality 85
    Write-Host "Saved: $outPath"
    $capPath = Join-Path $captionDir ("Gallery$n.txt")
    if (-not (Test-Path $capPath)) {
      $capText = "Placeholder caption for Gallery$n`nReplace with a short title / medium / size / year."
      Set-Content -Path $capPath -Value $capText -Encoding UTF8
      Write-Host "Created caption: $capPath"
    }
    $img.Dispose(); $gfx.Dispose(); $bmp.Dispose();
  } catch {
    Write-Host "Failed processing $path: $_" -ForegroundColor Red
  }
}
Write-Host "Processing complete. Review Gallery/ and commit changes via Git." -ForegroundColor Green
