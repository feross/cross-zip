module.exports = {
  zip: zip,
  zipSync: zipSync,
  unzip: unzip,
  unzipSync: unzipSync
}

var cp = require('child_process')
var path = require('path')

function zip (inPath, outPath, cb) {
  cp.exec(getZipCommand(inPath, outPath), function (err) {
    cb(err)
  })
}

function zipSync (inPath, outPath) {
  cp.execSync(getZipCommand(inPath, outPath))
}

function getZipCommand (inPath, outPath) {
  if (process.platform === 'win32') {
    return (
      'powershell.exe -nologo -noprofile -command "& { ' +
      'Add-Type -A \'System.IO.Compression.FileSystem\'; ' +
      `[IO.Compression.ZipFile]::CreateFromDirectory('${inPath}', '${outPath}'); }"`
    )
  } else {
    var dirPath = path.dirname(inPath)
    var fileName = path.basename(inPath)
    return `cd ${dirPath} && zip -r -y ${outPath} ${fileName}`
  }
}

function unzip (inPath, outPath, cb) {
  cp.exec(getUnzipCommand(inPath, outPath), function (err) {
    cb(err)
  })
}

function unzipSync (inPath, outPath) {
  cp.execSync(getUnzipCommand(inPath, outPath))
}

function getUnzipCommand (inPath, outPath) {
  if (process.platform === 'win32') {
    return (
      'powershell.exe -nologo -noprofile -command "& { ' +
      'Add-Type -A \'System.IO.Compression.FileSystem\'; ' +
      `[IO.Compression.ZipFile]::ExtractToDirectory('${inPath}', '${outPath}'); }"`
    )
  } else {
    return `unzip -o ${inPath} -d ${outPath}`
  }
}
