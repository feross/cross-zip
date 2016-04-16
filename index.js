module.exports = zip

var cp = require('child_process')
var path = require('path')

function zip (inPath, outPath) {
  if (process.platform === 'win32') {
    cp.execSync(
      'powershell.exe -nologo -noprofile -command "& { ' +
      'Add-Type -A \'System.IO.Compression.FileSystem\'; ' +
      `[IO.Compression.ZipFile]::CreateFromDirectory('${inPath}', '${outPath}'); }"`
    )
  } else {
    var dirPath = path.dirname(inPath)
    var fileName = path.basename(inPath)
    cp.execSync(`cd ${dirPath} && zip -r -y ${outPath} ${fileName}`)
  }
}
