# PowerShell script to update CSS link order in all HTML files

$htmlFiles = Get-ChildItem -Path "HTML" -Filter "*.html"

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    
    $content = Get-Content -Path $file.FullName
    
    # Check if the file contains both common.css and a page-specific CSS
    $hasCommonCss = $content | Select-String -Pattern '<link.*common\.css' -Quiet
    $hasTestNavbarCss = $content | Select-String -Pattern '<link.*test-navbar\.css' -Quiet
    $pageSpecificCss = $content | Select-String -Pattern '<link.*CSS\/([^/]+)\.css' | 
                       Where-Object { $_ -notmatch 'common\.css' -and $_ -notmatch 'test-navbar\.css' } | 
                       ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ($hasCommonCss -and $pageSpecificCss) {
        Write-Host "  Found common.css and page-specific CSS: $pageSpecificCss"
        
        # Create the correct order of CSS links
        $updatedContent = $content | ForEach-Object {
            if ($_ -match '<link.*common\.css') {
                $_  # Output common.css line
                
                # Add test-navbar.css if not already present
                if (-not $hasTestNavbarCss) {
                    '    <link rel="stylesheet" href="../CSS/test-navbar.css">'
                }
            }
            elseif ($_ -match '<link.*test-navbar\.css') {
                if ($hasCommonCss) {
                    $_  # Only output if common.css is present
                }
                else {
                    # If common.css is not present, add it before test-navbar.css
                    '    <link rel="stylesheet" href="../CSS/common.css">'
                    $_
                }
            }
            else {
                $_  # Output all other lines unchanged
            }
        }
        
        # Write the updated content back to the file
        $updatedContent | Set-Content -Path $file.FullName
        Write-Host "  Updated CSS link order in $($file.Name)"
    }
    else {
        Write-Host "  No changes needed for $($file.Name)"
    }
}

Write-Host "All HTML files have been processed." 