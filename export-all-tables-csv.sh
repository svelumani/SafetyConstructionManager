#!/bin/bash

# MySafety Complete Database Export to CSV
# Exports all tables from the current database to CSV format

echo "🚀 MySafety Complete Database Export to CSV"
echo "==========================================="
echo ""

# Create exports directory if it doesn't exist
mkdir -p uploads/csv_exports

# Get the current timestamp for the export batch
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_DIR="uploads/csv_exports/export_${TIMESTAMP}"
mkdir -p "$EXPORT_DIR"

echo "📁 Export directory: $EXPORT_DIR"
echo ""

# List of all MySafety tables to export
TABLES=(
    "tenants"
    "users" 
    "sites"
    "hazard_reports"
    "hazard_comments"
    "hazard_assignments"
    "incident_reports"
    "inspections"
    "inspection_templates"
    "inspection_sections"
    "inspection_items"
    "inspection_responses"
    "inspection_findings"
    "permit_requests"
    "system_logs"
    "role_permissions"
    "email_templates"
    "subcontractors"
    "site_personnel"
    "teams"
    "team_members"
    "training_courses"
    "training_content"
    "training_records"
    "reports"
)

# Export each table to CSV
echo "📊 Starting table exports..."
echo ""

EXPORTED_COUNT=0
TOTAL_RECORDS=0

for table in "${TABLES[@]}"; do
    echo "🔄 Exporting table: $table"
    
    # Check if table exists and get record count
    RECORD_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$RECORD_COUNT" != "0" ] && [ "$RECORD_COUNT" != "" ]; then
        # Export table to CSV
        psql "$DATABASE_URL" -c "\COPY $table TO '$PWD/$EXPORT_DIR/${table}.csv' WITH CSV HEADER;" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Exported $RECORD_COUNT records to ${table}.csv"
            EXPORTED_COUNT=$((EXPORTED_COUNT + 1))
            TOTAL_RECORDS=$((TOTAL_RECORDS + RECORD_COUNT))
        else
            echo "   ⚠️  Failed to export $table (table may not exist)"
        fi
    else
        echo "   📝 Skipping $table (empty or doesn't exist)"
    fi
done

echo ""
echo "📋 Export Summary:"
echo "   Tables exported: $EXPORTED_COUNT"
echo "   Total records: $TOTAL_RECORDS"
echo "   Export location: $EXPORT_DIR"
echo ""

# Create a manifest file with export details
cat > "$EXPORT_DIR/export_manifest.txt" << EOF
MySafety Database Export
========================
Date: $(date)
Database: $DATABASE_URL
Export Directory: $EXPORT_DIR
Tables Exported: $EXPORTED_COUNT
Total Records: $TOTAL_RECORDS

Files:
EOF

# List all exported CSV files with their sizes
for csv_file in "$EXPORT_DIR"/*.csv; do
    if [ -f "$csv_file" ]; then
        filename=$(basename "$csv_file")
        filesize=$(wc -l < "$csv_file")
        echo "  $filename - $((filesize - 1)) records" >> "$EXPORT_DIR/export_manifest.txt"
    fi
done

echo "📄 Created export manifest: export_manifest.txt"
echo ""

# Create a ZIP archive of all CSV files
if command -v zip >/dev/null 2>&1; then
    ZIP_FILE="uploads/mysafety_csv_export_${TIMESTAMP}.zip"
    cd "$EXPORT_DIR"
    zip -r "../../mysafety_csv_export_${TIMESTAMP}.zip" *.csv export_manifest.txt >/dev/null 2>&1
    cd - >/dev/null
    
    if [ -f "$ZIP_FILE" ]; then
        ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
        echo "📦 Created ZIP archive: mysafety_csv_export_${TIMESTAMP}.zip ($ZIP_SIZE)"
    fi
fi

echo ""
echo "✅ Database export completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "   1. Download the CSV files from: $EXPORT_DIR"
echo "   2. Or download the ZIP archive: mysafety_csv_export_${TIMESTAMP}.zip"
echo "   3. Import these CSV files into your EC2 PostgreSQL database"
echo ""
echo "💡 You can use pgAdmin or psql COPY commands to import the CSV files"