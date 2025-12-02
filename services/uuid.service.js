// UUID Generator Service for Football IDs (FB20261234 format)
class UUIDService {
  // Generate Football ID: FB + Year + Sequential Number
  // Format: FB20261234
  generateFootballID() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `FB${year}${randomNum}`;
  }

  // Generate unique Football ID with database check
  async generateUniqueFootballID() {
    // SQL Query to generate unique ID
    const footballId = this.generateFootballID();
    
    // Check if ID already exists
    const checkQuery = `
      SELECT id FROM users WHERE football_id = $1;
    `;
    
    // If exists, generate new one (handled in API route)
    return { footballId, checkQuery, params: [footballId] };
  }

  // Get next sequential Football ID from database
  async getNextFootballID() {
    const year = new Date().getFullYear();
    const prefix = `FB${year}`;
    
    // Get the last ID for current year
    const query = `
      SELECT football_id 
      FROM users 
      WHERE football_id LIKE $1 
      ORDER BY football_id DESC 
      LIMIT 1;
    `;
    
    return { query, params: [`${prefix}%`], prefix };
  }

  // Parse Football ID
  parseFootballID(footballId) {
    // FB20261234 -> { prefix: 'FB', year: '2026', number: '1234' }
    if (!footballId || footballId.length < 8) {
      return null;
    }

    return {
      prefix: footballId.substring(0, 2),
      year: footballId.substring(2, 6),
      number: footballId.substring(6),
      full: footballId,
    };
  }

  // Validate Football ID format
  validateFootballID(footballId) {
    const pattern = /^FB\d{8}$/; // FB + 8 digits (4 year + 4 sequential)
    return pattern.test(footballId);
  }
}

export default new UUIDService();
