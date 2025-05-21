import { sendEmail } from "../email";
import { HazardReport, HazardAssignment, User } from "@shared/schema";

/**
 * Sends a notification when a new hazard is reported
 */
export async function sendHazardReportedNotification(
  hazard: HazardReport,
  reportedBy: User,
  siteName: string,
  recipients: User[]
): Promise<boolean> {
  if (!recipients.length) return true;

  const severityFormatted = hazard.severity.charAt(0).toUpperCase() + hazard.severity.slice(1);
  
  const subject = `[SAFETY ALERT] New ${severityFormatted} Hazard Reported: ${hazard.title}`;
  
  const html = `
    <h2>New Hazard Report: ${hazard.title}</h2>
    <p><strong>Reported by:</strong> ${reportedBy.firstName} ${reportedBy.lastName}</p>
    <p><strong>Severity:</strong> ${severityFormatted}</p>
    <p><strong>Location:</strong> ${hazard.location} (${siteName})</p>
    <p><strong>Type:</strong> ${hazard.hazardType}</p>
    <p><strong>Description:</strong> ${hazard.description}</p>
    
    ${hazard.recommendedAction ? `<p><strong>Recommended Action:</strong> ${hazard.recommendedAction}</p>` : ''}
    
    <p>Please log in to the safety management system to view more details and take appropriate action.</p>
  `;

  const text = `
New Hazard Report: ${hazard.title}
Reported by: ${reportedBy.firstName} ${reportedBy.lastName}
Severity: ${severityFormatted}
Location: ${hazard.location} (${siteName})
Type: ${hazard.hazardType}
Description: ${hazard.description}

${hazard.recommendedAction ? `Recommended Action: ${hazard.recommendedAction}\n` : ''}

Please log in to the safety management system to view more details and take appropriate action.
  `;

  try {
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient.email,
        subject,
        html,
        text
      });
    }
    return true;
  } catch (error) {
    console.error("Failed to send hazard reported notification:", error);
    return false;
  }
}

/**
 * Sends a notification when a hazard is assigned to a user
 */
export async function sendHazardAssignedNotification(
  hazard: HazardReport,
  assignment: HazardAssignment,
  assignedBy: User,
  assignedTo: User,
  siteName: string
): Promise<boolean> {
  const severityFormatted = hazard.severity.charAt(0).toUpperCase() + hazard.severity.slice(1);
  
  const subject = `[ACTION REQUIRED] Hazard Assignment: ${hazard.title}`;
  
  const html = `
    <h2>Hazard Assignment: ${hazard.title}</h2>
    <p>You have been assigned to address a ${severityFormatted.toLowerCase()} severity hazard.</p>
    
    <p><strong>Assigned by:</strong> ${assignedBy.firstName} ${assignedBy.lastName}</p>
    <p><strong>Hazard:</strong> ${hazard.title}</p>
    <p><strong>Severity:</strong> ${severityFormatted}</p>
    <p><strong>Location:</strong> ${hazard.location} (${siteName})</p>
    <p><strong>Type:</strong> ${hazard.hazardType}</p>
    
    ${assignment.dueDate ? `<p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>` : ''}
    
    ${assignment.notes ? `<p><strong>Assignment Notes:</strong> ${assignment.notes}</p>` : ''}
    
    <p>Please log in to the safety management system to view more details and update the status as you make progress.</p>
  `;

  const text = `
Hazard Assignment: ${hazard.title}
You have been assigned to address a ${severityFormatted.toLowerCase()} severity hazard.

Assigned by: ${assignedBy.firstName} ${assignedBy.lastName}
Hazard: ${hazard.title}
Severity: ${severityFormatted}
Location: ${hazard.location} (${siteName})
Type: ${hazard.hazardType}

${assignment.dueDate ? `Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}\n` : ''}
${assignment.notes ? `Assignment Notes: ${assignment.notes}\n` : ''}

Please log in to the safety management system to view more details and update the status as you make progress.
  `;

  try {
    await sendEmail({
      to: assignedTo.email,
      subject,
      html,
      text
    });
    return true;
  } catch (error) {
    console.error("Failed to send hazard assignment notification:", error);
    return false;
  }
}

/**
 * Sends a notification when a hazard status is updated
 */
export async function sendHazardStatusUpdateNotification(
  hazard: HazardReport,
  previousStatus: string,
  updatedBy: User,
  recipients: User[]
): Promise<boolean> {
  if (!recipients.length) return true;

  const statusFormatted = hazard.status.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const previousStatusFormatted = previousStatus.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const subject = `[STATUS UPDATE] Hazard Status Changed: ${hazard.title}`;
  
  const html = `
    <h2>Hazard Status Update: ${hazard.title}</h2>
    <p>The status of a hazard has been updated.</p>
    
    <p><strong>Updated by:</strong> ${updatedBy.firstName} ${updatedBy.lastName}</p>
    <p><strong>Hazard:</strong> ${hazard.title}</p>
    <p><strong>Previous Status:</strong> ${previousStatusFormatted}</p>
    <p><strong>New Status:</strong> ${statusFormatted}</p>
    
    <p>Please log in to the safety management system to view more details.</p>
  `;

  const text = `
Hazard Status Update: ${hazard.title}
The status of a hazard has been updated.

Updated by: ${updatedBy.firstName} ${updatedBy.lastName}
Hazard: ${hazard.title}
Previous Status: ${previousStatusFormatted}
New Status: ${statusFormatted}

Please log in to the safety management system to view more details.
  `;

  try {
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient.email,
        subject,
        html,
        text
      });
    }
    return true;
  } catch (error) {
    console.error("Failed to send hazard status update notification:", error);
    return false;
  }
}

/**
 * Sends a notification when a comment is added to a hazard
 */
export async function sendHazardCommentNotification(
  hazard: HazardReport,
  commenter: User,
  comment: string,
  recipients: User[]
): Promise<boolean> {
  if (!recipients.length) return true;

  const subject = `[HAZARD COMMENT] New Comment on Hazard: ${hazard.title}`;
  
  const html = `
    <h2>New Comment on Hazard: ${hazard.title}</h2>
    
    <p><strong>Comment by:</strong> ${commenter.firstName} ${commenter.lastName}</p>
    <p><strong>Comment:</strong></p>
    <div style="padding: 10px; background-color: #f5f5f5; border-left: 4px solid #ccc; margin: 10px 0;">
      ${comment.replace(/\n/g, '<br>')}
    </div>
    
    <p>Please log in to the safety management system to view the full discussion and respond if needed.</p>
  `;

  const text = `
New Comment on Hazard: ${hazard.title}

Comment by: ${commenter.firstName} ${commenter.lastName}
Comment:
${comment}

Please log in to the safety management system to view the full discussion and respond if needed.
  `;

  try {
    for (const recipient of recipients) {
      // Don't send notification to the person who made the comment
      if (recipient.id === commenter.id) continue;
      
      await sendEmail({
        to: recipient.email,
        subject,
        html,
        text
      });
    }
    return true;
  } catch (error) {
    console.error("Failed to send hazard comment notification:", error);
    return false;
  }
}