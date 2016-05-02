module.exports = {
  zip: zip,
  zipSync: zipSync,
  unzip: unzip,
  unzipSync: unzipSync
}

var cp = require('child_process')
var fs = require('fs')
var os = require('os')
var path = require('path')

function zip (inPath, outPath, cb) {
  // Windows zip command cannot zip files, only directories. So move the file into
  // a temporary directory before zipping.
  if (process.platform === 'win32') {
    fs.stat(inPath, function (err, stats) {
      if (err) return cb(err)
      if (stats.isFile()) {
        copyToTemp()
      } else {
        doZip()
      }
    })
  } else {
    doZip()
  }

  function doZip () {
    cp.exec(getZipCommand(inPath, outPath), function (err) {
      cb(err)
    })
  }

  function copyToTemp () {
    fs.readFile(inPath, function (err, inFile) {
      if (err) return cb(err)
      var tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
      fs.mkdir(tmpPath, function (err) {
        if (err) return cb(err)
        fs.writeFile(path.join(tmpPath, path.basename(inPath)), inFile, function (err) {
          if (err) return cb(err)
          inPath = tmpPath
          doZip()
        })
      })
    })
  }
}

function zipSync (inPath, outPath) {
  if (process.platform === 'win32' && fs.statSync(inPath).isFile()) {
    var inFile = fs.readFileSync(inPath)
    var tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
    fs.mkdirSync(tmpPath)
    fs.writeFileSync(path.join(tmpPath, path.basename(inPath)), inFile)
    inPath = tmpPath
  }
  cp.execSync(getZipCommand(inPath, outPath))
}

function getZipCommand (inPath, outPath) {
  if (process.platform === 'win32') {
    return `powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('${inPath}', '${outPath}'); }"`
  } else {
    var dirPath = path.dirname(inPath)
    var fileName = path.basename(inPath)
    return `cd ${dirPath} && zip -r -y ${JSON.stringify(outPath)} ${JSON.stringify(fileName)}`
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
    return `powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('${inPath}', '${outPath}'); }"`
  } else {
    return `unzip -o ${JSON.stringify(inPath)} -d ${JSON.stringify(outPath)}`
  }
}
