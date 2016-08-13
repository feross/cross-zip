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
var rimraf = require('rimraf')

function zip (inPath, outPath, cb) {
  if (!cb) cb = function () {}
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

  // Windows zip command cannot zip files, only directories. So move the file into
  // a temporary directory before zipping.
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

  // Windows zip command does not overwrite existing files. So do it manually first.
  function doZip () {
    if (process.platform === 'win32') {
      rimraf(outPath, doZip2)
    } else {
      doZip2()
    }
  }

  function doZip2 () {
    cp.exec(getZipCommand(inPath, outPath), { maxBuffer: Infinity }, function (err) {
      cb(err)
    })
  }
}

function zipSync (inPath, outPath) {
  if (process.platform === 'win32') {
    if (fs.statSync(inPath).isFile()) {
      var inFile = fs.readFileSync(inPath)
      var tmpPath = path.join(os.tmpdir(), 'cross-zip-' + Date.now())
      fs.mkdirSync(tmpPath)
      fs.writeFileSync(path.join(tmpPath, path.basename(inPath)), inFile)
      inPath = tmpPath
    }
    rimraf.sync(outPath)
  }
  cp.execSync(getZipCommand(inPath, outPath))
}

function getZipCommand (inPath, outPath) {
  if (process.platform === 'win32') {
    return `powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('${inPath}', '${outPath}'); }"`
  } else {
    var dirPath = path.dirname(inPath)
    var fileName = path.basename(inPath)
    return `cd ${JSON.stringify(dirPath)} && zip -r -y ${JSON.stringify(outPath)} ${JSON.stringify(fileName)}`
  }
}

function unzip (inPath, outPath, cb) {
  if (!cb) cb = function () {}
  cp.exec(getUnzipCommand(inPath, outPath), { maxBuffer: Infinity }, function (err) {
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
