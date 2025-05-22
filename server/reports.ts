import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import {
  Document,
  Paragraph,
  TextRun,
  SectionType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  WidthType,
  TableOfContents,
  LevelFormat,
  ImageRun,
  Header,
  Footer,
} from "docx";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, between, desc, sql } from "drizzle-orm";
import { format } from "date-fns";

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
const reportDir = path.join(uploadDir, "reports");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir);
}

// Define the report generation parameters interface
interface ReportGenerationParams {
  siteId: number;
  startDate: string;
  endDate: string;
  includeHazards: boolean;
  includeIncidents: boolean;
  includeInspections: boolean;
  includePermits: boolean;
  includeTraining: boolean;
}

// Generate a formatted report name based on site and date range
function generateReportName(siteName: string, startDate: string, endDate: string): string {
  const formattedStartDate = format(new Date(startDate), "yyyy-MM-dd");
  const formattedEndDate = format(new Date(endDate), "yyyy-MM-dd");
  return `${siteName}_Safety_Report_${formattedStartDate}_to_${formattedEndDate}`;
}

// Main report generation function
export async function generateReport(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const params: ReportGenerationParams = req.body;
    const { siteId, startDate, endDate, includeHazards, includeIncidents, includeInspections, includePermits, includeTraining } = params;
    
    // Get site information
    const [site] = await db.select().from(schema.sites).where(eq(schema.sites.id, siteId));
    
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    // Convert dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Set end date to end of day

    // Fetch data based on parameters
    let hazardData: any[] = [];
    if (includeHazards) {
      hazardData = await db
        .select({
          hazard: schema.hazardReports,
          site: schema.sites,
          reportedBy: schema.users,
        })
        .from(schema.hazardReports)
        .leftJoin(schema.sites, eq(schema.hazardReports.siteId, schema.sites.id))
        .leftJoin(schema.users, eq(schema.hazardReports.reportedById, schema.users.id))
        .where(
          and(
            eq(schema.hazardReports.siteId, siteId),
            between(schema.hazardReports.createdAt, startDateObj.toISOString(), endDateObj.toISOString())
          )
        )
        .orderBy(schema.hazardReports.createdAt);
    }

    let incidentData: any[] = [];
    if (includeIncidents) {
      incidentData = await db
        .select({
          incident: schema.incidentReports,
          site: schema.sites,
          reportedBy: schema.users,
        })
        .from(schema.incidentReports)
        .leftJoin(schema.sites, eq(schema.incidentReports.siteId, schema.sites.id))
        .leftJoin(schema.users, eq(schema.incidentReports.reportedById, schema.users.id))
        .where(
          and(
            eq(schema.incidentReports.siteId, siteId),
            between(schema.incidentReports.incidentDate, startDateObj.toISOString(), endDateObj.toISOString())
          )
        )
        .orderBy(schema.incidentReports.incidentDate);
    }

    let inspectionData: any[] = [];
    if (includeInspections) {
      inspectionData = await db
        .select({
          inspection: schema.inspections,
          site: schema.sites,
          conductedBy: schema.users,
        })
        .from(schema.inspections)
        .leftJoin(schema.sites, eq(schema.inspections.siteId, schema.sites.id))
        .leftJoin(schema.users, eq(schema.inspections.completedById, schema.users.id))
        .where(
          and(
            eq(schema.inspections.siteId, siteId),
            between(schema.inspections.scheduledDate, startDateObj.toISOString(), endDateObj.toISOString())
          )
        )
        .orderBy(schema.inspections.scheduledDate);
    }

    let permitData: any[] = [];
    if (includePermits) {
      permitData = await db
        .select({
          permit: schema.permitRequests,
          site: schema.sites,
          requestedBy: schema.users,
        })
        .from(schema.permitRequests)
        .leftJoin(schema.sites, eq(schema.permitRequests.siteId, schema.sites.id))
        .leftJoin(schema.users, eq(schema.permitRequests.requesterId, schema.users.id))
        .where(
          and(
            eq(schema.permitRequests.siteId, siteId),
            between(schema.permitRequests.createdAt, startDateObj.toISOString(), endDateObj.toISOString())
          )
        )
        .orderBy(schema.permitRequests.createdAt);
    }

    let trainingData: any[] = [];
    if (includeTraining) {
      trainingData = await db
        .select({
          record: schema.trainingRecords,
          course: schema.trainingCourses,
          user: schema.users,
        })
        .from(schema.trainingRecords)
        .leftJoin(schema.trainingCourses, eq(schema.trainingRecords.courseId, schema.trainingCourses.id))
        .leftJoin(schema.users, eq(schema.trainingRecords.userId, schema.users.id))
        .where(
          and(
            eq(schema.trainingRecords.isActive, true),
            between(schema.trainingRecords.completionDate, startDateObj.toISOString(), endDateObj.toISOString())
          )
        )
        .orderBy(desc(schema.trainingRecords.completionDate));
    }

    // Generate report document
    const doc = createReportDocument(
      site,
      startDate,
      endDate,
      hazardData,
      incidentData,
      inspectionData,
      permitData,
      trainingData
    );

    // Create filename and save path
    const reportFileName = generateReportName(site.name, startDate, endDate);
    const reportFilePath = path.join(reportDir, `${reportFileName}.docx`);
    
    // Save the document
    const buffer = await doc.save();
    fs.writeFileSync(reportFilePath, buffer);

    // Save a record of the generated report in the database
    const insertResult = await db
      .insert(schema.reportHistory)
      .values({
        siteId: site.id,
        userId: req.user.id,
        startDate,
        endDate,

        reportName: reportFileName,
        reportUrl: `/api/reports/download/${reportFileName}`,
        status: "completed",
        includeHazards,
        includeIncidents,
        includeInspections,
        includePermits,
        includeTraining,
      })
      .returning();

    // Return success response
    res.status(200).json({
      message: "Report generated successfully",
      report: {
        id: insertResult[0].id,
        reportName: reportFileName,
        downloadUrl: `/api/reports/download/${insertResult[0].id}`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report", error: String(error) });
  }
}

// Function to retrieve report history
export async function getReportHistory(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const reports = await db
      .select({
        report: schema.reportHistory,
        site: schema.sites,
        user: schema.users,
      })
      .from(schema.reportHistory)
      .leftJoin(schema.sites, eq(schema.reportHistory.siteId, schema.sites.id))
      .leftJoin(schema.users, eq(schema.reportHistory.userId, schema.users.id))
      .orderBy(schema.reportHistory.createdAt);

    const formattedReports = reports.map((r) => ({
      id: r.report.id,
      siteName: r.site ? r.site.name : "Unknown Site",
      startDate: r.report.startDate,
      endDate: r.report.endDate,
      generatedBy: r.user ? `${r.user.firstName} ${r.user.lastName}` : "Unknown User",
      generatedOn: r.report.createdAt,
      reportName: r.report.reportName,
      downloadUrl: `/api/reports/download/${r.report.id}`,
      status: r.report.status,
    }));

    res.status(200).json({ reports: formattedReports });
  } catch (error) {
    console.error("Error fetching report history:", error);
    res.status(500).json({ message: "Failed to fetch report history", error: String(error) });
  }
}

// Function to download a previously generated report
export async function downloadReport(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const reportId = Number(req.params.id);
    const [report] = await db
      .select()
      .from(schema.reportHistory)
      .where(eq(schema.reportHistory.id, reportId));

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const reportPath = path.join(reportDir, `${report.reportName}.docx`);
    
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ message: "Report file not found" });
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=${report.reportName}.docx`);
    
    const stream = fs.createReadStream(reportPath);
    stream.pipe(res);
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).json({ message: "Failed to download report", error: String(error) });
  }
}

// Helper function to create the Word document
function createReportDocument(
  site: any,
  startDate: string,
  endDate: string,
  hazardData: any[],
  incidentData: any[],
  inspectionData: any[],
  permitData: any[],
  trainingData: any[]
): Document {
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          type: SectionType.CONTINUOUS,
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "MySafety for Construction",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Generated on ${format(new Date(), "MMMM d, yyyy")}`,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Safety Compliance Report", bold: true, size: 40 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: site.name, bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${format(new Date(startDate), "MMMM d, yyyy")} to ${format(
                  new Date(endDate),
                  "MMMM d, yyyy"
                )}`,
                size: 28,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Site Information
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "Site Information", bold: true, size: 32 })],
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Site Name", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: site.name })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Address", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: site.address })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Location", bold: true })] }),
                  new TableCell({
                    children: [new Paragraph({ text: `${site.city}, ${site.state}` })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Type", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: site.type })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "Executive Summary", bold: true, size: 32 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This report provides a comprehensive overview of safety performance and compliance for the specified site and time period. It includes detailed information on hazards, incidents, inspections, permits, and training records to help maintain a safe working environment and ensure regulatory compliance.",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Table of Contents
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "Table of Contents", bold: true, size: 32 })],
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-5",
            stylesWithLevels: [
              { styleId: "Heading1", level: 1 },
              { styleId: "Heading2", level: 2 },
              { styleId: "Heading3", level: 3 },
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
        ],
      },
    ],
  });

  // Add Hazard Section if data is included
  if (hazardData.length > 0) {
    const section = doc.addSection({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Hazard Reports", bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Hazard Reports: ${hazardData.length}`,
              size: 24,
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        createHazardsTable(hazardData),
        new Paragraph({ text: "" }),
      ],
    });
  }

  // Add Incident Section if data is included
  if (incidentData.length > 0) {
    const section = doc.addSection({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Incident Reports", bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Incidents: ${incidentData.length}`,
              size: 24,
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        createIncidentsTable(incidentData),
        new Paragraph({ text: "" }),
      ],
    });
  }

  // Add Inspection Section if data is included
  if (inspectionData.length > 0) {
    const section = doc.addSection({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Safety Inspections", bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Inspections: ${inspectionData.length}`,
              size: 24,
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        createInspectionsTable(inspectionData),
        new Paragraph({ text: "" }),
      ],
    });
  }

  // Add Permit Section if data is included
  if (permitData.length > 0) {
    const section = doc.addSection({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Work Permits", bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Permits: ${permitData.length}`,
              size: 24,
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        createPermitsTable(permitData),
        new Paragraph({ text: "" }),
      ],
    });
  }

  // Add Training Section if data is included
  if (trainingData.length > 0) {
    const section = doc.addSection({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Training Records", bold: true, size: 32 })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Training Completions: ${trainingData.length}`,
              size: 24,
              bold: true,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        createTrainingTable(trainingData),
        new Paragraph({ text: "" }),
      ],
    });
  }

  // Add Conclusion Section
  const conclusionSection = doc.addSection({
    properties: {
      type: SectionType.CONTINUOUS,
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "Conclusion and Recommendations", bold: true, size: 32 })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "This section is provided for safety officers to enter their conclusions and recommendations based on the data presented in this report.",
            size: 24,
          }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Please add your analysis of safety trends, areas of improvement, and specific recommendations for enhancing safety on this construction site.",
            size: 24,
          }),
        ],
      }),
      new Paragraph({ text: "" }),
    ],
  });

  return doc;
}

