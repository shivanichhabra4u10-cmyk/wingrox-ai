$ErrorActionPreference = 'Stop'
$f = 'C:\Users\USER\repos\wingrox-ai\frontend\public\platforms\twin.html'
$c = [System.IO.File]::ReadAllText($f)

$styleMatch = [regex]::Match($c, '(?s)<style>(.*?)</style>')
$styleContent = $styleMatch.Groups[1].Value

$bodyOpen = [regex]::Match($c, '<body[^>]*>')
$bodyInnerStart = $bodyOpen.Index + $bodyOpen.Length
$bodyClose = $c.LastIndexOf('</body>')
$bodyHtml = $c.Substring($bodyInnerStart, $bodyClose - $bodyInnerStart)

$scripts = [regex]::Matches($c, '(?s)<script(?:\s[^>]*)?>(.*?)</script>')
$inlineScripts = @()
foreach ($s in $scripts) {
  $tag = $c.Substring($s.Index, $s.Length)
  if ($tag -notmatch 'src=') { $inlineScripts += $s.Groups[1].Value }
}
$appScript = $inlineScripts -join "`n`n/* ---- next inline script ---- */`n`n"

$bodyHtmlClean = [regex]::Replace($bodyHtml, '(?s)<script[^>]*src=[^>]*></script>', '')
$bodyHtmlClean = [regex]::Replace($bodyHtmlClean, '(?s)<script(?![^>]*src=)[^>]*>.*?</script>', '')

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText('C:\Users\USER\repos\wingrox-ai\frontend\src\styles\twin.css', $styleContent, $utf8)
[System.IO.File]::WriteAllText('C:\Users\USER\repos\wingrox-ai\frontend\public\platforms\twin.app.js', $appScript, $utf8)
[System.IO.File]::WriteAllText('C:\Users\USER\repos\wingrox-ai\frontend\src\components\platform\twin\twin-body.html', $bodyHtmlClean, $utf8)

Write-Host ('CSS  bytes: ' + (Get-Item 'C:\Users\USER\repos\wingrox-ai\frontend\src\styles\twin.css').Length)
Write-Host ('JS   bytes: ' + (Get-Item 'C:\Users\USER\repos\wingrox-ai\frontend\public\platforms\twin.app.js').Length)
Write-Host ('HTML bytes: ' + (Get-Item 'C:\Users\USER\repos\wingrox-ai\frontend\src\components\platform\twin\twin-body.html').Length)
