// Test script for GFF UID generation logic
// Run with: node --experimental-vm-modules scripts/test-gff-uid.mjs

// ===== Mock database for testing =====
class MockDatabase {
    constructor(existingIds = []) {
        this.existingIds = existingIds;
    }

    async getLastGFFSequence(yearPrefix) {
        // Filter IDs matching the prefix, sort descending, return the first
        const matching = this.existingIds
            .filter(id => id.startsWith(yearPrefix))
            .sort()
            .reverse();
        return matching.length > 0 ? matching[0] : null;
    }
}

// ===== Inline copy of the GFF generation logic for testing =====
const ROLE_PREFIX_MAP = {
    coach: 'C',
    referee: 'R',
    athlete: 'A',
    manager: 'M',
};

async function generateGFFId(role, database) {
    const rolePrefix = ROLE_PREFIX_MAP[role];
    if (!rolePrefix) {
        throw new Error(`Unknown role: ${role}`);
    }

    const yearSuffix = String(new Date().getFullYear()).slice(-2);
    const yearPrefix = `GFF${yearSuffix}`;

    const lastId = await database.getLastGFFSequence(yearPrefix);

    let nextSeq = 1;
    if (lastId) {
        const seqStr = lastId.slice(yearPrefix.length + 1);
        const parsed = parseInt(seqStr, 10);
        if (!isNaN(parsed)) {
            nextSeq = parsed + 1;
        }
    }

    const seqPadded = String(nextSeq).padStart(3, '0');
    return `${yearPrefix}${rolePrefix}${seqPadded}`;
}

function validateFootballID(footballId) {
    const pattern = /^GFF\d{2}[ACMR]\d{3,}$/;
    return pattern.test(footballId);
}

function parseFootballID(footballId) {
    if (!footballId || footballId.length < 9) return null;
    return {
        prefix: footballId.substring(0, 3),
        year: footballId.substring(3, 5),
        role: footballId.substring(5, 6),
        number: footballId.substring(6),
        full: footballId,
    };
}

// ===== Test runner =====
let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  [PASS] PASS: ${testName}`);
        passed++;
    } else {
        console.log(`  [FAIL] FAIL: ${testName}`);
        failed++;
    }
}

async function runTests() {
    const year = String(new Date().getFullYear()).slice(-2);

    console.log('=== GFF UID Generation Tests ===\n');

    // ----- Test 1: First coach (empty DB) -----
    console.log('Test 1: First coach (empty database)');
    const db1 = new MockDatabase([]);
    const id1 = await generateGFFId('coach', db1);
    assert(id1 === `GFF${year}C001`, `Expected GFF${year}C001, got ${id1}`);
    assert(validateFootballID(id1), `${id1} should be valid`);

    // ----- Test 2: Second user (athlete) after coach exists -----
    console.log('\nTest 2: Athlete after one existing coach');
    const db2 = new MockDatabase([`GFF${year}C001`]);
    const id2 = await generateGFFId('athlete', db2);
    assert(id2 === `GFF${year}A002`, `Expected GFF${year}A002, got ${id2}`);

    // ----- Test 3: Third user (referee) after two exist -----
    console.log('\nTest 3: Referee after two existing users');
    const db3 = new MockDatabase([`GFF${year}C001`, `GFF${year}A002`]);
    const id3 = await generateGFFId('referee', db3);
    assert(id3 === `GFF${year}R003`, `Expected GFF${year}R003, got ${id3}`);

    // ----- Test 4: Invalid role should throw -----
    console.log('\nTest 4: Invalid role throws error');
    try {
        await generateGFFId('superadmin', new MockDatabase([]));
        assert(false, 'Should have thrown for invalid role');
    } catch (e) {
        assert(e.message.includes('Unknown role'), `Got expected error: ${e.message}`);
    }

    // ----- Test 5: Parse football ID -----
    console.log('\nTest 5: Parse football ID');
    const parsed = parseFootballID(`GFF${year}C001`);
    assert(parsed !== null, 'Parse should return non-null');
    assert(parsed.prefix === 'GFF', `Prefix should be GFF, got ${parsed.prefix}`);
    assert(parsed.year === year, `Year should be ${year}, got ${parsed.year}`);
    assert(parsed.role === 'C', `Role should be C, got ${parsed.role}`);
    assert(parsed.number === '001', `Number should be 001, got ${parsed.number}`);

    // ----- Test 6: Validate football ID format -----
    console.log('\nTest 6: Validation');
    assert(validateFootballID(`GFF${year}C001`) === true, 'GFF26C001 valid');
    assert(validateFootballID(`GFF${year}A123`) === true, 'GFF26A123 valid');
    assert(validateFootballID(`GFF${year}R999`) === true, 'GFF26R999 valid');
    assert(validateFootballID(`GFF${year}M050`) === true, 'GFF26M050 valid');
    assert(validateFootballID('FB20261234') === false, 'Old format invalid');
    assert(validateFootballID('FT-ABC123-4567') === false, 'FT format invalid');
    assert(validateFootballID('') === false, 'Empty string invalid');
    assert(validateFootballID(null) === false, 'null invalid');

    // ----- Test 7: Large sequence number -----
    console.log('\nTest 7: Large sequence number (beyond 999)');
    const db7 = new MockDatabase([`GFF${year}A999`]);
    const id7 = await generateGFFId('coach', db7);
    assert(id7 === `GFF${year}C1000`, `Expected GFF${year}C1000, got ${id7}`);
    assert(validateFootballID(id7), `${id7} should still be valid (3+ digits)`);

    // ===== Summary =====
    console.log(`\n${'='.repeat(40)}`);
    console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
    console.log('='.repeat(40));

    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('\n>>> All tests passed!\n');
        process.exit(0);
    }
}

runTests().catch((err) => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
