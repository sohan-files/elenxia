import Database from 'better-sqlite3';

const db = new Database('./backend/node/pillpall.db');

console.log('Testing PillPall Database...\n');

const tables = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type='table'
  ORDER BY name
`).all();

console.log('✓ Database tables:');
tables.forEach(t => console.log(`  - ${t.name}`));

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const medicineCount = db.prepare('SELECT COUNT(*) as count FROM medicines').get();
const intakeCount = db.prepare('SELECT COUNT(*) as count FROM medicine_intakes').get();
const caregiverCount = db.prepare('SELECT COUNT(*) as count FROM caregivers').get();

console.log('\n✓ Data counts:');
console.log(`  - Users: ${userCount.count}`);
console.log(`  - Medicines: ${medicineCount.count}`);
console.log(`  - Intakes: ${intakeCount.count}`);
console.log(`  - Caregivers: ${caregiverCount.count}`);

console.log('\n✓ Database is ready!');

db.close();
