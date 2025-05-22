import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createSampleSites() {
  try {
    console.log('Creating sample construction sites...');
    
    // Define construction sites with realistic names and locations
    const sites = [
      {
        name: "Downtown Medical Center Expansion",
        address: "421 Main Street, Boston, MA 02108",
        city: "Boston",
        state: "MA",
        zipCode: "02108",
        status: "active",
        description: "Expansion of the east wing of Downtown Medical Center to add 120 beds and modern facilities.",
        type: "healthcare"
      },
      {
        name: "Riverfront Luxury Condominiums",
        address: "50 Harbor Drive, New York, NY 10014",
        city: "New York",
        state: "NY",
        zipCode: "10014",
        status: "active",
        description: "Construction of 35-story luxury condominium tower with 250 units and retail spaces.",
        type: "residential"
      },
      {
        name: "Tech Innovation Campus Phase II",
        address: "1800 Technology Way, San Francisco, CA 94105",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        status: "active",
        description: "Second phase of the tech campus development with four office buildings and a research center.",
        type: "commercial"
      },
      {
        name: "Westside Elementary School Renovation",
        address: "350 School Avenue, Chicago, IL 60611",
        city: "Chicago",
        state: "IL",
        zipCode: "60611",
        status: "active",
        description: "Complete renovation of the 50-year-old elementary school including seismic upgrades and modernization.",
        type: "education"
      },
      {
        name: "Central Station Transit Hub",
        address: "100 Transit Plaza, Seattle, WA 98104",
        city: "Seattle",
        state: "WA",
        zipCode: "98104",
        status: "active",
        description: "Construction of new multi-modal transit hub connecting light rail, bus, and regional train services.",
        type: "infrastructure"
      },
      {
        name: "Oakwood Bridge Replacement",
        address: "River Road, Portland, OR 97201",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        status: "active",
        description: "Replacement of aging bridge structure with new earthquake-resistant design.",
        type: "infrastructure"
      },
      {
        name: "Greenfield Solar Farm",
        address: "5000 Energy Drive, Phoenix, AZ 85004",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85004",
        status: "active",
        description: "Installation of 50MW solar farm with battery storage facility on former industrial land.",
        type: "energy"
      },
      {
        name: "Bayside Shopping Mall Redevelopment",
        address: "200 Retail Drive, Miami, FL 33131",
        city: "Miami",
        state: "FL",
        zipCode: "33131",
        status: "active",
        description: "Transformation of outdated shopping mall into mixed-use development with retail, dining, and apartments.",
        type: "commercial"
      },
      {
        name: "Mountain View Data Center",
        address: "4500 Cloud Way, Denver, CO 80202",
        city: "Denver",
        state: "CO",
        zipCode: "80202",
        status: "active",
        description: "Construction of tier-4 data center with state-of-the-art cooling and power systems.",
        type: "technology"
      },
      {
        name: "Harbor City Convention Center",
        address: "1000 Convention Boulevard, San Diego, CA 92101",
        city: "San Diego",
        state: "CA",
        zipCode: "92101",
        status: "active",
        description: "New convention center with 500,000 sq ft of exhibition space and 50,000 sq ft of meeting rooms.",
        type: "commercial"
      }
    ];
    
    // Insert sites into the database
    for (const site of sites) {
      const result = await pool.query(`
        INSERT INTO sites (
          tenant_id, name, address, city, state, zip_code, status, description, type, created_at, updated_at
        ) VALUES (
          1, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        ) ON CONFLICT (tenant_id, name) DO NOTHING
        RETURNING id, name
      `, [
        site.name,
        site.address,
        site.city,
        site.state,
        site.zipCode,
        site.status,
        site.description,
        site.type
      ]);
      
      if (result.rows.length > 0) {
        console.log(`Added site: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`Site already exists: ${site.name}`);
      }
    }
    
    console.log('Sample sites creation completed!');
    
  } catch (error) {
    console.error('Error creating sample sites:', error);
  } finally {
    await pool.end();
  }
}

createSampleSites();