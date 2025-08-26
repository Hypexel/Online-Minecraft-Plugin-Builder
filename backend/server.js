const express = require('express');
app.use('/api/', limiter);


// Endpoint to build a project (client sends a zip of the project)
app.post('/api/build', upload.single('projectZip'), async (req, res) => {
try {
if (!req.file) return res.status(400).json({ error: 'missing project zip' });


const id = uuidv4();
const workDir = path.join(BUILD_ROOT, id);
fs.mkdirSync(workDir, { recursive: true });


// unzip
const zip = new AdmZip(req.file.path);
zip.extractAllTo(workDir, true);


// cleanup uploaded zip
fs.unlinkSync(req.file.path);


// run dockerized maven build to avoid host maven issues. Requires Docker installed.
// The command mounts the workDir into /workspace inside the maven image and runs 'mvn -DskipTests package'.
// Use the official maven image with Java 21 (adopt/equivalent). Update image tag to a specific version if needed.


const mavenImage = 'maven:3.9.5-eclipse-temurin-21';
const containerCmd = `docker run --rm -v ${workDir}:/workspace -w /workspace ${mavenImage} mvn -DskipTests package`;


exec(containerCmd, { timeout: 15 * 60 * 1000 }, (err, stdout, stderr) => {
if (err) {
console.error('Build failed:', err, stderr);
return res.status(500).json({ error: 'Build failed', details: stderr || err.message });
}


// Find the produced jar (target/*.jar)
const targetDir = path.join(workDir, 'target');
if (!fs.existsSync(targetDir)) {
return res.status(500).json({ error: 'No target directory after build' });
}


const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.jar'));
if (files.length === 0) return res.status(500).json({ error: 'No JAR produced' });


// Choose the first jar (or shaded jar if exists)
const jarName = files.sort().reverse()[0];
const jarPath = path.join(targetDir, jarName);


res.download(jarPath, jarName, (err) => {
// cleanup build dir after download is initiated
setTimeout(() => rimraf.sync(workDir), 60 * 1000);
});
});


} catch (e) {
console.error(e);
res.status(500).json({ error: e.message });
}
});


// Simple endpoint to get example template files
app.get('/api/template/basic', (req, res) => {
const templateDir = path.join(__dirname, '..', 'templates', 'basic-plugin');
res.json({ path: 'templates/basic-plugin', files: fs.readdirSync(templateDir) });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
