import { Request, Response } from 'express';
import { db } from './db';
import { eq, between, and, desc } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import Docx from 'docx';
import { format } from 'date-fns';
import { hazardReports } from '@shared/schema';
import { incidentReports } from '@shared/schema';
import { inspections } from '@shared/schema';
import { permitRequests } from '@shared/schema';
import { trainingRecords } from '@shared/schema';
import { sites } from '@shared/schema';
import { users } from '@shared/schema';
import { reportHistory } from '@shared/schema';

const { Document, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, BorderStyle } = Docx;

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

// Generate report filename based on site and date range
function generateReportName(siteName: string, startDate: string, endDate: string): string {
  const formattedStart = format(new Date(startDate), 'MMddyyyy');
  const formattedEnd = format(new Date(endDate), 'MMddyyyy');
  return `${siteName.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${formattedStart}_${formattedEnd}.docx`;
}

// Handler for generating a report
export async function generateReport(req: Request, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    
    if (!tenantId || !userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const params: ReportGenerationParams = req.body;
    
    if (!params.siteId || !params.startDate || !params.endDate) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Get site information
    const siteResult = await db.select().from(sites).where(eq(sites.id, params.siteId)).limit(1);
    
    if (siteResult.length === 0) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    const site = siteResult[0];
    const siteName = site.name;
    const reportName = generateReportName(siteName, params.startDate, params.endDate);
    
    // Fetch data for report sections
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    
    // 1. Hazard data if requested
    let hazardData = [];
    if (params.includeHazards) {
      hazardData = await db.select()
        .from(hazardReports)
        .where(
          and(
            eq(hazardReports.siteId, params.siteId),
            eq(hazardReports.tenantId, tenantId),
            between(hazardReports.reportedAt, startDate, endDate)
          )
        )
        .orderBy(desc(hazardReports.reportedAt));
    }
    
    // 2. Incident data if requested
    let incidentData = [];
    if (params.includeIncidents) {
      incidentData = await db.select()
        .from(incidentReports)
        .where(
          and(
            eq(incidentReports.siteId, params.siteId),
            eq(incidentReports.tenantId, tenantId),
            between(incidentReports.incidentDate, startDate, endDate)
          )
        )
        .orderBy(desc(incidentReports.incidentDate));
    }
    
    // 3. Inspection data if requested
    let inspectionData = [];
    if (params.includeInspections) {
      inspectionData = await db.select()
        .from(inspections)
        .where(
          and(
            eq(inspections.siteId, params.siteId),
            eq(inspections.tenantId, tenantId),
            between(inspections.scheduledDate, startDate, endDate)
          )
        )
        .orderBy(desc(inspections.scheduledDate));
    }
    
    // 4. Permit data if requested
    let permitData = [];
    if (params.includePermits) {
      permitData = await db.select()
        .from(permitRequests)
        .where(
          and(
            eq(permitRequests.siteId, params.siteId),
            eq(permitRequests.tenantId, tenantId),
            between(permitRequests.requestDate, startDate, endDate)
          )
        )
        .orderBy(desc(permitRequests.requestDate));
    }
    
    // 5. Training data if requested
    let trainingData = [];
    if (params.includeTraining) {
      trainingData = await db.select()
        .from(trainingRecords)
        .where(
          and(
            eq(trainingRecords.tenantId, tenantId),
            between(trainingRecords.completedDate, startDate, endDate)
          )
        )
        .orderBy(desc(trainingRecords.completedDate));
      
      // Filter training data by site (this would need to be implemented based on your schema)
      // For now, we'll use all tenant training data
    }
    
    // Generate document
    const doc = createReportDocument(
      siteName,
      params.startDate,
      params.endDate,
      hazardData,
      incidentData,
      inspectionData,
      permitData,
      trainingData
    );
    
    // Save report to uploads directory (create if it doesn't exist)
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const reportPath = path.join(uploadsDir, reportName);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(reportPath, buffer);
    
    // Save report record in database
    const [reportRecord] = await db.insert(reportHistory)
      .values({
        tenantId,
        userId,
        siteId: params.siteId,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        reportName,
        reportUrl: `/uploads/${reportName}`,
        status: 'generated',
        createdAt: new Date()
      })
      .returning();
    
    // Send response with report details
    res.status(200).json({
      id: reportRecord.id,
      reportName,
      downloadUrl: `/api/reports/download/${reportRecord.id}`,
      message: 'Report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'An error occurred while generating the report' });
  }
}

// Handler for fetching report history
export async function getReportHistory(req: Request, res: Response) {
  try {
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Optional filter by site
    const siteId = req.query.siteId ? Number(req.query.siteId) : undefined;
    
    // Get report history with site and user information
    const query = db.select({
      report: reportHistory,
      site: sites,
      user: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(reportHistory)
    .leftJoin(sites, eq(reportHistory.siteId, sites.id))
    .leftJoin(users, eq(reportHistory.userId, users.id))
    .where(eq(reportHistory.tenantId, tenantId))
    .orderBy(desc(reportHistory.createdAt));
    
    // Apply site filter if provided
    if (siteId) {
      query.where(eq(reportHistory.siteId, siteId));
    }
    
    const reports = await query;
    
    res.status(200).json({
      reports: reports.map(r => ({
        id: r.report.id,
        siteName: r.site.name,
        startDate: r.report.startDate,
        endDate: r.report.endDate,
        generatedBy: `${r.user.firstName} ${r.user.lastName}`,
        generatedOn: r.report.createdAt,
        reportName: r.report.reportName,
        downloadUrl: `/api/reports/download/${r.report.id}`,
        status: r.report.status
      }))
    });
    
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({ message: 'An error occurred while fetching report history' });
  }
}

// Handler for downloading a report
export async function downloadReport(req: Request, res: Response) {
  try {
    const reportId = Number(req.params.id);
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get report details
    const [report] = await db.select()
      .from(reportHistory)
      .where(
        and(
          eq(reportHistory.id, reportId),
          eq(reportHistory.tenantId, tenantId)
        )
      );
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', report.reportName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Report file not found' });
    }
    
    res.download(filePath, report.reportName);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'An error occurred while downloading the report' });
  }
}

