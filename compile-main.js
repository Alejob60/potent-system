const { exec } = require('child_process');

// Compilar solo el archivo main.ts
exec('npx tsc src/main.ts --outDir dist --module commonjs --target ES2022 --esModuleInterop --emitDecoratorMetadata --experimentalDecorators', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  if (stdout) {
    console.log(`stdout: ${stdout}`);
  }
  
  console.log('Compilation completed');
});