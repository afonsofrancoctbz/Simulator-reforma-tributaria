
$watchDir = "src"
$debounceSec = 5

Write-Host "Starting Auto-Sync (PowerShell)..."
Write-Host "Press Ctrl+C to stop."

while ($true) {
    $status = git status --porcelain
    if ($status) {
        Write-Host "Changes detected:"
        Write-Host $status
        Write-Host "Waiting $debounceSec seconds before committing..."
        Start-Sleep -Seconds $debounceSec
        
        # Check again to ensure we capture latest changes
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-sync: $timestamp"
        
        Write-Host "Pushing to remote..."
        git push
        
        if ($LASTEXITCODE -eq 0) {
             Write-Host "Synced successfully at $timestamp"
        } else {
             Write-Host "Error pushing."
        }
    }
    Start-Sleep -Seconds 2
}
