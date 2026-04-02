// UUID Generator Service for Football IDs (GFF26C001 format)

const ROLE_PREFIX_MAP = {
  coach: 'C',
  referee: 'R',
  athlete: 'A',
  manager: 'M',
  others: 'O',
};

class UUIDService {
  // Generate GFF Football ID: GFF + YY + RolePrefix + SeqNumber
  // Format: GFF26C001
  // Requires database access to get the next sequence number
  async generateGFFId(role, database) {
    const rolePrefix = ROLE_PREFIX_MAP[role];
    if (!rolePrefix) {
      throw new Error(`Unknown role: ${role}. Valid roles: ${Object.keys(ROLE_PREFIX_MAP).join(', ')}`);
    }

    const yearSuffix = String(new Date().getFullYear()).slice(-2); // '26' for 2026
    const yearPrefix = `GFF${yearSuffix}`;

    // Query the database for the last GFF ID this year (global across all roles)
    const lastId = await database.getLastGFFSequence(yearPrefix);

    let nextSeq = 1;
    if (lastId) {
      // Extract the sequence number from the last ID
      // e.g., 'GFF26C001' → '001' → 1, then increment to 2
      const seqStr = lastId.slice(yearPrefix.length + 1); // skip 'GFF26' + role letter
      const parsed = parseInt(seqStr, 10);
      if (!isNaN(parsed)) {
        nextSeq = parsed + 1;
      }
    }

    // Zero-pad to 3 digits
    const seqPadded = String(nextSeq).padStart(3, '0');
    return `${yearPrefix}${rolePrefix}${seqPadded}`;
  }

  // Parse GFF Football ID
  parseFootballID(footballId) {
    // GFF26C001 -> { prefix: 'GFF', year: '26', role: 'C', number: '001' }
    if (!footballId || footballId.length < 9) {
      return null;
    }

    return {
      prefix: footballId.substring(0, 3),
      year: footballId.substring(3, 5),
      role: footballId.substring(5, 6),
      number: footballId.substring(6),
      full: footballId,
    };
  }

  // Validate GFF Football ID format
  validateFootballID(footballId) {
    // GFF + 2-digit year + role letter + 3+ digit sequence
    const pattern = /^GFF\d{2}[ACMRO]\d{3,}$/;
    return pattern.test(footballId);
  }
}

export default new UUIDService();