// Create the Word document structure
function createReportDocument(
  siteName: string,
  startDateStr: string,
  endDateStr: string,
  hazards: any[],
  incidents: any[],
  inspections: any[],
  permits: any[],
  trainings: any[]
) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const formattedStartDate = format(startDate, 'MMMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMMM d, yyyy');
  
  // Create document
  const doc = new Document({
    title: `${siteName} Safety Report`,
    description: `Safety report for ${siteName} from ${formattedStartDate} to ${formattedEndDate}`,
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28,
            bold: true,
            color: "000000",
            font: "Calibri",
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 24,
            bold: true,
            color: "2F5496",
            font: "Calibri",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: "TableHeader",
          name: "Table Header",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 22,
            bold: true,
            color: "FFFFFF",
            font: "Calibri",
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
      ],
    },
  });
  
  // Add report sections
  const children = [
    // Title page
    new Paragraph({
      text: `${siteName} Safety Report`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    }),
    new Paragraph({
      text: `Reporting Period: ${formattedStartDate} to ${formattedEndDate}`,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    }),
    new Paragraph({
      text: `Generated: ${format(new Date(), 'MMMM d, yyyy')}`,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 800,
      },
    }),
    
    // Executive Summary
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: `This report provides a comprehensive overview of all safety-related activities at ${siteName} between ${formattedStartDate} and ${formattedEndDate}.`,
    }),
    new Paragraph({
      text: `During this period, there were ${hazards.length} hazards reported, ${incidents.length} incidents recorded, ${inspections.length} inspections conducted, and ${permits.length} permits processed.`,
    }),
  ];
  
  // Add hazards section if included
  if (hazards.length > 0) {
    children.push(
      new Paragraph({
        text: 'Hazard Reports',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${hazards.length} hazards were reported during this period.`,
      }),
      createHazardsTable(hazards)
    );
  }
  
  // Add incidents section if included
  if (incidents.length > 0) {
    children.push(
      new Paragraph({
        text: 'Incident Reports',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${incidents.length} incidents were recorded during this period.`,
      }),
      createIncidentsTable(incidents)
    );
  }
  
  // Add inspections section if included
  if (inspections.length > 0) {
    children.push(
      new Paragraph({
        text: 'Inspections',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${inspections.length} inspections were conducted during this period.`,
      }),
      createInspectionsTable(inspections)
    );
  }
  
  // Add permits section if included
  if (permits.length > 0) {
    children.push(
      new Paragraph({
        text: 'Permits',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${permits.length} permits were processed during this period.`,
      }),
      createPermitsTable(permits)
    );
  }
  
  // Add training section if included
  if (trainings.length > 0) {
    children.push(
      new Paragraph({
        text: 'Training',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `${trainings.length} training completions were recorded during this period.`,
      }),
      createTrainingTable(trainings)
    );
  }
  
  // Add conclusion
  children.push(
    new Paragraph({
      text: 'Conclusion and Recommendations',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: 'This section can be edited to provide overall conclusions and specific recommendations based on the data presented in this report.',
    }),
    new Paragraph({
      text: '____________________________________________________________________________________',
    }),
    new Paragraph({
      text: '____________________________________________________________________________________',
    }),
    new Paragraph({
      text: '____________________________________________________________________________________',
    })
  );
  
  // Add all sections to document
  doc.addSection({
    children,
  });
  
  return doc;
}