// Helper function to create hazards table
function createHazardsTable(hazards: any[]) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Hazard Description", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Location", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Severity", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Status", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Reported By", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Reported Date", bold: true })],
        }),
      ],
    }),
  ];

  hazards.forEach((h) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: h.hazard.description })] }),
          new TableCell({ children: [new Paragraph({ text: h.hazard.location })] }),
          new TableCell({ children: [new Paragraph({ text: h.hazard.severity })] }),
          new TableCell({ children: [new Paragraph({ text: h.hazard.status })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: h.reportedBy
                  ? `${h.reportedBy.firstName} ${h.reportedBy.lastName}`
                  : "Unknown",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: format(new Date(h.hazard.createdAt), "MMM d, yyyy"),
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
    },
    rows,
  });
}

// Helper function to create incidents table
function createIncidentsTable(incidents: any[]) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Incident Title", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Description", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Location", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Severity", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Status", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Incident Date", bold: true })],
        }),
      ],
    }),
  ];

  incidents.forEach((i) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: i.incident.title })] }),
          new TableCell({ children: [new Paragraph({ text: i.incident.description })] }),
          new TableCell({ children: [new Paragraph({ text: i.incident.location })] }),
          new TableCell({ children: [new Paragraph({ text: i.incident.severity })] }),
          new TableCell({ children: [new Paragraph({ text: i.incident.status })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: format(new Date(i.incident.incidentDate), "MMM d, yyyy"),
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
    },
    rows,
  });
}

