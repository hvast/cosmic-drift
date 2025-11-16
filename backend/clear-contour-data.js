// Script to clear all contour data from database
// This will force re-generation on next access
const mysql = require('mysql2/promise');

async function clearContourData() {
  console.log('🗑️  Clearing all contour data from database...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cosmic_drift'
  });

  try {
    // Get count before clearing
    const [countBefore] = await connection.execute(
      'SELECT COUNT(*) as count FROM creatures WHERE contour_data IS NOT NULL'
    );
    console.log(`Found ${countBefore[0].count} creatures with contour data\n`);

    if (countBefore[0].count === 0) {
      console.log('✅ No contour data to clear');
      return;
    }

    // Ask for confirmation
    console.log('⚠️  This will clear all contour data. They will be regenerated on next access.');
    console.log('   Clearing in 2 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear all contour data
    const [result] = await connection.execute(
      'UPDATE creatures SET contour_data = NULL WHERE contour_data IS NOT NULL'
    );

    console.log(`✅ Cleared contour data from ${result.affectedRows} creatures`);

    // Verify
    const [countAfter] = await connection.execute(
      'SELECT COUNT(*) as count FROM creatures WHERE contour_data IS NOT NULL'
    );
    console.log(`Remaining creatures with contour data: ${countAfter[0].count}`);

  } finally {
    await connection.end();
  }
}

clearContourData()
  .then(() => {
    console.log('\n✅ Operation completed');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart the backend server');
    console.log('   2. Open the frontend and click on a creature');
    console.log('   3. The contour will be extracted fresh from the image\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