// Create hazards table
function createHazardsTable(hazards: any[]) {
  // Table header row
  const headerRow = new TableRow({
    tableHeader: true,
    height: {
      value: 400,
      rule: HeightRule.EXACT,
    },
    children: [
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Date', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Description', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Severity', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Status', style: 'TableHeader' })],
      }),
    ],
  });
  
  // Table data rows
  const rows = hazards.map(hazard => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: format(new Date(hazard.reportedAt), 'MMM d, yyyy') })],
        }),
        new TableCell({
          children: [new Paragraph({ text: hazard.description })],
        }),
        new TableCell({
          children: [new Paragraph({ text: hazard.severity })],
        }),
        new TableCell({
          children: [new Paragraph({ text: hazard.status })],
        }),
      ],
    });
  });
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...rows],
  });
}

// Create incidents table
function createIncidentsTable(incidents: any[]) {
  // Table header row
  const headerRow = new TableRow({
    tableHeader: true,
    height: {
      value: 400,
      rule: HeightRule.EXACT,
    },
    children: [
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Date', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Description', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Severity', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Status', style: 'TableHeader' })],
      }),
    ],
  });
  
  // Table data rows
  const rows = incidents.map(incident => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: format(new Date(incident.incidentDate), 'MMM d, yyyy') })],
        }),
        new TableCell({
          children: [new Paragraph({ text: incident.description })],
        }),
        new TableCell({
          children: [new Paragraph({ text: incident.severity || 'Medium' })],
        }),
        new TableCell({
          children: [new Paragraph({ text: incident.status })],
        }),
      ],
    });
  });
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...rows],
  });
}

// Create inspections table
function createInspectionsTable(inspections: any[]) {
  // Table header row
  const headerRow = new TableRow({
    tableHeader: true,
    height: {
      value: 400,
      rule: HeightRule.EXACT,
    },
    children: [
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Date', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Inspector', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Template', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Status', style: 'TableHeader' })],
      }),
    ],
  });
  
  // Table data rows
  const rows = inspections.map(inspection => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: format(new Date(inspection.scheduledDate), 'MMM d, yyyy') })],
        }),
        new TableCell({
          children: [new Paragraph({ text: inspection.inspectorName || 'Safety Officer' })],
        }),
        new TableCell({
          children: [new Paragraph({ text: inspection.templateName || 'Standard Inspection' })],
        }),
        new TableCell({
          children: [new Paragraph({ text: inspection.status })],
        }),
      ],
    });
  });
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...rows],
  });
}

// Create permits table
function createPermitsTable(permits: any[]) {
  // Table header row
  const headerRow = new TableRow({
    tableHeader: true,
    height: {
      value: 400,
      rule: HeightRule.EXACT,
    },
    children: [
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Date', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Type', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Expiration', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Status', style: 'TableHeader' })],
      }),
    ],
  });
  
  // Table data rows
  const rows = permits.map(permit => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: format(new Date(permit.requestDate), 'MMM d, yyyy') })],
        }),
        new TableCell({
          children: [new Paragraph({ text: permit.type })],
        }),
        new TableCell({
          children: [
            new Paragraph({ 
              text: permit.expirationDate 
                ? format(new Date(permit.expirationDate), 'MMM d, yyyy')
                : 'N/A'
            })
          ],
        }),
        new TableCell({
          children: [new Paragraph({ text: permit.status })],
        }),
      ],
    });
  });
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...rows],
  });
}

// Create training table
function createTrainingTable(trainings: any[]) {
  // Table header row
  const headerRow = new TableRow({
    tableHeader: true,
    height: {
      value: 400,
      rule: HeightRule.EXACT,
    },
    children: [
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Date', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Employee', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Course', style: 'TableHeader' })],
      }),
      new TableCell({
        shading: {
          fill: '2F5496',
          val: ShadingType.CLEAR,
        },
        children: [new Paragraph({ text: 'Status', style: 'TableHeader' })],
      }),
    ],
  });
  
  // Table data rows
  const rows = trainings.map(training => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({ 
              text: training.completedDate 
                ? format(new Date(training.completedDate), 'MMM d, yyyy')
                : format(new Date(training.assignedDate), 'MMM d, yyyy')
            })
          ],
        }),
        new TableCell({
          children: [new Paragraph({ text: training.userName || 'Employee' })],
        }),
        new TableCell({
          children: [new Paragraph({ text: training.courseTitle || 'Safety Training' })],
        }),
        new TableCell({
          children: [new Paragraph({ text: training.status || 'Completed' })],
        }),
      ],
    });
  });
  
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [headerRow, ...rows],
  });
}