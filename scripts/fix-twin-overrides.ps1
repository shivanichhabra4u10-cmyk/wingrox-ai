$ErrorActionPreference = 'Stop'
$path = 'C:\Users\USER\repos\wingrox-ai\frontend\src\styles\twin.css'
$css = [System.IO.File]::ReadAllText($path)

$tag1 = 'WinGroX OS integration overrides'
$tag2 = '/* WG-OS-OVERRIDES */'
$cut = -1
$i1 = $css.IndexOf($tag1)
$i2 = $css.IndexOf($tag2)
if ($i1 -ge 0) {
  $start = $css.LastIndexOf('/*', $i1)
  if ($start -ge 0 -and ($cut -eq -1 -or $start -lt $cut)) { $cut = $start }
}
if ($i2 -ge 0 -and ($cut -eq -1 -or $i2 -lt $cut)) { $cut = $i2 }
if ($cut -ge 0) { $css = $css.Substring(0, $cut).TrimEnd() }

$override = "`r`n`r`n/* WG-OS-OVERRIDES */`r`n.twin-root #nav { display: none !important; }`r`n.twin-root { padding-top: 72px; }`r`n"

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $css + $override, $utf8)
Write-Host ('twin.css size: ' + (Get-Item $path).Length)
