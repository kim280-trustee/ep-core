param(
    [Parameter(Mandatory=$true)]
    [string]$ModuleName
)

$source = "src/features/$ModuleName"
$output = "$ModuleName-export.txt"

if (!(Test-Path $source)) {
    Write-Host "Module not found: $source"
    exit
}

Remove-Item $output -ErrorAction SilentlyContinue

Get-ChildItem $source -Recurse -File |
Where-Object {
    $_.Extension -in ".ts",".tsx"
} |
ForEach-Object {

    "==================================================" | Out-File $output -Append
    "FILE: $($_.FullName)" | Out-File $output -Append
    "==================================================" | Out-File $output -Append

    Get-Content $_.FullName |
    Out-File $output -Append

    "" | Out-File $output -Append
}

Write-Host "Export complete: $output"