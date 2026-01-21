Get-ChildItem -Recurse -File |
ForEach-Object {
  try {
    $l = (Get-Content -LiteralPath $_.FullName -ErrorAction Stop | Measure-Object -Line).Lines
  } catch {
    $l = 0
  }
  $p = $_.FullName -replace '\\','/'
  [PSCustomObject]@{Lines = $l; Path = $p}
} | Sort-Object Lines -Descending | Export-Csv -NoTypeInformation -Path line_counts.csv -Encoding UTF8