// Helper function to create inspections table
function createInspectionsTable(inspections: any[]) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Inspection Title", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Type", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Status", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Conducted By", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Inspection Date", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Score", bold: true })],
        }),
      ],
    }),
  ];

  inspections.forEach((i) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: i.inspection.title })] }),
          new TableCell({ children: [new Paragraph({ text: i.inspection.type || "General" })] }),
          new TableCell({ children: [new Paragraph({ text: i.inspection.status })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: i.conductedBy
                  ? `${i.conductedBy.firstName} ${i.conductedBy.lastName}`
                  : "Unknown",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: i.inspection.scheduledDate
                  ? format(new Date(i.inspection.scheduledDate), "MMM d, yyyy")
                  : "N/A",
              }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: i.inspection.score ? `${i.inspection.score}%` : "N/A" })],
          }),
        ],
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
    },
    rows,
  });
}

// Helper function to create permits table
function createPermitsTable(permits: any[]) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Permit Type", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Description", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Status", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Requested By", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Start Date", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "End Date", bold: true })],
        }),
      ],
    }),
  ];

  permits.forEach((p) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: p.permit.type })] }),
          new TableCell({ children: [new Paragraph({ text: p.permit.description })] }),
          new TableCell({ children: [new Paragraph({ text: p.permit.status })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: p.requestedBy
                  ? `${p.requestedBy.firstName} ${p.requestedBy.lastName}`
                  : "Unknown",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: p.permit.startDate
                  ? format(new Date(p.permit.startDate), "MMM d, yyyy")
                  : "N/A",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: p.permit.endDate
                  ? format(new Date(p.permit.endDate), "MMM d, yyyy")
                  : "N/A",
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
    },
    rows,
  });
}

// Helper function to create training table
function createTrainingTable(trainings: any[]) {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Course Name", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Employee", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Status", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Completion Date", bold: true })],
        }),
        new TableCell({
          shading: {
            fill: "CCCCCC",
          },
          children: [new Paragraph({ text: "Score", bold: true })],
        }),
      ],
    }),
  ];

  trainings.forEach((t) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: t.course ? t.course.title : "Unknown Course" })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: t.user
                  ? `${t.user.firstName} ${t.user.lastName}`
                  : "Unknown User",
              }),
            ],
          }),
          new TableCell({ children: [new Paragraph({ text: t.record.status })] }),
          new TableCell({
            children: [
              new Paragraph({
                text: t.record.completionDate
                  ? format(new Date(t.record.completionDate), "MMM d, yyyy")
                  : "N/A",
              }),
            ],
          }),
          new TableCell({ children: [new Paragraph({ text: t.record.score ? `${t.record.score}%` : "N/A" })] }),
        ],
      })
    );
  });

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
    },
    rows,
  });
}