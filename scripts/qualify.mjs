// Exercise the shipped authoring example against its installed SDK, away from source.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
// npm supplies its JS entrypoint on every platform, including Windows.
const npm=process.env.npm_execpath;
assert.ok(npm,'Run this check with npm test.');
const run=(args,cwd)=>execFileSync(process.execPath,[npm,...args],{cwd,encoding:'utf8',stdio:['ignore','pipe','inherit']});
const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
if(process.env.GITHUB_REF?.startsWith('refs/tags/'))assert.equal(process.env.GITHUB_REF,`refs/tags/v${pkg.version}`);
const notes=await readFile(join(root,'RELEASE_NOTES.md'),'utf8');
assert.ok(notes.startsWith(`# ${pkg.version}\n`),'Release notes must describe this package version.');
const expected=[...pkg.files,'package.json'].sort();
const scratch=await mkdtemp(join(tmpdir(),'amplifier-shell-sdk-'));
try{
 const [packed]=JSON.parse(run(['pack','--json','--pack-destination',scratch],root));
 assert.deepEqual(packed.files.map(row=>row.path).sort(),expected);
 const archive=join(scratch,packed.filename),consumer=join(scratch,'consumer');
 await mkdir(consumer);
 const example=JSON.parse(await readFile(join(root,'examples/shell-controls/package.json'),'utf8'));
 await writeFile(join(consumer,'package.json'),JSON.stringify({...example,
  devDependencies:{...example.devDependencies,typescript:pkg.devDependencies.typescript}}));
 run(['install',archive,'--save-exact','--no-audit','--no-fund'],consumer);
 const installed=join(consumer,'node_modules/@amplifier/shell-sdk');
 assert.deepEqual(await readFile(join(installed,'examples/shell-controls/package.json')),await readFile(join(root,'examples/shell-controls/package.json')));
 for(const name of ['index.js','index.d.ts'])assert.deepEqual(await readFile(join(installed,name)),await readFile(join(root,name)));
 for(const name of ['index.js','manifest.json','build.mjs','README.md'])
  await copyFile(join(installed,'examples/shell-controls',name),join(consumer,name));
 await copyFile(join(root,'tests/consumer.ts'),join(consumer,'consumer.ts'));
 execFileSync(process.execPath,[join(consumer,'node_modules/typescript/bin/tsc'),
  '--strict','--noEmit','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','consumer.ts'],
  {cwd:consumer,stdio:'inherit'});
 run(['run','build'],consumer);
 const meta=JSON.parse(await readFile(join(consumer,'dist/build-inputs.json'),'utf8'));
 assert.deepEqual(Object.keys(meta.inputs).sort(),['index.js','node_modules/@amplifier/shell-sdk/index.js']);
 assert.ok(Object.values(meta.outputs).every(item=>item.imports.length===0));
 const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
 const output=join(root,'dist');await mkdir(output,{recursive:true});
 const receipt={package:packed.name,version:packed.version,tarball:packed.filename,
  tarballSha256:await hash(archive),moduleSha256:await hash(join(consumer,'dist/module.mjs')),
  files:packed.files.map(({path,size})=>({path,size})),node:process.version,npm:run(['--version'],consumer).trim(),
  platform:process.platform,typescript:pkg.devDependencies.typescript,strictConsumer:'passed',inputs:Object.keys(meta.inputs),hostAcceptance:'Separate Unified DTU validation is required for changed interface or component behavior.'};
 await copyFile(archive,join(output,packed.filename));
 for(const name of ['module.mjs','manifest.json','build-inputs.json'])await copyFile(join(consumer,'dist',name),join(output,name));
 await writeFile(join(output,'qualification.json'),JSON.stringify(receipt,null,2)+'\n');
 await writeFile(join(output,'SHA256SUMS'),`${receipt.tarballSha256}  ${packed.filename}\n`);
 await writeFile(join(output,'RELEASE_NOTES.md'),notes);
 console.log(JSON.stringify(receipt,null,2));
}finally{
 await rm(scratch,{recursive:true,force:true});
}
