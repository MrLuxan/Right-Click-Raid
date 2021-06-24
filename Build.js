const fs = require('fs');
const path = require('path');

const platforms = ['Chrome','FireFox'];

let Log  = false;

function copyFileSync(source, target) {

  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
      if ( fs.lstatSync( target ).isDirectory() ) {
          targetFile = path.join( target, path.basename( source ) );
      }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target, topLevel = true) {
  var files = [];
  var targetFolder;

  if(!topLevel)
  {  
    targetFolder = path.join( target,path.basename( source ));
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }
  }
  else
  {
    targetFolder = target;
  }

  // Copy
  if ( fs.lstatSync( source ).isDirectory() ) {
      files = fs.readdirSync( source );
      files.forEach( function ( file ) {
          var curSource = path.join( source, file );
          if ( fs.lstatSync( curSource ).isDirectory()) {          
              if(file != 'VariantFiles')
              {
                if(Log)
                  console.log('Creating folder ' + file);

                copyFolderRecursiveSync( curSource, targetFolder, false );
              }
          } else {

            if(Log)
              console.log('copying ' + curSource + " to " + targetFolder);

            copyFileSync( curSource, targetFolder );
          }
      } );
  }
}



/// Create Builds ///
console.clear();
console.log((new Date()).toString());

fs.rmdirSync('build', { recursive: true });

if(!fs.existsSync('build')){
  fs.mkdirSync('build');
}

platforms.forEach(platform =>{
  console.log(`Building ${platform}`);

  let buildPath = path.join('build',platform)

  
  if(!fs.existsSync(buildPath)){
    fs.mkdirSync(buildPath);
  }

  //Log = true;
  copyFolderRecursiveSync('dev', buildPath);
  
  let variantPath = path.join('dev','VariantFiles',platform); 
  if(fs.existsSync(variantPath))
  {
    copyFolderRecursiveSync(variantPath, buildPath);    
  }
});

console.log(`Done`);