$ErrorActionPreference = 'Stop'

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if ($Text -notmatch $Pattern) {
        throw $Message
    }
}

$index = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot '..\index.html')

Assert-Contains `
    -Text $index `
    -Pattern 'data-dzignex-mobile-fix[\s\S]*?AboutMeOverlay[\s\S]*?bottom:\s*calc\(124px\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\)' `
    -Message 'About Me must stop above the mobile dock and safe area.'

Assert-Contains `
    -Text $index `
    -Pattern 'AboutMeOverlay[\s\S]*?data-framer-name="Content"[\s\S]*?overflow-y:\s*auto\s*!important' `
    -Message 'About Me content must scroll vertically on mobile.'

$projectScriptPath = Join-Path $PSScriptRoot '..\mobile-project-images.js'
if (-not (Test-Path -LiteralPath $projectScriptPath)) {
    throw 'The mobile project image loader is missing.'
}

$projectScript = Get-Content -Raw -LiteralPath $projectScriptPath
Assert-Contains `
    -Text $index `
    -Pattern '<script src="/mobile-project-images\.js\?v=20260825-5"></script>' `
    -Message 'The homepage must load the mobile project image fix for its inline project windows.'
Assert-Contains `
    -Text $projectScript `
    -Pattern 'matchMedia\(''\(max-width:\s*809\.98px\)''\)' `
    -Message 'The project image fix must be restricted to mobile.'
Assert-Contains `
    -Text $projectScript `
    -Pattern 'querySelectorAll\(''img\[loading="lazy"\]''\)' `
    -Message 'The mobile project image loader must activate deferred gallery images.'
if ($projectScript -match "image\.loading\s*=\s*'eager'") {
    throw 'The mobile project image loader must not force the whole gallery to load eagerly.'
}
Assert-Contains `
    -Text $projectScript `
    -Pattern "image\.loading\s*=\s*'lazy'" `
    -Message 'Injected mobile project images must keep native lazy loading.'
Assert-Contains `
    -Text $projectScript `
    -Pattern "image\.fetchPriority\s*=\s*'low'" `
    -Message 'Below-fold project images must use low network priority.'
Assert-Contains `
    -Text $projectScript `
    -Pattern 'scale-down-to=512[\s\S]*?scale-down-to=1024' `
    -Message 'Injected mobile images must use responsive Framer image variants.'

$missingProjectImages = @{
    'noua' = @(
        'BwQJ2mVbLRbaFgM7D1uM8ufU179f'
    )
    'champ-dermology' = @(
        'zIrvKdLWWRz2QRZ4pWN4BpVDlzk88ac',
        'Z1t7ru4zclN8CCVd8f4do1zbzkd4f6'
    )
    'formura-labs' = @(
        'tH43mLMG1yOwugNhTO2TxZbl1488ac',
        'CQ8ashP0sAwUdxlthDQAMncl65088ac',
        'eyDutTnO5HXOrjBfiWkzukwfo5k88ac'
    )
    'auravita' = @(
        '27W9Pbl1kZOETiSPIMQbDeL7zk4d9f',
        'f8fVeUXNSRFaJP4qHrhG3wUNts4d9f'
    )
    'menotopia' = @(
        'bqntUTYcSWJ720pzKaO0Clcoh8179f',
        '8nujY1TOrwqZYivqYTN9VzodQU179f'
    )
    'ops-first' = @(
        '8h0XbBOmeNos7JmzuytN4ojFRg88ac',
        'jIHQ4Tty9tjzp3sDSfVhju4RY88ac',
        'SxTtOBAAD13kSeSy8QK5JWb2gcd01',
        'dTotGuWqG30Ssg1J2K8n7ycwVM88ac'
    )
}

foreach ($projectName in $missingProjectImages.Keys) {
    Assert-Contains `
        -Text $projectScript `
        -Pattern ([regex]::Escape("'$projectName'")) `
        -Message "The mobile gallery does not define the omitted images for $projectName."

    foreach ($imageStem in $missingProjectImages[$projectName]) {
        Assert-Contains `
            -Text $projectScript `
            -Pattern ([regex]::Escape($imageStem)) `
            -Message "$projectName is still missing CMS image $imageStem on mobile."
    }
}

Assert-Contains `
    -Text $projectScript `
    -Pattern 'data-dzignex-mobile-extra-media' `
    -Message 'Injected mobile project images need a stable marker to prevent duplicates.'
Assert-Contains `
    -Text $projectScript `
    -Pattern 'querySelectorAll\(''\[data-framer-name="Image 5"\]''\)' `
    -Message 'The homepage fix must scan every inline project window, not only direct project pages.'

$projectFiles = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\works') -Filter '*.html'
if ($projectFiles.Count -ne 6) {
    throw "Expected 6 project pages, found $($projectFiles.Count)."
}

foreach ($projectFile in $projectFiles) {
    $projectHtml = Get-Content -Raw -LiteralPath $projectFile.FullName
    Assert-Contains `
        -Text $projectHtml `
        -Pattern '<script src="\.\./mobile-project-images\.js\?v=20260825-5"></script>' `
        -Message "$($projectFile.Name) does not load the mobile project image fix."
}

Write-Output 'PASS: mobile About Me and project image regression checks.'
