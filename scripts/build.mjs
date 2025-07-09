import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

execSync('yarn build', { stdio: 'inherit' });

const publicDir = path.join(process.cwd(), 'public', 'swagger-ui');
fs.mkdirSync(publicDir, { recursive: true });

execSync(`cpx 'node_modules/swagger-ui-dist/**/*' public/swagger-ui`, {
  stdio: 'inherit',
});

const initializerPath = path.join(publicDir, 'swagger-initializer.js');
if (fs.existsSync(initializerPath)) {
  let content = fs.readFileSync(initializerPath, 'utf8');
  content = content.replace(/url: ".*"/, 'url: "/docs-json"');
  fs.writeFileSync(initializerPath, content);
}

const distPublicDir = path.join(process.cwd(), 'dist', 'public', 'swagger-ui');
fs.mkdirSync(distPublicDir, { recursive: true });
execSync(`cpx 'public/swagger-ui/**/*' dist/public/swagger-ui`, {
  stdio: 'inherit',
});
